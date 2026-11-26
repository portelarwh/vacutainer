const { abrir } = require('./base.cjs');
abrir(async (f, p, erros) => {
  const r = await f.evaluate(() => {
    const d = db(), base = d.productionDays.find(x => !x.deleted), clone = o => JSON.parse(JSON.stringify(o));
    let sd = 20261126; const rnd = () => (sd = (sd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff, pick = a => a[Math.floor(rnd() * a.length)];
    const MUT = {
      zeraProducao: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = 0; })),
      producaoGigante: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = (i.good || 1000) * 1000; })),
      producaoNula: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = null; })),
      semIntervalos: x => x.shifts.forEach(s => { s.intervals = []; }),
      semTurnos: x => { x.shifts = []; },
      semEventos: x => { x.events = []; },
      paradaLonga: x => x.events.push({ id: 'f' + rnd(), codeId: 'dc_fme', start: 0, end: 1440, minutes: null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      paradaInvertida: x => x.events.push({ id: 'f' + rnd(), codeId: 'dc_fme', start: 500, end: 400, minutes: null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      paradaSemHorario: x => x.events.push({ id: 'f' + rnd(), codeId: 'dc_fme', start: null, end: null, minutes: 12, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      paradaMinutosNegativos: x => x.events.push({ id: 'f' + rnd(), codeId: 'dc_fme', start: null, end: null, minutes: -30, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      paradaSobreposta: x => { const e = x.events[0]; if (e) x.events.push({ ...clone(e), id: 'g' + rnd() }); },
      paradaCodigoInexistente: x => x.events.push({ id: 'f' + rnd(), codeId: 'nao_existe', start: 420, end: 450, minutes: null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      catalogoInexistente: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.catalogId = 'cat_nao_existe'; })),
      catalogoNulo: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.catalogId = null; })),
      // os três casos de turno mudam o snapshot E os intervalos (o motor usa os intervalos para a duração)
      turnoMadrugada: x => { const s = x.shifts[x.shifts.length - 1]; if (s) { s.snap = { ...s.snap, start: '23:00', end: '30:00' }; s.intervals = [[1380, 1440], [1440, 1500], [1500, 1560], [1560, 1620], [1620, 1680], [1680, 1740], [1740, 1800]].map(([a, b], i) => ({ id: 'nt' + i, start: a, end: b, catalogId: null, good: 40000, note: '', kind: 'padrão' })); } },
      paradaNaVirada: x => x.events.push({ id: 'v' + rnd(), codeId: 'dc_fme', start: 1430, end: 1470, minutes: null, equipmentId: 'mac_eq03', note: 'x', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true } }),
      turnoZeroMinutos: x => { const s = x.shifts[0]; if (s) { s.snap = { ...s.snap, start: '06:00', end: '06:00' }; s.intervals = [{ id: 'z0', start: 360, end: 360, catalogId: null, good: 1000, note: '', kind: 'padrão' }]; } },
      turnoInvertido: x => { const s = x.shifts[0]; if (s) { s.snap = { ...s.snap, start: '14:30', end: '06:00' }; s.intervals = [{ id: 'iv0', start: 870, end: 360, catalogId: null, good: 1000, note: '', kind: 'padrão' }]; } },
      horaExtra: x => x.shifts.forEach(s => s.intervals.push({ id: 'he' + rnd(), start: 300, end: 360, catalogId: (s.intervals[0] || {}).catalogId, good: 500, note: '', kind: 'extra' })),
      textoNoNumero: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = 'abc'; })),
      numeroComoTexto: x => x.shifts.forEach(s => s.intervals.forEach(i => { i.good = String(i.good ?? 0); })),
      refugoMaiorQueProducao: x => x.shifts.forEach(s => { s.scrap = 1e9; }),   // número: o motor lê +ps.scrap
      refugoNegativo: x => x.shifts.forEach(s => { s.scrap = -500; }),
      semAbono: x => { },
    };
    const nomes = Object.keys(MUT), viol = [], vistos = new Set(), prova = {};
    const alvo = (n, fn) => { const x = clone(base); MUT[n](x); const per = Engine.periodResult(d, [x], {}); prova[n] = fn(per, x); };
    alvo('turnoMadrugada', (per, x) => ({ netMin: per.netMin, grossMin: per.grossMin, good: per.good, minNoturno: x.shifts[x.shifts.length - 1].intervals.reduce((a, i) => a + (i.end - i.start), 0) }));
    alvo('refugoMaiorQueProducao', (per) => ({ scrap: per.scrap, good: per.good, Q: per.Q }));
    alvo('turnoZeroMinutos', (per) => ({ netMin: per.netMin, D: per.D, P: per.P }));
    alvo('turnoInvertido', (per) => ({ netMin: per.netMin, D: per.D, P: per.P }));
    alvo('paradaNaVirada', (per) => ({ aMin: per.aMin }));
    const folhas = (o, pre, acc) => { if (o == null) return acc; if (typeof o === 'number') { if (!Number.isFinite(o)) acc.push(pre + '=' + o); } else if (typeof o === 'object') for (const k of Object.keys(o).slice(0, 80)) folhas(o[k], pre + '.' + k, acc); return acc; };
    const tent = (ops, rot) => { const x = clone(base); try { ops.forEach(n => MUT[n](x)); } catch (e) { return; }
      let res, per; try { res = Engine.computeDay(d, x); per = Engine.periodResult(d, [x], {}); } catch (e) { const k = rot + '|exc|' + String(e.message).slice(0, 60); if (!vistos.has(k)) { vistos.add(k); viol.push({ ops, tipo: 'exceção', msg: String(e.message).slice(0, 120) }); } return; }
      const bad = [...folhas(res.agg, 'agg', []), ...folhas(res.r, 'r', []), ...folhas(per, 'per', [])].slice(0, 6);
      if (bad.length) { const k = ops.join('+') + '|nan'; if (!vistos.has(k)) { vistos.add(k); viol.push({ ops, tipo: 'NaN/Infinity', onde: bad }); } }
      const o = per.oee, a = per.D ?? per.availability, pp = per.P ?? per.performance, q = per.Q ?? per.quality;
      for (const [n, v] of [['oee', o], ['D', a], ['P', pp], ['Q', q]]) if (typeof v === 'number' && Number.isFinite(v) && (v < -1e-9 || v > 1.0000001)) { const k = ops.join('+') + '|rng' + n; if (!vistos.has(k)) { vistos.add(k); viol.push({ ops, tipo: 'fora de [0,1]', onde: n + '=' + v }); } }
      if (typeof o === 'number' && Number.isFinite(o) && typeof a === 'number' && typeof pp === 'number' && typeof q === 'number' && Math.abs(o - a * pp * q) > 1e-6) { const k = ops.join('+') + '|prod'; if (!vistos.has(k)) { vistos.add(k); viol.push({ ops, tipo: 'OEE != D*P*Q', onde: `oee=${o} D*P*Q=${a * pp * q}` }); } }
    };
    for (const n of nomes) tent([n], n);
    for (let i = 0; i < 700; i++) { const k = 2 + Math.floor(rnd() * 2), ops = Array.from({ length: k }, () => pick(nomes)); tent(ops, ops.join('+')); }
    return { prova, chavesPer: Object.keys(Engine.periodResult(d, [base], {})).slice(0, 40), per0: (({ D, P, Q, oee, availability, performance, quality }) => ({ D, P, Q, oee, availability, performance, quality }))(Engine.periodResult(d, [base], {})), nviol: viol.length, viol: viol };
  });
  console.log(JSON.stringify(r)); console.log('erros de página', erros.length, erros.slice(0, 3));
});
