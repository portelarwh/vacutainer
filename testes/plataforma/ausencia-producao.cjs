// Análise comum 26/11/2026 (C01/P2, C07, P3): produção em branco é ausência (não zero) no resumo publicado e fica fora dos consolidados;
// intervalo com início igual ou depois do fim vira erro visível; relatório do turno avisa Performance acima de 100%. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'UTC' }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message)); await p.clock.setFixedTime(new Date('2026-11-19T15:00:00Z'));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=reports');
    const q = p.locator('iframe[title="Módulo Produção"]'); await q.contentFrame().locator('body').waitFor({ state: 'attached', timeout: 60000 });
    const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto() && typeof Exports !== 'undefined', null, { timeout: 60000 });
    const r = await f.evaluate(() => {
      const d = db(), x = d.productionDays.find(y => !y.deleted), orig = JSON.parse(JSON.stringify(x.shifts)), out = {}, ivs = () => x.shifts.flatMap(s => s.intervals);
      const dia = () => Exports.build(d).porDia.find(e => e.dia === x.date);
      out.base = (({ boa, oee, cap, semLancamento, ausentes }) => ({ boa, oee, cap, semLancamento, ausentes }))(dia());
      ivs().forEach(i => { i.good = null; }); x._rev++; out.vazio = dia();
      x.shifts = JSON.parse(JSON.stringify(orig)); ivs()[0].good = null; x._rev++; out.parcial = (({ boa, oee, semLancamento, ausentes }) => ({ boa, oee, semLancamento, ausentes }))(dia());
      x.shifts = JSON.parse(JSON.stringify(orig)); x._rev++;
      // intervalo invertido
      const i0 = ivs()[0], e0 = i0.end; i0.end = i0.start; x._rev++; out.msgInvertido = Engine.computeDay(d, x).msgs.filter(m => /início igual ou depois do fim/.test(m.msg)).map(m => m.level); i0.end = e0; x._rev++;
      // Performance acima de 100% no relatório do turno
      ivs().forEach(i => { i.good = 5e6; }); x._rev++; const R = rpState(); R.type = 'shift'; R.date = x.date; R.psId = x.shifts[0].id; const M = rpModel(R); out.kpiP = (M.kpis.find(k => k.l === 'Performance') || {}).s || '';
      return out;
    });
    assert.ok(r.base.boa > 0 && r.base.oee > 0 && !r.base.semLancamento && r.base.ausentes === undefined, 'dia completo segue igual: ' + JSON.stringify(r.base));
    assert.equal(r.vazio.semLancamento, true, 'dia em branco é marcado sem lançamento'); assert.deepEqual([r.vazio.boa, r.vazio.oee, r.vazio.cap, r.vazio.metaOp], [null, null, null, null], 'e não vira zero: ' + JSON.stringify(r.vazio));
    assert.equal(r.parcial.ausentes, 1, 'dia parcial informa quantos intervalos faltam'); assert.ok(r.parcial.boa > 0 && !r.parcial.semLancamento, 'e continua com o lançado: ' + JSON.stringify(r.parcial));
    assert.deepEqual(r.msgInvertido, ['erro'], 'intervalo com início igual ao fim vira erro visível'); assert.match(r.kpiP, /acima de 100%/, 'o relatório avisa Performance acima de 100%: ' + r.kpiP);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok ausência: produção em branco não vira zero e fica fora dos consolidados; intervalo invertido é erro; relatório avisa Performance > 100%');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
