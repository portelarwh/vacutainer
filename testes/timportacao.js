// Fase 3 do briefing de 09/11/2026: Portal › Importação (IMP-01..04), abas Importar levando ao Portal (IMP-06, WST-02),
// endereços diretos das telas de importação (IMP-05) e Produção › Ordens reorganizada (PRD-02/03).
// node testes/timportacao.js → código 1 se alguma conferência falhar
const SP = require('path').resolve(__dirname, '..') + '/'; const S = 'file://' + SP + 'paginas/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const errs = [];
  const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FALHA ') + msg); if (!c) errs.push('falhou: ' + msg); };
  const nova = async (arq, tag, hash = '') => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(tag + ' ' + e.message)); p.on('dialog', d => d.accept()); await p.goto(S + encodeURI(arq) + hash); await p.waitForTimeout(1500); return p; };

  /* ---------- exports.importacoes em cada página (IMP-04) ---------- */
  const o = await nova('OEE-Vacutainer.html', 'Produção');
  await o.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); }); await o.waitForTimeout(800);
  const eo = await o.evaluate(() => { const d = JSON.parse(Store.serialize(Store.S.db)); d.server = ServerData.ensureStore(d);
    d.server.imports.push({ id: 'i1', at: '2026-03-11T08:00', by: 'Ana', file: 'mes.csv', from: '2026-03-10T05:00:00', to: '2026-03-11T07:00:00', boxes: 900 });
    d.imports = (d.imports || []).concat([{ id: 'p1', at: '2026-03-01T09:00', by: 'Ana', kind: 'planos', source: 'plano.xlsx' }]);
    const ex = Exports.build(d); const ob = Ord.exportsBuild.call({ B: { competencias: { '2026-03': { mb51: { em: '2026-03-11T09:00', por: 'Ana', arquivo: 'mb51.xlsx' }, coois: { em: '2026-03-11T09:10', por: 'Ana' } } } } });
    return { mes: (ex.importacoes || []).find(i => i.tipo === 'MES'), pcp: (ex.importacoes || []).find(i => i.tipo === 'PLANOS_PCP'), ord: ob.importacoes }; });
  ok(eo.mes && eo.mes.de === '2026-03-10T05:00:00' && eo.mes.ate === '2026-03-11T07:00:00' && eo.pcp, 'IMP-04 Produção: exports.importacoes traz o CSV do MES com o período coberto e o plano do PCP');
  ok(eo.ord.length === 2 && eo.ord.some(i => i.tipo === 'MB51' && i.comp === '2026-03') && eo.ord.some(i => i.tipo === 'COOIS'), 'IMP-04 Ordens: MB51 e COOIS por competência no exports');
  const w = await nova('Perdas-Ordem.html', 'Waste');
  const ew = await w.evaluate(() => { enterTest(); B.imports = (B.imports || []).concat([{ id: 'k1', tipo: 'KKBC_ORD', data: '2026-03-02T10:00', usuario: 'Ana', periodos: ['2026-02'], status: 'ok' }, { id: 'k2', tipo: 'KKBC_ORD', data: '2026-03-03T10:00', periodos: ['2026-01'], status: 'cancelado' }]); return buildExports0().importacoes; });
  ok(ew.some(i => i.tipo === 'KKBC_ORD' && i.periodos.includes('2026-02')) && !ew.some(i => i.periodos.includes('2026-01')), 'IMP-04 Waste: KKBC_ORD com as competências (importação desfeita fica fora)');
  const pa = await nova('Paradas.html', 'Paradas');
  const ep = await pa.evaluate(() => { modoTeste(); const D = JSON.parse(JSON.stringify(Store.data)); D.importacoes = (D.importacoes || []).concat([{ id: 'f1', em: '2026-03-11T07:30', por: 'Ana', arquivo: 'forms.xlsx', de: '2026-03-09', ate: '2026-03-10', novas: 12 }]); return calcExports(D).importacoes; });
  ok(ep.some(i => i.tipo === 'FORMS' && i.de === '2026-03-09' && i.ate === '2026-03-10'), 'IMP-04 Paradas: Forms com os dias cobertos');
  const g = await nova('Gestão-Gel-Vacutainer.html', 'Gel');
  const eg = await g.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); enterDemo(); render(); return gelExports().importacoes; });
  ok(Array.isArray(eg) && eg.length > 0 && eg.every(i => i.tipo === 'ESTOQUE_LP' && i.em), 'IMP-04 Gel: relatórios de estoque de LPs no exports');

  /* ---------- Portal › Importação ---------- */
  const po = await nova('Portal.html', 'Portal', '#geral');
  await po.evaluate(() => enterTest()); await po.waitForTimeout(400);
  const X = '2026-03-10';
  const montar = async (comTudo) => po.evaluate(({ X, comTudo }) => {
    const setEx = (id, L) => { MOD.data[id] = MOD.data[id] || { sys: sysOf(id), kpis: [], pend: [] }; MOD.data[id].ex = Object.assign({}, MOD.data[id].ex || { exportsVersion: 1 }, { importacoes: L }); };
    setEx('oee', [{ tipo: 'MES', em: '2026-03-11T08:00', de: '2026-03-10T05:00:00', ate: comTudo ? '2026-03-11T07:00:00' : '2026-03-10T20:00:00' }]);
    setEx('paradas', [{ tipo: 'FORMS', em: '2026-03-11T07:30', de: '2026-03-09', ate: '2026-03-10' }]);
    setEx('gel', [{ tipo: 'ESTOQUE_LP', em: '2026-03-11T06:10' }]);
    setEx('perdas', [{ tipo: 'KKBC_ORD', em: '2026-03-02T10:00', periodos: ['2026-02'] }]);
    MOD.ordensEx = { exportsVersion: 1, importacoes: comTudo ? [{ tipo: 'MB51', comp: '2026-03', em: '2026-03-11T09:00' }, { tipo: 'COOIS', comp: '2026-03', em: '2026-03-11T09:10' }] : [{ tipo: 'MB51', comp: '2026-03', em: '2026-03-11T09:00' }] };
    Imp.dia = X; location.hash = '#importacao'; App.show('imp', { keepHash: true });
    const rows = [...document.querySelectorAll('#main table tr')].slice(1).map(r => [r.cells[1].innerText.split('\n')[0], r.cells[4].innerText]);
    return { rows, txt: document.querySelector('#main').innerText, botoes: [...document.querySelectorAll('[data-impir]')].map(a => [a.dataset.impir, a.getAttribute('href')]) };
  }, { X, comTudo });
  const p1 = await montar(true);
  ok(await po.evaluate(() => !!document.querySelector('#nav [data-t="imp"]')), 'IMP-01: Portal tem a aba Importação');
  ok(/Dia 10\/03\/2026 100% atualizado/.test(p1.txt), 'IMP-04: com todas as importações diárias cobrindo o dia, "Dia X 100% atualizado"');
  ok(p1.rows.map(r => r[0]).join('|').startsWith('CSV do servidor (MES)|Forms de paradas|Estoque de LPs (SAP)|MB51 (movimentos de material)|COOIS (ordens)|KKBC_ORD'), 'IMP-03: sequência recomendada MES → Forms → LPs → MB51 → COOIS → KKBC_ORD → plano');
  ok(['Produção', 'Paradas', 'Gestão de Gel', 'Waste', 'Portal (cadastro)', 'Iniciativas / Ações'].every(n => p1.txt.toLowerCase().includes(n.toLowerCase())), 'IMP-02: subdividida por página (Produção, Paradas, Gel, Waste, Portal, Iniciativas)');
  const hrefs = Object.fromEntries(p1.botoes);
  ok(/OEE-Vacutainer\.html#aba=ordens&sub=mb51$/.test(hrefs.MB51) && /#aba=ordens&sub=coois$/.test(hrefs.COOIS) && /Perdas-Ordem\.html#aba=importar$/.test(hrefs.KKBC_ORD) && /Paradas\.html#aba=importar$/.test(hrefs.FORMS) && /#aba=importar$/.test(hrefs.ESTOQUE_LP) && /#aba=config&sec=importacao$/.test(hrefs.MES), 'IMP-05: cada "Importar" abre a tela de importação da página dona');
  const p2 = await montar(false);
  if (!/falta(m)? 2 de 5/i.test(p2.txt)) console.log('p2:', p2.txt.slice(0, 300), JSON.stringify(p2.rows));
  ok(/falta(m)? 2 de 5/i.test(p2.txt) && /parcial/i.test(p2.rows.find(r => /MES/.test(r[0]))[1]) && /falta/i.test(p2.rows.find(r => /COOIS/.test(r[0]))[1]), 'IMP-04: MES parcial e COOIS ausente aparecem como faltando no dia');
  await po.evaluate(() => { location.hash = '#importacao/waste'; }); await po.waitForTimeout(400);
  ok(await po.evaluate(() => App.tab === 'imp' && Imp.sec === 'waste' && !!document.querySelector('#imp-waste.imp-on')), 'IMP-06: #importacao/waste abre a subseção do Waste');

  /* ---------- abas Importar das páginas levam ao Portal (IMP-06, WST-02) ---------- */
  const leva = async (pg, acao) => { await acao(); await pg.waitForTimeout(800); return pg.url(); };
  const w2 = await nova('Perdas-Ordem.html', 'Waste2'); await w2.evaluate(() => enterTest());
  ok(/Portal\.html#importacao\/waste$/.test(await leva(w2, () => w2.click('#nav [data-t="importar"]'))), 'WST-02/IMP-06: Waste › Importar leva ao Portal › Importação › Waste');
  const w3 = await nova('Perdas-Ordem.html', 'Waste3', '#aba=importar'); await w3.waitForTimeout(300);
  ok(await w3.evaluate(() => { const t = document.querySelector('#t-importar'); return !!t && getComputedStyle(t).display !== 'none' && /Portal › Importação/.test(t.innerText); }), 'IMP-05: #aba=importar (botão do Portal) abre a tela do Waste, com o atalho de volta');
  const pa2 = await nova('Paradas.html', 'Paradas2'); await pa2.evaluate(() => modoTeste());
  ok(/Portal\.html#importacao\/paradas$/.test(await leva(pa2, () => pa2.click('#nav [data-t="importar"]'))), 'IMP-06: Paradas › Importar leva ao Portal › Importação › Paradas');
  const g2 = await nova('Gestão-Gel-Vacutainer.html', 'Gel2', '#aba=importar'); await g2.waitForTimeout(800);
  ok(await g2.evaluate(() => !!document.querySelector('#iAt')), 'IMP-05: Gel abre a importação do relatório do SAP por #aba=importar');

  /* ---------- Produção › Ordens (PRD-02/03) e endereços diretos ---------- */
  const o2 = await nova('OEE-Vacutainer.html', 'Produção2');
  const ord = await o2.evaluate(async () => { document.querySelectorAll('.overlay').forEach(x => x.remove()); Demo.enterExample(); await new Promise(r => setTimeout(r, 300)); go('ordens'); await new Promise(r => setTimeout(r, 400));
    return { sub: Ord.sub, abas: [...document.querySelectorAll('.ord-sub button')].map(x => x.textContent.trim()), menu: (NAV_GRUPOS.find(g => g.g === 'Ordens') || { itens: [] }).itens.map(x => x[1]) }; });
  ok(ord.sub === 'lista' && ord.abas.join('|') === 'Ordens produzidas|Conciliação|Histórico de competências|Importar ↗', 'PRD-02: Ordens abre em Ordens produzidas; ordem Ordens produzidas · Conciliação · Histórico · Importar');
  ok(ord.menu.join('|') === 'Ordens produzidas|Conciliação|Histórico de competências|Importar ↗', 'PRD-03: MB51 e COOIS viraram um item só (Importar) no menu');
  ok(/Portal\.html#importacao\/producao$/.test(await leva(o2, () => o2.click('.ord-sub [data-oimp-portal]'))), 'IMP-06: Produção › Ordens › Importar leva ao Portal › Importação › Produção');
  const o3 = await nova('OEE-Vacutainer.html', 'Produção3', '#aba=ordens&sub=coois');
  const r3 = await o3.evaluate(async () => { document.querySelectorAll('.overlay').forEach(x => x.remove()); return { route: App.route, sub: Ord.sub, passos: [...document.querySelectorAll('.ord-imp [data-osub]')].map(x => x.textContent.trim()) }; });
  ok(r3.route === 'ordens' && r3.sub === 'coois', 'IMP-05: #aba=ordens&sub=coois abre a importação do COOIS');
  ok(r3.passos.length === 2 && /MB51/.test(r3.passos[0]) && /COOIS/.test(r3.passos[1]), 'PRD-03: na importação, 1 · MB51 e 2 · COOIS lado a lado (o COOIS complementa o MB51)');
  const o4 = await nova('OEE-Vacutainer.html', 'Produção4', '#aba=config&sec=importacao');
  ok(await o4.evaluate(() => App.route === 'config' && App.cfgSec === 'importacao'), 'IMP-05: #aba=config&sec=importacao abre Configurações › Importação (MES, PCP, histórico)');

  await b.close();
  if (errs.length) { console.log('\n' + errs.join('\n')); process.exit(1); } else console.log('\nsem erros');
})();
