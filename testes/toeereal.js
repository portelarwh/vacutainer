// Produção 2.4.37 (10/11/2026): OEE real pela linha do tempo (início e fim espelhados), OEE reportado / OEE real / Fora de turno no dia e na
// Visão Geral, caixas do MES e trocas de lote por turno, cartão do turno não produtivo com caixas, "Editar cards" (preferência do computador).
// node testes/toeereal.js → "sem erros"; código 1 se falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [], pe = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push(msg); };
  const o = await ctx.newPage(); o.on('pageerror', e => pe.push(e.message)); o.on('dialog', d => d.accept());
  await o.goto(S + 'OEE-Vacutainer.html'); await o.waitForTimeout(1500);
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(800);
  const R = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)), out = {};
    const d = JSON.parse(Store.serialize(Store.S.db)), SD = ServerData, X = '2026-03-10', X1 = '2026-03-11', LINE = 'line_vac';
    const mkShift = (code, name, start, end) => ({ id: 'sh_' + code.toLowerCase(), code, name, lineId: LINE, status: 'ativo', versions: [{ id: 'v_' + code, validFrom: '2000-01-01', validTo: null, start, end, weekdays: [0, 1, 2, 3, 4, 5, 6], active: true, breaks: [], template: null }] });
    d.shifts = [mkShift('T1', 'Turno A', '06:00', '14:30'), mkShift('T2', 'Turno B', '14:30', '22:47'), mkShift('T3', 'Turno C', '22:47', '30:00')];
    d.shifts[2].versions[0].productive = false;
    d.calendar = []; d.productionDays = d.productionDays.filter(x => x.date !== X && x.date !== X1);
    const cat = d.catalogs.find(c => !c.deleted && c.active !== false && Engine.resolveTarget(d, X, c.id, 'mac_line', LINE));
    Object.assign(d.settings, { foraTurnoDesde: '2026-01-01', continuityMin: 10, serverBoxQty: 1000 });
    const dia = date => { const day = Engine.buildDay(d, date, LINE, 'mac_line', 'teste'); day.demo = false; day.shifts.forEach(p => { p.initialCatalogId = cat.id; p.intervals.forEach(i => i.good = 60000); p.scrap = 0; }); d.productionDays.push(day); return day; };
    const dX = dia(X), dX1 = dia(X1);
    const base = SD.dayStartMin(X), rng = (a, z) => { const L = []; for (let m = a; m <= z; m++) L.push(base + m); return L; };
    const seg = (id, lot, ms, b0) => { const e = SD.enc(ms); return { id, lineId: LINE, lot, cat: cat.code, b0, b1: b0 + ms.length - 1, t0: SD.fromMin(ms[0]), t1: SD.fromMin(ms[ms.length - 1]), n: ms.length, base: e.base, m: e.m }; };
    d.server = SD.ensureStore(d);
    d.server.segments = [seg('s0', 'L-1', rng(20 * 60, 20 * 60 + 10), 1), seg('s1', 'L-2', rng(22 * 60 + 30, 23 * 60 + 40), 1), seg('s2', 'L-2', rng(26 * 60, 26 * 60 + 30), 500)];
    d.server.lotClass = { 'L-1': { kind: 'normal' }, 'L-2': { kind: 'normal' } };
    Store.S.db = Model.ensure(d); Engine.bumpConfig();
    const dd = db(), rX = Engine.computeDay(dd, dd.productionDays.find(x => x.date === X)), rX1 = Engine.computeDay(dd, dd.productionDays.find(x => x.date === X1));
    const oX = OeeReal.dia(dd, dd.productionDays.find(x => x.date === X), rX), oX1 = OeeReal.dia(dd, dd.productionDays.find(x => x.date === X1), rX1);
    out.X = { antes: oX.antes, depois: oX.depois, rep: oX.rep, real: oX.real, fora: oX.fora, oficial: rX.r.oee };
    out.X1 = { antes: oX1.antes, depois: oX1.depois, rep: oX1.rep, real: oX1.real, fora: oX1.fora };
    // 2.4.42 · Plano do mês: realizado igual à soma da produção dos dias (inclui fora de turno)
    try { const plan = { id: 'pl_t', month: '2026-03', lineId: LINE, versions: [{ n: 1, items: [{ catalogId: cat.id, qty: 30000000 }] }], exc: [], orders: [{ id: 'o1', order: '100', lot: 'L-2', catalogId: cat.id, qty: 100000000, start: X }, { id: 'o2', order: '200', lot: '', catalogId: cat.id, qty: 100000000, start: X }] };
      const PR = Engine.monthPlanResult(dd, plan, X1), gX = rX.r.good + rX1.r.good; const OP = Engine.orderProgress(dd, plan).byOrder, g1 = OP.get('o1'), g2 = OP.get('o2'); out.plano = { real: PR.real, dias: gX, ord: g1.produced, mes: g1.mes, ini: g1.firstAt, fim: g1.lastAt, done: g1.doneAt, o2: g2.produced };
    } catch (e) { out.plano = { erro: String(e) }; }
    // Lançamento do dia X
    App.prefs.kcOff = []; App.sel.date = X; App.sel.lineId = LINE; go('launch'); await w(300);
    const kl = [...document.querySelectorAll('.section.kpis .kpi .l')].map(l => l.childNodes[0].textContent.trim());
    out.kpis = kl; out.ib = ['oeeRep', 'oeeReal', 'foraTurnoKpi'].every(k => document.querySelector(`.section.kpis [data-help="${k}"]`));
    const tx = s => s.textContent.replace(/\s+/g, ' '); out.cartoes = document.querySelectorAll('section.tl, section.shift').length;
    out.B = [...document.querySelectorAll('section.tl, section.shift:not(.np)')].map(tx).find(t => /Turno B/.test(t)) || ''; out.C = [...document.querySelectorAll('section.shift.np')].map(tx).join(' ');
    // 2.4.41 · cartão do turno (PRD-10) e popup de scrap (PRD-13)
    out.cardB = out.B; out.temProcessada = /Produção processada/i.test(document.querySelector('section.tl, section.shift:not(.np)').textContent);
    const psB = dd.productionDays.find(x => x.date === X).shifts.find(p => p.snap.code === 'T2');
    document.querySelector(`[data-scrapturno="${psB.id}"]`).click(); await w(200);
    let ov = document.querySelector('.overlay'); out.scModal = !!ov && !!ov.querySelector('#scSo') && ov.querySelectorAll('[data-scm]').length > 2;
    out.scDesab = [...ov.querySelectorAll('[data-scm]')].every(i => i.disabled);
    ov.querySelector('#scSo').click(); await w(50);
    const ins = [...ov.querySelectorAll('[data-scm]')]; ins[0].value = '400'; ins[0].dispatchEvent(new Event('input')); ins[1].value = '850'; ins[1].dispatchEvent(new Event('input')); await w(50);
    out.scSoma = ov.querySelector('#scSoma').textContent; ov.querySelector('#scOk').click(); await w(400);
    const psB2 = db().productionDays.find(x => x.date === X).shifts.find(p => p.snap.code === 'T2'); out.scGrav = [psB2.scrap, JSON.stringify(psB2.scrapMaq)];
    document.querySelector(`[data-scrapturno="${psB.id}"]`).click(); await w(200); ov = document.querySelector('.overlay');
    ov.querySelector('#scSo').click(); await w(50); ov.querySelector('#scTot').value = '1.000'; ov.querySelector('#scOk').click(); await w(400);
    const psB3 = db().productionDays.find(x => x.date === X).shifts.find(p => p.snap.code === 'T2'); out.scTot = [psB3.scrap, psB3.scrapMaq == null];
    out.scTxt = (document.querySelector(`[data-scrapturno="${psB.id}"]`).closest('.kv, .tl-k') || {}).textContent || '';
    // Painel: indicadores novos
    out.pnK = ['oeeRep', 'oeeReal', 'fora', 'caixas'].every(k => PN_K[k]) && PN_MINE().kpis.includes('oeeReal');
    // Editar cards
    document.getElementById('kcEdit').click(); await w(100);
    const cb = [...document.querySelectorAll('[data-kc]')]; out.edit = cb.map(c => c.dataset.kc);
    const fora = cb.find(c => c.dataset.kc === 'Fora de turno'); fora.checked = false; fora.onchange(); await w(150);
    out.semFora = ![...document.querySelectorAll('.section.kpis .kpi .l')].some(l => /Fora de turno/.test(l.textContent)); out.pref = JSON.stringify(App.prefs.kcOff);
    document.querySelectorAll('.overlay').forEach(x => x.remove()); App.prefs.kcOff = []; render(); await w(100);
    out.kpiCx = ([...document.querySelectorAll('.section.kpis .kpi')].find(k => /Caixas do MES/.test(k.textContent)) || {}).textContent || '';
    // Hora a hora: turno C (não produtivo) no seletor e na grade só leitura; recolher turno; gráfico com todas as horas
    HHPs.sel = null; go('hourly'); await w(400);
    out.hhSel = [...document.querySelectorAll('[data-hhsel]')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    out.hhNP = (document.querySelector('section.hh-np') || {}).textContent || '';
    out.hhNPlinhas = document.querySelectorAll('section.hh-np tbody tr').length;
    out.textos = /número completo|Pausas e intervalos padrão|Para editar um intervalo/.test(document.getElementById('main').textContent);
    const svg = [...document.querySelectorAll('section.card')].find(sc => /Atendimento hora a hora/.test(sc.textContent)).querySelector('svg');
    out.rotulos = svg ? svg.querySelectorAll('g.ax text').length : 0; out.colunas = (res => res.flat.length)(Engine.computeDay(db(), db().productionDays.find(x => x.date === X)));
    const g = document.querySelector('tr[data-hhgrp="T2"]'); g.click(); await w(50);
    out.dobrou = [...document.querySelectorAll('tr[data-hhg="T2"]')].every(r => r.hidden) && [...document.querySelectorAll('tr[data-hhg="T1"]')].every(r => !r.hidden) && App.prefs.hhFold.T2 === true;
    render(); await w(200); out.lembra = [...document.querySelectorAll('tr[data-hhg="T2"]')].every(r => r.hidden);
    document.querySelector('tr[data-hhgrp="T2"]').click(); await w(50);
    const npb = document.querySelector('[data-hhsel^="np:"]'); npb.click(); await w(300);
    out.soNP = !document.querySelector('tr[data-hhg]') && !!document.querySelector('section.hh-np');
    if (window.__print) await window.__print('hh');
    HHPs.sel = null;
    // 2.4.42 · Relatórios › Tabelas
    { const RS = rpState(); RS.type = 'tables'; RS.tab = { mod: 'dia', from: X, to: X1, wd: [], turno: '', fam: '', cat: '' }; go('reports'); await w(400);
      const lin = () => [...document.querySelectorAll('#rpDoc table.rt-t tbody tr:not(.total)')].map(t => t.textContent.replace(/\s+/g, ' ').trim());
      out.tab = { tipo: !!document.querySelector('[data-rpt="tables"]'), mods: document.querySelectorAll('#rtMod option').length, dia: lin() };
      document.querySelector('[data-rtwd="2"]').click(); await w(300); out.tab.ter = lin();
      RS.tab.wd = []; RS.tab.mod = 'turno'; render(); await w(300); out.tab.turno = lin();
      RS.tab.mod = 'lotes'; render(); await w(300); out.tab.lotes = lin();
      RS.tab.mod = 'diasemana'; render(); await w(300); out.tab.ds = lin(); out.tab.titulo = (document.querySelector('#rpDoc') || {}).textContent.slice(0, 80); }
    // Visão Geral do período X..X1
    App.filters.from = X; App.filters.to = X1; App.filters.lineId = LINE; Panel.st().view = 'padrao'; go('overview'); await w(400);
    out.vg = [...document.querySelectorAll('.kpi .l')].map(l => l.childNodes[0].textContent.trim()).filter(t => /^(OEE reportado|OEE real|Fora de turno)$/.test(t));
    out.vgCards = [...document.querySelectorAll('section.vg-ind .kpi .l')].map(l => l.childNodes[0].textContent.trim());
    out.vgFoldBtns = document.querySelectorAll('section.card > header .dobra').length;
    const sb = [...document.querySelectorAll('section.card')].find(sc => /Indicadores do período/.test(sc.textContent)); sb.querySelector('.dobra').click(); await w(50);
    out.vgDobrou = sb.classList.contains('dobrado') && getComputedStyle(sb.querySelector('.kpis')).display === 'none' && App.prefs.vgFold['Indicadores do período'] === true;
    sb.querySelector('.dobra').click(); out.maisInd = !!document.querySelector('details.more-kpi');
    if (window.__print) await window.__print('vg');
    out.vgReal = OeeReal.periodo([X, X1].map(x => dd.productionDays.find(y => y.date === x)));
    return out;
  });
  ok(R.X.antes === 0 && R.X.depois === 54, `fim espelhado: o B passou do horário até 23:40 → +54 min no tempo planejado do OEE real (antes ${R.X.antes}, depois ${R.X.depois})`);
  ok(R.X.rep === R.X.oficial && R.X.real < R.X.rep && R.X.fora === 54000, `OEE reportado = oficial (${(R.X.rep * 100).toFixed(1)}%); OEE real menor (${(R.X.real * 100).toFixed(1)}%); fora de turno 54 mil`);
  ok(R.X1.antes === 240 && R.X1.depois === 0 && R.X1.real < R.X1.rep, `início espelhado: produção da madrugada (02:00) sem continuidade vai para o A e o real conta da 1ª caixa (+${R.X1.antes} min)`);
  ok(['OEE reportado', 'OEE real', 'Fora de turno'].every(k => R.kpis.includes(k)) && R.ib, `os 3 indicadores na faixa do dia, com ⓘ (${R.kpis.join(' · ')})`);
  ok(/Caixas do MES/.test(R.B) && /1ª 20:00 · última 22:46/.test(R.B) && /L-1 terminou 20:10 → L-2 começou 22:30 · 2h20/.test(R.B) && /Total de troca no turno: 2h20/.test(R.B), 'cartão do B: 1ª e última caixa, troca de lote (fim, início, duração) e total de troca');
  ok(R.cartoes === 3 && /não produtivo/.test(R.C) && /Turno B/.test(R.C) && /Turno A de 11\/03\/2026/.test(R.C) && /Só leitura/.test(R.C), `cartão do turno C (não produtivo) com as caixas e para onde foram (${R.C.slice(0, 160)})`);
  ok(R.edit.includes('Fora de turno') && R.edit.includes('Produção boa') && R.semFora && R.pref === '["Fora de turno"]', 'Editar cards: desmarcar esconde o indicador e fica na preferência do computador');
  ok(R.vg.length === 3 && R.vgReal.real < R.vgReal.rep && R.vgReal.fora === 85000, `Visão Geral com os 3 no período (fora de turno ${R.vgReal.fora})`);
  ok(/Caixas do MES/.test(R.kpiCx) && /20:00 – 02:30/.test(R.kpiCx) && /1 troca/.test(R.kpiCx), `cartão "Caixas do MES" no Lançamento com 1ª e última caixa e trocas (${R.kpiCx.replace(/\s+/g, ' ').slice(0, 120)})`);
  ok(R.hhSel.some(t => /Turno C não produtivo · 85 cx/.test(t)) && /só leitura/i.test(R.hhNP) && R.hhNPlinhas === 8, `Hora a hora: turno C no seletor e na grade só leitura por hora (${R.hhSel.join(' | ')}; ${R.hhNPlinhas} horas)`);
  ok(R.soNP, 'Hora a hora: escolhendo o C, mostra só a grade dele');
  ok(R.dobrou && R.lembra, 'Hora a hora: cada turno recolhe e expande pela linha do turno, e a escolha fica lembrada');
  ok(!R.textos, 'Hora a hora sem os textos fixos (número completo, pausas e intervalos padrão, ⋯ no fim da linha)');
  ok(R.rotulos >= R.colunas + 3, `gráfico do hora a hora com rótulo em todas as colunas, mais as horas do C com caixas (${R.rotulos} rótulos, ${R.colunas} intervalos)`);
  ok(['Último catálogo do período', 'Produção boa', 'OEE realizado', 'Disponibilidade', 'Performance', 'Qualidade', 'Capacidade planejada', 'Meta oficial do período', 'OEE reportado', 'OEE real', 'Fora de turno', 'Caixas do MES'].every(k => R.vgCards.includes(k)), `Visão Geral com os cartões do Lançamento (${R.vgCards.join(' · ')})`);
  ok(R.vgFoldBtns >= 5 && R.vgDobrou && R.maisInd, `Visão Geral: ${R.vgFoldBtns} blocos recolhíveis (lembrado neste computador); Mais indicadores continua`);
  ok(/Produção dentro do turno/i.test(R.cardB) && /Produção fora do turno/i.test(R.cardB) && /54 caixa/.test(R.cardB) && /22:47\s?–\s?23:40/.test(R.cardB) && /Produção total considerada/i.test(R.cardB) && /OEE reportado/i.test(R.cardB) && /OEE real/i.test(R.cardB) && !/OEE realizado/i.test(R.cardB) && !R.temProcessada, 'PRD-10: cartão do turno com produção dentro / fora (caixas e horário) / total considerada, OEE reportado e OEE real; sem "Produção processada"');
  ok(R.scModal && R.scDesab && R.scSoma === '1.250' && R.scGrav[0] === 1250 && /EQ01":400/.test(R.scGrav[1]), `PRD-13: popup de scrap por máquina (máquinas desabilitadas em "só o total"; soma ${R.scSoma}; gravado ${R.scGrav.join(' ')})`);
  ok(R.scTot[0] === 1000 && R.scTot[1] && /1\.000\s*peças/.test(R.scTxt) && /só o total/.test(R.scTxt), 'PRD-13: "Reportar só o total" grava o total e limpa o por máquina; o cartão mostra o total');
  ok(R.pnK, 'PRD-08: OEE reportado, OEE real, Fora de turno e Caixas do MES no catálogo do Painel; Meu painel com OEE real');
  ok(R.plano && R.plano.real === R.plano.dias && R.plano.ord === 102000 && R.plano.mes && R.plano.mes.caixas === 102 && R.plano.ini === '2026-03-10T22:30' && R.plano.fim === '2026-03-11T02:30' && R.plano.o2 === R.plano.dias - 102000, `Plano: realizado = soma dos dias (com fora de turno); ordem do lote L-2 = 102 caixas do MES, 1ª e última caixa; ordem sem lote recebe o resto (plano ${R.plano && R.plano.real}, ordem L-2 ${R.plano && R.plano.ord}, outra ${R.plano && R.plano.o2}, ${R.plano && R.plano.ini}–${R.plano && R.plano.fim}${R.plano && R.plano.erro ? ' · ' + R.plano.erro : ''})`);
  ok(R.tab.tipo && R.tab.mods === 10 && R.tab.dia.length === 2 && R.tab.ter.length === 1 && /Ter/.test(R.tab.ter[0]), `Relatórios › Tabelas: 10 modelos; por dia (2 linhas) e só terças (1 linha: ${(R.tab.ter[0] || '').slice(0, 60)})`);
  ok(R.tab.turno.length === 4 && R.tab.lotes.length === 2 && /L-1/.test(R.tab.lotes[0]) && /L-2/.test(R.tab.lotes[1]) && R.tab.ds.length === 2, `Tabelas: por turno (${R.tab.turno.length} linhas), lotes do MES (${R.tab.lotes.map(x => x.slice(0, 30)).join(' | ')}), por dia da semana (${R.tab.ds.length})`);
  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
