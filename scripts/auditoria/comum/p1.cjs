const abrir = require('./h.cjs');
abrir(process.argv[2], async f => { console.log(JSON.stringify(await f.evaluate(() => { const d = db(), x = d.productionDays.find(y => !y.deleted), out = {}, orig = JSON.parse(JSON.stringify(x.shifts));
  // A04(B): MAX_VALUE
  x.shifts[0].intervals[0].good = Number.MAX_VALUE; x.shifts[0].intervals[1].good = Number.MAX_VALUE; x._rev++; const r = Engine.computeDayRaw(d, x), bad = []; (function w(o, p) { if (o && typeof o === 'object') for (const k of Object.keys(o).slice(0, 200)) w(o[k], p + '.' + k); else if (typeof o === 'number' && !isFinite(o)) bad.push(p); })(r.agg, 'agg'); out.maxValue = { naoFinitos: bad.length, ex: bad.slice(0, 4) };
  x.shifts = JSON.parse(JSON.stringify(orig)); x._rev++;
  // F04: filtro de turno em Lotes do MES
  const sh = d.shifts.filter(s => !s.deleted).map(s => s.id); const R = {}, T = RpTab.st(R); T.mod = 'lotes'; T.from = '2026-11-01'; T.to = '2026-11-30'; const txt = () => JSON.stringify(RpTab.model(R).blocks).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  T.turno = ''; const todos = txt(); out.lotes = {}; for (const s of sh) { T.turno = s; out.lotes[s] = txt() === todos; } out.turnosIgualAoSemFiltro = out.lotes;
  // G03: periodResult com N dias
  const base = d.productionDays.find(y => !y.deleted), mk = n => { const arr = []; for (let i = 0; i < n; i++) { const c = JSON.parse(JSON.stringify(base)); c.id = 'g' + i; c.date = new Date(Date.UTC(2025, 0, 1) + i * 864e5).toISOString().slice(0, 10); arr.push(c); } return arr; };
  out.perf = {}; for (const n of [30, 365, 730]) { const days = mk(n), dd = { ...d, productionDays: d.productionDays.concat(days) }; const t0 = performance.now(); Engine.periodResult(dd, days, {}); const t1 = performance.now(); Engine.periodResult(dd, days, {}); out.perf[n] = [Math.round(t1 - t0), Math.round(performance.now() - t1)]; }
  return out; }), null, 0)); }).catch(e => console.error(e.message.slice(0, 500)));
