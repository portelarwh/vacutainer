// Fase 4 do briefing (Gel dentro da Produção). Passo 4a (D10, G2/G3): parâmetros do gel no Portal, lidos pelo Gel sem mudar nenhuma conta.
// node testes/tgel.js → código 1 se alguma conferência falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* ---------- Gel: contas iguais com os parâmetros vindos do Portal ---------- */
  const g = await nova('Gestão-Gel-Vacutainer.html', 'Gel');
  await g.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.removeItem('vac.cadastros'); enterDemo();
    // configuração rica, como a da pasta real (a demonstração vem com os padrões)
    S.config.params = [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }, { from: addDays(todayISO(), -10), g: 0.96, pT: 2.0, pB: 0.7, pP: 0.48 }];
    S.config.fmts = [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }];
    S.config.motivos = [{ id: 'm1', name: 'Gel com bolha', comps: [], active: true }, { id: 'm2', name: 'Etiqueta ruim', comps: ['completo'], active: true }];
    S.config.equips = [{ id: 'eq-1', name: 'Máquina de gel', tara: 80, active: true, descs: [{ id: 'd1', comp: 'tubogel', cat: 'T', mots: ['m1'] }, { id: 'd2', comp: 'gel', cat: 'P' }] }];
    S.catalogs.forEach((k, i) => { k.fmt = i % 2 ? '75' : '100'; k.lotSize = 900000; k.rateH = 38000 + i; k.vig = [{ from: '2000-01-01', gTubo: 0.85 + i / 100, bomKg: 8.84, bomBase: 10000, tol: 6 }, { from: addDays(todayISO(), -5), gTubo: 0.86 + i / 100, bomKg: 8.9, bomBase: 10000, tol: 6 }]; });
    render(); });
  const marca = () => g.evaluate(() => { const ex = gelExports(); delete ex.geradoEm; const h = todayISO();
    const dias = Object.keys(S.prodlog || {}).sort().slice(-6).map(d => { const r = prodCalc(d, S.prodlog[d]); return [d, JSON.stringify(r, (k, v) => typeof v === 'function' ? undefined : v)]; });
    const cats = S.catalogs.map(c => [c.num, gelReal(c.id, h), JSON.stringify(bomInfo(c.id, h)), gelReal(c.id, addDays(h, -8)), catFmt(c.id)]);
    return JSON.stringify({ ex, dias, cats, p: [paramsAt(h), paramsAt(addDays(h, -20))], f: fmtAt(h), sob: sobraAt(h), mot: motList(), eq: S.config.equips.map(e => [e.tara, e.descs]) }); });
  const g0 = await marca();
  const nDias = await g.evaluate(() => Object.keys(S.prodlog || {}).length);
  await g.evaluate(() => {   // o mesmo conteúdo, agora no cadastro do Portal (como o Trazer configurações deixa)
    const C = { schema: 'vac-cadastros', rev: 8, parametros: { gel: { processo: JSON.parse(JSON.stringify(S.config.params)), formatos: JSON.parse(JSON.stringify(S.config.fmts)), motivos: JSON.parse(JSON.stringify(S.config.motivos)), registroPelaProducaoDesde: '2026-12-01' } },
      equipamentos: [{ codigo: 'EQ90', nome: 'Máquina de gel', ativo: true, categoria: 'gel', gel: { tara: 80, descs: JSON.parse(JSON.stringify(S.config.equips[0].descs)) } }],
      catalogos: S.catalogs.map(k => ({ codigo: k.num, tipoItem: 'tubo', nome: k.desc, cor: k.color, ativo: k.active !== false, formato: '13x' + k.fmt, gel: { fmt: k.fmt, lotSize: k.lotSize, rateH: k.rateH, vig: JSON.parse(JSON.stringify(k.vig)) } })), materiais: [], bom: [] };
    // a cópia local do Gel é zerada: tudo tem que vir do Portal
    S.config.params = []; S.config.fmts = []; S.config.motivos = []; S.config.equips[0].descs = []; S.config.equips[0].tara = ''; S.catalogs.forEach(k => { k.vig = []; k.fmt = '100'; k.lotSize = null; k.rateH = null; });
    localStorage.setItem('vac.cadastros', JSON.stringify(C)); render(); });
  const g1 = await marca();
  ok(nDias > 0, `GEL-06: base de exemplo com ${nDias} dia(s) de registro para comparar`);
  ok(g0 === g1, 'GEL-06 / 4a: com processo, formatos, motivos, descartes e gel do catálogo vindos do Portal, todas as contas do gel dão os mesmos números');
  const mud = await g.evaluate(() => { const C = JSON.parse(localStorage.getItem('vac.cadastros')); const h = todayISO(); const antes = paramsAt(h).pT;
    C.parametros.gel.processo.push({ from: addDays(h, -1), g: 0.96, pT: 3.5, pB: 0.7, pP: 0.48 }); localStorage.setItem('vac.cadastros', JSON.stringify(C)); render(); return [antes, paramsAt(h).pT, paramsAt(addDays(h, -3)).pT]; });
  ok(mud[0] === 2.0 && mud[1] === 3.5 && mud[2] === 2.0, '4a: vigência nova de perdas no Portal vale da data dela em diante (dias anteriores ficam com a anterior)');
  const cruz = await g.evaluate(() => Object.keys(S.prodlog || {}).map(d => { const rec = S.prodlog[d], pc = prodCalc(d, rec); const t = {}; recOrdersEff(rec).forEach(o => t[o.cat] = (t[o.cat] || 0) + (+o.t || 0));
    const k = vacGel.teorico({ tubosPorCat: t, date: d, cg: id => ({ fmt: catFmt(id), vig: catVigList(catById(id)) }), fmts: S.config.fmts, params: S.config.params }); return [d, pc.teo, k.teo, pc.gelBons, k.gelBons]; }).filter(x => Math.abs(x[1] - x[2]) > 1e-9 || Math.abs(x[3] - x[4]) > 1e-9));
  ok(!cruz.length, '4b: teórico do kit (vacGel.teorico) igual ao prodCalc do Gel em todos os dias registrados' + (cruz.length ? ' · ' + JSON.stringify(cruz[0]) : ''));
  const trav = await g.evaluate(async () => { const r = {}; for (const sec of ['proc', 'fmts', 'motivos', 'equip']) { openConfig(sec); await new Promise(x => setTimeout(x, 60)); const b = document.querySelector('#ov .cfgbody');
      r[sec] = { banner: /cadastro geral do Portal/.test(b.innerText), livres: [...b.querySelectorAll('input,select,textarea,button')].filter(el => !el.disabled && !el.closest('a') && el.id !== 'ctPortal').length }; }
    document.querySelectorAll('.overlay').forEach(o => o.remove()); return r; });
  for (const [sec, r] of Object.entries(trav)) ok(r.banner && r.livres === 0, `4a: Gel › Configuração › ${sec} só consulta, com "Editar no Portal" (livres: ${r.livres})`);
  await g.evaluate(() => localStorage.removeItem('vac.cadastros'));

  /* ---------- 4b: a pesagem do Gel é a do kit (vacGel), com os mesmos resultados de antes ---------- */
  const ref = require('./bases/gel-pesagens.json');
  const g4b = await nova('Gestão-Gel-Vacutainer.html', 'Gel 4b');
  const dif = await g4b.evaluate(ref => { document.querySelectorAll('.overlay').forEach(o => o.remove()); localStorage.removeItem('vac.cadastros'); enterDemo();
    S.config.params = [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }, { from: '2026-06-01', g: 0.95, pT: 2, pB: 0.7, pP: 0.48 }];
    S.config.fmts = [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }, { from: '2026-06-01', tara: 72, taraP: 5, f: { '100': { tubo: 4.81, gel: 0.84, adit: 0.021, tr: 2.3 }, '75': { tubo: 3.56, gel: 0.83, adit: 0.016, tr: 2.3 } } }];
    const comps = ['completo', 'tubogel', 'spray', 'gel', 'barril'], cats = ['T', 'B', 'P'];
    S.config.equips = [{ id: 'eqA', name: 'A', tara: '', active: true, descs: [] }, { id: 'eqB', name: 'B', tara: 90, active: true, descs: [] }];
    for (const e of S.config.equips) comps.forEach(c => cats.forEach(k => e.descs.push({ id: c + '-' + k, comp: c, cat: k })));
    S.catalogs = [{ id: 'c1', num: '111111', fmt: '100', vig: [{ from: '2000-01-01', gTubo: 0.85, bomKg: 8.8, bomBase: 10000, tol: 6 }, { from: '2026-07-01', gTubo: 0.87, bomKg: 8.9, bomBase: 10000, tol: 6 }] }, { id: 'c2', num: '222222', fmt: '75' }, { id: 'c3', num: '333333', fmt: '100', gTubo: 0.9 }];
    const eqv = (a, b) => JSON.stringify(a, (k, v) => typeof v === 'number' ? +v.toFixed(9) : v) === JSON.stringify(b, (k, v) => typeof v === 'number' ? +v.toFixed(9) : v);
    return ref.filter(c => !eqv(scrapCalc(c.ent, c.date), c.r)).slice(0, 3).map(c => [c, scrapCalc(c.ent, c.date)]); }, ref);
  ok(ref.length === 1440 && dif.length === 0, `4b: pesagem do Gel pela conta comum (vacGel) igual à anterior nos ${ref.length} casos (5 composições × 3 categorias × 2 formatos × vigências × embalagem)${dif.length ? ' · diferença: ' + JSON.stringify(dif[0]).slice(0, 300) : ''}`);
  const kt = await g4b.evaluate(() => { const r = vacGel.teorico({ tubosPorCat: { a: 1000000 }, date: '2026-03-10', cg: () => ({ fmt: '100', vig: [{ from: '2000-01-01', gTubo: 0.85 }] }), fmts: [], params: [{ from: '2000-01-01', g: 0.97, pT: 2, pB: 1, pP: 1 }] }); return r; });
  ok(Math.abs(kt.gelBons - 850) < 1e-9 && Math.abs(kt.teo - 850 / 0.96) < 1e-9 && Math.abs(kt.sTeo.T - kt.teo * 0.02) < 1e-9, '4b: vacGel.teorico = gel nos tubos bons ÷ (1 − perdas), com a parte de cada categoria');

  /* ---------- Portal: Parâmetros › Gestão de Gel, fichas e migração ---------- */
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(300);
  await po.evaluate(() => { location.hash = '#cadastros/parametros'; }); await po.waitForTimeout(500);
  ok(await po.evaluate(() => !!document.querySelector('#parGel') && !document.querySelector('#pgOk')), '4a Portal: Parâmetros tem o grupo Gestão de Gel (só consulta sem a senha)');
  await po.evaluate(() => { Lock.on(Cad.D.seguranca.senhaHash); App.render(); }); await po.waitForTimeout(300);
  await po.click('#parGel [data-pgadd="processo"]'); await po.waitForTimeout(200);
  await po.fill('#parGel [data-pg="processo.0.pT"]', '2.5'); await po.fill('#parGel [data-pg="registroPelaProducaoDesde"]', '2026-12-01');
  await po.click('#parGel [data-pgadd="motivos"]'); await po.waitForTimeout(200); await po.fill('#parGel [data-pg="motivos.0.name"]', 'Gel com bolha');
  await po.click('#pgOk'); await po.waitForTimeout(600);
  const pg = await po.evaluate(() => (Cad.D.parametros || {}).gel || null), hoje = await po.evaluate(() => todayISO());
  ok(pg && pg.processo && pg.processo[0].pT === 2.5 && pg.processo[0].from === hoje && pg.registroPelaProducaoDesde === '2026-12-01' && pg.motivos[0].name === 'Gel com bolha' && /^m-/.test(pg.motivos[0].id), '4a Portal: grava parametros.gel (perdas com vigência a partir de hoje, motivos com id, data de corte G3)');
  const recusa = await po.evaluate(() => { App.render(); const W = ParGel.W; W.processo[0].from = '2020-01-01'; W.processo[0].pT = 9; $('#pgOk').click(); return Cad.D.parametros.gel.processo[0].pT; });
  ok(recusa === 2.5, '4a Portal: vigência gravada não muda (data no passado é recusada)');
  await po.waitForTimeout(1200);
  const ficha = await po.evaluate(async () => { const e = Cad.D.equipamentos[0]; location.hash = '#cadastros/equipamentos/' + e.codigo; await new Promise(r => setTimeout(r, 400));
    const sel = document.querySelector('#fBox [data-p="categoria"]'); sel.value = 'gel'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 200));
    const temBloco = /Gel: embalagem e descartes/i.test(document.querySelector('#fBox').innerText); const add = document.querySelector('#fBox [data-add="gel.descs"]'); if (add) add.click(); await new Promise(r => setTimeout(r, 150));
    const mot = document.querySelector('#fBox [data-p="gel.descs.0.mots"]'); if (mot) { mot.checked = true; mot.dispatchEvent(new Event('change', { bubbles: true })); }
    const W = Ficha.W; const c = Cad.D.catalogos.find(x => x.tipoItem !== 'preparacao'); Ficha.fechar && Ficha.fechar(); location.hash = '#cadastros/catalogos/' + c.codigo; await new Promise(r => setTimeout(r, 400));
    return { temBloco, descs: (W.gel || {}).descs, cat: /Gel do catálogo|<b>Gel<\/b>/.test(document.querySelector('#fBox').innerHTML) || /\bGel\b/.test(document.querySelector('#fBox details.cd summary') ? document.querySelector('#fBox').innerText : '') }; });
  if (!(ficha.temBloco && ficha.descs && ficha.descs.length === 1)) console.log('ficha:', JSON.stringify(ficha));
  ok(ficha.temBloco && ficha.descs && ficha.descs.length === 1 && (ficha.descs[0].mots || []).length === 1, '4a Portal: ficha do Equipamento – Gel com embalagem e descartes (composição, categoria e motivos do gel)');
  ok(ficha.cat, '4a Portal: ficha do catálogo com o bloco Gel (formato, lote, velocidade e vigências de gel/BOM)');
  const mig = await po.evaluate(() => { TrazCfg.B = { gel: { config: { params: [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }], fmts: [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }], motivos: [{ id: 'm9', name: 'Quebra', comps: [], active: true }],
      equips: [{ id: 'eq-z', name: Cad.D.equipamentos[1].nome, tara: 80, active: true, descs: [{ id: 'dz', comp: 'gel', cat: 'P' }] }] }, catalogs: { items: [{ id: 'cat-q', num: Cad.D.catalogos[0].codigo, fmt: '75', lotSize: 900000, vig: [{ from: '2000-01-01', gTubo: 0.85, bomKg: 8.84, bomBase: 10000, tol: 6 }] }] } } };
    Cad.D.parametros.gel = {}; Cad.D.equipamentos[1].gel = null; Cad.D.catalogos[0].gel = null;
    TrazCfg.P = []; TrazCfg.avisos = []; TrazCfg.montar(); const L = TrazCfg.P.filter(i => i.grupo === 'Só no Gel · parâmetros do gel'); const W2 = JSON.parse(JSON.stringify(Cad.D)); L.forEach(i => i.fn(W2));
    return { n: L.length, pg: W2.parametros.gel, eq: W2.equipamentos[1].gel, cat: W2.catalogos[0].gel, catg: W2.equipamentos[1].categoria }; });
  ok(mig.n === 5 && mig.pg.processo[0].pT === 2.1 && mig.pg.formatos[0].sobra === 1.3 && mig.pg.motivos[0].id === 'm9' && mig.eq.descs[0].cat === 'P' && mig.catg === 'gel' && mig.cat.fmt === '75' && mig.cat.vig[0].bomKg === 8.84, '4a migração: Trazer configurações leva processo, formatos, motivos, descartes (Equipamento – Gel) e o gel do catálogo, com a mesma estrutura');

  /* ---------- 4c (GEL-03 / PRD-10): Registrar scrap de gel no turno da Produção ---------- */
  const o = await nova('OEE-Vacutainer.html', 'Produção 4c');
  const p4c = await o.evaluate(async () => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); await new Promise(r => setTimeout(r, 300));
    const day = Store.S.db.productionDays.filter(x => !x.deleted && x.status !== 'fechado' && x.shifts.some(p => !p.deleted && p.status !== 'fechado')).sort((a, b) => a.date < b.date ? 1 : -1)[0];
    const res = Engine.computeDay(db(), day), ps = day.shifts.find(p => !p.deleted && p.status !== 'fechado' && res.flat.some(f => f.ps === p && f.cat));
    const catCode = ((db().catalogs || []).find(c => c.id === res.flat.find(f => f.ps === ps && f.cat).cat) || {}).code;
    const C = { schema: 'vac-cadastros', rev: 11, parametros: { gel: { formatos: [{ from: '2000-01-01', tara: 70, taraP: 4, sobra: 1.3, f: { '100': { tubo: 4.8, gel: 0.83, adit: 0.02, tr: 2.31 }, '75': { tubo: 3.55, gel: 0.82, adit: 0.015, tr: 2.29 } } }], processo: [{ from: '2000-01-01', g: 0.97, pT: 2.1, pB: 0.71, pP: 0.5 }], motivos: [{ id: 'm1', name: 'Gel com bolha', comps: [], active: true }] } },
      equipamentos: [{ codigo: 'EQ90', nome: 'Máquina de gel', ativo: true, categoria: 'gel', gel: { tara: 80, descs: [{ id: 'd1', comp: 'tubogel', cat: 'T', mots: [] }, { id: 'd2', comp: 'barril', cat: 'B' }] } }],
      catalogos: [{ codigo: catCode, tipoItem: 'tubo', nome: 'Tubo', ativo: true, formato: '13x100', gel: { fmt: '100', vig: [{ from: '2000-01-01', gTubo: 0.85, bomKg: 8.84, bomBase: 10000, tol: 6 }] } }], materiais: [], bom: [] };
    localStorage.setItem('vac.cadastros', JSON.stringify(C)); Engine.bumpConfig();
    App.sel.dayId = day.id; App.sel.date = day.date; go('launch'); await new Promise(r => setTimeout(r, 400));
    const btn = document.querySelector(`[data-gelscrap="${ps.id}"]`); if (!btn) return { semBotao: true };
    btn.click(); await new Promise(r => setTimeout(r, 300));
    const m = document.querySelector('.overlay'); const kg = m.querySelector('[data-gf="kg"]'); kg.value = '2,345'; kg.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 100));
    const mot = m.querySelector('[data-gm="m1"]'); if (mot) { mot.checked = true; mot.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 100)); }
    const prev = m.querySelector('[data-gi="0"] td:nth-last-child(2)').innerText;
    m.querySelector('#gOk').click(); await new Promise(r => setTimeout(r, 500));
    const d2 = Store.S.db.productionDays.find(x => x.id === day.id), ps2 = d2.shifts.find(p => p.id === ps.id), gs = ps2.gelScrap;
    const esperado = vacGel.pesagem({ desc: { comp: 'tubogel', cat: 'T' }, taraEq: 80, kg: 2.345, cg: { fmt: '100', vig: [{ from: '2000-01-01', gTubo: 0.85 }] }, date: day.date, fmts: C.parametros.gel.formatos, params: C.parametros.gel.processo });
    d2.demo = false;   // o exports ignora dias de demonstração; aqui o dia faz papel de dia real
    const ex = Exports.build(db()), linha = (ex.porDiaTurno || []).find(x => x.dia === day.date && x.turno === (ps.snap.code || ps.snap.name));
    // tela do turno (operador)
    App.op = true; App.opSel = { date: day.date, shiftId: ps.shiftId }; go('shift'); await new Promise(r => setTimeout(r, 400)); const naTelaTurno = !!document.querySelector(`[data-gelscrap="${ps.id}"]`); App.op = false;
    return { gs, prev, esperado, linha: linha ? { gel: linha.gel, extraMin: linha.extraMin } : null, naTelaTurno, catCode };
  });
  ok(!p4c.semBotao, 'GEL-03 / PRD-10: o turno da Produção tem o botão Registrar scrap (catálogo do turno usa gel e há equipamento de gel no Portal)');
  ok(p4c.gs && p4c.gs.eq.length === 1 && p4c.gs.eq[0].e === 'EQ90' && p4c.gs.eq[0].kg === 2.345 && p4c.gs.eq[0].cat === p4c.catCode && (p4c.gs.eq[0].mots || [])[0].m === 'm1' && p4c.gs.por, 'G1: a pesagem fica gravada no turno da Produção (equipamento do Portal, descarte, catálogo, peso, motivo, quem)');
  ok(p4c.linha && p4c.linha.gel && Math.abs(p4c.linha.gel.kg.T - Math.round(p4c.esperado.gel * 1000) / 1000) < 1e-9 && p4c.linha.gel.pesagens.length === 1 && p4c.linha.extraMin != null, 'GEL-03: exports porDiaTurno[].gel com as pesagens e o gel por categoria pela conta comum (vacGel), e a hora extra do turno');
  ok(/gel/.test(p4c.prev) && p4c.prev.includes(String(p4c.esperado.gel.toFixed(3)).replace('.', ',')), 'GEL-03: o formulário mostra o gel calculado de cada pesagem antes de gravar');
  ok(p4c.naTelaTurno, 'PRD-10: o Registrar scrap também está na tela do turno (operador)');
  await o.evaluate(() => localStorage.removeItem('vac.cadastros'));

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
