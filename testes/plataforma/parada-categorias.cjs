// Plataforma 1.8.26 (Produção 2.6.18) · PAR-CAT: o tipo de parada nas "Sugestões do servidor" (e na importação de paradas e no turno sem
// produção) aparece separado por categoria e com busca em tempo real: "setup" deixa só os tipos de setup (código, nome ou categoria).
// Dados fictícios (demonstração); nada é gravado.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());

    // 1) montagem comum: um grupo por categoria, na ordem do cadastro, com os mesmos tipos de antes
    const g = await o.evaluate(() => { const codes = db().downtimeCodes.filter(c => c.active !== false && !c.deleted), d = document.createElement('select'); d.innerHTML = tipoParadaOpts(codes, null);
      return { grupos: [...d.querySelectorAll('optgroup')].map(x => x.label), cats: [...new Set(codes.map(c => c.category || 'Sem categoria'))], n: d.options.length, total: codes.length }; });
    assert.deepEqual(g.grupos, g.cats); assert.equal(g.n, g.total, 'mesmos tipos, só agrupados');
    console.log(`ok tipos de parada agrupados por categoria (${g.grupos.length} categorias, ${g.n} tipos)`);

    // 2) sugestões do servidor: lista com categorias e busca; "setup" deixa só os de setup
    //    (a demonstração não tem intervalo sem caixa: só na memória desta página, entra uma pausa fictícia de 25 min no meio do turno)
    await o.evaluate(() => { const S = db().server, sg = S.segments.find(x => x.t0.slice(0, 10) === App.sel.date) || S.segments[0], dia = sg.t0.slice(0, 10), sep = sg.t0.charAt(10); App.sel.date = dia;
      S.gaps.push({ lot: sg.lot, cat: sg.cat, lineId: sg.lineId, from: dia + sep + '10:00:00', to: dia + sep + '10:25:00' }); S.rev = (S.rev || 0) + 1; render(); });
    await o.waitForSelector('#srvRev'); await o.click('#srvRev'); await o.waitForSelector('select[data-evc]', { state: 'attached' });
    const r = await o.evaluate(async () => { const s = document.querySelector('select[data-evc]'), cx = s.closest('.vac-fs'), inp = cx && cx.querySelector('.vac-filtro'),   /* 1.8.58: a busca fica dentro da lista (como o filtro do Excel) */ norm = x => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const grupos = s.querySelectorAll('optgroup').length, filtro = inp && inp.classList.contains('vac-filtro');
      inp.value = 'setup'; inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 50));
      const vis = [...s.options].filter(o => o.value && !o.hidden).map(o => (o.textContent + ' ' + (o.parentElement.label || ''))), gruposVis = [...s.querySelectorAll('optgroup')].filter(x => !x.hidden).map(x => x.label);
      return { grupos, filtro, vis, gruposVis, todos: vis.every(t => norm(t).includes('setup')), msg: cx.querySelector('.vac-filtro-msg').textContent }; });
    assert.ok(r.grupos > 1 && r.filtro, 'categorias e campo de busca'); assert.ok(r.vis.length >= 1 && r.todos, 'só tipos com "setup": ' + JSON.stringify(r.vis));
    assert.match(r.msg, /opç/); console.log(`ok sugestões do servidor: busca "setup" deixa ${r.vis.length} tipo(s) (${r.gruposVis.join(', ')})`);

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok tipo de parada por categoria: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
