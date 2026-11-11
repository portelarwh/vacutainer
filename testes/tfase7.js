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
    R.respTurno = m.querySelectorAll('[data-psf$="|responsible"]').length; R.nTurnos = m.querySelectorAll('section.tl, section.shift').length;
    R.hhBtn = m.querySelectorAll('section.tl [data-hhps], section.shift [data-hhps]').length;
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
    render(); await w(); document.querySelector(`section.tl [data-hhps="${ps.id}"]`).click(); await w();
    R.rota = App.route; R.grp = [...document.querySelectorAll('table.hh tr.grp')].map(t => t.textContent.trim().slice(0, 30));
    R.seg = [...document.querySelectorAll('[data-hhsel]')].map(x => x.textContent.trim());
    R.sel = (document.querySelector('[data-hhsel][aria-pressed="true"]') || {}).dataset?.hhsel;
    document.querySelector('[data-hhsel=""]').click(); await w(); R.todos = document.querySelectorAll('table.hh tr.grp').length;
    R.psNome = ps.snap.name; return R;
  });
  ok(r.ver >= '2.4.34', 'Produção (2.4.34+)');
  ok(!r.respDia && r.respTurno === r.nTurnos && r.nTurnos >= 2, `PRD-05: sem "Responsável" do dia; um por turno (${r.respTurno}/${r.nTurnos})`);
  ok(r.respRep, 'PRD-05: com scrap "Total diário" aparece "Responsável pelo reporte"');
  ok(r.psResp === 'P. Costa', 'PRD-05: responsável do turno gravado no turno');
  ok(r.hhBtn === r.nTurnos, 'PRD-06: cada turno tem o próprio botão Hora a hora');
  ok(r.rota === 'hourly' && r.grp.length === 1 && r.grp[0].includes(r.psNome) && r.sel, `PRD-06: abre só o turno escolhido (${r.grp.join(' | ')})`);
  ok(r.seg[0] === 'Todos' && r.seg.length === r.nTurnos + 1 && /\d+\/\d+/.test(r.seg[1]) && r.todos === r.nTurnos, `PRD-06: troca entre turnos com preenchimento x/y e "Todos" (${r.seg.join(' · ')})`);
  ok(r.ib.length === 4, `UX-01: ⓘ em ${r.ib.join(', ')}`);

  /* 2.4.35 · CSV do MES: catálogo e lote registrados antes da 1ª caixa pertencem a ela; caixa 0 (contador zerado) não conta */
  const ms = await o.evaluate(() => {
    const csv = `Time,VAEB01_MES_Catalogo_Atual,VAEB01_MES_Lote_Atual,VAEB01_MES_Caixa_Atual
11/9/2026 2:00:00.000 AM,,6299900.000,0.0
11/9/2026 2:00:05.000 AM,360060.000,,
11/9/2026 2:30:00.000 AM,,,1.0
11/9/2026 2:31:00.000 AM,,,2.0
11/9/2026 3:10:00.000 AM,,6299948.000,0.0
11/9/2026 3:10:06.032 AM,360057.000,,
11/9/2026 4:53:06.325 AM,,,1.0
11/9/2026 4:53:31.484 AM,,,2.0
11/9/2026 4:54:10.000 AM,,,3.0`;
    const an = ServerData.analyze(ServerData.parseCsv(csv), { gapMin: 10 });
    return { seg: an.segments.map(s => [s.lot, s.cat, s.b0, s.b1, s.t0.slice(11)].join('|')), gaps: an.gaps.length, zeros: an.zeros, boxes: an.boxes, mes: an.mes.map(e => e.k + '@' + e.t.slice(11)).join(' ') };
  });
  ok(JSON.stringify(ms.seg) === JSON.stringify(['6299900|360060|1|2|02:30:00', '6299948|360057|1|3|04:53:06']), `MES: cada lote com o catálogo registrado acima da 1ª caixa e início na 1ª caixa (${ms.seg.join(' ; ')})`);
  ok(ms.zeros === 2 && ms.boxes === 5 && ms.gaps === 0, `MES: caixa 0 não conta nem abre lacuna (caixas ${ms.boxes}, zeros ${ms.zeros}, lacunas ${ms.gaps})`);
  ok(ms.mes === 'lot@02:00:00 cat@02:00:05 lot@03:10:00 cat@03:10:06', `MES: horário do registro guardado como evento (${ms.mes})`);

  /* UX-02: guia por aba (kit vacGuia + conteúdo da página) */
  const gp = await o.evaluate(async () => {
    const w = t => new Promise(r => setTimeout(r, t)); go('launch'); await w(150);
    localStorage.setItem('vac.guiaMostrar', '1'); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' })); await w(150);
    const R = { btn: !!document.getElementById('vacGuiaBtn'), h1: (document.querySelector('#vacGuia h2') || {}).textContent, marcas: [...document.querySelectorAll('.vg-marca')].filter(m => m.style.display !== 'none').length };
    go('hourly'); await w(700); R.h2 = (document.querySelector('#vacGuia h2') || {}).textContent;
    go('stops'); await w(700); R.h3 = (document.querySelector('#vacGuia') || {}).innerText || '';
    vacGuia.fechar(); await w(50); R.fechou = !document.getElementById('vacGuia') && !document.querySelector('.vg-marca'); return R;
  });
  ok(gp.btn && /Lançamento do dia/.test(gp.h1) && gp.marcas >= 3, `UX-02: "?"/F1 abre o guia da aba aberta, com os campos numerados na tela (${gp.h1}, ${gp.marcas} marcas)`);
  ok(/Hora a hora/.test(gp.h2) && /em preparação/.test(gp.h3) && gp.fechou, 'UX-02: o guia acompanha a troca de aba; aba sem guia avisa "em preparação"; fechar tira as marcas');

  /* UX-04: pílula comum, "desatualizada" quando outra página já leu uma rev mais nova */
  const u = await o.evaluate(() => { localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 9 })); return [vacCadPilula(7, { fonte: 'pasta' }), vacCadPilula(9, { fonte: 'pasta' }), vacCadPilula(7, { fonte: 'pasta', portal: true }), vacCadPilula(9, { fonte: 'copia' }), vacCadPilula(null)]; });
  ok(/desatualizada/.test(u[0]) && /pill warn/.test(u[0]) && !/desatualizada/.test(u[1]) && /pill info/.test(u[1]) && !/desatualizada/.test(u[2]), 'UX-04: rev atrás da mais nova lida neste computador = "desatualizada"; igual = normal; no Portal nunca');
  ok(/cópia local/.test(u[3]) && /não lido/.test(u[4]) && /Revisão do cadastro geral do Portal/.test(u[1]), 'UX-04: cópia local e "não lido" sinalizados; ⓘ explica o número');
  await o.close();

  for (const [arq, id, abas] of [['Portal.html', 'portal', 7], ['Paradas.html', 'paradas', 10], ['Perdas-Ordem.html', 'perdas', 8], ['Gestão-Gel-Vacutainer.html', 'gel', 8], ['Iniciativas.html', 'inic', 6], ['Equipamentos.html', 'equip', 5]]) {
    const pg = await nova(arq); const r = await pg.evaluate(id => { vacGuia.abrir(); return { n: Object.keys((window.VAC_GUIA || {})[id] || {}).length, a: vacGuia.aba(), h: (document.querySelector('#vacGuia h2') || {}).textContent }; }, id);
    ok(r.n >= abas && /^Guia · /.test(r.h || ''), `UX-02: ${arq} com guia em ${r.n} aba(s); aberto na aba "${r.a}" (${r.h})`); await pg.close();
  }
  /* UX-03 Waste e Gel; UX-04 Paradas e Portal; ⓘ no Portal */
  const w = await nova('Perdas-Ordem.html');
  ok(await w.evaluate(() => document.querySelector('[data-t="painel"]').textContent.trim() === 'Visão Geral' && APP_VER >= '1.8.29'), 'UX-03 (WST-01): Waste 1.8.29 com a aba Visão Geral');
  await w.close();
  const g = await nova('Gestão-Gel-Vacutainer.html');
  ok(await g.evaluate(() => TABS[0][0] === 'painel' && TABS[0][1] === 'Visão Geral' && APP_VERSION >= '2.21' && !!VAC_INICIAL_ALVO['Gestão de Gel › Visão Geral'] && !!VAC_INICIAL_ALVO['Gestão de Gel › Painel']), 'UX-03 (GEL-01): Gel 2.21 com a aba Visão Geral (id painel; página inicial antiga continua valendo)');
  await g.close();
  const pa = await nova('Paradas.html');
  ok(await pa.evaluate(() => { return PAGE.versao >= '1.0.26' && typeof vacCadPilula === 'function'; }), 'Paradas 1.0.26 usa a pílula comum');
  await pa.close();
  const po = await nova('Portal.html');
  const pr = await po.evaluate(() => ({ v: PAGE.versao, aj: /como a peça falhou/.test(CAT_AJUDA.modosFalha) && /por que a linha parou/.test(CAT_AJUDA.paradas) }));
  ok(pr.v >= '1.9.15' && pr.aj, 'Portal (1.9.15+): ⓘ das categorias explica código de parada × modo de falha');
  /* POR-02 (Portal 1.9.16): códigos de parada com filtros e ordenação por coluna */
  await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  await po.evaluate(() => { const P = (c, n, nome, pilar, classe, onde, af) => ({ codigo: c, numero: n, nome, pilar, classe, ondeAponta: onde, afetaD: af.includes('D'), afetaP: af.includes('P'), afetaQ: af.includes('Q'), ativo: true });
    Cad.D.paradas = [P('FME', '801', 'Falha mecânica', 'D', 'porDuracao', 'Máquina', 'D'), P('TRC', '501', 'Troca de catálogo', 'D', 'fixa', 'Linha', 'D'), P('RTB', '901', 'Retrabalho', 'Q', 'emPecas', 'Linha', 'Q'),
      P('MIC', '702', 'Microparada', 'P', 'calculada', '', 'P'), P('ALM', '401', 'Almoço', 'U', 'fixa', 'Liderança', '')]; });
  await po.evaluate(() => { location.hash = '#cadastros/paradas'; }); await po.waitForTimeout(600);
  const lin = () => po.evaluate(() => [...document.querySelectorAll('tr[data-cod]')].map(r => ({ c: r.dataset.cod, t: [...r.children].map(td => td.textContent.trim()) })));
  const hd = await po.evaluate(() => [...document.querySelectorAll('th[data-ci]')].map(h => h.textContent.trim()));
  const iP = hd.indexOf('Pilar'), iN = hd.indexOf('Nome'), iO = hd.indexOf('Onde');
  const L0 = await lin();
  const sel = await po.evaluate(() => [...document.querySelectorAll('[data-fp]')].map(s => s.dataset.fp + ':' + (s.options.length - 1)));
  ok(L0.length > 3 && sel.length === 5 && sel.every(x => +x.split(':')[1] >= 1), `POR-02: filtros pilar, classe, onde, grupo, afeta com os valores do cadastro (${sel.join(' ')})`);
  const pil = L0.map(r => r.t[iP]).find(Boolean);
  await po.selectOption('[data-fp="pilar"]', pil); await po.waitForTimeout(150);
  const L1 = await lin();
  ok(L1.length > 0 && L1.length < L0.length && L1.every(r => r.t[iP] === pil), `POR-02: filtro Pilar ${pil} deixa ${L1.length} de ${L0.length}`);
  await po.click('#cadFpX'); await po.waitForTimeout(150);
  ok((await lin()).length === L0.length, 'POR-02: Limpar filtros volta tudo');
  await po.click(`th[data-ci="${iN}"]`); await po.waitForTimeout(150);
  const n1 = (await lin()).map(r => r.t[iN]); const ord = n1.slice().sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
  ok(JSON.stringify(n1) === JSON.stringify(ord), 'POR-02: clique em Nome ordena A→Z');
  await po.click(`th[data-ci="${iN}"]`); await po.waitForTimeout(150);
  const n2 = (await lin()).map(r => r.t[iN]);
  ok(JSON.stringify(n2) === JSON.stringify(ord.slice().reverse()) && /▼/.test(await po.textContent(`th[data-ci="${iN}"]`)), 'POR-02: segundo clique inverte (▼)');
  await po.click(`th[data-ci="${iN}"]`); await po.waitForTimeout(150);
  ok(JSON.stringify((await lin()).map(r => r.c)) === JSON.stringify(L0.map(r => r.c)), 'POR-02: terceiro clique volta à ordem padrão (pelo Nº)');
  await po.click(`th[data-ci="${iO}"]`); await po.waitForTimeout(150);
  const o1 = (await lin()).map(r => r.t[iO]); const vazio = o1.indexOf('');
  ok(vazio < 0 || o1.slice(vazio).every(x => !x), 'POR-02: vazios ficam no fim');
  await po.close();

  ok(!pe.length, 'sem erros de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
