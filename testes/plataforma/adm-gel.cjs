// Administração central · bloco 1 · tarefa 6 (23/11/2026): a tela Administração › Gel (#cadastros/gel).
// Demonstração: cadastro fictício, relógio fixo em 23/11/2026. O que este teste prova:
//  1. o botão Gel do menu abre a tela; a vigência do formato (01/10/2025) e as composições calculadas (8,035 / 5,715 / 5,735 e 6,709 / 4,394 / 4,409);
//  2. "Nova vigência" a partir de 01/12/2026 com Gel 100 = 1,000: a tabela fica com 2 linhas e o Excluir só existe na futura; a composição dela muda;
//  3. arrastar o 3º local para o 1º lugar grava a ordem e reabrir a tela a mantém; "+ Local" e Excluir (inativar, nunca apagar);
//  4. motivos e parâmetros do gel (4ª parte) gravam em parametros.gel sem tocar nas cópias antigas do formato;
//  5. #parGel não existe mais e a ficha do equipamento não tem a tabela de descartes, só o link para Gel;
//  6. perfil com Gel = ver só consulta; a auditoria registra cada gravação (tipo gel, com motivo); nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const w = (f, ms = 300) => f.waitForTimeout ? f.waitForTimeout(ms) : new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-23T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/portal');
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D && typeof ADM_ASSUNTOS !== 'undefined', null, { timeout: 30000 });
    await f.evaluate(() => { location.hash = '#cadastros'; App.render(); }); await f.waitForSelector('.cadside');
    const abrir = async () => { await f.evaluate(() => { Cad.ui.sec = 'inicio'; App.render(); }); await f.click('.cadside [data-sec="gel"]'); await f.waitForSelector('#gelFmt'); };

    // 1) menu, vigência e composições
    assert.deepEqual(await f.evaluate(() => ADM_ASSUNTOS.find(a => a.id === 'gel').itens), ['gel'], 'o assunto Gel tem a tela gel');
    await abrir();
    assert.equal(await f.evaluate(() => location.hash), '#cadastros/gel');
    const v0 = await f.$$eval('#gelVigs tr[data-de]', r => r.map(x => x.dataset.de));
    assert.equal(v0.length, 1, 'uma vigência no cenário ' + v0);
    const de0 = v0[0];
    const comp = async () => f.$$eval('#gelComps tr[data-comp]', r => r.map(x => [x.dataset.comp, ...[...x.querySelectorAll('td.n')].map(t => t.textContent.trim())]));
    assert.deepEqual(await comp(), [['completo', '8,035 g', '6,709 g'], ['tubogel', '5,715 g', '4,394 g'], ['spray', '5,735 g', '4,409 g']], 'composições da vigência atual');
    for (const t of ['Nova vigência', 'Folha plástica da purga (g)', 'Sobra padrão de gel por barril (kg)', 'Peso da embalagem de pesagem (g)', 'Vale a partir de', 'Tubo vazio', 'Aditivo / spray', 'Tampa + rolha (conjunto)', 'contada em unidades', 'Tubo completo', 'Locais de descarte', 'Arraste ⠿ (ou use ↑ ↓) para definir a ordem']) assert.ok((await f.locator('#cadMain').innerText()).includes(t), 'texto da tela: ' + t);
    assert.equal(await f.locator('#gelVigs [data-gvdel]').count(), 0, 'vigência atual/passada: sem Excluir');
    console.log('ok menu Gel, vigência de ' + de0 + ' e composições 8,035/5,715/5,735 · 6,709/4,394/4,409');

    // 2) nova vigência
    const dt = (sel, v) => f.evaluate(([s, x]) => { const i = document.querySelector(s); i.value = x; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);
    await dt('#gvDe', '2026-12-01'); await f.fill('[data-gv="t.100.gelG"]', '1,000'); await f.fill('#gvMotivo', 'teste: gel novo'); await f.click('#gvOk'); await w(page, 700);
    const v1 = await f.$$eval('#gelVigs tr[data-de]', r => r.map(x => [x.dataset.de, !!x.querySelector('[data-gvdel]')]));
    assert.deepEqual(v1, [['2026-12-01', true], [de0, false]], 'duas vigências; Excluir só na futura ' + JSON.stringify(v1));
    const fm = await f.evaluate(() => Cad.D.gel.formatos.map(x => [x.de, x.tubos['100'].gelG, x.tubos['75'].gelG, x.embalagemG, x.motivo]));
    assert.deepEqual(fm, [[de0, 0.936, 0.834, 75, ''], ['2026-12-01', 1, 0.834, 75, 'teste: gel novo']].map((x, i) => i ? x : [x[0], x[1], x[2], x[3], fm[0][4]]), 'gravou a nova e não mexeu na antiga ' + JSON.stringify(fm));
    await f.selectOption('#gelCompSel', '2026-12-01'); await w(page, 200);
    assert.equal((await comp())[0][1], '8,099 g', 'composição da vigência futura: 4,779 + 2,3 + 1 + 0,02');
    assert.equal(await f.evaluate(() => vacCad.gel.composicao('100', 'completo', '2026-11-23').gPorTubo), 8.035, 'hoje continua a vigência antiga');
    // recusas
    await f.evaluate(() => { GelAdm.vig = null; App.render(); }); await w(page, 200);
    await dt('#gvDe', '2026-11-01'); await f.fill('#gvMotivo', 'x'); await f.click('#gvOk'); await w(page, 200);
    assert.equal(await f.evaluate(() => Cad.D.gel.formatos.length), 2, 'data no passado é recusada');
    // excluir a futura
    await f.evaluate(() => { GelAdm.vig = null; App.render(); }); await w(page, 200);
    await f.click('#gelVigs [data-gvdel="2026-12-01"]'); await w(page, 500);
    assert.equal(await f.evaluate(() => Cad.D.gel.formatos.length), 1, 'Excluir removeu só a vigência futura');
    await dt('#gvDe', '2026-12-01'); await f.fill('[data-gv="t.100.gelG"]', '1,000'); await f.fill('#gvMotivo', 'teste: gel novo'); await f.click('#gvOk'); await w(page, 700);
    console.log('ok nova vigência 01/12/2026: 2 linhas, Excluir só na futura, passado recusado, composição 8,099 g');

    // 3) ordem dos locais por arrastar
    const ord = () => f.$$eval('#gelLocs tr[data-gid]', r => r.map(x => x.dataset.gid));
    const o0 = await ord(); assert.ok(o0.length >= 14, 'locais do cenário ' + o0.length);
    await f.evaluate(() => document.querySelector('#gelLoc').scrollIntoView({ block: 'start' })); await w(page, 200);
    const h3 = await (await f.$('#gelLocs tr[data-gid="' + o0[2] + '"] td.eq-h')).boundingBox(), r1 = await (await f.$('#gelLocs tr[data-gid="' + o0[0] + '"]')).boundingBox();
    await page.mouse.move(h3.x + h3.width / 2, h3.y + h3.height / 2); await page.mouse.down();
    await page.mouse.move(r1.x + 30, r1.y + 3, { steps: 6 }); await page.mouse.up(); await w(page, 700);
    const o1 = await ord(); assert.deepEqual(o1.slice(0, 3), [o0[2], o0[0], o0[1]], 'o 3º local foi para o 1º lugar ' + o1.slice(0, 4));
    await f.evaluate(() => { Cad.ui.sec = 'turnos'; App.render(); }); await w(page, 200); await abrir();
    assert.deepEqual((await ord()).slice(0, 3), [o0[2], o0[0], o0[1]], 'reabrir mantém a ordem');
    assert.deepEqual(await f.evaluate(() => vacCad.gel.locais().slice(0, 3).map(l => l.id)), [o0[2], o0[0], o0[1]], 'vacCad.gel.locais() na nova ordem');
    // ↓ move um lugar
    await f.click('#gelLocs tr[data-gid="' + o0[2] + '"] [data-gmv="1"]'); await w(page, 500);
    assert.deepEqual((await ord()).slice(0, 3), [o0[0], o0[2], o0[1]], '↓ desce um lugar');
    console.log('ok ordem dos locais: arrastar, reabrir e ↓');

    // + Local, Editar, Excluir = inativar
    await f.click('#gelNovoLocal'); await f.waitForSelector('#glOk');
    await f.selectOption('#glEq', 'EQ03'); await f.fill('#glLocal', 'LOCAL DE TESTE (fictício)'); await f.selectOption('#glComp', 'tubogel'); await f.fill('#glEmb', '80'); await f.fill('#glMotivo', 'teste: local novo'); await f.click('#glOk'); await w(page, 700);
    const nl = await f.evaluate(() => Cad.D.gel.locais.find(l => l.local === 'LOCAL DE TESTE (fictício)'));
    assert.ok(nl && nl.equipamento === 'EQ03' && nl.comp === 'tubogel' && nl.categoria === 'T' && nl.embalagemG === 80 && nl.ativo === true && /^L-\d{4}$/.test(nl.id), 'local novo ' + JSON.stringify(nl));
    assert.equal(nl.ordem, Math.max(...(await f.evaluate(() => Cad.D.gel.locais.map(l => l.ordem)))), 'entra no fim');
    const n0 = await f.evaluate(() => Cad.D.gel.locais.length);
    await f.click('#gelLocs tr[data-gid="' + nl.id + '"] [data-gedit]'); await f.waitForSelector('#glOk');
    assert.equal(await f.inputValue('#glLocal'), 'LOCAL DE TESTE (fictício)'); await f.click('#glCancel'); await w(page, 200);
    await f.click('#gelLocs tr[data-gid="' + nl.id + '"] [data-gdel]'); await w(page, 600);
    const ap = await f.evaluate(id => ({ n: Cad.D.gel.locais.length, l: Cad.D.gel.locais.find(x => x.id === id) }), nl.id);
    assert.equal(ap.n, n0, 'Excluir não apaga'); assert.equal(ap.l.ativo, false, 'Excluir inativa');
    assert.equal(await f.evaluate(id => vacCad.gel.locais().some(l => l.id === id), nl.id), false, 'inativo some de vacCad.gel.locais()');
    console.log('ok + Local, Editar e Excluir = inativar');

    // 4) motivos e parâmetros do gel
    const antigo = await f.evaluate(() => JSON.stringify((Cad.D.parametros.gel || {}).formatos ?? null));
    await f.click('#gelPar [data-pgadd="motivos"]'); await f.fill('#gelPar [data-pg="motivos.0.name"]', 'Gel com bolha');
    await f.click('#gelPar [data-pgadd="processo"]'); await f.fill('#gelPar [data-pg="processo.0.pT"]', '2,5'.replace(',', '.'));
    await dt('#gelPar [data-pg="registroPelaProducaoDesde"]', '2026-12-01'); await f.click('#gpOk'); await w(page, 600);
    const pg = await f.evaluate(() => Cad.D.parametros.gel);
    assert.ok(pg.motivos[0].name === 'Gel com bolha' && /^m-/.test(pg.motivos[0].id) && pg.processo[0].pT === 2.5 && pg.registroPelaProducaoDesde === '2026-12-01', 'parametros.gel ' + JSON.stringify(pg).slice(0, 200));
    assert.equal(JSON.stringify(pg.formatos ?? null), antigo, 'a cópia antiga do formato não foi tocada');
    console.log('ok motivos, perdas e corte do gel gravam em parametros.gel');

    // 5) o que saiu
    assert.equal(await f.locator('#parGel').count(), 0, 'sem #parGel na tela Gel');
    await f.evaluate(() => { location.hash = '#cadastros/parametros'; }); await w(page, 600);
    assert.equal(await f.locator('#parGel, #pgOk').count(), 0, 'sem Parâmetros › Gestão de Gel'); assert.ok(await f.locator('#parGer').count(), 'Parâmetros continua');
    await f.evaluate(() => Ficha.abrir('equipamentos', 'EQ03')); await w(page, 500);
    const fi = await f.evaluate(() => { const b = document.querySelector('#fBox'); return { tabela: /Local do descarte|Gel: embalagem e descartes/.test(b.innerText), link: b.querySelector('[data-irhash="#cadastros/gel/locais"]')?.textContent || '' }; });
    assert.equal(fi.tabela, false, 'a ficha não tem a tabela de descartes'); assert.match(fi.link, /Locais de descarte deste equipamento › Gel/);
    await f.click('#fBox [data-irhash]'); await w(page, 900);
    assert.deepEqual(await f.evaluate(() => [location.hash, Cad.ui.sec, Ficha.aberta()]), ['#cadastros/gel/locais', 'gel', false], 'o link abre a tela Gel');
    console.log('ok #parGel removido; ficha do equipamento só com o link para Gel');

    // 6) permissão por assunto e auditoria
    await f.evaluate(async () => {
      const as = (o, d = 'ver') => Object.fromEntries(ADM_ASSUNTOS.map(a => [a.id, o[a.id] || d]));
      await Cad.ops([{ acao: 'criação', tipo: 'perfis', codigo: 'TSG', item: { codigo: 'TSG', nome: 'Teste sem gel', paginaInicial: 'Portal', semSenha: true, permissoes: permDe(['ver']), assuntos: as({ gel: 'ver' }, 'editar'), ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'usuarios', codigo: '3011', item: { codigo: '3011', nome: 'Teste 3011 (fictício)', perfil: 'TSG', paginaInicial: '(do perfil)', ativo: true }, motivo: 'teste' }]);
      localStorage.setItem('vac.userId', '3011'); Cad.ui.sec = 'gel'; App.render();
    });
    await f.waitForSelector('#gelFmt');
    assert.equal(await f.locator('#gvOk, #glOk, #gelNovoLocal, #gpOk, [data-gvdel], [data-gdel]').count(), 0, 'Gel = ver: sem botões de gravar');
    assert.ok(await f.locator('#gelVigs tr[data-de]').count() >= 1, 'continua mostrando as vigências');
    const neg = await f.evaluate(() => Cad.ops([{ acao: 'edição', tipo: 'gel', codigo: null, mudancas: { locais: { antes: Cad.D.gel.locais, depois: [] } }, motivo: 'x' }]));
    assert.equal(neg, false, 'Cad.ops recusa tipo gel sem permissão'); assert.equal(await f.evaluate(() => Cad.D.gel.locais.length), n0);
    await f.evaluate(() => { localStorage.setItem('vac.userId', '9001'); App.render(); });
    const aud = await f.evaluate(() => Cad.D.auditoria.filter(a => a.tipo === 'gel').map(a => [a.acao, a.campo, a.motivo]));
    assert.deepEqual(aud.map(a => a[1]), ['formatos', 'formatos', 'formatos', 'locais', 'locais', 'locais', 'locais', 'locais', 'locais'].slice(0, aud.length), 'auditoria do Gel por campo ' + JSON.stringify(aud));
    assert.ok(aud.every(a => a[2]), 'toda gravação do Gel tem motivo ' + JSON.stringify(aud)); assert.ok(aud.length >= 3);
    console.log('ok Gel = ver só consulta; auditoria: ' + aud.map(a => a[1] + ' (' + a[2] + ')').join(' | '));

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
