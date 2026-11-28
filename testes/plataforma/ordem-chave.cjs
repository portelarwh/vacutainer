// Plataforma 1.8.113 · ORD-CHAVE (pedido do responsável, 28/11/2026: "todo local que menciona o lote ou a ordem tem dados interligados?").
// O SAP traz a mesma ordem com zeros à esquerda num relatório e sem eles em outro. Prova, com a demonstração fictícia:
//  1. a regra comum vacChaveOrdem existe em todas as páginas e compara 000100234567 = 100234567 (texto com letras: maiúsculas);
//  2. a Gestão de Gel abre a ordem pedida por outra página com ou sem os zeros (antes: "Ordem sem registro no Gel");
//  3. na demonstração, ordem e lote batem entre Produção, SAP, Waste, Gel, Paradas e Iniciativas (nenhum lote em duas ordens).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const H = require('../../scripts/html.cjs');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/gel');
    const f = await (await p.locator('iframe[title="Módulo Gestão de Gel"]').elementHandle({ timeout: 60000 })).contentFrame();
    await f.waitForFunction(() => window.vacPagina && vacPagina.pronto() && typeof gelOrders === 'function', null, { timeout: 60000 });
    const r = await f.evaluate(() => { const o = gelOrders()[0]; return { chave: [vacChaveOrdem('000100234567'), vacChaveOrdem(' 100234567 '), vacChaveOrdem('abc-01'), vacChaveOrdem('0')], ordem: o && o.ordem, com: o && !!gelOrder('000' + o.ordem), sem: o && !!gelOrder(String(o.ordem).replace(/^0+/, '')), outra: !!gelOrder('999999999') }; });
    assert.deepEqual(r.chave, ['100234567', '100234567', 'ABC-01', '0']);
    assert.ok(r.ordem, 'a demonstração tem ordem no Gel'); assert.equal(r.com, true, 'com zeros à esquerda, o Gel acha a ordem'); assert.equal(r.sem, true); assert.equal(r.outra, false);
    console.log('ok Gel abre a ordem ' + r.ordem + ' pedida com ou sem zeros à esquerda; vacChaveOrdem comum');
    // revisão do PR 209: o PCP com zeros e o SAP sem zeros podem virar dois registros; a grafia exata vem primeiro e, entre as equivalentes, a que tem lote/tubos
    const dup = await f.evaluate(() => { const g0 = gelOrders; gelOrders = () => [{ ordem: '123', lote: null, tubos: 0, fonte: 'SAP' }, { ordem: '000123', lote: 'L-FICT', tubos: 1000, fonte: 'PCP' }];
      try { return [gelOrder('000123').fonte, gelOrder('123').fonte, gelOrder('0123').fonte]; } finally { gelOrders = g0; } });
    assert.deepEqual(dup, ['PCP', 'SAP', 'PCP'], 'grafia exata primeiro; sem exata, a equivalente com lote e tubos');
    console.log('ok registros equivalentes no Gel: a grafia exata vem primeiro; sem ela, o registro com lote e tubos');

    const app = H.fromHtml(html.toString()), B = JSON.parse(app.text('dados/cenario')).bases, ex = k => (B[k] && B[k].exports) || {}, nk = v => { const s = String(v ?? '').trim(); return /^\d+$/.test(s) ? s.replace(/^0+(?=\d)/, '') : s.toUpperCase(); };
    const P = []; const add = (m, o, l) => { if (o || l) P.push({ m, o: o == null ? '' : String(o), l: l == null ? '' : String(l) }); };
    (ex('oee').porOrdem || []).forEach(o => add('Produção', o.ordem, o.lote)); (ex('oee').ordens || []).forEach(o => add('Produção', o.ordem, o.lote));
    (ex('ordens').porOrdem || []).forEach(o => { add('SAP', o.ordem); (o.lotes || []).forEach(l => add('SAP', o.ordem, l)); });
    (ex('perdas').porOrdem || []).forEach(o => add('Waste', o.ordem, o.lote)); (ex('gel').ordens || []).forEach(o => add('Gel', o.ordem, o.lote));
    (ex('paradas').porOrdem || []).forEach(o => add('Paradas', o.ordem)); ((B.inic && B.inic.acoes) || []).forEach(a => { const v = a.vinculos || [], o = v.find(x => x.tipo === 'ordem'), l = v.find(x => x.tipo === 'lote'); if (o || l) add('Iniciativas', o && o.cod, l && l.cod); });
    const lo = {}; for (const x of P) if (x.l && x.o) (lo[x.l] = lo[x.l] || new Set()).add(nk(x.o));
    assert.deepEqual(Object.entries(lo).filter(([, s]) => s.size > 1), [], 'nenhum lote ligado a duas ordens');
    const conhecidas = new Set(P.filter(x => /Produção|SAP/.test(x.m)).map(x => nk(x.o)).filter(Boolean));
    assert.deepEqual(P.filter(x => x.o && !/Produção|SAP/.test(x.m) && !conhecidas.has(nk(x.o))).map(x => x.m + ':' + x.o), [], 'toda ordem citada nas outras páginas existe na Produção ou no SAP');
    console.log(`ok demonstração: ${P.length} citações de ordem/lote em ${[...new Set(P.map(x => x.m))].join(', ')} batem entre si`);
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
