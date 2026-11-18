// Plataforma 1.8.3 (Produção 2.6.3) · Lançamento: card Scrap (total), "OEE do dia" no Editar cards e com semáforo,
// turnos em resumo lado a lado (o clicado abre o detalhe), semáforo no cartão do turno e sem a aba Painel repetida.
// Demonstração: dados fictícios. Nenhum número muda: o card de scrap usa r.scrap e r.scrapPct do cálculo.
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
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    await f.evaluate(() => { App.prefs.kcOff = []; delete App.prefs.lcTurno; savePrefs(); go('launch'); });
    await f.waitForSelector('.tr-faixa');

    // 1) card Scrap (total): mesmo número do cálculo; sem lançamento, "—"
    const sc = await f.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), c = [...document.querySelectorAll('.kpis > .kpi')].find(k => KC.chave(k) === 'Scrap (total)');
      return { v: c && c.querySelector('.v').textContent, s: c && c.querySelector('.s').textContent, esp: U.fmt(res.r.scrap) + 'peças', pct: U.pct(res.r.scrapPct, 2),
        soma: U.sum(day.shifts.filter(p => p.scrap != null), p => p.scrap) === res.r.scrap,
        vazio: ScrapDia.conhecido({ scrapMode: 'shift', shifts: [{ scrap: null, snap: { name: 'A' } }] }) }; });
    assert.equal(sc.v, sc.esp, 'card Scrap (total) com o número do cálculo'); assert.ok(sc.s.includes(sc.pct), 'mesmo % do card Qualidade');
    assert.ok(sc.soma, 'soma do scrap dos turnos'); assert.equal(sc.vazio, '', 'sem scrap lançado: desconhecido, não zero');
    console.log('ok Scrap (total): ' + sc.v + ' · ' + sc.pct + ' (soma dos turnos)');

    // 2) OEE do dia aparece no Editar cards, desliga e volta; barras pelo semáforo
    const oee = await f.evaluate(() => { KC.editar(); const box = document.querySelector('[data-kc="' + KC.OEE_DIA + '"]'), lista = [...document.querySelectorAll('[data-kc]')].map(c => c.dataset.kc);
      const cores = [...document.querySelectorAll('.v2-oeeh svg rect')].map(r => r.getAttribute('fill'));
      return { tem: !!box, scrap: lista.includes('Scrap (total)'), cores: [...new Set(cores)] }; });
    assert.ok(oee.tem, 'OEE do dia na lista do Editar cards'); assert.ok(oee.scrap, 'Scrap (total) na lista do Editar cards');
    assert.ok(oee.cores.every(c => /--ok|--warn|--crit/.test(c)), 'barras do OEE do dia pelo semáforo ' + JSON.stringify(oee.cores));
    await f.locator('[data-kc="OEE do dia (evolução por hora)"]').uncheck(); await f.waitForTimeout(400);
    assert.equal(await f.locator('.v2-oeeh').count(), 0, 'desligado: o gráfico some');
    await f.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); App.prefs.kcOff = []; savePrefs(); render(); }); await f.waitForTimeout(400);
    assert.equal(await f.locator('.v2-oeeh').count(), 1, 'ligado de novo: o gráfico volta');
    console.log('ok OEE do dia: na lista do Editar cards, desliga e volta; barras verde/atenção/vermelho');

    // 3) turnos em resumo (2.6.10): nenhum aberto por padrão; clicar abre; outro troca; clicar no aberto recolhe
    const t0 = await f.evaluate(() => ({ n: document.querySelectorAll('[data-trturno]').length, tl: document.querySelectorAll('section.tl[data-tl]').length, vis: [...document.querySelectorAll('section.tl[data-tl]')].filter(s => !s.classList.contains('tr-oculto')).map(s => s.dataset.tl), on: [...document.querySelectorAll('[data-trturno].on')].map(b => b.dataset.trturno) }));
    assert.equal(t0.n, t0.tl, 'um resumo por turno'); assert.equal(t0.vis.length, 0, 'nenhum turno aberto por padrão'); assert.deepEqual(t0.on, [], 'nenhum resumo marcado');
    const prim = await f.evaluate(() => document.querySelector('[data-trturno]').dataset.trturno); await f.locator(`[data-trturno="${prim}"]`).click();
    assert.deepEqual(await f.evaluate(() => [...document.querySelectorAll('section.tl[data-tl]')].filter(s => !s.classList.contains('tr-oculto')).map(s => s.dataset.tl)), [prim], 'clicar abre o detalhe'); t0.vis = [prim];
    const outro = await f.evaluate(v => [...document.querySelectorAll('[data-trturno]')].map(b => b.dataset.trturno).find(id => id !== v), t0.vis[0]);
    await f.locator(`[data-trturno="${outro}"]`).click();
    const t1 = await f.evaluate(() => [...document.querySelectorAll('section.tl[data-tl]')].filter(s => !s.classList.contains('tr-oculto')).map(s => s.dataset.tl));
    assert.deepEqual(t1, [outro], 'clicar abre o outro turno');
    await f.evaluate(() => render()); assert.deepEqual(await f.evaluate(() => [...document.querySelectorAll('section.tl[data-tl]')].filter(s => !s.classList.contains('tr-oculto')).map(s => s.dataset.tl)), [outro], 'escolha lembrada');
    await f.locator(`[data-trturno="${outro}"]`).click();
    assert.equal(await f.locator('section.tl[data-tl]:not(.tr-oculto)').count(), 0, 'clicar no aberto recolhe');
    await f.evaluate(id => document.querySelector(`[data-ir-turno="${id}"]`)?.click(), t0.vis[0]);
    if (await f.locator('[data-ir-turno]').count()) assert.equal(await f.locator(`section.tl[data-tl="${t0.vis[0]}"]:not(.tr-oculto)`).count(), 1, '"cartão ↓" abre o turno');
    console.log('ok turnos em resumo: nenhum aberto por padrão, clicar abre, outro troca, clicar de novo recolhe');

    // 4) semáforo no cartão do turno (94% e OEE perto da meta → amarelo)
    const sem = await f.evaluate(() => { const res = Engine.computeDay(db(), curDay()), st = db().settings.semaphore || {};
      return res.shifts.map(sr => { const s = document.querySelector(`section.tl[data-tl="${sr.ps.id}"]`), meta = sr.r.metaOp, b = s.querySelector('.tl-pinfo .tl-okt,.tl-pinfo .tl-warnt,.tl-pinfo .tl-bad');
        return { esp: sr.r.good >= meta ? 'tl-okt' : { ok: 'tl-okt', warn: 'tl-warnt', crit: 'tl-bad' }[Engine.sem(sr.r.attain, st)], tem: b && b.className }; }); });
    sem.forEach(x => assert.equal(x.tem, x.esp, 'meta do turno pelo semáforo'));
    console.log('ok cartão do turno: meta e OEE pelo semáforo (' + sem.map(x => x.tem).join(', ') + ')');

    // 5) aba Painel repetida fora da barra; o endereço antigo abre a Visão Geral
    const pn = await f.evaluate(() => ({ abas: visibleRoutes().map(r => r[0]), tab: !!document.querySelector('[data-route="panel"]') }));
    assert.ok(!pn.abas.includes('panel') && !pn.tab, 'sem aba Painel'); assert.ok(pn.abas.includes('overview'), 'Visão Geral continua');
    await f.evaluate(() => go('panel')); await f.waitForTimeout(500);
    assert.equal(await f.evaluate(() => App.route), 'overview', 'endereço antigo do Painel abre a Visão Geral');
    console.log('ok aba Painel: fora da barra; endereço antigo abre a Visão Geral');

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok lançamento 1.8.3: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
