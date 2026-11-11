// Produção 2.4.52 · Hora a hora com as 24 h e Ordens sem MB51 (pedido do usuário, 11/11/2026). Dados fictícios.
// Caso: turnos A (06:00–14:30) e B (14:30–22:47) produtivos, C (22:47–06:00) não produtivo; a linha começou às 04:00 do dia 11/03
// (janela do C do dia 10/03), sem parada até o A → a produção 04:00–06:00 conta no turno A de 11/03 (ForaTurno, OEE reportado).
// Confere:
//   1) Hora a hora de 11/03, turno A: as horas 04:00–06:00 aparecem como "fora do turno" (só leitura) com as caixas do MES,
//      e a produção considerada do turno inclui essas caixas;
//   2) "Dia (24 h)": 24 linhas do dia de produção (06:00 a 06:00), as horas recebidas de antes do início no topo, meta e apontado iguais
//      à grade dos turnos, horas sem turno com "conta no …";
//   3) Ordens › Ordens produzidas sem MB51: os lotes do MES com a ordem do plano e "não conciliado", em vez de "nada importado".
// Código 1 se falhar.
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const PREP = () => {
  const d = JSON.parse(Store.serialize(Store.S.db)), SD = ServerData, LINE = 'line_vac', D = ['2026-03-10', '2026-03-11'];
  const mkShift = (code, name, start, end) => ({ id: 'sh_' + code.toLowerCase(), code, name, lineId: LINE, status: 'ativo', versions: [{ id: 'v_' + code, validFrom: '2000-01-01', validTo: null, start, end, weekdays: [0, 1, 2, 3, 4, 5, 6], active: true, breaks: [], template: null }] });
  d.shifts = [mkShift('T1', 'Turno A', '06:00', '14:30'), mkShift('T2', 'Turno B', '14:30', '22:47'), mkShift('T3', 'Turno C', '22:47', '30:00')];
  d.shifts[2].versions[0].productive = false;
  d.calendar = []; d.productionDays = [];
  const cat = d.catalogs.find(c => !c.deleted && c.active !== false && Engine.resolveTarget(d, D[0], c.id, 'mac_line', LINE));
  Object.assign(d.settings, { foraTurnoDesde: '2026-01-01', continuityMin: 10, serverBoxQty: 1000 });
  D.forEach(date => { const day = Engine.buildDay(d, date, LINE, 'mac_line', 'teste'); day.demo = false;
    day.shifts.forEach(p => { p.initialCatalogId = cat.id; p.intervals.forEach(i => i.good = 50000); }); d.productionDays.push(day); });
  /* caixas: 11/03 das 04:00 às 06:20 (uma por minuto, sem parada) → janela do C de 10/03 + começo do A de 11/03 */
  const base = SD.dayStartMin(D[1]), L = []; for (let m = 4 * 60; m <= 6 * 60 + 20; m++) { L.push(base + m); if (m >= 6 * 60 && m < 6 * 60 + 10) L.push(base + m); }   /* 06:00–06:09: 2 caixas por minuto (o MES registra várias no mesmo minuto) */
  const e = SD.enc(L);
  d.server = SD.ensureStore(d); d.server.segments = [{ id: 's0', lineId: LINE, lot: 'L-424', cat: cat.code, b0: 1, b1: L.length, t0: SD.fromMin(L[0]), t1: SD.fromMin(L[L.length - 1]), n: L.length, base: e.base, m: e.m }];
  d.server.lotClass = { 'L-424': { kind: 'normal' } };
  Store.S.db = Model.ensure(d); Engine.bumpConfig();
  App.sel.date = D[1]; App.sel.lineId = LINE; HHPs.sel = null; go('hourly');
  return { cat: cat.code };
};
(async () => {
  const b = await chromium.launch(); const pe = [];
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const o = await c.newPage(); o.on('pageerror', e => pe.push(e.message));
  await o.goto('file://' + RAIZ + 'paginas/OEE-Vacutainer.html'); await o.waitForTimeout(900);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(900);
  await o.evaluate(PREP); await o.waitForTimeout(700);
  // 1) turno A com as horas fora do turno
  const A = await o.evaluate(() => {
    const day = curDay(), res = Engine.computeDay(db(), day), sr = res.shifts.find(x => x.ps.snap.code === 'T1');
    const rows = [...document.querySelectorAll('#main table.hh tr.hh-fora[data-hhg="T1"]')].map(tr => tr.textContent.replace(/\s+/g, ' ').trim());
    const ft = res.foraTurno, rec = ft ? U.sum(ft.recebe.filter(i => i.alvo && i.alvo.code === 'T1'), i => i.pecas) : 0;
    const grpIdx = [...document.querySelectorAll('#main table.hh tbody tr, #main table.hh tr')].map(tr => tr.className + '|' + (tr.dataset.hhg || '') + '|' + (tr.dataset.iv ? 'iv' : ''));
    const iFora = grpIdx.findIndex(x => x.startsWith('hh-fora|T1')), iIv = grpIdx.findIndex(x => x.endsWith('|T1|iv'));
    return { rows, rec, foraTurno: sr.foraTurno || 0, antes: iFora >= 0 && iFora < iIv, chips: [...document.querySelectorAll('[data-hhsel]')].map(x => x.textContent.trim()) };
  });
  ok(A.rows.length === 2 && /04:00–05:00/.test(A.rows[0]) && /05:00–06:00/.test(A.rows[1]), `turno A mostra 04:00–05:00 e 05:00–06:00 como "fora do turno" (${A.rows.length} linha(s))`);
  ok(A.antes, 'as horas fora do turno vêm antes das linhas do turno A');
  ok(A.rec === 120000 && A.foraTurno === 120000 && /60\.000|60,0|60/.test(A.rows[0]), `produção recebida pelo turno A = 120 caixas (${A.rec}) e as linhas mostram as caixas`);
  ok(A.chips.some(t => /Dia \(24 h\)/.test(t)), 'seletor com "Dia (24 h)"');
  // 2.4.54 · gráfico "Atendimento hora a hora" em ordem de horário e sem o aviso "o lançamento confere com o servidor"
  const G = await o.evaluate(() => { const sec = [...document.querySelectorAll('#main section.card')].find(x => /Atendimento hora a hora/.test(x.textContent)); const xs = sec ? [...sec.querySelectorAll('svg text')].map(t => t.textContent).filter(t => /^\d\d:\d\d$/.test(t)) : [];
    return { xs: xs.slice(0, 4).join(' '), banner: /confere com o servidor|O servidor tem dados deste dia/.test(document.getElementById('main').textContent) }; });
  ok(/^04:00 05:00 06:00/.test(G.xs), `gráfico do hora a hora: 04:00 e 05:00 antes das 06:00 (${G.xs})`);
  ok(!G.banner, 'sem o aviso "O servidor tem dados deste dia… confere com o servidor"');
  // 2.4.53 · Caixas do MES e Lotes do dia pelo dia de trabalho: turnos + fora do turno que conta no dia (não 06:00→06:00)
  const W = await o.evaluate(() => { const day = curDay(), res = Engine.computeDay(db(), day), md = MesDia.dia(db(), day), LT = CaixasDia.lotes(db(), day, res), S = ServerData;
    return { n: md.n, fora: md.fora, de: S.fromMin(md.m0).slice(11, 16), lotes: U.sum(LT, x => x.n), lFora: U.sum(LT, x => x.fora) }; });
  ok(W.n === 151 && W.fora === 120 && W.de === '04:00' && W.lotes === 151 && W.lFora === 120, `Caixas do MES e Lotes do dia = 151 caixas do dia de trabalho, 120 fora do turno, 1ª às 04:00, com 2 caixas no mesmo minuto (${JSON.stringify(W)})`);
  // 2.4.55 · todos os blocos e turnos do Lançamento recolhíveis pela seta ao lado do ícone (lembrado neste computador); cartões sem ícone ganham um
  const Lf = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)); go('launch'); await w(600);
    const all = [...document.querySelectorAll('#main .lf')], turnos = all.filter(x => x.matches('section.tl')), cards = all.filter(x => x.matches('section.card'));
    const semSeta = all.filter(x => !x.querySelector('.lf-tg')).length, semIcone = cards.filter(x => !x.querySelector(':scope > header svg')).length;
    const t = turnos[0], k = t && t.dataset.lfk; if (!t) return { n: all.length };
    t.querySelector('.lf-tg').click(); await w(200); const dob = t.classList.contains('lf-fold'), txt = t.querySelector('.lf-tg').textContent.trim(), esc = [...t.children].filter(x => !x.classList.contains('tl-head')).every(x => getComputedStyle(x).display === 'none');
    render(); await w(500); const t2 = document.querySelector(`#main [data-lfk="${CSS.escape(k)}"]`), lembra = !!(t2 && t2.classList.contains('lf-fold'));
    t2.querySelector('.lf-tg').click(); await w(200); const abriu = !t2.classList.contains('lf-fold'), txt2 = t2.querySelector('.lf-tg').textContent.trim(); go('hourly'); await w(400);
    return { n: all.length, turnos: turnos.length, cards: cards.length, semSeta, semIcone, dob, txt, esc, lembra, abriu, txt2 }; });
  ok(Lf.turnos >= 2 && Lf.cards >= 2 && !Lf.semSeta && !Lf.semIcone, `Lançamento: seta Mostrar/Recolher em ${Lf.n} bloco(s) (${Lf.turnos} turnos, ${Lf.cards} cartões), todos com ícone`);
  ok(Lf.dob && Lf.esc && /Mostrar/.test(Lf.txt) && Lf.lembra && Lf.abriu && /Recolher/.test(Lf.txt2), `turno recolhe pela seta ("${Lf.txt}"), fica recolhido depois de redesenhar e abre de novo ("${Lf.txt2}")`);
  // 2.4.55 · gráfico do hora a hora respeita o turno escolhido
  const GT = await o.evaluate(async () => { const w = t => new Promise(r => setTimeout(r, t)), day = curDay(), xs = () => { const sec = [...document.querySelectorAll('#main section.card')].find(x => /Atendimento hora a hora/.test(x.textContent)); return sec ? [...sec.querySelectorAll('svg text')].map(t => t.textContent).filter(t => /^\d\d:\d\d$/.test(t)) : []; };
    const A = day.shifts.find(p => p.snap.code === 'T1'), Bs = day.shifts.find(p => p.snap.code === 'T2'), np = HHPs.nps(day)[0], out = {};
    HHPs.sel = { date: day.date, id: A.id }; render(); await w(400); out.A = xs();
    HHPs.sel = { date: day.date, id: Bs.id }; render(); await w(400); out.B = xs();
    if (np) { HHPs.sel = { date: day.date, id: np.id }; render(); await w(400); out.C = xs(); out.Ctab = [...document.querySelectorAll('#main section.hh-np tbody tr')].filter(r => /Turno A/.test(r.textContent)).map(r => r.cells[0].textContent.trim()); }
    HHPs.sel = null; render(); await w(300); return out; });
  ok(GT.A[0] === '04:00' && GT.A[1] === '05:00' && GT.A[2] === '06:00' && !GT.A.includes('15:00'), `turno A: 04:00 e 05:00 (contam nele) e só as horas do A (${GT.A.slice(0, 4).join(' ')} … ${GT.A.slice(-1)})`);
  ok(!GT.B.includes('04:00') && !GT.B.includes('06:00') && GT.B.includes('15:00'), `turno B: só as horas dele (${GT.B[0]} … ${GT.B.slice(-1)})`);
  ok(GT.C && GT.C.join(' ') === '04:00 05:00' && GT.Ctab.length === 2, `3º turno não produtivo: as horas da janela com caixas (${GT.C && GT.C.join(' ')}), cada uma "conta no Turno A" (${GT.Ctab && GT.Ctab.join(', ')})`);
  // 2) Dia (24 h)
  await o.evaluate(() => { document.querySelector('[data-hhsel="dia"]').click(); }); await o.waitForTimeout(500);
  const D = await o.evaluate(() => {
    const t = document.querySelector('#main section.hh-dia table'), day = curDay(), res = Engine.computeDay(db(), day);
    const rows = [...t.querySelectorAll('tbody tr')].map(tr => [...tr.cells].map(c => c.textContent.replace(/\s+/g, ' ').trim()));
    const horas = rows.filter(r => /^\d\d:\d\d–\d\d:\d\d$/.test(r[0]));
    const dados = HHPs.dia24Dados(day, res);
    const ix = t => horas.findIndex(r => r[0] === t);
    return { ordem: ix('04:00–05:00') >= 0 && ix('04:00–05:00') < ix('05:00–06:00') && ix('05:00–06:00') < ix('06:00–07:00'), cal: dados.cal, conta4: (horas[ix('04:00–05:00')] || [])[6] || '', n: dados.H.length, rec: dados.R.length, recTxt: rows.filter(r => /conta no Turno A/.test(r[6] || '')).length, metaH: U.sum(dados.H, x => x.meta || 0), metaD: U.sum(res.flat, f => f.metaOp || 0),
      apH: U.sum(dados.H, x => x.apont || 0), apD: U.sum(res.flat, f => f.good || 0), first: horas[0] && horas[0][0], semGrade: !document.querySelector('#main table.hh tr[data-iv]'), chart: !!document.querySelector('#main section.hh-dia svg'),
      turnoC: horas.filter(r => /não produtivo/.test(r[1])).length };
  });
  ok(D.n === 24, `Dia (24 h): 24 horas (${D.n})`);
  ok(D.cal && D.first === '00:00–01:00' && D.ordem && /conta no Turno A/.test(D.conta4) && D.rec === 0, `Dia (24 h) das 00:00 às 24:00: 04:00 e 05:00 antes das 06:00, "conta no Turno A" (1ª hora ${D.first}; ${D.conta4})`);
  ok(Math.abs(D.metaH - D.metaD) < 1 && Math.abs(D.apH - D.apD) < 1, `meta e apontado das 24 h iguais à grade dos turnos (${Math.round(D.metaH)} × ${Math.round(D.metaD)}; ${Math.round(D.apH)} × ${Math.round(D.apD)})`);
  ok(D.turnoC >= 7 && D.semGrade && D.chart, `horas do turno C como "não produtivo" (${D.turnoC}); só leitura, com gráfico`);
  // 3) Ordens sem MB51
  await o.evaluate(() => go('ordens')); await o.waitForTimeout(800);
  await o.evaluate(() => { if (Ord.B) Ord.B.competencias = {}; Ord.per = { de: '2026-03', ate: '2026-03', fy: '', q: '' }; Ord.sub = 'lista'; render(); }); await o.waitForTimeout(800);
  const O = await o.evaluate(() => ({ txt: document.getElementById('main').innerText, lotes: [...document.querySelectorAll('#main [data-oflote]')].map(x => x.dataset.oflote) }));
  ok(/não conciliado/.test(O.txt) && O.lotes.includes('L-424'), `Ordens produzidas sem MB51: lote L-424 com "não conciliado" (${O.lotes.join(', ')})`);
  ok(/Nenhum MB51 importado/.test(O.txt) && /Importar MB51/.test(O.txt), 'continua avisando que falta o MB51, com o botão de importar');
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})();
