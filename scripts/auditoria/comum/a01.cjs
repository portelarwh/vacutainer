const abrir = require('./h.cjs');
abrir(process.argv[2], async f => {
  const r = await f.evaluate(() => { const d = db(), x = d.productionDays.find(y => !y.deleted), orig = JSON.parse(JSON.stringify(x.shifts)), out = {};
    const med = (rot, mut) => { x.shifts = JSON.parse(JSON.stringify(orig)); mut(); x._rev = (x._rev || 0) + 1; const res = Engine.computeDay(d, x), ex = Exports.build(d), pd = ex.porDia.find(e => e.dia === x.date), per = Engine.periodResult(d, [x], {});
      out[rot] = { aggGood: res.agg.good, goodMissing: res.agg.goodMissing, oee: res.agg.oee, porDia: pd && { boa: pd.boa, oee: pd.oee, chaves: Object.keys(pd).join(',') }, periodo: { good: per.good, goodMissing: per.goodMissing } }; };
    const todos = fn => x.shifts.forEach(s => (s.intervals || []).forEach(fn));
    med('base', () => { }); med('nulo', () => todos(i => i.good = null)); med('zero', () => todos(i => i.good = 0));
    x.shifts = orig; x._rev++; return out; });
  console.log(JSON.stringify(r));
}).catch(e => { console.error(e.message.slice(0, 600)); process.exit(1); });
