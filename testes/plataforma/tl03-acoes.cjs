// Plataforma 1.8.44 · TL-03 (Linha do tempo: filtros Ordem e Lote; produção, meta e aderência no topo), PLN-02 (indicadores das Ações em cartões)
// e EQP-01 (ações ligadas ao equipamento na ficha). Demonstração: dados fictícios. O que este teste prova:
//  1. a Linha do tempo do dia mostra no topo a mesma produção e a mesma meta do Lançamento do dia (nenhuma conta nova);
//  2. escolher um lote troca o período pela janela do lote no MES (1ª à última caixa) e o topo continua com os números do Lançamento;
//     "Limpar" volta para o dia; sem lançamento no período, "—" (ausência não vira zero);
//  3. Ações mostra em cartões os mesmos indicadores que a página publica para a Visão da linha (calcExports.kpis);
//  4. a ficha do equipamento lista as ações abertas ligadas a ele, com o link para abrir a ação.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    await page.goto(base + '#/oee?tab=stops');
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    await f.evaluate(() => { App.prefs.grpSub = App.prefs.grpSub || {}; App.prefs.grpSub.stops = 'timeline'; App.tl.date = '2026-11-19'; render(); });
    await f.waitForSelector('.tlo-topo [data-tlk="producao"]');
    const ref = await f.evaluate(() => { const d = db().productionDays.find(x => !x.deleted && x.date === '2026-11-19' && x.lineId === 'line_vac'), r = Engine.computeDay(db(), d); return { good: U.sum(r.flat, x => x.good || 0), meta: U.sum(r.flat, x => x.metaOp || 0) }; });
    const txt = k => f.evaluate(k => (document.querySelector('.tlo-topo [data-tlk="' + k + '"] .v') || {}).textContent || '', k);
    const num = s => +String(s).replace(/\D/g, '');
    const dia = { p: await txt('producao'), m: await txt('meta') };
    assert.ok(num(dia.p) === Math.round(ref.good / 1000) && num(dia.m) === Math.round(ref.meta / 1000), 'dia: topo = Lançamento ' + JSON.stringify({ dia, ref }));
    console.log('ok Linha do tempo do dia: produção e meta no topo iguais às do Lançamento');
    const lote = await f.evaluate(() => { const s = document.querySelector('[data-tlx="lote"]'), o = [...s.options].find(o => o.value); s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); return o.value; });
    await f.waitForFunction(() => App.tl.modo === 'lote' && /06:01/.test((document.querySelector('[data-tlk="total"] .s') || {}).textContent || ''));
    const L = await f.evaluate(l => { const x = ServerData.lots(db(), 'line_vac').get(l) || ServerData.lots(db(), 'line_vac').get(+l); return { t0: x.t0, t1: x.t1, total: (document.querySelector('[data-tlk="total"] .s') || {}).textContent || '' }; }, lote);
    assert.ok(L.total.includes(L.t0.slice(11, 16)) && L.total.includes(L.t1.slice(11, 16)), 'período = janela do lote no MES ' + JSON.stringify(L));
    assert.equal(num(await txt('producao')), num(dia.p), 'lote: produção das horas do lote');
    console.log('ok lote: o período vira a janela do lote no MES (' + L.t0.slice(11, 16) + ' → ' + L.t1.slice(11, 16) + ')');
    await f.click('#tlLimpar'); await f.waitForFunction(() => App.tl.modo === 'dia' && !App.tl.lote);
    await f.evaluate(() => { App.tl.date = '2026-12-20'; render(); }); await f.waitForFunction(() => /20\/12\/2026/.test((document.querySelector('[data-tlk="total"] .s') || {}).textContent || ''));
    assert.equal((await txt('producao')).trim(), '—', 'sem lançamento no período: — (ausência não vira zero)');
    console.log('ok Limpar volta para o dia; sem lançamento, "—"');
    /* Ações e ficha do equipamento */
    await page.goto(base); await page.locator('.sidebar').getByRole('button', { name: 'Iniciativas' }).first().click();
    const fi = await (await page.waitForSelector('iframe[title="Módulo Iniciativas / Ações"]')).contentFrame(); await fi.waitForSelector('.ik .ik-c');
    const ik = await fi.evaluate(() => ({ tela: [...document.querySelectorAll('.ik .ik-c')].map(c => [c.querySelector('.l').textContent, c.querySelector('.v').textContent]), pub: calcExports(Store.data).kpis.map(k => [k[0], k[1]]) }));
    assert.deepEqual(ik.tela, ik.pub, 'cartões das Ações = indicadores publicados para a Visão da linha');
    console.log('ok Ações: cartões com os mesmos indicadores publicados (' + ik.tela.map(x => x.join(' ')).join(' · ') + ')');
    await page.locator('.sidebar').getByRole('button', { name: 'Equipamentos' }).first().click();
    const fe = await (await page.waitForSelector('iframe[title="Módulo Equipamentos"]')).contentFrame(); await fe.waitForFunction(() => typeof App !== 'undefined' && typeof render === 'function');
    const eq = await fe.evaluate(async () => { App.eq = 'EQ03'; render(); await new Promise(r => setTimeout(r, 400)); const h = [...document.querySelectorAll('h3')].find(x => x.textContent.trim() === 'Ações'), card = h && h.closest('.card');
      const esperadas = (Ext.ini && Ext.ini.acoes || []).filter(a => !['concluída', 'cancelada'].includes(a.status) && (a.vinculos || []).some(v => v.tipo === 'equipamento' && String(v.cod) === 'EQ03')).map(a => a.titulo).sort();
      return { tem: !!card, links: card ? [...card.querySelectorAll('a')].filter(a => /acao(=|%3D)/.test(a.getAttribute('href') || '')).map(a => a.textContent).sort() : [], esperadas }; });
    assert.ok(eq.tem && eq.esperadas.length && JSON.stringify(eq.links) === JSON.stringify(eq.esperadas), 'ficha do EQ03 lista as ações abertas ligadas a ele ' + JSON.stringify(eq));
    console.log('ok ficha do equipamento: ' + eq.links.length + ' ação(ões) aberta(s) ligada(s) ao EQ03, com o link para abrir');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
