// Produção 2.6.32 · TUR-05 (decisão do responsável, 21/11/2026): dia fechado com o horário antigo do turno é recalculado com o horário corrigido.
// O que este teste prova, na demonstração (dados fictícios, só na memória):
//  1. depois de corrigir o horário de um turno no cadastro, o dia fechado aparece no aviso do Lançamento e em Pendências;
//  2. "Recalcular com o horário corrigido" reabre com o motivo (o fechamento anterior fica no histórico, com os números), aplica o horário e
//     fecha de novo: o dia volta fechado, com o turno no horário novo e a produção das horas que continuam;
//  3. a mesma recusa do dia aberto: com produção numa hora que some, nada muda (o dia continua fechado, sem reabertura).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=launch');
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    /* um dia com produção, fechado; depois o último turno é corrigido no cadastro para terminar 30 min depois (as horas que existiam continuam) */
    const prep = await f.evaluate(() => {
      const D = db(), dias = D.productionDays.filter(d => !d.deleted && d.lineId === 'line_vac').sort((a, b) => b.date.localeCompare(a.date));
      const d = dias.find(x => x.shifts.filter(p => !p.deleted && !p.off).length >= 2); if (!d) return { erro: 'sem dia' };
      if (d.status !== 'fechado') { for (const p of d.shifts.filter(p => !p.deleted && !p.off)) try { Actions.setShiftSQDCP(d.id, p.id, { acidente: { resposta: 'nao' }, qn: { resposta: 'nao' } }); } catch (e) { }
        try { Actions.closeDay(d.id); } catch (e) { return { erro: 'fechar: ' + e.message }; } }
      const ps = db().productionDays.find(x => x.id === d.id).shifts.filter(p => !p.deleted && !p.off).sort((a, b) => U.toMin(a.snap.start) - U.toMin(b.snap.start)).pop();
      const sh = D.shifts.find(s => s.id === ps.shiftId), v = sh.versions.find(x => x.id === ps.shiftVersionId);
      const fim = U.toMin(v.end), ult = ps.intervals.filter(i => !i.deleted).sort((a, b) => b.end - a.end)[0];
      Store.mutate(db2 => { const s2 = db2.shifts.find(s => s.id === sh.id), v2 = s2.versions.find(x => x.id === v.id); v2.end = U.hhmm((fim + 30) % 1440); });
      App.sel.date = d.date; App.sel.lineId = d.lineId; go('launch');
      return { id: d.id, date: d.date, ps: ps.id, fechado: db().productionDays.find(x => x.id === d.id).status, reab: (d.reopenHistory || []).length, ult: ult && ult.end };
    });
    assert.ok(!prep.erro, 'preparação: ' + JSON.stringify(prep)); assert.equal(prep.fechado, 'fechado');
    await f.waitForSelector('#horFechado #horRecalc');
    const pend = await f.evaluate(async () => { go('pend'); await new Promise(r => setTimeout(r, 400)); return document.querySelector('#main').textContent.includes('Dias fechados com o horário antigo do turno'); });
    assert.ok(pend, 'Pendências lista o dia fechado com o horário antigo');
    console.log('ok dia fechado com o horário antigo: aviso no Lançamento e em Pendências');
    await f.evaluate(id => { const d = db().productionDays.find(x => x.id === id); App.sel.date = d.date; go('launch'); }, prep.id);
    await f.click('#horRecalc'); await f.waitForFunction(id => !document.querySelector('#horFechado') && db().productionDays.find(x => x.id === id).status === 'fechado', prep.id);
    const dep = await f.evaluate(([id, psId]) => { const d = db().productionDays.find(x => x.id === id), ps = d.shifts.find(p => p.id === psId);
      return { status: d.status, reab: (d.reopenHistory || []).length, motivo: (d.reopenHistory || []).slice(-1)[0]?.reason, snap: !!(d.reopenHistory || []).slice(-1)[0]?.snapshot, dif: Actions.shiftScheduleDiff(db(), d, true).length, fimTurno: Math.max(...ps.intervals.filter(i => !i.deleted).map(i => i.end)) }; }, [prep.id, prep.ps]);
    assert.equal(dep.status, 'fechado'); assert.equal(dep.reab, prep.reab + 1, 'uma reabertura no histórico'); assert.match(dep.motivo, /TUR-05/); assert.ok(dep.snap, 'o fechamento anterior fica no histórico com os números');
    assert.equal(dep.dif, 0, 'o dia ficou com o horário corrigido'); assert.ok(dep.fimTurno > prep.ult, 'o turno termina mais tarde (horário corrigido)');
    console.log('ok recalcular: reabre com o motivo, aplica o horário corrigido e fecha de novo; o fechamento anterior fica no histórico');
    /* recusa: produção numa hora que some → nada muda */
    const rec = await f.evaluate(([id, psId]) => { const d = db().productionDays.find(x => x.id === id), ps = d.shifts.find(p => p.id === psId), sh = db().shifts.find(s => s.id === ps.shiftId), v = sh.versions.find(x => x.id === ps.shiftVersionId);
      const ini = U.toMin(v.start); Store.mutate(db2 => { const v2 = db2.shifts.find(s => s.id === sh.id).versions.find(x => x.id === v.id); v2.start = U.hhmm((ini + 120) % 1440); });
      const antes = (d.reopenHistory || []).length; let msg = ''; try { Actions.recalcClosedSchedule(id); } catch (e) { msg = e.message; }
      const d2 = db().productionDays.find(x => x.id === id); return { msg, status: d2.status, reab: (d2.reopenHistory || []).length - antes }; }, [prep.id, prep.ps]);
    assert.ok(rec.msg && rec.status === 'fechado' && rec.reab === 0, 'produção numa hora que some: nada muda ' + JSON.stringify(rec));
    console.log('ok produção numa hora que some: recusa antes de reabrir (' + rec.msg.slice(0, 60) + '…)');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
