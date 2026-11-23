// Linha 360° 1.4.1 (pedido do responsável, 22/11/2026): em Configuração › Pontos e equipamentos, os pontos se editam todos e gravam de uma
// vez em "Salvar alterações". Antes, cada linha tinha o seu "Salvar" e salvar uma apagava o que estava digitado nas outras.
// Demonstração: dados fictícios. O que este teste prova:
//  1. alterar o nome de três pontos marca as três linhas e o botão mostra "(3)";
//  2. um redesenho da tela no meio (sincronização, outra gravação) não perde o que foi digitado;
//  3. "Salvar alterações" grava os três de uma vez; "Descartar alterações" volta ao que estava gravado;
//  4. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/linha');
    const f = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForSelector('#ficha'); await f.evaluate(() => { App.tab = 'config'; render(); }); await f.waitForSelector('tr[data-pt]');
    const ids = await f.evaluate(() => [...document.querySelectorAll('tr[data-pt]')].slice(0, 3).map(tr => tr.dataset.pt));
    assert.equal(ids.length, 3); assert.equal(await f.locator('[data-ptsalvar]').count(), 0, 'sem botão Salvar por linha');
    for (const id of ids) { await f.fill(`tr[data-pt="${id}"] [data-c=nome]`, 'Ponto teste ' + id); }
    const st = await f.evaluate(() => ({ sujas: document.querySelectorAll('tr.l3-sujo').length, bt: document.querySelector('[data-ptgravar]').textContent, on: !document.querySelector('[data-ptgravar]').disabled }));
    assert.deepEqual(st, { sujas: 3, bt: 'Salvar alterações (3)', on: true }, 'três linhas marcadas e o botão com (3)');
    console.log('ok três pontos alterados: linhas marcadas e "Salvar alterações (3)"');
    await f.evaluate(() => render());
    const depois = await f.evaluate(ids => ids.map(id => document.querySelector(`tr[data-pt="${id}"] [data-c=nome]`).value), ids);
    assert.deepEqual(depois, ids.map(id => 'Ponto teste ' + id), 'o texto digitado continua depois de redesenhar a tela');
    console.log('ok a tela redesenhada mantém o que foi digitado');
    await f.click('[data-ptgravar]');
    const salvos = await f.evaluate(ids => ({ nomes: ids.map(id => pontos().find(p => p.id === id).nome), rasc: Object.keys(App.ptRasc || {}).length, sujas: document.querySelectorAll('tr.l3-sujo').length }), ids);
    assert.deepEqual(salvos, { nomes: ids.map(id => 'Ponto teste ' + id), rasc: 0, sujas: 0 }, 'os três gravados de uma vez');
    console.log('ok "Salvar alterações" grava os três pontos de uma vez');
    await f.fill(`tr[data-pt="${ids[0]}"] [data-c=nome]`, 'Não vai ficar'); await f.click('[data-ptdesc]');
    assert.equal(await f.evaluate(id => document.querySelector(`tr[data-pt="${id}"] [data-c=nome]`).value, ids[0]), 'Ponto teste ' + ids[0], 'descartar volta ao gravado');
    console.log('ok "Descartar alterações" volta ao que estava gravado');
    const menu = f.locator('#cfMenu');
    async function acaoMapa(alvo, nome, posicao) {
      await alvo.click({ button: 'right', position: posicao });
      await menu.getByRole('button', { name: nome, exact: true }).click();
    }
    const cv = f.locator('#cv');
    await acaoMapa(cv, 'Adicionar processo', { x: 8, y: 8 });
    const ponto = await f.evaluate(() => P(App.sel));
    assert.equal(ponto.tipo, 'processo');
    assert.ok(ponto.x < 3 && ponto.y < 4 && ponto.numero > 18);
    const pin = f.locator('[data-pin="' + ponto.id + '"]');
    await acaoMapa(pin, 'Adicionar checklist');
    const chk = await f.evaluate(id => chkAtivos().find(c => c.ponto === id), ponto.id);
    await acaoMapa(pin, 'Detalhes · ' + chk.titulo);
    assert.equal(await f.inputValue('#fChk [name=id]'), chk.id);
    await f.fill('#fChk [name=titulo]', 'Verificação fictícia');
    await f.click('#chkSalvar');
    assert.equal(await f.evaluate(id => chkAtivos().find(c => c.id === id).titulo, chk.id), 'Verificação fictícia');
    await f.evaluate(() => ir('config'));
    await acaoMapa(pin, 'Adicionar formulário');
    const form = await f.evaluate(id => fmLista().find(q => q.ponto === id), ponto.id);
    await acaoMapa(pin, 'Detalhes · ' + form.titulo);
    assert.equal(await f.isChecked(`[data-fmpt="${ponto.id}"]`), true, 'o formulário abre com o ponto marcado na lista de pontos');
    await f.fill('#fmTitulo', 'Inspeção fictícia'); await f.click('#fmSalvar');
    assert.equal(await f.evaluate(id => fmLista().find(q => q.id === id).titulo, form.id), 'Inspeção fictícia');
    await f.evaluate(() => ir('config'));
    const zona = f.locator('polygon[data-zona]').first(), areaId = await zona.getAttribute('data-zona');
    await zona.scrollIntoViewIfNeeded();
    await zona.evaluate(el => {
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, clientX:r.left+r.width/2, clientY:r.top+r.height/2 }));
    });
    await menu.getByRole('button', { name:'Alterar nome da área' }).click();
    await f.fill('#fArea [name=nome]', 'Área teste'); await f.click('#fArea button[type=submit]');
    assert.equal(await f.evaluate(id => areas().find(q => q.id === id).nome, areaId), 'Área teste');
    // A área já existe. Arrastar um canto deve alterar apenas o rascunho até Salvar.
    const lerArea = () => f.evaluate(id => areas().find(a => a.id === id), areaId);
    const original = await lerArea(), vertices = original.pol.split(/\s+/).map(par => par.split(',').map(Number));
    await zona.scrollIntoViewIfNeeded();
    await zona.evaluate(el => {
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, clientX:r.left+r.width/2, clientY:r.top+r.height/2 }));
    });
    await menu.getByRole('button', { name:'Redimensionar área' }).click();
    assert.deepEqual(await f.evaluate(() => App.desenho.pts), vertices);
    const vertice = f.locator('[data-vertice="0"]');
    async function arrastar() {
      await vertice.evaluate(el => el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
      /* espera a rolagem da casca terminar: o vértice precisa estar parado antes de medir (senão o clique cai fora dele) */
      let r = await vertice.boundingBox();
      for (let k = 0; k < 20; k++) { await page.waitForTimeout(100); const r2 = await vertice.boundingBox(); if (Math.abs(r2.x - r.x) < .5 && Math.abs(r2.y - r.y) < .5) break; r = r2; }
      const x = r.x+r.width/2, y = r.y+r.height/2;
      await page.mouse.move(x,y); await page.mouse.down();
      await page.mouse.move(x+36,y+25,{steps:5}); await page.mouse.up();
      const pts = await f.evaluate(() => App.desenho.pts);
      assert.ok(pts[0][0] > vertices[0][0] && pts[0][1] > vertices[0][1]);
      assert.deepEqual(pts.slice(1), vertices.slice(1));
      return pts;
    }
    await arrastar(); assert.equal((await lerArea()).pol,original.pol);
    await f.click('#cfDesVolta'); assert.deepEqual(await f.evaluate(() => App.desenho.pts),vertices);
    await arrastar(); await f.click('#cfDesCanc'); assert.deepEqual(await lerArea(),original);
    await f.click('#cfAjustar');
    const ajustados = await arrastar();
    await f.click('#cfDesFim');
    const salvo = await lerArea();
    assert.equal(salvo.pol,ajustados.map(v=>v.join(',')).join(' '));
    assert.equal(salvo.nome,original.nome); assert.deepEqual(salvo.pts,original.pts);
    await f.click('#cfAjustar');
    assert.deepEqual(await f.evaluate(() => App.desenho.pts),ajustados);
    await f.locator('[data-aresta="0"]').evaluate(el=>{
      const r=el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
    });
    assert.equal(await f.locator('[data-vertice]').count(),ajustados.length+1);
    await f.click('#cfDesCanc');
    await f.click('#cfDes');
    assert.equal(await f.locator('[data-vertice]').count(),0);
    await f.click('#cfDesCanc'); assert.deepEqual(await lerArea(),salvo);
    console.log('ok arrastar, desfazer, cancelar, inserir vértice e reabrir o contorno salvo da área');
    await acaoMapa(cv, 'Adicionar equipamento', { x: 45, y: 15 });
    const eqPonto = await f.evaluate(() => P(App.sel));
    const adm = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame();
    await adm.waitForSelector('#fBox [data-p=nome]');
    assert.equal(await adm.inputValue('#fBox [data-p=nome]'), eqPonto.nome);
    assert.match(await adm.inputValue('#fBox [data-p=codigo]'), /^EQ\d+$/);
    const eqCodigo = await adm.inputValue('#fBox [data-p=codigo]');
    assert.equal(await adm.evaluate(id => Cad.D.equipamentos.filter(e => e.pontoLinha360 === id).length, eqPonto.id), 1);

    await adm.fill('#fBox [data-p=nome]', 'Equipamento fictício'); await adm.click('#fSalvar');
    const cadastrado = await adm.evaluate(id => Cad.D.equipamentos.find(e => e.pontoLinha360 === id), eqPonto.id);
    assert.equal(cadastrado.codigo, eqCodigo);
    assert.equal(cadastrado.nome, 'Equipamento fictício');
    assert.deepEqual(await f.evaluate(id => eqDoPonto(P(id)).lista, eqPonto.id), [eqCodigo]);
    console.log('ok menu da planta cria e reabre os registros nos seus editores e edita a área selecionada');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
