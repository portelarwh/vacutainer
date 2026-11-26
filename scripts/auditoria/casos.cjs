const { abrir } = require('./base.cjs');
abrir(async f => {
  const r = await f.evaluate(() => {
    const d = db(), base = d.productionDays.find(x => !x.deleted), clone = o => JSON.parse(JSON.stringify(o)); const out = {};
    const ev = (s, e, m) => ({ id: 'x' + s, codeId: 'dc_fme', start: s, end: e, minutes: m ?? null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } });
    const rod = (rot, fn) => { const x = clone(base); fn(x); const res = Engine.computeDay(d, x), per = Engine.periodResult(d, [x], {}); out[rot] = { D: per.D, P: per.P, Q: per.Q, oee: per.oee, availMin: per.availMin, netMin: per.netMin, aMin: per.aMin, msgs: (res.msgs || []).map(m => m.sev + ':' + String(m.txt || m.text || m.msg || JSON.stringify(m)).slice(0, 110)).slice(0, 6) }; };
    rod('base', () => { });
    rod('parada 00:00-24:00 (turno 06:00-14:30)', x => x.events.push(ev(0, 1440)));
    rod('parada 06:00-14:30 (igual ao turno)', x => x.events.push(ev(360, 870)));
    rod('parada 05:00-16:00 (maior que o turno)', x => x.events.push(ev(300, 960)));
    rod('parada fora do turno 16:00-18:00', x => x.events.push(ev(960, 1080)));
    rod('produção x1000', x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = (i.good || 1000) * 1000; })));
    rod('produção x3 (acima da capacidade)', x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = (i.good || 1000) * 3; })));
    rod('duas paradas iguais sobrepostas', x => { x.events.push(ev(420, 480)); x.events.push(ev(420, 480)); });
    rod('turno 06:00-06:00', x => { x.shifts[0].snap = { ...x.shifts[0].snap, start: '06:00', end: '06:00' }; });
    return out; });
  console.log(JSON.stringify(r, null, 1));
});
