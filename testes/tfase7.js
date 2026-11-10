// Fase 7 do briefing (09/11/2026): PRD-05 (responsável por turno), PRD-06 (hora a hora por turno), UX-01 (ⓘ), UX-03 (Painel →
// Visão Geral no Waste e no Gel), UX-04 (pílula única do cadastro, com "desatualizada"). UX-02 ficou para depois.
// node testes/tfase7.js → "sem erros"; código 1 se falhar.
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [], pe = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push(msg); };
  const nova = async (arq, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => pe.push(arq + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1200); return p; };

  /* Produção */
  const o = await nova('OEE-Vacutainer.html');
  const r = await o.evaluate(async () => {
    const w = () => new Promise(r => setTimeout(r, 120)); document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); await w();
    const d = db().productionDays.filter(x => !x.deleted && x.shifts.filter(p => !p.deleted && !p.summary).length >= 2 && x.status !== 'fechado').sort((a, b) => a.date < b.date ? 1 : -1)[0];
    App.sel.date = d.date; App.sel.lineId = d.lineId; go('launch'); await w();
    const m = document.getElementById('main') || document.body, R = { ver: APP_VERSION, date: d.date };
    R.respDia = !!m.querySelector('[data-dayf="responsible"]');
    R.respTurno = m.querySelectorAll('[data-psf$="|responsible"]').length; R.nTurnos = m.querySelectorAll('section.shift').length;
    R.hhBtn = m.querySelectorAll('section.shift [data-hhps]').length;
    R.ib = ['restaurarIv', 'reaplicarMetas', 'moverDia', 'diaSemProd'].filter(k => m.querySelector(`[data-help="${k}"]`));
    R.pill = (document.querySelector('[data-vac-cadrev]') || {}).outerHTML || '';
    // Total diário → Responsável pelo reporte
    Actions.setScrapMode(d.id, 'day'); await w(); render(); await w();
    R.respRep = /Responsável pelo reporte/.test((document.querySelector('[data-dayf="responsible"]') || { closest: () => null }).closest('label')?.textContent || '');
    Actions.setScrapMode(d.id, 'shift'); await w();
    // responsável por turno grava em ps.responsible
    const ps = d.shifts.filter(p => !p.deleted && !p.summary)[1]; Actions.setShiftField(d.id, ps.id, 'responsible', 'P. Costa'); await w();
    R.psResp = db().productionDays.find(x => x.id === d.id).shifts.find(p => p.id === ps.id).responsible;
    // PRD-06: hora a hora só do turno
    render(); await w(); document.querySelector(`section.shift [data-hhps="${ps.id}"]`).click(); await w();
    R.rota = App.route; R.grp = [...document.querySelectorAll('table.hh tr.grp')].map(t => t.textContent.trim().slice(0, 30));
    R.seg = [...document.querySelectorAll('[data-hhsel]')].map(x => x.textContent.trim());
    R.sel = (document.querySelector('[data-hhsel][aria-pressed="true"]') || {}).dataset?.hhsel;
    document.querySelector('[data-hhsel=""]').click(); await w(); R.todos = document.querySelectorAll('table.hh tr.grp').length;
    R.psNome = ps.snap.name; return R;
  });
  ok(r.ver === '2.4.34', 'Produção 2.4.34');
  ok(!r.respDia && r.respTurno === r.nTurnos && r.nTurnos >= 2, `PRD-05: sem "Responsável" do dia; um por turno (${r.respTurno}/${r.nTurnos})`);
  ok(r.respRep, 'PRD-05: com scrap "Total diário" aparece "Responsável pelo reporte"');
  ok(r.psResp === 'P. Costa', 'PRD-05: responsável do turno gravado no turno');
  ok(r.hhBtn === r.nTurnos, 'PRD-06: cada turno tem o próprio botão Hora a hora');
  ok(r.rota === 'hourly' && r.grp.length === 1 && r.grp[0].includes(r.psNome) && r.sel, `PRD-06: abre só o turno escolhido (${r.grp.join(' | ')})`);
  ok(r.seg[0] === 'Todos' && r.seg.length === r.nTurnos + 1 && /\d+\/\d+/.test(r.seg[1]) && r.todos === r.nTurnos, `PRD-06: troca entre turnos com preenchimento x/y e "Todos" (${r.seg.join(' · ')})`);
  ok(r.ib.length === 4, `UX-01: ⓘ em ${r.ib.join(', ')}`);

  /* UX-04: pílula comum, "desatualizada" quando outra página já leu uma rev mais nova */
  const u = await o.evaluate(() => { localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 9 })); return [vacCadPilula(7, { fonte: 'pasta' }), vacCadPilula(9, { fonte: 'pasta' }), vacCadPilula(7, { fonte: 'pasta', portal: true }), vacCadPilula(9, { fonte: 'copia' }), vacCadPilula(null)]; });
  ok(/desatualizada/.test(u[0]) && /pill warn/.test(u[0]) && !/desatualizada/.test(u[1]) && /pill info/.test(u[1]) && !/desatualizada/.test(u[2]), 'UX-04: rev atrás da mais nova lida neste computador = "desatualizada"; igual = normal; no Portal nunca');
  ok(/cópia local/.test(u[3]) && /não lido/.test(u[4]) && /Revisão do cadastro geral do Portal/.test(u[1]), 'UX-04: cópia local e "não lido" sinalizados; ⓘ explica o número');
  await o.close();

  /* UX-03 Waste e Gel; UX-04 Paradas e Portal; ⓘ no Portal */
  const w = await nova('Perdas-Ordem.html');
  ok(await w.evaluate(() => document.querySelector('[data-t="painel"]').textContent.trim() === 'Visão Geral' && APP_VER === '1.8.29'), 'UX-03 (WST-01): Waste 1.8.29 com a aba Visão Geral');
  await w.close();
  const g = await nova('Gestão-Gel-Vacutainer.html');
  ok(await g.evaluate(() => TABS[0][0] === 'painel' && TABS[0][1] === 'Visão Geral' && APP_VERSION === '2.21' && !!VAC_INICIAL_ALVO['Gestão de Gel › Visão Geral'] && !!VAC_INICIAL_ALVO['Gestão de Gel › Painel']), 'UX-03 (GEL-01): Gel 2.21 com a aba Visão Geral (id painel; página inicial antiga continua valendo)');
  await g.close();
  const pa = await nova('Paradas.html');
  ok(await pa.evaluate(() => { return PAGE.versao === '1.0.26' && typeof vacCadPilula === 'function'; }), 'Paradas 1.0.26 usa a pílula comum');
  await pa.close();
  const po = await nova('Portal.html');
  const pr = await po.evaluate(() => ({ v: PAGE.versao, aj: /como a peça falhou/.test(CAT_AJUDA.modosFalha) && /por que a linha parou/.test(CAT_AJUDA.paradas) }));
  ok(pr.v === '1.9.15' && pr.aj, 'Portal 1.9.15: ⓘ das categorias explica código de parada × modo de falha');
  await po.close();

  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
