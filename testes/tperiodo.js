// Fase 5 do briefing (relatórios e Visão Geral). 5a: período no Portal (POR-05, POR-06, POR-08, POR-09; D6).
// node testes/tperiodo.js → código 1 se alguma conferência falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* Produção publica capacidade e meta por dia e por turno (OEE de qualquer período sem média de médias) */
  const o = await nova('OEE-Vacutainer.html', 'Produção');
  const eo = await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); const d = JSON.parse(Store.serialize(Store.S.db)); d.productionDays.forEach(x => x.demo = false); const ex = Exports.build(d);
    const p = (ex.porDia || [])[0] || {}, t = (ex.porDiaTurno || [])[0] || {}; return { p: 'cap' in p && 'metaDec' in p && p.cap > 0, t: 'cap' in t && 'metaOp' in t && 'oeeMeta' in t, n: (ex.porDia || []).length }; });
  ok(eo.n > 0 && eo.p && eo.t, 'D6: Produção publica cap e metaDec por dia e por turno');

  /* Portal: seletor de período */
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  const h = await po.evaluate(() => todayISO());
  await po.evaluate(() => { localStorage.removeItem('portal.periodo'); const h = todayISO(), y = addDays(h, -1), y2 = addDays(h, -2), mes = h.slice(0, 7);
    const set = (id, ex) => { MOD.data[id] = MOD.data[id] || { sys: sysOf(id), kpis: [['x', '1', '', '']], pend: [] }; MOD.data[id].ex = Object.assign({ exportsVersion: 1 }, ex); };
    set('oee', { porDia: [{ dia: y, boa: 800, cap: 1000, metaDec: 750, metaOp: 760, scrap: 10, oee: 0.8, oeeMeta: 0.75 }, { dia: y2, boa: 600, cap: 1000, metaDec: 750, metaOp: 760, scrap: 20, oee: 0.6, oeeMeta: 0.75 }],
      porDiaTurno: [{ dia: y, turno: 'T1', boa: 500, cap: 600, metaDec: 450, metaOp: 460, scrap: 5, oee: 0.83 }, { dia: y, turno: 'T2', boa: 300, cap: 400, metaDec: 300, metaOp: 300, scrap: 5 }] });
    set('paradas', { eventos: [{ dia: y, turno: 'T1', minutos: 30, ocorrencias: 1, classe: 'quebra' }, { dia: y, turno: 'T2', minutos: 10, ocorrencias: 2, classe: 'operacional' }, { dia: y2, minutos: 50, classe: 'quebra' }], eventosCobertura: { de: addDays(h, -90), ate: h } });
    set('gel', { porDiaGel: [{ dia: y, teoKg: 100, baixadoKg: 110, tubos: 800 }, { dia: y2, teoKg: 100, baixadoKg: 90, tubos: 600 }] });
    set('perdas', { porMes: [{ per: mes, liquido: -100, perda: 300, ganho: -400, fechado: false }, { per: addDays(mes + '-01', -1).slice(0, 7), liquido: 999, perda: 999, ganho: 0, fechado: true }] });
    Per.sel = 'ontem'; Per.save(); App.show('geral'); });
  await po.waitForTimeout(300);
  const v1 = await po.evaluate(() => { const c = [...document.querySelectorAll('.mods .mod')].find(x => /Produção/i.test(x.querySelector('h2').innerText)), p = [...document.querySelectorAll('.mods .mod')].find(x => /Paradas/i.test(x.querySelector('h2').innerText));
    return { bar: !!document.querySelector('.per-bar [data-per="semana"]'), oee: c && c.innerText, link: c && c.querySelector('h2 a') && c.querySelector('h2 a').getAttribute('href'), chip: c && c.querySelector('header .pill.info') && c.querySelector('header .pill.info').innerText, par: p && p.innerText }; });
  ok(v1.bar, 'POR-06: Visão Geral tem o seletor Hoje · Ontem · Semana · Mês · Personalizado');
  ok(/OEE-Vacutainer\.html/.test(v1.link || ''), 'POR-05: o título do cartão leva à página (Produção)');
  ok(/80,0%/.test(v1.oee) && /meta 75,0%/.test(v1.oee) && /800/.test(v1.oee) && /ontem/i.test(v1.chip || ''), 'POR-06: cartão da Produção com o OEE de ontem (Σ boa ÷ Σ capacidade) e o período no selo');
  ok(/40 min/.test(v1.par) && /MTTR 30 min/.test(v1.par), 'POR-06: Paradas soma os eventos do período (minutos, quebras e MTTR)');
  const sem = await po.evaluate(() => { Per.sel = 'custom'; Per.de = addDays(todayISO(), -2); Per.ate = addDays(todayISO(), -1); return kpisPer('oee').kpis[0][1] + '|' + kpisPer('gel').kpis[1][1] + '|' + kpisPer('perdas').kpis[0][2]; });
  ok(sem.startsWith('70,0%') && /\+0,0%/.test(sem) && /competência/.test(sem), 'POR-06: personalizado (2 dias): OEE 70% (1.400 ÷ 2.000), gel baixado × teórico, Waste por competência');
  const rel = await po.evaluate(() => { Per.sel = 'turno'; Per.dia = addDays(todayISO(), -1); Per.turno = 'T1'; const d = relDoc(); const b0 = d.blocos.find(x => /Produção/.test(x.titulo)); const bp = d.blocos.find(x => /Paradas/.test(x.titulo)); return { per: d.periodo, oee: b0 && b0.itens[0][1], par: bp && bp.itens[0][1] }; });
  ok(/turno T1/.test(rel.per) && rel.oee === '83,3%' && rel.par === '30 min', 'POR-08: Relatório de 1 turno (OEE do turno T1 = 500 ÷ 600; paradas só do turno)');
  const tv = await po.evaluate(() => { Per.sel = 'semana'; return tvSlides().map(s => s.titulo); });
  ok(tv.length > 1 && tv.every(t => /semana|agora/.test(t)), 'POR-09: a TV usa o mesmo período, e cada tela diz qual é (sem misturar meses)');
  await po.evaluate(() => { Per.sel = 'mes'; Per.save(); App.show('rel'); }); await po.waitForTimeout(200);
  ok(await po.evaluate(() => !!document.querySelector('.per-bar [data-per="turno"]') && /Resumo da linha/.test(document.querySelector('#main').innerText)), 'POR-08: Relatórios com o seletor de período (inclui 1 turno)');
  await po.evaluate(() => localStorage.removeItem('portal.periodo'));

  /* ---------- 5b (PRD-01, D9): Painel e Visão Geral numa aba só, com Hoje/Ontem ---------- */
  const o2 = await nova('OEE-Vacutainer.html', 'Produção 5b');
  const v5 = await o2.evaluate(async () => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); await new Promise(r => setTimeout(r, 300));
    const espera = () => new Promise(r => setTimeout(r, 350)); const out = {};
    out.menu = (NAV_GRUPOS || []).map(g => g.g); go('overview'); await espera();
    const sel = document.querySelector('#vgView'); out.padrao = !!sel && sel.value === 'padrao' && [...sel.options].some(o => o.value === 'mine') && [...sel.options].some(o => /Diretoria/i.test(o.text));
    out.botoes = ['#vgPers', '#vgPrint', '#vgTv'].every(q => document.querySelector(q));
    const qp = [...document.querySelectorAll('[data-qp]')].map(b => b.textContent.trim()); out.qp = qp.slice(0, 4).join('|');
    document.querySelector('[data-qp="d1"]').click(); await espera(); const t = U.today(); out.ontem = App.filters.from === U.addDays(t, -1) && App.filters.to === U.addDays(t, -1);
    sel.value = 'mine'; sel.dispatchEvent(new Event('change')); await espera(); out.painel = App.route === 'overview' && !!document.querySelector('#pnView') && !!document.querySelector('#pnEdit') && !!document.querySelector('#pnView option[value="padrao"]');
    out.pnHoje = [...document.querySelectorAll('[data-pnpre]')].slice(0, 2).map(b => b.textContent.trim()).join('|');
    const pv = document.querySelector('#pnView'); pv.value = 'padrao'; pv.dispatchEvent(new Event('change')); await espera(); out.volta = !!document.querySelector('#vgView') && !document.querySelector('#pnEdit');
    go('panel'); await espera(); out.legado = App.route === 'overview' && Panel.st().view === 'mine' && !!document.querySelector('#pnView');
    return out; });
  ok(!v5.menu.includes('Painel') && v5.menu[0] === 'Visão Geral', 'PRD-01: o menu tem só Visão Geral (sem a aba Painel)');
  ok(v5.padrao && v5.botoes, 'PRD-01: Visão Geral abre na visão padrão, com o seletor (Meu painel, modelos como Diretoria mensal), Personalizar, Imprimir e Apresentar');
  ok(v5.qp === 'Hoje|Ontem|Semana|Mês' && v5.ontem, 'D9: períodos rápidos começam por Hoje · Ontem · Semana · Mês (Ontem filtra o dia anterior)');
  ok(v5.painel && v5.pnHoje === 'Hoje|Ontem', 'PRD-01: escolhendo uma visão do Painel, a própria Visão Geral vira o Painel (com Hoje e Ontem e a volta para a padrão)');
  ok(v5.volta, 'PRD-01: o seletor do Painel volta para a Visão Geral padrão');
  ok(v5.legado, 'PRD-01: o endereço antigo do Painel (go/aba panel) abre a Visão Geral em Meu painel');

  /* ---------- 5c (PRD-07): Segurança e Qualidade no relatório do dia/turno, com opção só performance ---------- */
  const o3 = await nova('OEE-Vacutainer.html', 'Produção 5c');
  const r5c = await o3.evaluate(async () => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); await new Promise(r => setTimeout(r, 300));
    const espera = () => new Promise(r => setTimeout(r, 400)), out = {};
    const day = Store.S.db.productionDays.filter(x => !x.deleted && x.shifts.filter(p => !p.deleted).length >= 2).sort((a, b) => a.date < b.date ? 1 : -1)[0];
    const [s1, s2] = day.shifts.filter(p => !p.deleted); s1.sqdcp = { acidente: { resposta: 'nao' }, qn: { resposta: 'sim', quantidade: 2, numeros: ['00001234'], resumo: '' } }; delete s2.sqdcp; day._rev = (day._rev || 0) + 1; Engine.bumpConfig();
    App.prefs.rpSQ = true; const R = rpState(); R.type = 'day'; R.date = day.date; R.summary = null; go('reports'); await espera();
    const doc = () => document.querySelector('#rpDoc').innerText;
    out.dia = doc(); out.check = !!document.querySelector('#rpSQ');
    document.querySelector('#rpSQ').click(); await espera(); out.semSQ = doc();
    document.querySelector('#rpSQ').click(); await espera();
    R.type = 'shift'; R.psId = s1.id; R.summary = null; render(); await espera(); out.turno = doc();
    R.type = 'week'; render(); await espera(); out.semana = !document.querySelector('#rpSQ');
    return out; });
  ok(/Segurança e Qualidade/i.test(r5c.dia) && /00001234/.test(r5c.dia) && /não informado/.test(r5c.dia) && /Qualidade: QN não informado em 1 turno|Qualidade:/.test(r5c.dia), 'PRD-07: relatório do dia com Segurança e Qualidade por turno (QN 00001234; "não informado" não vira zero) e a linha no resumo');
  ok(r5c.check && !/Segurança e Qualidade/i.test(r5c.semSQ), 'PRD-07: desmarcando "incluir Segurança e Qualidade", o relatório sai só de performance');
  ok(/Segurança e Qualidade/i.test(r5c.turno) && /00001234/.test(r5c.turno), 'PRD-07: a passagem de turno também traz Segurança e Qualidade do turno');
  ok(r5c.semana, 'PRD-07: a opção só aparece nos relatórios do dia e do turno');

  /* ---------- 5d (PRD-09): SQDCP em barras verde/vermelho, linha só para meta e tendência ---------- */
  const r5d = await o3.evaluate(async () => { go('sqdcp'); await new Promise(r => setTimeout(r, 600)); const ks = [...document.querySelectorAll('[data-sq-previa]')].map(b => b.dataset.sqPrevia);
    const hs = ks.map(k => Sqdcp.htmlImpressao(k) || '').filter(h => /sq-grafico/.test(h) && /<rect/.test(h));
    return { n: hs.length, linhaValores: hs.some(h => /<path d="/.test(h)), legenda: hs.every(h => /verde atingiu a meta/.test(h)), cores: hs.some(h => /#2e7d32|#c62828|#9b6600|#235f91/.test(h)) }; });
  ok(r5d.n > 0 && !r5d.linhaValores && r5d.legenda && r5d.cores, `PRD-09: gráficos do SQDCP em barras (verde atingiu, vermelho não atingiu, âmbar parcial), sem linha de valores; ${r5d.n} folha(s) conferida(s)`);

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
