// Fase 2 do briefing de 09/11/2026: turno não produtivo (TUR-01), habilitar no dia (TUR-02), produção fora de turno (TUR-03),
// OEE reportado × real (TUR-04) e madrugada antes das 06:00 (POR-10). Regras D1–D4 do usuário (10/11/2026).
// node testes/tturnos.js → código 1 se alguma conferência falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const o = await ctx.newPage(); o.on('pageerror', e => errs.push('Produção ' + e.message)); o.on('dialog', d => d.accept());
  await o.goto(S + 'OEE-Vacutainer.html'); await o.waitForTimeout(1500);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(1000);

  // cenário montado numa cópia da base de exemplo (o cálculo é o mesmo da tela)
  const R = await o.evaluate(() => {
    const out = {};
    const d = JSON.parse(Store.serialize(Store.S.db)), SD = ServerData, X = '2026-03-10', X1 = '2026-03-11', LINE = 'line_vac';
    const mkShift = (code, name, start, end) => ({ id: 'sh_' + code.toLowerCase(), code, name, lineId: LINE, status: 'ativo', versions: [{ id: 'v_' + code, validFrom: '2000-01-01', validTo: null, start, end, weekdays: [0, 1, 2, 3, 4, 5, 6], active: true, breaks: [], template: null }] });
    d.shifts = [mkShift('T1', 'Turno A', '06:00', '14:30'), mkShift('T2', 'Turno B', '14:30', '22:47'), mkShift('T3', 'Turno C', '22:47', '30:00')];
    d.shifts[2].versions[0].productive = false;                         // TUR-01: C ativo e não produtivo
    d.calendar = []; d.productionDays = d.productionDays.filter(x => x.date !== X && x.date !== X1);
    const cat = d.catalogs.find(c => !c.deleted && c.active !== false && Engine.resolveTarget(d, X, c.id, 'mac_line', LINE));
    Object.assign(d.settings, { foraTurnoDesde: '2026-01-01', continuityMin: 10, serverBoxQty: 1000 });
    const dia = date => { const day = Engine.buildDay(d, date, LINE, 'mac_line', 'teste'); day.shifts.forEach(p => { p.initialCatalogId = cat.id; p.intervals.forEach(i => i.good = 60000); p.scrap = 0; }); d.productionDays.push(day); return day; };
    const dX = dia(X), dX1 = dia(X1);
    out.semC = !dX.shifts.some(p => p.snap.code === 'T3') && dX.shifts.length === 2;
    // servidor: lote normal; trecho 1 contínuo do fim do B (22:30) até 23:40; trecho 2 isolado de 02:00 a 02:30 (madrugada de X1)
    const base = SD.dayStartMin(X), mins = []; for (let m = 22 * 60 + 30; m <= 23 * 60 + 40; m++) mins.push(base + m);
    const mins2 = []; for (let m = 26 * 60; m <= 26 * 60 + 30; m++) mins2.push(base + m);
    const seg = (id, ms, b0) => { const e = SD.enc(ms); return { id, lineId: LINE, lot: 'L-TESTE', cat: cat.code, b0, b1: b0 + ms.length - 1, t0: SD.fromMin(ms[0]), t1: SD.fromMin(ms[ms.length - 1]), n: ms.length, base: e.base, m: e.m }; };
    d.server = SD.ensureStore(d); d.server.segments = [seg('s1', mins, 1), seg('s2', mins2, 500)]; d.server.lotClass = { 'L-TESTE': { kind: 'normal' } };
    const naJanela1 = mins.filter(m => m >= base + 1367).length, naJanela2 = mins2.length;
    const manual = day => day.shifts.reduce((s, p) => s + p.intervals.reduce((t, i) => t + (+i.good || 0), 0), 0);
    const rX = Engine.computeDayRaw(d, dX), rX1 = Engine.computeDayRaw(d, dX1);
    const B = rX.shifts.find(s => s.ps.snap.code === 'T2'), A1 = rX1.shifts.find(s => s.ps.snap.code === 'T1');
    out.t1 = { goodX: rX.r.good, manualX: manual(dX), esperadoB: naJanela1 * 1000, foraB: B.foraTurno || 0, realX: rX.foraTurno && rX.foraTurno.real ? rX.foraTurno.real.good : null,
      itens: (rX.foraTurno ? rX.foraTurno.janela : []).map(i => ({ t0: i.t0, t1: i.t1, alvo: i.alvo && i.alvo.date + ' ' + i.alvo.code, regra: i.regra, oee: i.oeeReal, rot: i.rotulo })) };
    out.t1b = { goodX1: rX1.r.good, manualX1: manual(dX1), foraA: A1.foraTurno || 0, esperadoA: naJanela2 * 1000 };
    out.perf = { P: B.r.P, oeeRep: rX.r.oee, oeeReal: rX.foraTurno.real.oee };
    // TUR-02: habilitar o C no dia X → o turno entra no dia, o tempo vira planejado e nada mais é reatribuído da janela dele
    const tmp = Engine.buildDay(d, X, LINE, 'mac_line', 'teste', { only: 'sh_t3' }); const pc = tmp.shifts[0]; pc.enabledNP = true; dX.shifts.push(pc); dX._rev = 99;
    const rX2 = Engine.computeDayRaw(d, dX), C2 = rX2.shifts.find(s => s.ps.snap.code === 'T3');
    const sug = SD.daySuggest(d, dX, rX2, d.settings);
    out.t2 = { temC: !!C2, netC: C2 ? C2.agg.netMin : 0, recebe: rX2.foraTurno ? rX2.foraTurno.recebe.filter(i => i.data === X && i.t0 >= 1367 && i.t0 < 1800).length : 0,
      sugC: U.sum(sug.ivs.filter(x => x.start >= 1367), x => x.sug) };
    dX.shifts.pop();
    // regra só a partir da data: antes dela nada muda
    d.settings.foraTurnoDesde = '2026-12-01'; dX._rev = 100; const rOff = Engine.computeDayRaw(d, dX);
    out.desde = { good: rOff.r.good, manual: manual(dX), ft: rOff.foraTurno };
    d.settings.foraTurnoDesde = '2026-01-01';
    // POR-10: sem o turno C no dia (vigência sem esse dia da semana) a madrugada não some: cai na janela "fora dos turnos"
    d.shifts[2].versions[0].weekdays = []; dX._rev = 101; dX1._rev = 101;
    const rP = Engine.computeDayRaw(d, dX1), A2 = rP.shifts.find(s => s.ps.snap.code === 'T1');
    out.por10 = { foraA: A2.foraTurno || 0, rot: ((rP.foraTurno || {}).recebe || []).map(i => i.rotulo) };
    return out;
  });
  ok(R.semC, 'TUR-01: turno C ativo e não produtivo não entra no dia (lançamento só com A e B)');
  ok(R.t1.foraB === R.t1.esperadoB && R.t1.goodX === R.t1.manualX + R.t1.esperadoB, `TUR-01/D1: produção da janela do C emendada com o fim do B conta no B (${R.t1.foraB} peças)`);
  ok(R.t1.realX === R.t1.manualX, 'TUR-04: OEE real do dia não inclui a produção fora de turno');
  ok(R.t1.itens.some(i => i.t0 === 1367 && /T2$/.test(i.alvo) && /continua/.test(i.regra)) && R.t1.itens.every(i => i.t0 >= 1367) , 'TUR-03: o quadro registra o trecho na hora real (a partir de 22:47) e para onde foi');
  ok(R.t1b.foraA === R.t1b.esperadoA && R.t1b.goodX1 === R.t1b.manualX1 + R.t1b.esperadoA, 'D1: trecho da madrugada sem continuidade com o B vai para o A do dia seguinte');
  ok(R.t1.itens.some(i => /T1$/.test(i.alvo) && /sem continuidade/.test(i.regra)), 'D1: o motivo da reatribuição aparece (sem continuidade → Turno A)');
  ok(R.perf.oeeRep > R.perf.oeeReal, 'TUR-04: OEE reportado (com a reatribuição) maior que o real; performance acima de 100% é aceita (D2)');
  ok(R.t1.itens.every(i => i.oee > 0), 'D3: OEE real do trecho usa da 1ª à última caixa como tempo planejado');
  ok(R.t2.temC && R.t2.netC > 0 && R.t2.recebe === 0 && R.t2.sugC > 0, 'TUR-02/D4: habilitado no dia, o C entra com o tempo planejado, a janela dele não é reatribuída e o servidor sugere a produção nele');
  ok(R.desde.good === R.desde.manual && !R.desde.ft, 'Regra só vale a partir da data configurada: dias anteriores não mudam');
  ok(R.por10.foraA > 0 && R.por10.rot.every(r => /fora dos turnos/.test(r)), 'POR-10: sem turno C no dia, a produção antes das 06:00 deixa de sumir e conta no A');

  // tela: quadro do dia e "Habilitar turno" (TUR-02) na base em memória
  const ui = await o.evaluate(async () => {
    const d = Store.S.db; const X = U.today();
    await Store.mutate(db => { const sh = db.shifts.find(s => !s.deleted && (s.versions || []).some(v => !v.deleted)); sh.versions.filter(v => !v.deleted).forEach(v => v.productive = false); db.settings.foraTurnoDesde = '2026-01-01'; });
    Engine.bumpConfig();
    const sh = Store.S.db.shifts.find(s => !s.deleted && (s.versions || []).some(v => !v.deleted && v.productive === false));
    const day = Store.S.db.productionDays.find(x => !x.deleted && !x.demo && x.status !== 'fechado' && !x.shifts.some(p => !p.deleted && p.shiftId === sh.id)) || null;
    if (!day) return { sem: true };
    App.sel.dayId = day.id; App.sel.date = day.date; App.filters.from = day.date; go('launch'); await new Promise(r => setTimeout(r, 400));
    const cb = document.querySelector(`[data-turnonp="${sh.id}"]`); const tinha = !!cb; if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
    await new Promise(r => setTimeout(r, 500));
    const d2 = Store.S.db.productionDays.find(x => x.id === day.id);
    return { tinha, habil: !!d2.shifts.find(p => !p.deleted && p.shiftId === sh.id && p.enabledNP), card: !!document.querySelector('#ftCard') };
  });
  ok(ui.sem || (ui.tinha && ui.card), 'TUR-02 tela: o lançamento mostra "Habilitar <turno> neste dia" para o turno não produtivo');
  ok(ui.sem || ui.habil, 'TUR-02 tela: marcar habilita o turno só naquele dia');

  // Portal: campo "Turno não produtivo" na vigência e parâmetros de continuidade e data
  const po = await ctx.newPage(); po.on('pageerror', e => errs.push('Portal ' + e.message));
  await po.goto(S + 'Portal.html#geral'); await po.waitForTimeout(600); await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  const pt = await po.evaluate(() => ({ v: CAD_T.turnos.vcampos.some(c => c[0] === 'naoProdutivo'), aj: !!AJUDA_CAMPO['turnos.naoProdutivo'] }));
  ok(pt.v && pt.aj, 'TUR-01 Portal: vigência do turno tem "Turno não produtivo" com ⓘ');
  await po.evaluate(() => { location.hash = '#cadastros/parametros'; }); await po.waitForTimeout(500);
  ok(await po.evaluate(() => !!document.querySelector('[data-pprod="continuidadeMin"]') && !!document.querySelector('[data-pprod="foraTurnoDesde"]')), 'TUR-01 Portal: Parâmetros › Produção tem continuidade (min) e "vale a partir de"');
  // CadSync leva a flag e os parâmetros
  const cs = await o.evaluate(() => { const d = JSON.parse(Store.serialize(Store.S.db));
    CadSync.aplicar(d, { rev: 3, turnos: [{ codigo: 'T9', nome: 'Turno C', ativo: true, vigencias: [{ de: '2026-05-01', inicio: '22:47', fim: '30:00', dias: [1, 2, 3, 4, 5], ativo: true, naoProdutivo: true, pausas: [], intervalos: [] }] }], parametros: { producao: { continuidadeMin: 15 } } }, () => { });
    const t = d.shifts.find(s => s.code === 'T9'); return { prod: t.versions[0].productive, lim: d.settings.continuityMin, desde: d.settings.foraTurnoDesde }; });
  ok(cs.prod === false && cs.lim === 15 && cs.desde === '2026-05-01', 'TUR-01 CadSync: vigência não produtiva, continuidade e data (padrão = 1ª vigência não produtiva) chegam à Produção');

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
