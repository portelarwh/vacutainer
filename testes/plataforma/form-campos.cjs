// Linha 360° 1.7.0 · FORM-03 (pedido do responsável, 23/11/2026): campos do formulário A4.
// Demonstração: dados fictícios. O que este teste prova:
//  1. escolher a área marca todos os pontos dela e os equipamentos de cada ponto (área → máquina → equipamento); desmarcar um ponto
//     tira os equipamentos dele; o cabeçalho da folha mostra as várias máquinas;
//  2. colar várias linhas (bloco de notas ou Excel) numa tarefa cria uma tarefa por linha; linha recuada ou 2ª coluna = subtarefa (5.1);
//     o botão ↳ / ⇤ troca tarefa e subtarefa;
//  3. a orientação geral cresce com o texto, no campo e na folha A4 (sem cortar linhas);
//  4. retângulo e círculo giram (rotação em graus) no editor e na folha;
//  5. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/linha');
    const f = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForSelector('#cv');
    await f.evaluate(() => { App.tab = 'form'; render(); }); await f.click('#fmNovo'); await f.waitForSelector('#fmArv');

    // 1) área → pontos → equipamentos
    const area = await f.evaluate(() => { const a = areas().find(x => (x.pts || []).length >= 2); return { id: a.id, pts: a.pts.map(String) }; });
    await f.selectOption('#fmArea', area.id);
    const r1 = await f.evaluate(() => ({ pts: App.fm.d.pontos, eq: App.fm.d.equipamentos, marcados: [...document.querySelectorAll('[data-fmpt]:checked')].map(c => c.dataset.fmpt) }));
    const eqEsperados = await f.evaluate(ids => [...new Set(ids.flatMap(id => eqDoPonto(P(id)).lista))], area.pts);
    assert.deepEqual(r1.pts, area.pts.filter(id => r1.pts.includes(id)), 'pontos da área marcados'); assert.deepEqual(r1.marcados.sort(), r1.pts.slice().sort());
    assert.ok(r1.pts.length >= 2 && eqEsperados.every(c => r1.eq.includes(c)), 'equipamentos de cada ponto marcados ' + JSON.stringify(r1));
    const tira = r1.pts[0], eqTira = await f.evaluate(id => eqDoPonto(P(id)).lista, tira);
    await f.uncheck(`[data-fmpt="${tira}"]`);
    const r2 = await f.evaluate(() => ({ pts: App.fm.d.pontos, eq: App.fm.d.equipamentos, cab: document.querySelector('#fmPrev .fm-dg').textContent }));
    assert.ok(!r2.pts.includes(tira) && eqTira.every(c => !r2.eq.includes(c) || r2.pts.some(o => false)), 'ponto desmarcado leva os seus equipamentos');
    if (r2.pts.length > 1) assert.match(r2.cab, /\d+ máquinas:/, 'cabeçalho com várias máquinas');
    console.log('ok área marca os pontos e os equipamentos dela; desmarcar um ponto tira os equipamentos; cabeçalho com várias máquinas');

    // 2) colar várias linhas numa tarefa
    await f.click('#fmTarNova'); await f.waitForSelector('[data-tar]');
    await f.evaluate(() => { const inp = document.querySelector('[data-tar]'), dt = new DataTransfer();
      dt.setData('text/plain', 'Limpar a mesa\n  Conferir a correia\nTrocar o filtro\nInspecionar bicos\tBico 1 e 2\n');
      inp.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
    await page.waitForTimeout(300);
    const tar = await f.evaluate(() => App.fm.d.tarefas.map(t => [t.txt, !!t.sub]));
    assert.deepEqual(tar, [['Limpar a mesa', false], ['Conferir a correia', true], ['Trocar o filtro', false], ['Inspecionar bicos', false], ['Bico 1 e 2', true]], 'uma tarefa por linha, com subtarefas');
    const rot = await f.evaluate(() => [...document.querySelectorAll('.fm-tl .fm-nb')].map(n => n.textContent));
    assert.deepEqual(rot.slice(-5).map(x => x.replace(/^\d+/, 'N')), ['N', 'N.1', 'N', 'N', 'N.1'], 'numeração de tarefa e subtarefa ' + JSON.stringify(rot));
    await f.click('[data-tarsub] >> nth=2');
    assert.equal(await f.evaluate(() => App.fm.d.tarefas[2].sub), true, '↳ torna subtarefa');
    const folha = await f.evaluate(() => document.querySelectorAll('#fmPrev .fm-tl2 li.fm-sub').length);
    assert.equal(folha, 3, 'subtarefas recuadas na folha');
    console.log('ok colar 4 linhas cria tarefas e subtarefas (recuo e 2ª coluna do Excel); ↳ troca; folha com subtarefas recuadas');

    // 3) orientação cresce
    const h0 = await f.evaluate(() => document.querySelector('#fmObs').offsetHeight);
    const texto = Array.from({ length: 8 }, (_, i) => 'Linha de orientação ' + (i + 1) + ' (teste)').join('\n');
    await f.fill('#fmObs', texto); await f.locator('#fmObs').dispatchEvent('input'); await f.locator('#fmObs').blur();
    const h1 = await f.evaluate(() => document.querySelector('#fmObs').offsetHeight);
    await f.evaluate(() => fmPrevAtualizar());
    const p = await f.evaluate(() => { const el = document.querySelector('#fmPrev .fm-orient p'); return { txt: el.textContent, corta: el.scrollHeight > el.clientHeight + 2 }; });
    assert.ok(h1 > h0 + 40, 'campo cresce com o texto (' + h0 + ' → ' + h1 + ')'); assert.ok(p.txt.includes('Linha de orientação 8') && !p.corta, 'folha com o texto inteiro');
    console.log('ok orientação cresce no campo (' + h0 + ' → ' + h1 + ' px) e aparece inteira na folha');

    // 4) rotação de retângulo e círculo
    await f.evaluate(() => { const d = App.fm.d; d.fotos.push({ id: 'ftr', w: 800, h: 600, arq: '', ponto: '', eq: '', marcas: [{ id: 'mr', t: 'retangulo', c: '#E5322D', x1: 20, y1: 20, x2: 50, y2: 40, txt: 'Painel' }, { id: 'mc', t: 'circulo', c: '#1F6FE5', x1: 60, y1: 50, x2: 80, y2: 70, txt: 'Bico' }] }); render(); fmEditor('ftr'); App.fm.ed.sel = 'mr'; fmEdDesenhar(); });
    await f.waitForSelector('#edRot');
    await f.click('#edRotP'); await f.click('#edRotP'); await f.locator('#edRot').fill('-40');
    const r4 = await f.evaluate(() => ({ rot: App.fm.ed.f.marcas[0].rot, tr: document.querySelector('#edSvg [data-mk="mr"] rect').getAttribute('transform'), v: document.querySelector('#edRotV').textContent }));
    assert.deepEqual(r4, { rot: -40, tr: 'rotate(-40 350 225)', v: '-40°' }, 'retângulo girado ' + JSON.stringify(r4));
    await f.evaluate(() => { App.fm.ed.sel = 'mc'; fmEdDesenhar(); }); await f.click('#edRotP');
    assert.match(await f.evaluate(() => document.querySelector('#edSvg [data-mk="mc"] ellipse').getAttribute('transform')), /^rotate\(15 /, 'círculo girado');
    await f.click('#edOk');
    assert.ok(await f.evaluate(() => [...document.querySelectorAll('#fmPrev rect')].some(r => /rotate\(-40/.test(r.getAttribute('transform') || ''))), 'rotação também na folha');
    console.log('ok retângulo e círculo giram no editor (botões e controle) e na folha');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
