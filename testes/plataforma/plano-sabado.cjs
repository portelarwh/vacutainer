// Produção 2.6.32 · TUR-04 (decisão do responsável, 21/11/2026): o Plano do mês distribui o plano pelos dias pelo tempo programado de cada dia
// (turnos produtivos vigentes, menos pausas que descontam). O que este teste prova, com dados fictícios da demonstração e uma cópia da base:
//  1. a soma da necessidade dos dias é o plano do mês, e o ritmo esperado é o plano × tempo decorrido ÷ tempo do mês;
//  2. com todos os dias com o mesmo tempo, o resultado é o de antes (plano ÷ dias e necessidade × dias decorridos);
//  3. com o sábado 1 h menor, o sábado pede menos que a sexta, na proporção do tempo; o total do mês não muda.
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
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=plan');
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    const R = await f.evaluate(() => {
      const base = JSON.parse(JSON.stringify(db())), plan = (base.monthPlans || []).find(p => !p.deleted); if (!plan) return { semPlano: true };
      const asOf = plan.month + '-15', sab = d => new Date(d + 'T12:00:00').getDay() === 6;
      const resumo = (D) => { const r = Engine.monthPlanResult(D, plan, asOf), dias = r.cal.days.filter(x => r.needDia[x.date] != null);
        const sx = dias.find(x => sab(x.date)), sexta = sx && dias.find(x => x.date === U.addDays(sx.date, -1));
        return { total: r.PL.total, soma: dias.reduce((a, x) => a + r.needDia[x.date], 0), need: r.need, elapsed: r.elapsed, pace: r.paceTarget, nSab: sx ? r.needDia[sx.date] : null, nSex: sexta ? r.needDia[sexta.date] : null, pSab: sx ? r.peso[sx.date] : null, pSex: sexta ? r.peso[sexta.date] : null }; };
      const igual = resumo(base);
      /* cópia com o sábado 1 h menor: cada versão de turno que vale no sábado ganha uma versão só de sábado, terminando 60 min antes */
      const D2 = JSON.parse(JSON.stringify(base));
      for (const s of D2.shifts || []) { const novas = []; for (const v of s.versions || []) { if (v.deleted || !(v.weekdays || []).includes(6) || v.productive === false) continue;
        v.weekdays = v.weekdays.filter(w => w !== 6); const e = U.toMin(v.end), m = ((e - 60) % 1440 + 1440) % 1440; novas.push({ ...JSON.parse(JSON.stringify(v)), id: v.id + '_sab', weekdays: [6], end: U.hhmm(m) }); } s.versions.push(...novas); }
      return { igual, menor: resumo(D2) };
    });
    assert.ok(!R.semPlano, 'a demonstração tem plano do mês');
    const { igual, menor } = R, perto = (a, b, t = 1e-6) => Math.abs(a - b) <= t * Math.max(1, Math.abs(b));
    assert.ok(perto(igual.soma, igual.total), 'soma da necessidade dos dias = plano ' + JSON.stringify(igual));
    assert.ok(perto(igual.nSab, igual.nSex) && perto(igual.nSab, igual.need) && perto(igual.pace, igual.need * igual.elapsed), 'dias iguais: o resultado de antes ' + JSON.stringify(igual));
    console.log('ok dias com o mesmo tempo: plano ÷ dias e ritmo = necessidade × dias decorridos (como antes)');
    assert.ok(perto(menor.soma, menor.total) && menor.total === igual.total, 'sábado menor: o total do mês não muda ' + JSON.stringify(menor));
    assert.ok(menor.nSab < menor.nSex && perto(menor.nSab / menor.nSex, menor.pSab / menor.pSex), 'sábado menor pede menos, na proporção do tempo ' + JSON.stringify(menor));
    assert.ok(menor.pSex - menor.pSab >= 59, 'o sábado tem 1 h a menos de tempo programado ' + JSON.stringify(menor));
    console.log('ok sábado 1 h menor: pede menos que a sexta, na proporção do tempo (' + Math.round(menor.nSab) + ' × ' + Math.round(menor.nSex) + '); total igual');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
