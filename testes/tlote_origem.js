// Fase 1 ordem/lote (13/11/2026). Dados fictícios.
// Produção 2.4.68: exports.trechos (trechos do MES com a ordem do plano pelo lote), atual (lote em produção), trocas (troca de lote)
//   e paradasEventos (id estável = eventoId comum, turno, horário, equipamento, código, lote/ordem/catálogo do trecho no horário);
//   pendência de ordem × lote não quebra o exports.
// Paradas 1.2.5: parada do Forms com lote recebe ordem e catálogo pelo lote (exports da Produção); sem lote, pelo horário nos trechos
//   ("pelo horário"); lote que não está na Produção e lote em duas ordens ficam sem ordem e com aviso; a mesma parada apontada na
//   Produção ganha o eventoId dela, sem contar duas vezes (evento só da Produção não entra nas análises).
// node testes/tlote_origem.js → "sem erros"; código 1 se falhar
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PREP = () => {
  const d = JSON.parse(Store.serialize(Store.S.db)), SD = ServerData, LINE = 'line_vac', DIA = '2026-03-11';
  const mkShift = (code, name, start, end) => ({ id: 'sh_' + code.toLowerCase(), code, name, lineId: LINE, status: 'ativo', versions: [{ id: 'v_' + code, validFrom: '2000-01-01', validTo: null, start, end, weekdays: [0, 1, 2, 3, 4, 5, 6], active: true, breaks: [], template: null }] });
  d.shifts = [mkShift('T1', 'Turno A', '06:00', '14:00'), mkShift('T2', 'Turno B', '14:00', '22:00')];
  d.calendar = []; d.productionDays = []; d.events = (d.events || []).filter(e => !e.demo);
  const cats = d.catalogs.filter(c => !c.deleted && c.active !== false && Engine.resolveTarget(d, DIA, c.id, 'mac_line', LINE)).slice(0, 2);
  Object.assign(d.settings, { serverBoxQty: 1000 });
  const day = Engine.buildDay(d, DIA, LINE, 'mac_line', 'teste'); day.demo = false;
  day.shifts.forEach(p => { p.initialCatalogId = cats[0].id; p.intervals.forEach(i => i.good = 40000); }); d.productionDays.push(day);
  // parada de 20 min às 07:00 no EQ01 (dentro do trecho do lote L-501)
  const dc = d.downtimeCodes.find(c => !c.deleted && !c.deductsPlanned && !c.planned && c.code !== 'TALLY');
  const eq = d.machines.find(m => m.code === 'EQ01') || d.machines[1];
  (day.events = day.events || []).push({ id: 'ev_teste1', codeId: dc.id, start: 7 * 60, end: 7 * 60 + 20, minutes: null, equipmentId: eq.id, note: 'teste', impact: { deducts: false, a: true, p: false, q: false, pareto: true, report: true }, status: 'ativo' });
  // MES: L-501 das 06:00 às 09:59, L-502 das 10:30 às 13:59
  const base = SD.dayStartMin(DIA), mk = (lot, cat, a, z, id) => { const L = []; for (let m = a; m <= z; m++) L.push(base + m); const e = SD.enc(L); return { id, lineId: LINE, lot, cat, b0: 1, b1: L.length, t0: SD.fromMin(L[0]), t1: SD.fromMin(L[L.length - 1]), n: L.length, base: e.base, m: e.m }; };
  d.server = SD.ensureStore(d); d.server.segments = [mk('L-501', cats[0].code, 360, 599, 's1'), mk('L-502', cats[1].code, 630, 839, 's2')];
  d.server.lotClass = { 'L-501': { kind: 'normal' }, 'L-502': { kind: 'normal' } };
  d.monthPlans = [{ id: 'mp_t', month: '2026-03', lineId: LINE, orders: [
    { id: 'o1', order: '100200301', lot: 'L-501', catalogId: cats[0].id, qty: 240000 },
    { id: 'o2', order: '100200302', lot: 'L-502', catalogId: cats[1].id, qty: 210000 }], versions: [] }];
  Store.S.db = Model.ensure(d); Engine.bumpConfig();
  const x = Exports.build(Store.S.db, DIA);
  return { x, cats: cats.map(c => c.code), eq: eq.code, dc: dc.code };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message));
  await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(900);
  const P = await o.evaluate(PREP); const X = P.x;
  ok(X.trechos.length === 2 && X.trechos[0].lote === 'L-501' && X.trechos[0].ordem === '100200301' && X.trechos[0].ini === '2026-03-11T06:00' && X.trechos[0].fim === '2026-03-11T09:59' && X.trechos[0].caixas === 240 && X.trechos[1].ordem === '100200302' && X.trechos[1].catalogo === P.cats[1],
    'Produção: trechos do MES com lote, catálogo, ordem do plano e caixas');
  ok(X.atual && X.atual.lote === 'L-502' && X.atual.ordem === '100200302' && X.atual.desde === '2026-03-11T10:30' && X.atual.caixas === 210, 'Produção: atual = lote em produção (L-502, ordem 100200302, desde 10:30)');
  ok(X.trocas.length === 1 && X.trocas[0].de === 'L-501' && X.trocas[0].para === 'L-502' && X.trocas[0].em === '2026-03-11T10:30', 'Produção: uma troca de lote às 10:30');
  const ev = X.paradasEventos.find(e => e.id === 'ev_teste1');
  ok(ev && ev.dia === '2026-03-11' && ev.turno === 'T1' && ev.inicio === '07:00' && ev.fim === '07:20' && ev.minutos === 20 && ev.equipamento === P.eq && ev.codigo === P.dc && ev.lote === 'L-501' && ev.ordem === '100200301' && ev.catalogo === P.cats[0] && ev.origemLote === 'trecho',
    'Produção: paradasEventos com id estável, turno, horário, equipamento, código e lote/ordem do trecho no horário' + (ev ? '' : ' (evento não publicado)'));
  // ordem com dois lotes: vira pendência e o exports continua saindo
  const pend = await o.evaluate(() => { const d = Store.S.db; d.monthPlans[0].orders.push({ id: 'o3', order: '100200301', lot: 'L-509', catalogId: d.monthPlans[0].orders[0].catalogId, qty: 1000 }); try { const x = Exports.build(d, '2026-03-11'); return x.pendencias.filter(p => p.tipo === 'ordemLote').length; } catch (e) { return 'erro: ' + e.message; } finally { d.monthPlans[0].orders.pop(); } });
  ok(pend >= 1, 'Produção: ordem com dois lotes vira pendência sem quebrar o exports (' + pend + ')');
  ok(await o.evaluate(() => APP_VERSION) === '2.4.68', 'Produção 2.4.68');

  // ---------- Paradas: ordem e catálogo pelo lote ou pelo horário; eventoId
  const p = await c.newPage(); p.on('pageerror', e => pe.push(e.message));
  await p.goto('file://' + RAIZ + 'paginas/Paradas.html'); await p.waitForTimeout(900);
  const R = await p.evaluate(X => { modoTeste(); Ext.oee = X; Ext.oeeOk = true;
    const D = Store.data, mk = (id, o) => Object.assign({ id, origem: 'forms', dia: '2026-03-11', turno: 'T1', minutos: 10, equipamento: 'EQ09', codigo: 'FME', ordem: '', lote: '' }, o);
    D.eventos = [mk('FN-1', { lote: 'L-502', inicio: '06:10' }), mk('FN-2', { inicio: '08:15' }), mk('FN-3', { lote: 'L-999', inicio: '08:30' }), mk('FN-4', { inicio: '18:00' }),
      mk('FN-5', { equipamento: X.paradasEventos[0].equipamento, inicio: '07:03', minutos: 20 }), mk('FN-6', { ordem: '555', inicio: '09:00' })];
    const T = eventosTodos(), g = id => T.find(e => e.id === id) || {}, ex = calcExports(D), ge = id => (ex.eventos || []).find(e => e.id === id) || {};
    return { n: T.length, ids: T.map(e => e.id), f1: g('FN-1').origemOrdem, ex1: ge('FN-1'), ex2: ge('FN-2'), ex3: ge('FN-3'), ex4: ge('FN-4'), ex5: ge('FN-5'), ex6: ge('FN-6'),
      porOrdem: (ex.porOrdem || []).map(x => x.ordem + ':' + x.eventos).join(','), lote1: D.eventos[0].lote, ord1: D.eventos[0].ordem, avisos: typeof origemAvisos === 'function' ? origemAvisos(T) : null, pill: document.body.innerText.includes('só na Produção') };
  }, X);
  ok(R.ex1.ordem === '100200302' && R.ex1.catalogo === P.cats[1] && R.ex1.ordemFonte === 'lote' && R.ex1.lote === 'L-502', 'Paradas: com lote, ordem e catálogo vêm do lote (mesmo fora do horário do trecho)');
  ok(R.ex2.ordem === '100200301' && R.ex2.lote === 'L-501' && R.ex2.ordemFonte === 'horário' && R.ex2.loteDigitado === false, 'Paradas: sem lote, ordem e lote pelo horário nos trechos do MES ("horário")');
  ok(!R.ex3.ordem && R.ex3.ordemFonte === 'lote não encontrado', 'Paradas: lote que não está na Produção fica sem ordem e com aviso');
  ok(!R.ex4.ordem && !R.ex4.ordemFonte, 'Paradas: sem lote e fora dos trechos, fica sem ordem (nada inventado)');
  ok(R.ex6.ordem === '555' && R.ex6.ordemFonte === 'apontada', 'Paradas: ordem digitada continua valendo');
  ok(R.lote1 === 'L-502' && R.ord1 === '', 'Paradas: a base guarda só o lote digitado (ordem e catálogo são calculados na leitura)');
  ok(R.ex5.eventoId === 'ev_teste1' && R.n === 6 && !R.ids.some(i => /^OEE:/.test(i)), 'Paradas: a mesma parada apontada na Produção ganha o eventoId dela; nenhum evento contado duas vezes');
  ok(/100200301:2/.test(R.porOrdem) && /100200302:1/.test(R.porOrdem), 'Paradas: exports.porOrdem com as ordens vindas do lote e do horário (' + R.porOrdem + ')');
  ok(R.avisos && R.avisos.semOrdem === 1 && R.avisos.soProducao === 0, 'Paradas: avisos de origem (lote não encontrado: 1; paradas só na Produção: 0)');
  ok(await p.evaluate(() => PAGE.versao) === '1.2.5', 'Paradas 1.2.5');
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + [...new Set(pe)].slice(0, 3).join(' | ') : ''));
  await b.close(); if (errs.length) { console.log(`\n${errs.length} falha(s)`); process.exit(1); } console.log('\nsem erros');
})().catch(e => { console.error(e); process.exit(1); });
