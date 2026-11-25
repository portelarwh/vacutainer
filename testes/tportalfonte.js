// Fase 1 do briefing de 09/11/2026: o Portal como fonte única (ARQ-01 a ARQ-07).
// node testes/tportalfonte.js → imprime as conferências; sai com código 1 se alguma falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + '__modulos__/';
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
    const d = U.clone(Store.S.db);
    Object.assign(d.settings, ProdCad.montar({ rev: 1, parametros: { producao: { unidadeLancamento: 1000, rotuloUnidade: 'mil', arredondamentoMeta: [{ de: '2000-01-01', valor: 7000 }, { de: '2099-01-01', valor: 500 }] } } }).settings);
    const st = d.settings, dia = d.productionDays.find(x => !x.deleted && x.shifts && x.shifts.length);
    const res = Engine.computeDayRaw(d, dia), metas = res.flat.map(f => f.metaOp).filter(v => v != null && v > 0);
    return { vig: (st.roundingVig || []).length, ru: st.roundingUnit, a: roundAt(st, '2026-01-01'), b: roundAt(st, '2099-06-01'), semVig: roundAt({ roundingUnit: 1000 }, '2026-01-01'), metas: metas.length, mult: metas.slice(0, -1).every(v => v % 7000 === 0) };
  });
  ok(r6.vig === 2 && r6.ru === 7000, 'ARQ-06 Produção: o ProdCad deriva as vigências do arredondamento e o vigente hoje');
  ok(r6.a === 7000 && r6.b === 500 && r6.semVig === 1000, 'ARQ-06 Produção: roundAt usa a vigência da data (sem vigência, o valor da base)');
  ok(r6.metas > 1 && r6.mult, 'ARQ-06 Produção: a meta de cada intervalo sai no múltiplo da vigência do dia');
  const q = await o.evaluate(() => { localStorage.setItem('vac.qtd', 'abs'); const a = [DISP(), unitLbl()]; localStorage.setItem('vac.qtd', 'unit'); const u = [DISP(), unitLbl()]; return { a, u }; });
  ok(q.a[0] === 1 && q.a[1] === 'un' && q.u[0] > 1, 'ARQ-06 Produção: exibição das quantidades segue vac.qtd do computador');
  await o.evaluate(() => localStorage.removeItem('vac.qtd'));

  /* ================= ARQ-01/02/03/04 · PRD-04 ================= */
  const r1 = await o.evaluate(() => {
    const d = U.clone(Store.S.db), sh = d.shifts.find(x => !x.deleted && (x.versions || []).some(v => !v.deleted));
    const vigs = sh.versions.filter(v => !v.deleted).map(v => ({ de: v.validFrom, ate: v.validTo || null, inicio: v.start, fim: v.end, dias: v.weekdays, ativo: true, pausas: [], intervalos: [] }));
    sh.status = 'inativo';                                   // desativado aqui antes do Portal assumir (PRD-04)
    const tc = JSON.parse(JSON.stringify(sh)); tc.id = 'sh_tc'; tc.code = 'TC'; tc.status = 'ativo'; d.shifts.push(tc);   // mesmo turno com outro código
    void d.shifts.filter(x => !x.deleted && x.id !== sh.id && x.id !== 'sh_tc').map(x => ({ codigo: x.code, nome: x.name, ativo: x.status !== 'inativo', vigencias: (x.versions || []).filter(v => !v.deleted).map(v => ({ de: v.validFrom, ate: v.validTo || null, inicio: v.start, fim: v.end, dias: v.weekdays, ativo: v.active !== false, pausas: [], intervalos: [] })) }));
    const T = ProdCad.montar({ rev: 1, turnos: [{ codigo: sh.code, nome: sh.name, ativo: true, vigencias: vigs }], parametros: {} });
    return { st: T.shifts.find(x => x.code === sh.code).status, cod: sh.code };
  });
  ok(r1.st === 'ativo', `PRD-04: turno ${r1.cod} inativo na Produção volta a ativo quando o Portal diz ativo (o status seguia o local)`);
  const r2 = await o.evaluate(() => {
    const semDoc = JSON.stringify(CadPortal.dominios());
    Store.S.cadDoc = { schema: 'vac-cadastros', rev: 9, turnos: [{ codigo: 'T1', vigencias: [] }], catalogos: [], paradas: [], metasOee: [], linhas: [], parametros: {} };
    const D = CadPortal.dominios(); Store.S.cadDoc = null;
    return { semDoc, D };
  });
  ok(r2.semDoc === '{}', 'ARQ-01..04: sem pasta e sem Portal (modo local/testes) nada do cadastro é aplicado sobre a base');
  ok(r2.D.turnos && r2.D.catalogos && r2.D.metas && r2.D.paradas && r2.D.estrutura, 'ARQ-01..04: com o cadastro do Portal, turnos, catálogos, metas, paradas e estrutura vêm dele, mesmo com o domínio vazio no Portal');
  /* 1.8.47/1.8.48 · CFG-ADM e CAD-CONS: as cinco telas saíram; o menu e a seção pedida direto abrem a Consulta de cadastros */
  const r3 = await o.evaluate(async () => {
    const res = {}; go('config'); await new Promise(r => setTimeout(r, 300));
    const menu = () => [...document.querySelectorAll('.cfg nav [data-sec]')].map(b => b.dataset.sec).filter(k => ['consulta', 'estrutura', 'turnos', 'catalogos', 'metas', 'paradas'].includes(k)).join(',');
    res.semDoc = menu();
    Store.S.cadDoc = { schema: 'vac-cadastros', rev: 9, turnos: [{ codigo: 'T1', vigencias: [] }], catalogos: [], paradas: [], metasOee: [], linhas: [], parametros: {} };
    render(); await new Promise(r => setTimeout(r, 250));
    res.comDoc = menu();
    for (const sec of ['turnos', 'catalogos', 'metas', 'paradas', 'estrutura']) { App.cfgSec = sec; render(); await new Promise(r => setTimeout(r, 200));
      res[sec] = !!document.querySelector('.cfg > div [data-vcc]') && ![...document.querySelectorAll('.cfg > div input, .cfg > div select, .cfg > div textarea')].some(el => !el.matches('[data-vcc-busca]')); }
    App.cfgSec = 'base'; Store.S.cadDoc = null; return res;
  });
  ok(r3.semDoc === 'consulta' && r3.comDoc === r3.semDoc, 'CAD-CONS: com ou sem o cadastro do Portal, o menu tem só "Consulta de cadastros" no lugar de estrutura, turnos, catálogos, metas e tipos de parada (' + r3.semDoc + ')');
  for (const sec of ['turnos', 'catalogos', 'metas', 'paradas', 'estrutura']) ok(r3[sec], `CAD-CONS: Produção › Configurações › ${sec} não tem tela própria; abre a consulta (só leitura)`);

  /* ================= ARQ-05 / ARQ-07 · Gestão de Gel (GEL-06: contas iguais) ================= */
  const g = await nova('Gestão-Gel-Vacutainer.html', 'Gel');
  await g.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.removeItem('vac.cadastros'); enterDemo();
    if (!(S.config.equips || []).length) S.config.equips = [{ id: 'eq-t1', name: 'Máquina de gel', tara: '', active: true, descs: [{ id: 'd-1', comp: 'tubogel', cat: 'T' }] }, { id: 'eq-t2', name: 'Inspeção', tara: 12, active: true, descs: [{ id: 'd-2', comp: 'gel', cat: 'P' }] }];
    render(); }); await g.waitForTimeout(500);
  const marca = () => g.evaluate(() => { const ex = gelExports(); delete ex.geradoEm; const h = todayISO(), d30 = addDays(h, -30);
    const cats = S.catalogs.filter(c => c.origem !== 'Portal').map(c => [c.num, gelReal(c.id, h), JSON.stringify(bomInfo(c.id, h)), gelReal(c.id, d30), JSON.stringify(bomInfo(c.id, d30))]);
    return JSON.stringify({ ex, cats }); });
  await g.evaluate(() => {
    const tubos = { '100': { tuboG: 4.779, gelG: 0.936 }, '75': { tuboG: 3.56, gelG: 0.834 } };
    const locais = S.config.equips.map((e, i) => ({ id: 'L-' + i, equipamento: 'EQ9' + i, local: e.name, categoria: 'T', comp: 'tubogel', ativo: true }));
    localStorage.setItem('vac.cadastros', JSON.stringify({ schemaVersion: 2, gel: { locais, formatos: [{ de: '2025-01-01', tubos }] } }));
  });
  const g0 = await marca();
  await g.evaluate(() => {
    const cats = S.catalogs.map(c => ({ codigo: String(c.num), tipoItem: 'tubo', nome: 'Portal ' + c.num, cor: '#123456', formato: '13x' + (c.fmt || '100'), ativo: c.active !== false, vigencias: [] }));
    const eqs = (S.config.equips || []).map((e, i) => ({ codigo: 'EQ9' + i, nome: e.name, ativo: e.active !== false, categoria: 'gel' })).concat([{ codigo: 'EQ80', nome: 'Dosadora nova', ativo: true, categoria: 'gel' }]);
    const cad = vacCad();
    localStorage.setItem('vac.cadastros', JSON.stringify({ ...cad, catalogos: cats, equipamentos: eqs }));
    render(); return { n: cats.length, e: eqs.length };
  });
  const g1 = await marca();
  ok(g0 === g1, 'GEL-06: com catálogos e equipamentos ligados ao Portal, os números do gel (exports, gel aplicado, BOM e meta) são os mesmos');
  const lig = await g.evaluate(() => ({ desc: S.catalogs.every(c => /^Portal /.test(c.desc) && c.color === '#123456' && c.portal), eq: equipList().every(e => /^EQ9/.test(e.codigo)), n: equipList().length }));
  ok(lig.desc, 'ARQ-05: nome e cor do catálogo vêm do Portal (vínculo pelo número)');
  ok(lig.eq && lig.n === 2, 'ARQ-07: o Gel lê o equipamento dos locais pelo código no cadastro da Administração');
  /* 1.8.47 · CFG-ADM: Catálogos e Equipamentos do Gel abrem na Administração; equipamento da Administração com dados de gel entra sozinho */
  const ui5 = await g.evaluate(() => { const ir = [], o = window.vacIrPortal; window.vacIrPortal = h => ir.push(h); openConfig('cat'); openConfig('equip'); window.vacIrPortal = o;
    const c = vacCad(); c.gel.locais.push({ id: 'novo', equipamento: 'EQ80', local: 'Dosadora', embalagemG: 12, categoria: 'T', comp: 'tubogel', ativo: true }); localStorage.setItem('vac.cadastros', JSON.stringify(c)); render();
    const q = equipList().find(x => x.codigo === 'EQ80'); return { ir, modal: !!document.querySelector('#ov .cfgbody [data-vcc]'), eq: q ? { tara: q.descs[0].embalagemG, nome: q.name } : null }; });
  ok(!ui5.ir.length && ui5.modal, 'CAD-CONS: Gel › Catálogos e Equipamentos abrem a Consulta de cadastros (só leitura), sem tela de edição');
  ok(ui5.eq && ui5.eq.tara === 12, 'CFG-ADM: equipamento da Administração com embalagem e descartes do gel entra sozinho no Gel (' + JSON.stringify(ui5.eq) + ')');
  const auto = await g.evaluate(() => { const c = JSON.parse(localStorage.getItem('vac.cadastros')); c.materiais = [{ codigo: '10000001', tipo: 'gel', ativo: true }]; c.catalogos.push({ codigo: '777777', tipoItem: 'tubo', nome: 'Tubo SST novo', cor: '#00aa00', formato: '13x75', ativo: true, vigencias: [{ de: '2025-01-01', pphNominal: 40000, tubosPorCaixa: 1000, caixasPorLote: 900 }] });
    c.bom = [{ catalogo: '777777', vigencias: [{ de: '2025-01-01', itens: [{ material: '10000001', qtdPorMilheiro: 0.9 }] }] }]; localStorage.setItem('vac.cadastros', JSON.stringify(c)); render();
    const k = S.catalogs.find(x => x.num === '777777'); return k ? { fmt: k.fmt, lot: k.lotSize, rate: k.rateH, portal: k.portal } : null; });
  ok(auto && auto.fmt === '75' && auto.lot === 900000 && auto.rate === 40000 && auto.portal === '777777', 'ARQ-05: catálogo do Portal com gel na BOM entra sozinho no Gel (formato, lote e velocidade do Portal)');
  await g.evaluate(() => localStorage.removeItem('vac.cadastros'));
  ok(await po.evaluate(() => CAD_T.equipamentos.campos.some(c => c[0] === 'categoria') && !!AJUDA_CAMPO['equipamentos.categoria']), 'ARQ-07: Portal › Equipamentos tem a Categoria (Equipamento – Gel) com ⓘ');

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
