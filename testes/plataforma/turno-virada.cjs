// Plataforma 1.8.29 (Produção 2.6.21) · TUR-07: turno produtivo que passa da meia-noite (ex.: 3º turno habilitado) dividido no TOTAL DO DIA
// (decisão do responsável, 20/11/2026; dias desde 01/11/2026): a parte depois de 00:00 sai do dia em que o turno começou e entra no dia
// seguinte; o turno continua um só, com o OEE do turno inteiro. A demonstração tem um dia: o teste estende o 2º turno até 01:00 e copia o dia. Scrap do turno proporcional à produção; paradas sem horário ao tempo.
// Nada se perde nem duplica entre os dois dias. Dados fictícios: valores postos só na memória da página da demonstração.
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

    const r = await o.evaluate(() => {
      const d = db(), dias = d.productionDays.filter(x => !x.deleted).sort((a, b) => a.date.localeCompare(b.date));
      const cruza = x => x.shifts.find(p => !p.deleted && p.intervals.some(i => !i.deleted && i.end > 1440));   /* na demonstração o 3º turno está sem produção: o teste o habilita só na memória */
      /* a demonstração tem um dia só: o 2º turno passa a ir até 01:00 (22:47–00:00 e 00:00–01:00) e o dia seguinte é uma cópia do dia */
      const base = dias[dias.length - 1], ult = base.shifts.filter(p => !p.deleted).sort((x, y) => x.intervals[0].start - y.intervals[0].start).pop(), fim = Math.max(...ult.intervals.map(i => i.end));
      ult.intervals.push({ id: 'tst_iv1', start: fim, end: 1440, catalogId: null, good: null, note: '', kind: 'manual' }, { id: 'tst_iv2', start: 1440, end: 1500, catalogId: null, good: null, note: '', kind: 'manual' });
      const prox = JSON.parse(JSON.stringify(base)); prox.id = 'tst_day'; prox.date = U.addDays(base.date, 1); prox.shifts.forEach(p => { p.id = 'tst_' + p.id; p.intervals = p.intervals.filter(i => !/^tst_/.test(i.id)).map(i => ({ ...i, id: 'tst_' + i.id })); }); prox.events = [];
      d.productionDays.push(prox); dias.push(prox);
      let d0 = dias.find(x => x.date >= '2026-11-01' && cruza(x) && dias.some(y => y.date === U.addDays(x.date, 1) && y.lineId === x.lineId));
      if (!d0) return { semPar: true };
      const d1 = dias.find(y => y.date === U.addDays(d0.date, 1) && y.lineId === d0.lineId), t = cruza(d0);
      /* valores fictícios no turno que passa da meia-noite: 50 mil por hora e 1.000 de scrap; uma parada sem horário de 70 min */
      t.off = false; t.offType = null; t.intervals.filter(i => !i.deleted).forEach(i => { i.good = 50000; }); t.scrap = 1000;
      const cod = d.downtimeCodes.find(c => c.active !== false && c.affectsA); d0.events.push({ id: 'tst_ev', productionShiftId: t.id, codeId: cod.id, minutes: 70, start: null, end: null, intervalId: null });
      d0._rev = (d0._rev || 0) + 1; d1._rev = (d1._rev || 0) + 1;
      const r0 = Engine.computeDay(d, d0), r1 = Engine.computeDay(d, d1), s0 = r0.shifts.find(x => x.ps === t);
      const depois = t.intervals.filter(i => !i.deleted).reduce((a, i) => a + (i.end <= 1440 ? 0 : i.start >= 1440 ? 50000 : 50000 * (i.end - 1440) / (i.end - i.start)), 0);
      const soma = rr => rr.shifts.reduce((a, x) => a + x.agg.good, 0);
      return { d0: d0.date, d1: d1.date, turno: t.snap.name, depois, vira: r0.virada && r0.virada.agg.good, vem: r1.vem && r1.vem.agg.good, de: r1.vem && r1.vem.de,
        cons0: Math.round(r0.agg.good - (soma(r0) - r0.virada.agg.good + (r0.vem ? r0.vem.agg.good : 0))), cons1: Math.round(r1.agg.good - (soma(r1) - (r1.virada ? r1.virada.agg.good : 0) + r1.vem.agg.good)),
        scrapK: +(r0.virada.agg.scrap / s0.agg.scrap).toFixed(4), goodK: +(r0.virada.agg.good / s0.agg.good).toFixed(4), paradaK: +((r0.virada.agg.aMin + r0.virada.agg.pMin + r0.virada.agg.deductMin) > 0 ? 1 : 0),
        turnoInteiro: Math.round(s0.agg.good) === Math.round(t.intervals.filter(i => !i.deleted).length * 50000 + 0) || s0.agg.good > r0.virada.agg.good,
        msg0: r0.msgs.some(m => /depois de 00:00 contam no total de/.test(m.text || m.msg || '')), msg1: r1.msgs.some(m => /Inclui .* depois de 00:00/.test(m.text || m.msg || '')),
        antigo: (() => { d.settings.foraTurnoRelogioDesde = '2027-01-01'; d0._rev++; d1._rev++; try { const a = Engine.computeDay(d, d0), b = Engine.computeDay(d, d1); return { v: !!a.virada, m: !!b.vem }; } finally { delete d.settings.foraTurnoRelogioDesde; d0._rev++; d1._rev++; } })() };
    });
    assert.ok(!r.semPar, 'a demonstração tem dois dias seguidos com um turno que passa da meia-noite');
    assert.ok(r.depois > 0 && Math.abs(r.vira - r.depois) < 1, `parte depois de 00:00: ${r.vira} = ${r.depois}`);
    assert.equal(r.vem, r.vira, 'o dia seguinte recebe exatamente a mesma parte'); assert.equal(r.de, r.d0);
    assert.equal(r.cons0, 0); assert.equal(r.cons1, 0); assert.equal(r.scrapK, r.goodK, 'scrap proporcional à produção'); assert.ok(r.turnoInteiro, 'o turno continua inteiro');
    assert.ok(r.msg0 && r.msg1, 'avisos nos dois dias'); assert.deepEqual(r.antigo, { v: false, m: false }, 'antes da data da regra: nada muda');
    console.log(`ok ${r.turno} de ${r.d0}: ${r.vira} produzidos depois de 00:00 saem do total de ${r.d0} e entram em ${r.d1}; scrap na mesma proporção (${r.scrapK}); nada se perde nem duplica`);

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok turno que passa da meia-noite: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
