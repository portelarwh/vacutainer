// Plataforma 1.8.14 (Produção 2.6.11) · abas agrupadas (Proposta A, aprovada em 18/11/2026): Ordens e lotes, Resultados e Paradas.
// A barra de escolha fica separada no topo e sempre à vista (também em "Ordens (plano do mês)" e "Lotes"); endereços antigos abrem
// a tela certa dentro do grupo; sem "Imprimir módulo"; nenhum turno aberto por padrão no Lançamento. Dados fictícios (demonstração).
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
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const f = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    const w = ms => page.waitForTimeout(ms || 700);
    await w(1200);

    // 1) barra de abas da casca: 11 abas, na ordem aprovada, sem Painel, Hora a hora, Semanal, Mensal, Linha do tempo e Lotes; sem "Imprimir módulo"
    const abas = await page.evaluate(() => [...document.querySelectorAll('.module-tabs [data-tab-id]')].map(b => b.textContent.trim()));
    assert.deepEqual(abas, ['Lançamento', 'Pendências', 'Visão Geral', 'Resultados', 'Paradas', 'Plano do mês', 'Ordens e lotes', 'Relatórios', 'SQDCP', 'Equipamentos', '⚙ Config.']);
    assert.equal(await page.getByRole('button', { name: 'Imprimir módulo', exact: true }).count(), 0, 'sem Imprimir módulo');
    console.log('ok barra: ' + abas.join(' · ') + '; sem Imprimir módulo');

    // 2) Lançamento: nenhum turno aberto por padrão
    assert.equal(await f.locator('section.tl[data-tl]:not(.tr-oculto)').count(), 0, 'nenhum turno aberto por padrão');
    console.log('ok Lançamento sem turno aberto por padrão');

    // 3) Ordens e lotes: a barra fica à vista em todas as escolhas, separada do cartão de filtros
    await page.locator('.module-tabs [data-tab-id="ordens"]').click(); await w(1200);
    const esc = { lista: 'Ordens produzidas', plano: 'Ordens (plano do mês)', conc: 'Conciliação', hist: 'Histórico de competências', lotes: 'Lotes (MES)' };
    for (const [k, nome] of Object.entries(esc)) {
      await f.click(`[data-grpsub="ordens|${k}"]`); await w();
      const r = await f.evaluate(() => { const b = document.querySelector('.grp-sub'); return { sel: b && b.querySelector('[aria-selected="true"]')?.textContent, fora: !!b && !b.closest('.card'), primeiro: !!b && b === document.querySelector('#main').querySelector('.grp-sub, .card, section') }; });
      assert.deepEqual(r, { sel: nome, fora: true, primeiro: true }, k);
    }
    assert.ok(await f.evaluate(() => /Histórico de lotes/i.test(document.querySelector('#main').textContent)), 'Lotes (MES) mostra a tela de Lotes');
    await f.click('[data-grpsub="ordens|plano"]'); await w();
    assert.ok(await f.evaluate(() => !!document.querySelector('#pmK')), 'Ordens (plano do mês) mostra o Plano do mês sem sair da aba');
    assert.equal(await f.evaluate(() => App.route), 'ordens');
    console.log('ok Ordens e lotes: a barra fica à vista e separada em Ordens produzidas, plano do mês, Conciliação, Histórico e Lotes');

    // 4) Resultados e Paradas: escolha lembrada; endereços antigos abrem a tela certa dentro do grupo
    await page.locator('.module-tabs [data-tab-id="history"]').click(); await w(1000);
    await f.click('[data-grpsub="history|monthly"]'); await w();
    assert.equal(await f.evaluate(() => [App.route, GrpAbas.rota(), App.prefs.grpSub.history].join()), 'history,monthly,monthly');
    await page.locator('.module-tabs [data-tab-id="stops"]').click(); await w(1000);
    await page.locator('.module-tabs [data-tab-id="history"]').click(); await w(1000);
    assert.equal(await f.evaluate(() => GrpAbas.rota()), 'monthly', 'Resultados volta no Mensal (lembrado)');
    for (const [antiga, pai] of [['weekly', 'history'], ['timeline', 'stops'], ['lots', 'ordens']]) {
      await f.evaluate(r => go(r), antiga); await w();
      const r = await f.evaluate(() => ({ route: App.route, rota: GrpAbas.rota(), barra: !!document.querySelector('.grp-sub [aria-selected="true"]') }));
      assert.deepEqual(r, { route: pai, rota: antiga, barra: true }, antiga);
    }
    console.log('ok Resultados e Paradas: escolha lembrada; go(weekly/timeline/lots) abre dentro do grupo');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok abas agrupadas: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
