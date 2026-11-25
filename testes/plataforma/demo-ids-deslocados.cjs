// Bloco 3: a demonstração desloca as datas do cenário para "hoje". Os ids derivados do cadastro (catálogo, versão de turno, meta) carregam
// a data da vigência; se o id do lançamento não andar junto com a data do cadastro, o dia aponta para um catálogo que não existe e a capacidade
// planejada vira 0. Com o relógio em um dia diferente do de referência do cenário, o dia tem de calcular igual (sem "Catálogo inexistente").
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');
(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  try {
    const r = {};
    for (const hoje of ['2026-11-09', '2026-11-25', '2027-03-02']) {
      const ctx = await browser.newContext({ timezoneId: 'America/Sao_Paulo' }), page = await ctx.newPage(); page.on('pageerror', e => erros.push(e.message));
      await page.clock.setFixedTime(new Date(hoje + 'T15:00:00Z'));
      await page.goto('http://127.0.0.1:' + srv.address().port + '/Plataforma.html?demo=1#/oee?tab=launch');
      const q = page.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 30000 });
      const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && db().productionDays.length, null, { timeout: 30000 });
      r[hoje] = await f.evaluate(() => { const d = db(), dia = d.productionDays.find(x => !x.deleted), res = Engine.computeDay(d, dia);
        const cats = new Set(d.catalogs.map(c => c.id)), shv = new Set(d.shifts.flatMap(s => s.versions.map(v => v.id)));
        const orfaos = []; for (const s of dia.shifts) { if (s.initialCatalogId && !cats.has(s.initialCatalogId)) orfaos.push(s.initialCatalogId); if (s.shiftVersionId && !shv.has(s.shiftVersionId)) orfaos.push(s.shiftVersionId); }
        return { cap: res.agg.cap, good: res.agg.good, orfaos, msgs: res.msgs.filter(m => m.level === 'erro').length }; });
      await ctx.close();
    }
    for (const [hoje, x] of Object.entries(r)) { assert.deepEqual(x.orfaos, [], hoje + ': todo id do lançamento existe nas tabelas do cadastro ' + JSON.stringify(x)); assert.ok(x.cap > 0 && x.msgs === 0, hoje + ': capacidade planejada calculada e sem erro do motor ' + JSON.stringify(x)); }
    const caps = new Set(Object.values(r).map(x => x.cap + '|' + x.good)); assert.equal(caps.size, 1, 'o mesmo dia do cenário dá o mesmo resultado em qualquer data de relógio: ' + JSON.stringify(r));
    assert.deepEqual(erros, []);
    console.log('ok demonstração: ids do lançamento acompanham as datas do cadastro em 3 datas de relógio (capacidade e produção iguais)');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
