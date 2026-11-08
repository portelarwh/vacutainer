// E4 do plano único (08/11/2026): o que cada página publica por ordem (exports, aditivo na versão 1) e como as outras leem.
// Produção porOrdem com histórico e dias do lote; Paradas porOrdem; Gel cobertura; leitores conferem a versão (F06);
// Waste: ordem em várias competências (F07) e dias do lote pela chave "dia|lote" (F08). node testes/tcontratos.js → "sem erros"
const path = require('path'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
(async () => {
  const b = await chromium.launch();
  const nova = async (a, ent) => { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept()); await p.goto(PG + encodeURI(a)); await p.waitForTimeout(1200); await p.evaluate(`document.querySelectorAll('.overlay').forEach(o=>o.remove());${ent || ''}`); await p.waitForTimeout(800); p.__pe = pe; return p; };
  // ---------- Produção: porOrdem com histórico (24 meses) e dias do lote pela chave
  {
    const p = await nova('OEE-Vacutainer.html', "Demo.enterExample();const db=Store.S.db;for(const k of ['productionDays','monthPlans','calendar'])(db[k]||[]).forEach(d=>delete d.demo);Engine.bumpConfig()");
    const r = await p.evaluate(() => {
      const db = Store.S.db, hoje = U.today(), mk = hoje.slice(0, 7);
      // plano do mês de 6 meses atrás (fora do bloco "ordens", que só tem o mês atual e o anterior), no formato do savePlan
      const [y, m] = mk.split('-').map(Number), t = y * 12 + (m - 1) - 6, m6 = `${Math.floor(t / 12)}-${String(t % 12 + 1).padStart(2, '0')}`;
      const cat = (db.catalogs || []).find(c => !c.deleted) || {}; db.monthPlans = db.monthPlans || [];
      db.monthPlans.push({ id: 'plano-velho', lineId: 'line_vac', month: m6, workdays: [1, 2, 3, 4, 5, 6], exc: [], extra: [], excCount: null, versions: [{ id: 'pv1', n: 1, kind: 'inicial', at: hoje, by: 'teste', reason: '', items: [{ catalogId: cat.id, qty: 2000 }] }],
        orders: [0, 1].map(i => ({ id: 'ov' + i, order: '91000000' + i, lot: i ? 'LX10' : 'LX1', catalogId: cat.id, qty: 1000, start: m6 + '-02', end: m6 + '-05' })), ...Model.meta('teste') });
      db.server = db.server || {}; db.server.dayLot = Object.assign({}, db.server.dayLot, { [m6 + '-03|LX1']: { kind: 'retrabalho' }, [m6 + '-04|LX1']: { kind: 'normal' }, [m6 + '-05|LX10']: { kind: 'normal' } });
      Engine.bumpConfig(); const t0 = performance.now(); const ex = Exports.build(db, hoje); const ms = performance.now() - t0;
      const o0 = (ex.porOrdem || []).find(o => o.ordem === '910000000'), o1 = (ex.porOrdem || []).find(o => o.ordem === '910000001');
      return { ms: Math.round(ms), n: (ex.porOrdem || []).length, cob: ex.porOrdemCobertura, naOrdens: (ex.ordens || []).some(o => String(o.ordem) === '910000000'), o0, o1, versao: ex.exportsVersion, ordensAntigas: (ex.ordens || []).length };
    });
    ok(!r.erro && r.versao === 1 && r.cob && r.cob.meses === 24 && r.cob.ordens === r.n, `Produção: porOrdem com cobertura declarada (${r.n} ordens, ${r.cob && r.cob.de} a ${r.cob && r.cob.ate}; exportsVersion ${r.versao}; montagem ${r.ms} ms)`);
    ok(r.o0 && !r.naOrdens, `Produção: ordem de 6 meses atrás está em porOrdem (o bloco "ordens" de 2 meses continua igual, ${r.ordensAntigas} ordens)`);
    ok(r.o0 && JSON.stringify(r.o0.diasLote) === JSON.stringify([r.o0.mes + '-03', r.o0.mes + '-04']) && JSON.stringify(r.o0.retrabalhoDias) === JSON.stringify([r.o0.mes + '-03']) && r.o1 && r.o1.diasLote.length === 1,
      `Produção: dias do lote pela chave "dia|lote", sem misturar LX1 com LX10 (LX1: ${r.o0 && r.o0.diasLote}; retrabalho ${r.o0 && r.o0.retrabalhoDias}; LX10: ${r.o1 && r.o1.diasLote})`);
    ok(!p.__pe.length, `Produção sem erro de página${p.__pe.length ? ' (' + p.__pe[0] + ')' : ''}`);
    // Produção › Ordens lendo o Waste com exports de versão desconhecida
    const r2 = await p.evaluate(async () => { const S0 = { mode: Store.S.mode, be: Store.S.backend }; Store.S.mode = 'pasta'; Store.S.backend = { readSibling: async () => JSON.stringify({ exports: { exportsVersion: 2, porOrdem: [{ ordem: '1' }] } }) }; await Ord.lerWaste(); const w = Ord.waste; Store.S.mode = S0.mode; Store.S.backend = S0.be; return w; });
    ok(r2 && /versão 2/.test(r2.erro || '') && !r2.lanc, `Produção › Ordens: exports do Waste na versão 2 não é usado (${r2 && r2.erro})`);
    await p.close();
  }
  // ---------- Paradas: porOrdem; leitura do exports da Produção com versão conferida
  {
    const p = await nova('Paradas.html', 'modoTeste()');
    const r = await p.evaluate(async () => {
      const D = Store.data; const ev = eventosTodos(); const comOrdem = ev.filter(e => e.ordem);
      // garante uma ordem nos dados de teste: duas paradas da mesma ordem em equipamentos diferentes
      if (!comOrdem.length && ev.length >= 2) { ev[0].ordem = '920000001'; ev[1].ordem = '920000001'; }
      const ex = calcExports(D); const po = ex.porOrdem || [];
      const esperado = {}; for (const e of eventosTodos()) { const o = String(e.ordem || '').trim().replace(/^0+(?=\d)/, ''); if (o) esperado[o] = (esperado[o] || 0) + (+e.minutos || 0); }
      const confere = po.every(x => Math.abs(x.minutos - Math.round(esperado[x.ordem] * 10) / 10) < 0.05) && po.length === Object.keys(esperado).length;
      // leitura do OEE com exports de versão desconhecida
      const S0 = { dir: Store.dir, perm: Store.perm, test: Store.test, rj: Store.readJSON };
      Store.dir = {}; Store.perm = true; Store.test = false; Store.readJSON = async n => n === 'oee-vacutainer-base.json' ? { obj: { exports: { exportsVersion: 2, porDia: [{ dia: 'x' }] } } } : null;
      try { await Ext.load(); } catch (e) { } const oee = Ext.oee, err = Ext.oeeErr; Object.assign(Store, { dir: S0.dir, perm: S0.perm, test: S0.test, readJSON: S0.rj });
      return { n: po.length, ex1: ex.exportsVersion, confere, campos: po[0] && Object.keys(po[0]), oee, err };
    });
    ok(r.ex1 === 1 && r.n > 0 && r.confere, `Paradas: porOrdem com minutos iguais aos eventos (${r.n} ordem(ns); campos ${r.campos})`);
    ok(r.oee === null && /versão 2/.test(r.err || ''), `Paradas: exports da Produção na versão 2 não é usado (${r.err})`);
    ok(!p.__pe.length, `Paradas sem erro de página${p.__pe.length ? ' (' + p.__pe[0] + ')' : ''}`);
    await p.close();
  }
  // ---------- Gel: cobertura das ordens declarada
  {
    const p = await nova('Gestão-Gel-Vacutainer.html', 'enterDemo();render()');
    const r = await p.evaluate(() => { const ex = gelExports(); return { cob: ex.ordensCobertura, v: ex.exportsVersion, n: (ex.ordens || []).length, lps: (ex.ordens || []).every(o => Array.isArray(o.lps)) }; });
    ok(r.v === 1 && r.cob && r.cob.dias === 150 && /^\d{4}-\d{2}-\d{2}$/.test(r.cob.desde) && r.lps, `Gel: ordens com cobertura declarada (desde ${r.cob && r.cob.desde}, ${r.n} ordens, lps em todas)`);
    await p.close();
  }
  // ---------- Waste: versão conferida (F06), ordem em várias competências (F07), dias do lote pela chave (F08)
  {
    const p = await nova('Perdas-Ordem.html', 'enterTest()');
    const r = await p.evaluate(async () => {
      const S0 = { mode: ST.mode, dir: ST.dir }; const arq = {};
      ST.mode = 'pasta'; ST.dir = { getFileHandle: async n => { if (!arq[n]) { const e = new Error('não existe'); e.name = 'NotFoundError'; throw e; } return { getFile: async () => ({ lastModified: Date.now() + Math.random(), text: async () => arq[n] }) }; } };
      // F07: a mesma ordem em duas competências; o tipo do COOIS só na mais antiga, depois só na mais nova
      arq['ordens-base.json'] = JSON.stringify({ exports: { exportsVersion: 1, porOrdem: [
        { ordem: '000930000001', competencia: '2026-08', coois: { tipo: 'ZPRW' }, saldos: [{ um: 'UN' }], materiais: ['A'] },
        { ordem: '930000001', competencia: '2026-09', coois: null, saldos: [{ um: 'KG' }], materiais: ['B'] }] } });
      await loadOrdens(true); const x1 = ordX('930000001');
      arq['ordens-base.json'] = JSON.stringify({ exports: { exportsVersion: 1, porOrdem: [
        { ordem: '930000001', competencia: '2026-09', coois: { tipo: 'ZNOV' } }, { ordem: '930000001', competencia: '2026-08', coois: { tipo: 'ZPRW' } }] } });
      await loadOrdens(true); const x2 = ordX('930000001');
      arq['ordens-base.json'] = JSON.stringify({ exports: { exportsVersion: 2, porOrdem: [{ ordem: '1' }] } }); await loadOrdens(true); const ordV2 = { idx: ORDX.idx, err: ORDX.err };
      // F06: exports da Produção na versão 2
      arq['oee-vacutainer-base.json'] = JSON.stringify({ exports: { exportsVersion: 2, ordens: [{ ordem: '1' }] }, monthPlans: [] }); await loadOEE(true); const oeeV2 = { ex: OEE.src && OEE.src.exports, err: OEE.err };
      // F08: dias do lote pela chave "dia|lote" (LX1 × LX10)
      OEE.src = { exports: { exportsVersion: 1, ordens: [{ ordem: '940000001', lote: 'LX1' }] }, monthPlans: null, server: { dayLot: { '2026-05-03|LX1': { kind: 'retrabalho' }, '2026-05-04|LX1': { kind: 'normal' }, '2026-05-05|LX10': { kind: 'normal', obs: 'LX1' } } } };
      const f = oeeFind('940000001'); const dl = (f.lotHits.find(h => /dias do lote/.test(h.path)) || {}).obj;
      Object.assign(ST, S0); return { x1, x2, ordV2, oeeV2, dias: dl && Object.keys(dl).sort() };
    });
    ok(r.x1 && r.x1.tipo === 'ZPRW' && r.x1.ums.join() === 'UN,KG' && r.x1.comps.join() === '2026-08,2026-09', `Waste (F07): ordem em duas competências não perde o tipo do COOIS (${r.x1 && r.x1.tipo}; unidades ${r.x1 && r.x1.ums}; competências ${r.x1 && r.x1.comps})`);
    ok(r.x2 && r.x2.tipo === 'ZNOV', `Waste (F07): com COOIS nas duas, vale o da competência mais recente, sem depender da ordem do arquivo (${r.x2 && r.x2.tipo})`);
    ok(!r.ordV2.idx && /versão 2/.test(r.ordV2.err), `Waste (F06): exports das Ordens na versão 2 não é usado (${r.ordV2.err})`);
    ok(r.oeeV2.ex === null && /versão 2/.test(r.oeeV2.err), `Waste (F06): exports da Produção na versão 2 não é usado (${r.oeeV2.err})`);
    ok(JSON.stringify(r.dias) === JSON.stringify(['2026-05-03', '2026-05-04']), `Waste (F08): dias do lote LX1 pela chave, sem o LX10 (${r.dias})`);
    ok(!p.__pe.length, `Waste sem erro de página${p.__pe.length ? ' (' + p.__pe[0] + ')' : ''}`);
    await p.close();
  }
  // ---------- kit: conferência de versão
  {
    const p = await nova('Portal.html', '');
    const r = await p.evaluate(() => [vacExportsOk({ exportsVersion: 1 }).ok, vacExportsOk({}).ok, vacExportsOk({ exportsVersion: 2 }).ok, vacExportsOk(null).ok, vacExportsOk({ exportsVersion: 2 }, 2).ok]);
    ok(JSON.stringify(r) === '[true,true,false,false,true]', `kit vacExportsOk: v1 e sem número usam; v2 desconhecida não; sem exports não (${r})`);
    await p.close();
  }
  await b.close();
  console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
