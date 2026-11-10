// Fase 1 do briefing de 09/11/2026: o Portal como fonte única (ARQ-01 a ARQ-07).
// node testes/tportalfonte.js → imprime as conferências; sai com código 1 se alguma falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* ================= ARQ-06 · Parâmetros ================= */
  // Portal: grupo Produção e "Neste computador"
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  await po.evaluate(() => { location.hash = '#cadastros/parametros'; }); await po.waitForTimeout(600);
  ok(await po.evaluate(() => !!document.querySelector('#parProd') && !!document.querySelector('#parPc')), 'ARQ-06 Portal: Parâmetros tem os grupos Produção e Neste computador');
  ok(await po.evaluate(() => [...document.querySelectorAll('.cadside [data-sec="parametros"]')].some(x => /^Parâmetros/.test(x.textContent.trim()))), 'ARQ-06 Portal: menu "Parâmetros"');
  ok(await po.evaluate(() => !document.querySelector('#ppOk')), 'ARQ-06 Portal: sem a senha, o grupo Produção é só consulta');
  const mig6 = await po.evaluate(() => { TrazCfg.B = { oee: { shifts: [], downtimeCodes: [], targets: [], settings: { entryUnit: 1000, unitLabel: 'mil', roundingUnit: 1000 }, productionDays: [{ date: '2025-03-10' }] } }; TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const x = (TrazCfg.P || []).find(i => i.grupo === 'Parâmetros' && /lançamento em/.test(i.titulo)); if (!x) return null; const W2 = { parametros: {} }; x.fn(W2); return W2.parametros.producao; });
  ok(mig6 && mig6.unidadeLancamento === 1000 && mig6.arredondamentoMeta[0].de === '2025-03-10' && mig6.arredondamentoMeta[0].valor === 1000, 'ARQ-06 migração: "Trazer das páginas" leva unidade, rótulo e arredondamento da Produção (vigência desde o 1º dia lançado)');
  await po.click('[data-pcq="abs"]'); await po.waitForTimeout(300);
  ok(await po.evaluate(() => localStorage.getItem('vac.qtd') === 'abs'), 'ARQ-06 Portal: exibição das quantidades grava vac.qtd (neste computador)');
  await po.evaluate(() => Lock.on(Cad.D.seguranca.senhaHash)); await po.evaluate(() => App.render()); await po.waitForTimeout(400);
  await po.fill('[data-pprod="unidadeLancamento"]', '1000'); await po.fill('[data-pprod="rotuloUnidade"]', 'mil');
  const amanha = await po.evaluate(() => addDays(todayISO(), 1));
  await po.fill('#ppArDe', amanha); await po.fill('#ppArV', '500'); await po.click('#ppOk'); await po.waitForTimeout(800);
  const pp = await po.evaluate(() => (Cad.D.parametros || {}).producao || null);
  ok(pp && pp.unidadeLancamento === 1000 && pp.rotuloUnidade === 'mil' && (pp.arredondamentoMeta || []).some(v => v.de === amanha && v.valor === 500), 'ARQ-06 Portal: grava parametros.producao com a vigência nova do arredondamento');
  await po.evaluate(() => App.render()); await po.waitForTimeout(300);
  await po.fill('#ppArDe', '2020-01-01'); await po.fill('#ppArV', '700'); await po.click('#ppOk'); await po.waitForTimeout(500);
  ok(await po.evaluate(() => !((Cad.D.parametros || {}).producao.arredondamentoMeta || []).some(v => v.de === '2020-01-01')), 'ARQ-06 Portal: vigência no passado é recusada (vigências gravadas não mudam)');

  // Produção: aplica o grupo, arredondamento pela data do dia, exibição do computador
  const o = await nova('OEE-Vacutainer.html', 'Produção');
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(1200);
  const r6 = await o.evaluate(() => {
    const d = JSON.parse(Store.serialize(Store.S.db));
    CadSync.aplicar(d, { rev: 1, parametros: { producao: { unidadeLancamento: 1000, rotuloUnidade: 'mil', arredondamentoMeta: [{ de: '2000-01-01', valor: 7000 }, { de: '2099-01-01', valor: 500 }] } } }, () => { });
    const st = d.settings, dia = d.productionDays.find(x => !x.deleted && x.shifts && x.shifts.length);
    const res = Engine.computeDayRaw(d, dia), metas = res.flat.map(f => f.metaOp).filter(v => v != null && v > 0);
    return { vig: (st.roundingVig || []).length, ru: st.roundingUnit, a: roundAt(st, '2026-01-01'), b: roundAt(st, '2099-06-01'), semVig: roundAt({ roundingUnit: 1000 }, '2026-01-01'), metas: metas.length, mult: metas.slice(0, -1).every(v => v % 7000 === 0) };
  });
  ok(r6.vig === 2 && r6.ru === 7000, 'ARQ-06 Produção: CadSync guarda as vigências do arredondamento e o vigente hoje');
  ok(r6.a === 7000 && r6.b === 500 && r6.semVig === 1000, 'ARQ-06 Produção: roundAt usa a vigência da data (sem vigência, o valor da base)');
  ok(r6.metas > 1 && r6.mult, 'ARQ-06 Produção: a meta de cada intervalo sai no múltiplo da vigência do dia');
  const q = await o.evaluate(() => { localStorage.setItem('vac.qtd', 'abs'); const a = [DISP(), unitLbl()]; localStorage.setItem('vac.qtd', 'unit'); const u = [DISP(), unitLbl()]; return { a, u }; });
  ok(q.a[0] === 1 && q.a[1] === 'un' && q.u[0] > 1, 'ARQ-06 Produção: exibição das quantidades segue vac.qtd do computador');
  await o.evaluate(() => localStorage.removeItem('vac.qtd'));

  /* ================= ARQ-01/02/03/04 · PRD-04 ================= */
  const r1 = await o.evaluate(() => {
    const d = JSON.parse(Store.serialize(Store.S.db)), sh = d.shifts.find(x => !x.deleted && (x.versions || []).some(v => !v.deleted));
    const vigs = sh.versions.filter(v => !v.deleted).map(v => ({ de: v.validFrom, ate: v.validTo || null, inicio: v.start, fim: v.end, dias: v.weekdays, ativo: true, pausas: [], intervalos: [] }));
    sh.status = 'inativo';                                   // desativado aqui antes do Portal assumir (PRD-04)
    const tc = JSON.parse(JSON.stringify(sh)); tc.id = 'sh_tc'; tc.code = 'TC'; tc.status = 'ativo'; d.shifts.push(tc);   // mesmo turno com outro código
    const outros = d.shifts.filter(x => !x.deleted && x.id !== sh.id && x.id !== 'sh_tc').map(x => ({ codigo: x.code, nome: x.name, ativo: x.status !== 'inativo', vigencias: (x.versions || []).filter(v => !v.deleted).map(v => ({ de: v.validFrom, ate: v.validTo || null, inicio: v.start, fim: v.end, dias: v.weekdays, ativo: v.active !== false, pausas: [], intervalos: [] })) }));
    const R = CadSync.aplicar(d, { rev: 1, turnos: [{ codigo: sh.code, nome: sh.name, ativo: true, vigencias: vigs }].concat(outros), parametros: {} }, () => { });
    const a = d.shifts.find(x => x.id === sh.id), c = d.shifts.find(x => x.id === 'sh_tc');
    return { st: a.status, tc: c.status, soLocal: R.soLocal || 0, cod: sh.code };
  });
  ok(r1.st === 'ativo', `PRD-04: turno ${r1.cod} inativo na Produção volta a ativo quando o Portal diz ativo (o status seguia o local)`);
  ok(r1.tc === 'inativo' && r1.soLocal === 1, 'PRD-04/ARQ-01: turno que só existe na Produção (TC) fica inativo para os dias novos (sem turno em dobro)');
  const r2 = await o.evaluate(() => {
    const semDoc = JSON.stringify(CadSync.dominios());
    Store.S.cadDoc = { schema: 'vac-cadastros', rev: 9, turnos: [{ codigo: 'T1', vigencias: [] }], catalogos: [], paradas: [], metasOee: [], linhas: [], parametros: {} };
    const D = CadSync.dominios(), ban = CadSync.banner('catalogos'), banT = CadSync.banner('turnos');
    const sl = CadSync.soLocal('turnos'); Store.S.cadDoc = null;
    return { semDoc, D, vazio: /O Portal ainda não tem catálogos/.test(ban), soLocal: sl, banT: /Só na Produção/.test(banT) };
  });
  ok(r2.semDoc === '{}', 'ARQ-01..04: sem pasta e sem Portal (modo local/testes) as Configurações ficam como antes');
  ok(r2.D.turnos && r2.D.catalogos && r2.D.metas && r2.D.paradas && r2.D.estrutura, 'ARQ-01..04: com o cadastro do Portal, turnos, catálogos, metas, paradas e estrutura ficam só consulta, mesmo com o domínio vazio no Portal');
  ok(r2.vazio, 'ARQ-02: domínio vazio no Portal avisa que a Produção segue com o que tinha (sem editar aqui)');
  ok(r2.soLocal.length > 0 && !r2.soLocal.includes('T1') && r2.banT, 'ARQ-01: aviso lista os turnos que só existem na Produção');
  // tela: com o cadastro, o formulário de turnos não edita
  const r3 = await o.evaluate(async () => {
    Store.S.cadDoc = { schema: 'vac-cadastros', rev: 9, turnos: [{ codigo: 'T1', vigencias: [] }], catalogos: [], paradas: [], metasOee: [], linhas: [], parametros: {} };
    go('config'); await new Promise(r => setTimeout(r, 300)); const res = {};
    for (const sec of ['turnos', 'catalogos', 'metas', 'paradas']) { const bt = document.querySelector(`[data-sec="${sec}"]`); if (bt) bt.click(); await new Promise(r => setTimeout(r, 250));
      const root = document.querySelector('#main') || document.body; res[sec] = [...root.querySelectorAll('button, input, select, textarea')].filter(el => !el.disabled && !el.closest('.side') && !el.closest('[data-keep]') && !el.dataset.keep && !el.dataset.sec && !el.classList.contains('ib') && !el.closest('nav') && !el.closest('header') && !el.closest('.vsuite') && !el.closest('#vacDemoBar') && el.offsetParent && !el.closest('.filters') && !el.closest('.tsearch') && !el.closest('details > summary')).map(el => el.id || el.textContent.trim().slice(0, 20) || el.name || el.tagName).slice(0, 5); }
    Store.S.cadDoc = null; return res;
  });
  for (const [sec, livres] of Object.entries(r3)) ok(!livres.length, `ARQ-01..04: Produção › Configurações › ${sec} sem campo ou botão de edição com o cadastro do Portal${livres.length ? ' (livres: ' + livres.join(', ') + ')' : ''}`);
  // Portal: Trazer configurações oferece o que só existe na Produção, com o mesmo código
  const mig1 = await po.evaluate(() => {
    TrazCfg.B = { oee: { lines: [], families: [], shifts: [{ id: 'sh_tc', code: 'TC', name: 'Turno C local', status: 'ativo', versions: [{ id: 'v1', validFrom: '2025-01-01', start: '22:47', end: '06:00', weekdays: [1, 2, 3, 4, 5], active: true, breaks: [{ label: 'Jantar', start: '02:00', end: '02:30', weekdays: [], deducts: true }], template: null }] }],
      catalogs: [{ id: 'cat_x', code: '999991', name: 'Tubo teste', pph: 30000, validFrom: '2025-01-01', active: true }], downtimeCodes: [{ id: 'dc_z', code: 'ZZZ', name: 'Parada só local', affectsA: true, active: true }], targets: [], settings: {}, productionDays: [] } };
    TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const P = TrazCfg.P;
    const t = P.find(i => i.grupo === 'Só na Produção · turnos'), c = P.find(i => i.grupo === 'Só na Produção · catálogos'), z = P.find(i => i.grupo === 'Só na Produção · tipos de parada');
    const W2 = { turnos: [], catalogos: [], paradas: [] }; if (t) t.fn(W2); if (c) c.fn(W2); if (z) z.fn(W2);
    return { t: !!t, tMarc: t && t.marcado, temT: (Cad.D.turnos || []).length, c: !!c, z: !!z, W2 };
  });
  ok(mig1.t && mig1.c && mig1.z, 'ARQ-01/02/04 migração: Trazer configurações lista turno, catálogo e tipo de parada que só existem na Produção');
  ok(mig1.temT ? mig1.tMarc === false : mig1.tMarc === true, 'ARQ-01 migração: turno só da Produção vem desmarcado quando o Portal já tem turnos (provável duplicado)');
  const tw = mig1.W2.turnos[0] || {}, vw = (tw.vigencias || [])[0] || {};
  ok(tw.codigo === 'TC' && vw.inicio === '22:47' && vw.fim === '06:00' && (vw.pausas || []).length === 1 && mig1.W2.catalogos[0].codigo === '999991' && mig1.W2.catalogos[0].vigencias[0].pphNominal === 30000 && mig1.W2.paradas[0].codigo === 'ZZZ', 'ARQ-01/02/04 migração: mesmo código, vigências, pausas e PPH preservados');

  /* ================= ARQ-05 / ARQ-07 · Gestão de Gel (GEL-06: contas iguais) ================= */
  const g = await nova('Gestão-Gel-Vacutainer.html', 'Gel');
  await g.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.removeItem('vac.cadastros'); enterDemo();
    if (!(S.config.equips || []).length) S.config.equips = [{ id: 'eq-t1', name: 'Máquina de gel', tara: '', active: true, descs: [{ id: 'd-1', comp: 'tubogel', cat: 'T' }] }, { id: 'eq-t2', name: 'Inspeção', tara: 12, active: true, descs: [{ id: 'd-2', comp: 'gel', cat: 'P' }] }];
    render(); }); await g.waitForTimeout(500);
  const marca = () => g.evaluate(() => { const ex = gelExports(); delete ex.geradoEm; const h = todayISO(), d30 = addDays(h, -30);
    const cats = S.catalogs.filter(c => c.origem !== 'Portal').map(c => [c.num, gelReal(c.id, h), JSON.stringify(bomInfo(c.id, h)), gelReal(c.id, d30), JSON.stringify(bomInfo(c.id, d30))]);
    return JSON.stringify({ ex, cats }); });
  const g0 = await marca();
  const liga = await g.evaluate(() => {
    const cats = S.catalogs.map(c => ({ codigo: String(c.num), tipoItem: 'tubo', nome: 'Portal ' + c.num, cor: '#123456', formato: '13x' + (c.fmt || '100'), ativo: c.active !== false, vigencias: [] }));
    const eqs = (S.config.equips || []).map((e, i) => ({ codigo: 'EQ9' + i, nome: e.name, ativo: e.active !== false, categoria: 'gel' })).concat([{ codigo: 'EQ80', nome: 'Dosadora nova', ativo: true, categoria: 'gel' }]);
    localStorage.setItem('vac.cadastros', JSON.stringify({ schema: 'vac-cadastros', rev: 5, catalogos: cats, equipamentos: eqs, materiais: [], bom: [] }));
    render(); return { n: cats.length, e: eqs.length };
  });
  const g1 = await marca();
  ok(g0 === g1, 'GEL-06: com catálogos e equipamentos ligados ao Portal, os números do gel (exports, gel aplicado, BOM e meta) são os mesmos');
  const lig = await g.evaluate(() => ({ desc: S.catalogs.every(c => /^Portal /.test(c.desc) && c.color === '#123456' && c.portal), eq: (S.config.equips || []).every(e => /^EQ9/.test(e.portal || '')), n: (S.config.equips || []).length }));
  ok(lig.desc, 'ARQ-05: nome e cor do catálogo vêm do Portal (vínculo pelo número)');
  ok(lig.eq && lig.n === 2, 'ARQ-07: equipamento do Gel liga ao do Portal pelo nome (código guardado no vínculo)');
  const ui5 = await g.evaluate(async () => {
    openConfig('cat'); await new Promise(r => setTimeout(r, 150)); const novoEscondido = !!document.querySelector('#ctSave') && !!document.querySelector('#ctSave').closest('.catform[hidden]'); const banner = /cadastro geral do Portal/.test(document.body.innerText);
    ui.catEdit = S.catalogs[0].id; openConfig('cat'); await new Promise(r => setTimeout(r, 150)); const numTrav = document.querySelector('#ctNum').disabled && document.querySelector('#ctDesc').disabled;
    ui.catEdit = null; ui.eqEdit = null; ui.eqDraft = null; openConfig('equip'); await new Promise(r => setTimeout(r, 150));
    const sel = document.querySelector('#eqPortal'), nomeEsc = !!document.querySelector('#eqName') && !!document.querySelector('#eqName').closest('[hidden]');
    const opc = sel ? [...sel.options].map(o => o.value).filter(Boolean) : [];
    document.querySelectorAll('.overlay').forEach(o => o.remove()); return { novoEscondido, banner, numTrav, sel: !!sel, opc, nomeEsc };
  });
  ok(ui5.banner && ui5.novoEscondido, 'ARQ-05: Gel › Configuração › Catálogos sem cadastro de catálogo novo (vem do Portal), com o aviso');
  ok(ui5.numTrav, 'ARQ-05: catálogo ligado: número e nome travados no Gel');
  ok(ui5.sel && ui5.nomeEsc && ui5.opc.join() === 'EQ80', 'ARQ-07: equipamento novo no Gel é escolhido do Portal (só os ainda não ligados), sem nome em texto livre');
  const auto = await g.evaluate(() => { const c = JSON.parse(localStorage.getItem('vac.cadastros')); c.materiais = [{ codigo: '10000001', tipo: 'gel', ativo: true }]; c.catalogos.push({ codigo: '777777', tipoItem: 'tubo', nome: 'Tubo SST novo', cor: '#00aa00', formato: '13x75', ativo: true, vigencias: [{ de: '2025-01-01', pphNominal: 40000, tubosPorCaixa: 1000, caixasPorLote: 900 }] });
    c.bom = [{ catalogo: '777777', vigencias: [{ de: '2025-01-01', itens: [{ material: '10000001', qtdPorMilheiro: 0.9 }] }] }]; localStorage.setItem('vac.cadastros', JSON.stringify(c)); render();
    const k = S.catalogs.find(x => x.num === '777777'); return k ? { fmt: k.fmt, lot: k.lotSize, rate: k.rateH, portal: k.portal } : null; });
  ok(auto && auto.fmt === '75' && auto.lot === 900000 && auto.rate === 40000 && auto.portal === '777777', 'ARQ-05: catálogo do Portal com gel na BOM entra sozinho no Gel (formato, lote e velocidade do Portal)');
  await g.evaluate(() => localStorage.removeItem('vac.cadastros'));
  // Portal: Trazer configurações oferece o que só existe no Gel
  const mig5 = await po.evaluate(() => {
    TrazCfg.B = { gel: { config: { equips: [{ id: 'eq-x', name: 'Balança do gel', active: true, descs: [] }] }, catalogs: { items: [{ id: 'cat-z', num: '888888', desc: 'SST gel', fmt: '75', color: '#ff0000', active: true, lotSize: 900000, rateH: 38000 }] } } };
    TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const P = TrazCfg.P, W2 = { catalogos: [], equipamentos: [] };
    const c = P.find(i => i.grupo === 'Só no Gel · catálogos'), e = P.find(i => i.grupo === 'Só no Gel · equipamentos'); if (c) c.fn(W2); if (e) e.fn(W2); return W2; });
  ok(mig5.catalogos[0] && mig5.catalogos[0].codigo === '888888' && mig5.catalogos[0].vigencias[0].caixasPorLote === 900 && mig5.equipamentos[0] && mig5.equipamentos[0].categoria === 'gel' && /^EQ\d+$/.test(mig5.equipamentos[0].codigo), 'ARQ-05/07 migração: Trazer configurações leva catálogos e equipamentos que só existem no Gel (Equipamento – Gel)');
  ok(await po.evaluate(() => CAD_T.equipamentos.campos.some(c => c[0] === 'categoria') && !!AJUDA_CAMPO['equipamentos.categoria']), 'ARQ-07: Portal › Equipamentos tem a Categoria (Equipamento – Gel) com ⓘ');

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
