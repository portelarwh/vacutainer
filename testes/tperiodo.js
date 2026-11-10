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

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
