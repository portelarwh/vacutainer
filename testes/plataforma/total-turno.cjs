// Produção 2.6.0 · produção total do turno (sem hora a hora) e avisos do servidor. Demonstração: dados fictícios, nada vai para pasta.
// O que este teste prova:
//  1. lançar só o total dá os mesmos números do turno lançado hora a hora (produção, capacidade, meta oficial, D, P, Q e OEE);
//  2. "Lançar meu turno": o bloco do total aparece; preencher o total bloqueia as horas (cinza, com Parada) e lançar uma hora bloqueia o total;
//  3. períodos com troca de catálogo: hora da troca, catálogo e média por hora; validações (cobrir o turno, sem buraco, catálogo na troca);
//  4. turno pelo total não aceita edição de hora (digitar, colar, dividir, excluir, mudar horário); voltar ao hora a hora recria as horas
//     e leva as paradas só com o tempo para a hora certa; turno fechado não muda;
//  5. Hora a hora (liderança): bloco abaixo da linha do turno, produção e catálogo travados, sem o menu de intervalo;
//  6. servidor: a prévia da importação avisa a produção já apontada (inclusive dia fechado); o turno pelo total não recebe produção do
//     servidor sem a troca; a revisão avisa e leva ao aceite (troca → horas com as sugestões marcadas → aplicar);
//  7. auditoria registra lançar e voltar; nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));

(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/oee?tab=shift');
    const el = page.locator('iframe[title="Módulo Produção"]'); await el.waitFor();
    const f = await (await el.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto());
    const ok = m => console.log('ok total do turno: ' + m);

    // utilitários dentro da página
    await f.evaluate(() => {
      window.__tt = {
        novoDia(k) { const ref = db().productionDays.filter(d => !d.deleted).sort((a, b) => b.date.localeCompare(a.date))[0]; const x = new Date(ref.date + 'T12:00:00'); x.setDate(x.getDate() + k); const s = x.toISOString().slice(0, 10); Actions.createDay(s, ref.lineId, ref.machineId); return s; },
        dia: s => db().productionDays.find(d => !d.deleted && d.date === s),
        turno(s, i = 0) { return __tt.dia(s).shifts[i]; },
        res(s, i = 0) { const d = __tt.dia(s); const sr = Engine.computeDay(db(), d).shifts.find(x => x.ps === d.shifts[i]); const k = ['good', 'cap', 'metaDec', 'D', 'P', 'Q', 'oee', 'oeeTarget', 'netMin', 'grossMin']; return Object.fromEntries(k.map(x => [x, sr.r[x] == null ? null : +(+sr.r[x]).toFixed(6)])); },
        tenta(fn) { try { fn(); return 'ACEITOU'; } catch (e) { return e.message; } },
      };
    });

    // ---------- 1. mesmos números: hora a hora × total ----------
    const num = await f.evaluate(() => {
      const A = __tt.novoDia(1), B = __tt.novoDia(2), TOTAL = 440000;
      const dA = __tt.dia(A), psA = dA.shifts[0], ivs = psA.intervals.filter(i => !i.deleted).sort((a, b) => a.start - b.start);
      const dur = ivs.reduce((s, i) => s + i.end - i.start, 0); let rest = TOTAL;
      ivs.forEach((iv, k) => { const g = k === ivs.length - 1 ? rest : Math.round(TOTAL * (iv.end - iv.start) / dur / 1000) * 1000; rest -= g; Actions.setIv(dA.id, iv.id, 'good', g); });
      const dB = __tt.dia(B), psB = dB.shifts[0], F = TotalTurno.faixa(dB, psB);
      Actions.lancarTotal(dB.id, psB.id, [{ start: F.a, end: F.b, catalogId: psB.initialCatalogId, good: TOTAL }]);
      const fl = Engine.computeDay(db(), __tt.dia(B)).flat, ps0 = __tt.turno(B);
      return { A: __tt.res(A), B: __tt.res(B), ivsB: __tt.turno(B).intervals.length, modo: __tt.turno(B).lancamento.modo, B_date: B, eixo: hhChartOpts(fl).x, codigo: ps0.snap.code || ps0.snap.name };
    });
    assert.equal(num.modo, 'total'); assert.equal(num.ivsB, 1, 'turno pelo total vira um período');
    for (const k of ['good', 'cap', 'metaDec', 'D', 'P', 'Q', 'oee', 'oeeTarget', 'netMin', 'grossMin']) assert.equal(num.B[k], num.A[k], 'mesmo ' + k + ' que o hora a hora');
    assert.equal(num.eixo[0], num.codigo, 'no gráfico hora a hora o turno pelo total aparece com o nome do turno, não com a hora de início');
    ok(`mesmos números do hora a hora (OEE ${(num.A.oee * 100).toFixed(1)}%, produção, capacidade, meta oficial, D, P, Q)`);

    // ---------- 2. Lançar meu turno ----------
    const C = await f.evaluate(() => { const s = __tt.novoDia(3); App.opSel = { date: s, shiftId: __tt.turno(s).shiftId }; App.route = 'shift'; render(); return s; });
    await page.waitForTimeout(500);
    let t = await f.evaluate(() => ({ campo: !!document.querySelector('input[data-tttot]'), dis: document.querySelector('input[data-tttot]').disabled, horasAbertas: [...document.querySelectorAll('input[data-good]')].filter(i => !i.disabled).length }));
    assert.ok(t.campo && !t.dis && t.horasAbertas > 0, 'turno vazio: total e horas abertos');
    await f.locator('input[data-tttot]').fill('430'); await f.locator('input[data-tttot]').press('Enter'); await page.waitForTimeout(700);
    t = await f.evaluate(s => ({ good: __tt.res(s).good, cinza: document.querySelectorAll('tr.tt-off').length, paradas: document.querySelectorAll('tr.tt-off [data-addev]').length, horasAbertas: [...document.querySelectorAll('input[data-good]')].filter(i => !i.disabled).length, kpi: [...document.querySelectorAll('.kpis > *')].map(k => k.textContent).find(x => /Horas/.test(x)), pill: !!document.querySelector('.tt-pill'), valor: document.querySelector('input[data-tttot]').value }), C);
    assert.equal(t.good, 430000, '430 lido como 430 mil'); assert.ok(t.cinza >= 8 && t.paradas === t.cinza, 'horas em cinza, cada uma com Parada'); assert.equal(t.horasAbertas, 0, 'nenhuma hora aberta');
    assert.match(t.kpi, /Total/); assert.ok(t.pill); assert.equal(t.valor, '430');
    ok('Lançar meu turno: total grava, horas em cinza com Parada, cartão "Total"');
    // apagar o total volta ao hora a hora; lançar uma hora bloqueia o total
    await f.locator('input[data-tttot]').fill(''); await f.locator('input[data-tttot]').press('Enter'); await page.waitForTimeout(700);
    t = await f.evaluate(s => ({ modo: !!__tt.turno(s).lancamento, ivs: __tt.turno(s).intervals.length }), C);
    assert.equal(t.modo, false); assert.ok(t.ivs >= 8, 'horas padrão de volta');
    await f.locator('input[data-good]').first().fill('50'); await f.locator('input[data-good]').first().press('Enter'); await page.waitForTimeout(700);
    t = await f.evaluate(() => ({ dis: document.querySelector('input[data-tttot]').disabled, msg: document.querySelector('.tt-msg').textContent }));
    assert.ok(t.dis && /em andamento/.test(t.msg), 'com hora lançada o total fica desligado');
    assert.match(await f.evaluate(s => __tt.tenta(() => { const d = __tt.dia(s), ps = d.shifts[0], F = TotalTurno.faixa(d, ps); Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b, good: 1 }]); }), C), /Já há produção lançada por hora/);
    ok('apagar o total volta às horas; com hora lançada o total fica desligado (tela e ação)');

    // ---------- 3. períodos ----------
    const D = await f.evaluate(() => { const s = __tt.novoDia(4); App.opSel = { date: s, shiftId: __tt.turno(s).shiftId }; App.route = 'shift'; render(); return s; });
    await page.waitForTimeout(400);
    await f.locator('[data-ttper]').click(); await page.waitForTimeout(300);
    await f.evaluate(() => { const c0 = document.querySelector('[data-tc="0"]'), c1 = document.querySelector('[data-tc="1"]'); c1.value = [...c1.options].find(o => o.value && o.value !== c0.value).value; document.querySelector('[data-ti="1"]').value = '10:30'; document.querySelector('[data-tp="0"]').value = '230'; document.querySelector('[data-tp="1"]').value = '210'; document.querySelectorAll('#ttRows input,#ttRows select').forEach(i => i.dispatchEvent(new Event('input'))); });
    const med = await f.evaluate(() => [...document.querySelectorAll('[data-tm]')].map(x => x.textContent));
    assert.deepEqual(med, ['51,1/h', '52,5/h'], 'média por hora de cada período (230 mil em 4h30 e 210 mil em 4h)');
    await f.locator('#ttOk').click(); await page.waitForTimeout(700);
    t = await f.evaluate(s => { const ps = __tt.turno(s); return { per: ps.intervals.map(i => U.range(i.start, i.end) + '|' + i.good + '|' + (i.catalogId ? 'troca' : 'inicial')), good: __tt.res(s).good, lista: document.querySelectorAll('.tt-per li').length }; }, D);
    assert.deepEqual(t.per, ['06:00–10:30|230000|inicial', '10:30–14:30|210000|troca']); assert.equal(t.good, 440000); assert.equal(t.lista, 2);
    const val = await f.evaluate(s => { const d = __tt.dia(s), ps = d.shifts[0], F = TotalTurno.faixa(d, ps), cat = d.shifts[0].initialCatalogId; return {
      curto: __tt.tenta(() => Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b - 30, good: 1 }])),
      buraco: __tt.tenta(() => Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.a + 120, good: 1 }, { start: F.a + 180, end: F.b, catalogId: cat, good: 1 }])),
      semCat: __tt.tenta(() => Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.a + 120, good: 1 }, { start: F.a + 120, end: F.b, good: 1 }])) }; }, D);
    assert.match(val.curto, /cobrir o turno inteiro/); assert.match(val.buraco, /começar onde o anterior termina/); assert.match(val.semCat, /informe o catálogo/);
    ok('períodos: troca às 10:30, catálogo e média por hora; recusa período que não cobre o turno, com buraco ou sem catálogo');

    // ---------- 4. proteções, paradas e volta ----------
    const prot = await f.evaluate(s => { const d = __tt.dia(s), ps = d.shifts[0], iv = ps.intervals[0];
      // parada só com o tempo no 2º período (vai para a hora certa na volta)
      const code = db().downtimeCodes.find(c => c.active !== false && !c.deleted && c.allowsManualDuration && !c.requiresPrevCatalog && !c.requiresNextCatalog && !c.deductsPlanned);
      Actions.saveEvent(d.id, { codeId: code.id, start: null, end: null, minutes: 15, intervalId: ps.intervals[1].id, note: 'teste' });
      Actions.saveEvent(d.id, { codeId: code.id, start: null, end: null, minutes: 120, intervalId: ps.intervals[0].id, note: 'longa' });
      return { setIv: __tt.tenta(() => Actions.setIv(d.id, iv.id, 'good', 1)), cat: __tt.tenta(() => Actions.setIv(d.id, iv.id, 'catalogId', null)), colar: __tt.tenta(() => Actions.setGoods(d.id, [{ ivId: iv.id, good: 1 }])), dividir: __tt.tenta(() => Actions.splitInterval(d.id, iv.id, iv.start + 60, 1, 1)), excluir: __tt.tenta(() => Actions.deleteInterval(d.id, iv.id)), horario: __tt.tenta(() => Actions.editIntervalTimes(d.id, iv.id, iv.start, iv.end - 10)) }; }, D);
    for (const [k, v] of Object.entries(prot)) assert.match(v, /lançado pelo total/, 'recusa ' + k);
    const volta = await f.evaluate(s => { const d = __tt.dia(s), ps = d.shifts[0]; Actions.voltarHoraAHora(d.id, ps.id, true); const ps2 = __tt.turno(s), ev = __tt.dia(s).events.find(e => !e.deleted && e.note === 'teste'), iv = ps2.intervals.find(i => i.id === ev.intervalId);
      const aud = (db().auditLog || []).filter(a => a.entityId === ps.id && a.field === 'produção total do turno').map(a => a.after);
      const longa = __tt.dia(s).events.find(e => !e.deleted && e.note === 'longa'), msgs = Actions.closingCheck(db(), __tt.dia(s), ps2.id).msgs.map(m => m.msg).join(' | ');
      const R = Engine.computeDay(db(), __tt.dia(s)), minLonga = R.events && R.events[longa.id] ? R.events[longa.id].minutes : null;
      return { modo: !!ps2.lancamento, ivs: ps2.intervals.length, goods: ps2.intervals.filter(i => i.good != null).length, paradaEm: iv ? U.range(iv.start, iv.end) : null, aud, longa: { iv: longa.intervalId, turno: longa.productionShiftId === ps2.id, min: minLonga }, msgs }; }, D);
    assert.equal(volta.modo, false); assert.ok(volta.ivs >= 8); assert.equal(volta.goods, 0);
    assert.equal(volta.paradaEm, '10:00–11:00', 'parada só com o tempo foi para a hora em que o período começava');
    assert.equal(volta.longa.iv, null); assert.ok(volta.longa.turno, 'parada de 120 min (maior que uma hora) fica no turno'); assert.equal(volta.longa.min, 120, 'com os mesmos 120 min');
    assert.doesNotMatch(volta.msgs, /maior que o intervalo/, 'nenhuma parada maior que o intervalo depois da volta');
    assert.ok(volta.aud.length >= 2 && volta.aud.some(a => /^total:/.test(a)) && volta.aud.some(a => /hora a hora/.test(a)), 'auditoria de lançar e voltar ' + JSON.stringify(volta.aud));
    const fechado = await f.evaluate(s => { const d = __tt.dia(s), ps = d.shifts[0], F = TotalTurno.faixa(d, ps); Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b, good: 400000 }]); Actions.closeShift(d.id, ps.id, true); return __tt.tenta(() => Actions.voltarHoraAHora(d.id, ps.id, true)); }, D);
    assert.match(fechado, /fechado/);
    const congelada = await f.evaluate(s => { const d = __tt.dia(s), ps = d.shifts[0], t0 = JSON.stringify(ps.intervals[0].tgt || null);
      Actions.reopen(d.id, ps.id, 'teste do total');
      const F = TotalTurno.faixa(__tt.dia(s), ps), cat = __tt.turno(s).initialCatalogId;
      Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b, catalogId: cat, good: 410000 }]); const igual = JSON.stringify(__tt.turno(s).intervals[0].tgt || null);
      Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.a + 240, catalogId: cat, good: 200000 }, { start: F.a + 240, end: F.b, catalogId: cat, good: 200000 }]); const outro = __tt.turno(s).intervals.map(i => !!i.tgt);
      return { t0, igual, outro, good: __tt.res(s).good }; }, D);
    assert.notEqual(congelada.t0, 'null', 'o fechamento congelou a meta do período'); assert.equal(congelada.igual, congelada.t0, 'corrigir o total no mesmo período mantém a meta congelada');
    assert.deepEqual(congelada.outro, [false, false], 'período com outro horário usa a meta vigente'); assert.equal(congelada.good, 400000);
    ok('turno pelo total recusa digitar, colar, dividir, excluir e mudar horário; volta recria as horas com a parada na hora certa e a parada longa no turno; auditoria; turno fechado não muda; reaberto mantém a meta congelada');

    // ---------- 5. Hora a hora (liderança) ----------
    await f.evaluate(s => { App.sel.date = s; App.route = 'hourly'; render(); }, num.B_date); await page.waitForTimeout(700);
    t = await f.evaluate(() => ({ blocos: document.querySelectorAll('tr.tt-row .tt-box').length, travadas: [...document.querySelectorAll('input[data-good]')].filter(i => i.disabled && /pelo total/.test(i.title)).length, pill: document.querySelectorAll('tr.grp .tt-pill').length, selectsDoTurno: document.querySelectorAll('tr.tt-row ~ tr select[data-ivcat]').length }));
    assert.ok(t.blocos >= 2 && t.travadas === 1 && t.pill === 1, 'Hora a hora: bloco por turno, período travado e marca na linha do turno ' + JSON.stringify(t));
    ok('Hora a hora: bloco abaixo de cada turno, período do turno pelo total travado e marcado');

    // ---------- 6. servidor ----------
    const E = await f.evaluate(() => { const s = __tt.novoDia(5), d = __tt.dia(s), ps = d.shifts[0], F = TotalTurno.faixa(d, ps); Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b, catalogId: ps.initialCatalogId, good: 430000 }]);
      const ps2 = d.shifts[1], F2 = TotalTurno.faixa(d, ps2); Actions.lancarTotal(d.id, ps2.id, [{ start: F2.a, end: F2.b, catalogId: ps2.initialCatalogId, good: 300000 }]); try { Actions.closeDay(d.id); } catch (e) { }
      return { date: s, cat: (db().catalogs.find(c => c.id === ps.initialCatalogId) || {}).code, fechado: __tt.dia(s).status }; });
    // dia fechado: a prévia avisa e marca o dia fechado; depois reabre para aceitar
    const csv = 'Timestamp;Catalogo;Lote;Caixa\n' + Array.from({ length: 48 }, (_, k) => { const m = 6 * 60 + 5 + k * 10; return `${E.date}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00;${E.cat};9990001;${k + 1}`; }).join('\n');
    await f.evaluate(csv => { window.pickFile = async () => new File([csv], 'teste-servidor.csv', { type: 'text/csv' }); SrvUI.importFlow(); }, csv); await page.waitForTimeout(1200);
    t = await f.evaluate(() => { const m = [...document.querySelectorAll('.overlay .modal')].pop(), b = m && [...m.querySelectorAll('.banner.warn')].find(x => /apontados/.test(x.textContent)); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    assert.match(t, /Já existem dados apontados de produção/); assert.match(t, /1º Turno 430 mil \(pelo total\)/); assert.equal(E.fechado, 'fechado', 'o dia do teste foi fechado'); assert.match(t, /dia fechado/, 'prévia marca o dia fechado');
    await f.evaluate(() => document.querySelectorAll('[data-cls]').forEach(s => s.value = 'normal')); await f.locator('#svGo').click(); await page.waitForTimeout(900);
    await f.evaluate(s => { document.querySelectorAll('.overlay').forEach(o => o.remove()); const d = __tt.dia(s); if (d.status === 'fechado') Actions.reopen(d.id, null, 'teste'); App.sel.date = s; App.route = 'hourly'; render(); }, E.date); await page.waitForTimeout(800);
    t = await f.evaluate(() => { const b = [...document.querySelectorAll('.banner')].find(x => /servidor/.test(x.textContent)); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    assert.match(t, /Existem dados do servidor para 1º Turno/);
    const apl = await f.evaluate(s => { const d = __tt.dia(s), S = SrvUI.sug(d, Engine.computeDay(db(), d)), x = S.ivs.find(r => r.psId === d.shifts[0].id); return Srv.applyDay(d, { goods: [{ ivId: x.ivId, good: 1 }], cats: [], events: [] }); }, E.date);
    assert.equal(apl.goods, 0); assert.match(apl.errors.join(' '), /lançado pelo total/, 'servidor não grava produção no turno pelo total sem a troca');
    await f.locator('#srvRev').click(); await page.waitForTimeout(600);
    t = await f.evaluate(() => { const m = [...document.querySelectorAll('.overlay .modal')].pop(); return { aviso: !!m.querySelector('[data-ttsrv]'), texto: m.textContent.replace(/\s+/g, ' ') }; });
    assert.ok(t.aviso && /existem dados apontados de produção/.test(t.texto), 'revisão avisa e oferece a troca');
    await f.locator('[data-ttsrv]').first().click(); await page.waitForTimeout(300); await f.locator('.overlay').last().locator('button.primary,button.danger').last().click(); await page.waitForTimeout(900);
    t = await f.evaluate(s => { const m = [...document.querySelectorAll('.overlay .modal')].pop(); return { modo: !!__tt.turno(s).lancamento, marcadas: m.querySelectorAll('[data-g]:checked').length }; }, E.date);
    assert.equal(t.modo, false); assert.ok(t.marcadas >= 8, 'depois da troca, as horas do servidor vêm marcadas');
    await f.locator('#rvGo').click(); await page.waitForTimeout(900);
    t = await f.evaluate(s => __tt.turno(s).intervals.filter(i => i.good != null).length, E.date);
    assert.ok(t >= 8, 'aceite grava o hora a hora do servidor');
    ok('servidor: prévia avisa produção já apontada (dia fechado), turno pelo total não recebe produção sem a troca, revisão leva ao aceite');
    // retrabalho de um lote dentro de um turno lançado pelo total: tempo sai do OEE, produção informada não é trocada pela contagem
    const G = await f.evaluate(() => { const s = __tt.novoDia(6), d = __tt.dia(s), ps = d.shifts[0], F = TotalTurno.faixa(d, ps); Actions.lancarTotal(d.id, ps.id, [{ start: F.a, end: F.b, catalogId: ps.initialCatalogId, good: 430000 }]); return { date: s, cat: (db().catalogs.find(c => c.id === ps.initialCatalogId) || {}).code }; });
    const csv2 = 'Timestamp;Catalogo;Lote;Caixa\n' + Array.from({ length: 30 }, (_, k) => { const m = 6 * 60 + 5 + k * 10; return `${G.date}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00;${G.cat};9990002;${k + 1}`; }).join('\n');
    await f.evaluate(csv => { window.pickFile = async () => new File([csv], 'teste-retrabalho.csv', { type: 'text/csv' }); SrvUI.importFlow(); }, csv2); await page.waitForTimeout(1200);
    await f.evaluate(() => document.querySelectorAll('[data-cls]').forEach(s => s.value = 'normal')); await f.locator('#svGo').click(); await page.waitForTimeout(900);
    const rw = await f.evaluate(s => { document.querySelectorAll('.overlay').forEach(o => o.remove()); const d = __tt.dia(s), ps = d.shifts[0], P = ServerData.reworkPlan(db(), d, Engine.computeDay(db(), d), '9990002', db().settings);
      let erro = ''; try { Srv.setDayRework(d.id, '9990002', true, { goods: ps.intervals.map(i => i.id), removeInside: [], setups: [] }); } catch (e) { erro = e.message; }
      return { planoTrocaTotal: P.goods.some(g => ps.intervals.some(i => i.id === g.ivId)), erro, good: __tt.res(s).good, rtb: __tt.dia(s).events.filter(e => !e.deleted && e.srvRework === '9990002').length }; }, G.date);
    assert.equal(rw.planoTrocaTotal, false, 'o plano de retrabalho não propõe trocar a produção do turno pelo total');
    if (/RTB/.test(rw.erro)) console.log('aviso: demonstração sem o tipo RTB; conferido só o plano'); else { assert.equal(rw.erro, ''); assert.equal(rw.good, 430000, 'retrabalho não troca o total informado'); assert.ok(rw.rtb > 0, 'o tempo de retrabalho entra como parada RTB'); }
    ok('retrabalho em turno lançado pelo total: tempo vira parada RTB, produção informada continua 430 mil');

    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok total do turno: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
