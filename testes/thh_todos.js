// Produção 2.4.59 · todos os gráficos hora a hora com a lógica de Apontamento › Hora a hora (pedido do usuário, 12/11/2026).
// Cenário do thh24: dias 10 e 11/03/2026, só os turnos A e B produtivos, caixas do MES das 04:00 às 06:20 de 11/03 (contam no turno A).
// Confere que 04:00 e 05:00 aparecem antes das 06:00, como no Apontamento, em: Visão Geral (Produção por hora do dia), Painel › bloco
// Hora a hora (1 dia e período), TV › Painel do dia e Relatórios › Passagem de turno (turno A); e que os valores das horas dentro do turno
// são os do Apontamento. Código 1 se falhar.
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PREP = fs.readFileSync(__dirname + '/thh24.js', 'utf8').match(/const PREP = \(\) => \{[\s\S]*?\n\};\n/)[0].replace('const PREP = ', '(').replace(/\};\n$/, '})()');
(async () => {
  const b = await chromium.launch(); const pe = [];
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message));
  await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(900);
  await o.evaluate(PREP); await o.waitForTimeout(700);
  const R = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)), out = {};
    const eixo = el => el ? [...el.querySelectorAll('svg text')].map(t => t.textContent.trim()).filter(t => /^\d\d:\d\d$/.test(t)) : [];
    const ordem = L => L.indexOf('04:00') >= 0 && L.indexOf('05:00') > L.indexOf('04:00') && L.indexOf('06:00') > L.indexOf('05:00');
    const day = db().productionDays.find(d => d.date === '2026-03-11'), res = Engine.computeDay(db(), day);
    // Apontamento (referência): gráfico do hora a hora, todos os turnos
    HHPs.sel = null; App.sel.date = '2026-03-11'; go('hourly'); await w(500);
    const ap = [...document.querySelectorAll('#main section.card')].find(s => /Atendimento hora a hora/.test(s.textContent)); out.ap = eixo(ap);
    // o mesmo gráfico pela função comum
    const oD = HHComum.dia(day, res, '', 200); out.dia = oD.x; out.diaIgualAp = JSON.stringify(oD.x) === JSON.stringify(out.ap.length ? oD.x.filter(k => out.ap.includes(k)) : oD.x);
    const oA = HHComum.dia(day, res, day.shifts.find(p => p.snap.code === 'T1').id, 200); out.turnoA = oA.x;
    const oB = HHComum.dia(day, res, day.shifts.find(p => p.snap.code === 'T2').id, 200); out.turnoB = oB.x;
    // período (10 e 11/03): média por dia, horas dentro do turno com os mesmos valores do Apontamento
    const rows = ['2026-03-10', '2026-03-11'].map(dt => { const d = db().productionDays.find(x => x.date === dt); return { d, r: Engine.computeDay(db(), d).r, res: Engine.computeDay(db(), d) }; });
    const P = HHComum.periodo(rows, 200); out.per = P.x;
    const i6 = P.x.indexOf('06:00'), g6 = rows.map(x => x.res.flat.find(f => U.hhmm(f.iv.start) === '06:00')).filter(Boolean);
    out.media6 = Math.abs(P.bars[0].values[i6] - g6.reduce((s, f) => s + f.good, 0) / g6.length) < 0.01;
    const i4 = P.x.indexOf('04:00'); out.fora4 = P.bars[0].meta[i4] == null && P.bars[0].values[i4] > 0 && /fora do turno · conta no Turno A/.test(P.xFull[i4]);
    // Visão Geral
    Object.assign(App.filters, { from: '2026-03-10', to: '2026-03-11', lineId: 'line_vac', machineId: '', catalogId: '', shiftId: '', status: '' }); Panel.st().view = 'padrao'; go('overview'); await w(900);
    const vg = [...document.querySelectorAll('#main section.card')].find(s => /Produção por hora do dia/.test((s.querySelector('h3') || {}).textContent || ''));
    out.vgTitulo = !!vg; out.vg = eixo(vg); out.vgAntigo = [...document.querySelectorAll('#main h3')].some(h => /Atendimento por hora do dia/.test(h.textContent));
    // Painel › bloco Hora a hora (1 dia e período)
    const x1 = { days: [day], rows: [rows[1]] }; const d1 = document.createElement('div'); d1.innerHTML = PN_B.hourly.r(x1); out.pn1 = eixo(d1);
    const x2 = { days: rows.map(r => r.d), rows }; const d2 = document.createElement('div'); d2.innerHTML = PN_B.hourly.r(x2); out.pn2 = eixo(d2);
    // TV › Painel do dia
    const dt = document.createElement('div'); dt.innerHTML = TV.dia(day); out.tv = eixo(dt);
    // Relatórios › Passagem de turno (turno A)
    const ps = day.shifts.find(p => p.snap.code === 'T1'); const m = rpShiftModel({ type: 'shift', date: '2026-03-11', psId: ps.id }); const bl = m.blocks.find(x => x.id === 'hh');
    const dr = document.createElement('div'); dr.innerHTML = bl ? bl.html : ''; out.rel = eixo(dr);
    // Lançamento › OEE do dia (evolução por hora)
    go('launch'); await w(800); const og = document.querySelector('#main .v2-oeeh > svg'); out.oeeH = og ? [...og.querySelectorAll('rect title')].map(t => t.textContent.slice(0, 5)) : [];
    out.oeeFora = og ? [...og.querySelectorAll('rect.v2-fora title')].every(t => /fora do turno · conta no Turno A/.test(t.textContent)) && og.querySelectorAll('rect.v2-fora').length === 2 : false;
    out.ordem = { ap: ordem(out.ap), dia: ordem(out.dia), turnoA: ordem(out.turnoA), per: ordem(out.per), vg: ordem(out.vg), pn1: ordem(out.pn1), pn2: ordem(out.pn2), tv: ordem(out.tv), rel: ordem(out.rel), oee: ordem(out.oeeH) };
    out.bSemFora = !out.turnoB.includes('04:00') && !out.turnoB.includes('05:00');
    return out;
  });
  console.log('     eixos:', JSON.stringify({ ap: R.ap.slice(0, 5), vg: R.vg.slice(0, 5), pn1: R.pn1.slice(0, 5), pn2: R.pn2.slice(0, 5), tv: R.tv.slice(0, 5), rel: R.rel.slice(0, 5), turnoB: R.turnoB.slice(0, 3) }));
  ok(R.ordem.ap, 'Apontamento › Hora a hora (referência): 04:00 e 05:00 antes das 06:00');
  ok(R.ordem.dia && R.diaIgualAp, 'função comum (dia) igual ao gráfico do Apontamento');
  ok(R.ordem.turnoA && R.bSemFora, 'turno A recebe 04:00 e 05:00; turno B não');
  ok(R.ordem.per && R.media6 && R.fora4, 'período: horas na ordem do dia, 06:00 com a média do Apontamento, 04:00 fora do turno sem meta e "conta no Turno A"');
  ok(R.vgTitulo && !R.vgAntigo && R.ordem.vg, 'Visão Geral: "Produção por hora do dia" com 04:00 e 05:00 antes das 06:00');
  ok(R.ordem.pn1 && R.ordem.pn2, 'Painel › bloco Hora a hora (1 dia e período) com as horas fora do turno');
  ok(R.ordem.tv, 'TV › Painel do dia com as horas fora do turno');
  ok(R.ordem.rel, 'Relatórios › Passagem de turno (turno A) com as horas fora do turno que contam nele');
  ok(R.ordem.oee && R.oeeFora, 'Lançamento › OEE do dia por hora: 04:00 e 05:00 antes das 06:00, barra clara "fora do turno · conta no Turno A"');
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
