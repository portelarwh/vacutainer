// C42/H03 · P8 (26/11/2026): os títulos dos quadros hora a hora da aba Meta OEE FY27 trazem o código da família com letras e dígitos
// (ex.: "FX1 - Janeiro/27"). A leitura da Produção (Importers.parseMetaFY27) e a da Administração (mofLer) reconhecem as mesmas famílias.
// Planilha montada em memória com a SheetJS incorporada; demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const TITULOS = ['FX1 - Janeiro/27', 'SST - Fevereiro/27', 'E2DTA – Março/2027'];
const planilha = TITULOS => { const A = []; TITULOS.forEach(t => { A.push([t, null, null], ['Horário', 'Meta', null], ['06:00 - 07:00', 1000, null], ['07:00 - 08:00', 1200, null], ['Total 85%', 2200, 2200], [null, null, null]); }); return A; };
async function frame(p, base, rota, titulo, pronto) {
  await p.goto(base + '/?demo=1#/' + rota);
  const q = p.locator(`iframe[title="Módulo ${titulo}"]`); await q.waitFor({ state: 'attached', timeout: 60000 });
  const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(pronto, null, { timeout: 60000 }); return f;
}
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    const fams = ['FX1', 'SST', 'E2DTA'], A = planilha(TITULOS);
    const fo = await frame(p, base, 'oee', 'Produção', () => window.vacPagina?.pronto() && typeof Importers !== 'undefined');
    const prod = await fo.evaluate(async ([A, fams]) => {
      const X = await Libs.loadXLSX(), wb = X.utils.book_new(); X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(A), 'Meta OEE FY27');
      const d = JSON.parse(JSON.stringify(db())); d.families = fams.map(c => ({ id: 'fam_' + c, code: c, name: 'Família ' + c, active: true }));
      const r = Importers.parseMetaFY27(X, wb, d); return { fams: [...new Set(r.recs.map(x => x.familyCode))].sort(), meses: r.recs.map(x => x.month).sort(), nao: (r.unrecognized || []).filter(x => /Título/.test(x)) };
    }, [A, fams]);
    const fa = await frame(p, base, 'portal', 'Administração', () => window.vacPagina?.pronto() && typeof mofLer === 'function');
    const adm = await fa.evaluate(async ([A, fams]) => {
      const X = await Libs.xlsx(), wb = X.utils.book_new(); X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(A), 'Meta OEE FY27');
      const D = JSON.parse(JSON.stringify(Cad.D)); D.familias = fams.map(c => ({ codigo: c, nome: 'Família ' + c, ativo: true }));
      const r = mofLer(X, wb, D); return { fams: [...new Set(r.recs.map(x => x.fam))].sort(), meses: r.recs.map(x => x.mes).sort(), nao: (r.naoLidas || []).filter(x => /Título/.test(x)) };
    }, [A, fams]);
    assert.deepEqual(prod.nao, [], 'a Produção reconhece todos os títulos: ' + JSON.stringify(prod));
    assert.deepEqual(prod.fams, ['E2DTA', 'FX1', 'SST'], JSON.stringify(prod));
    assert.deepEqual(adm.fams, prod.fams, 'Administração e Produção reconhecem as mesmas famílias: ' + JSON.stringify({ prod, adm }));
    assert.deepEqual(adm.meses, prod.meses, 'e os mesmos meses: ' + JSON.stringify({ prod, adm }));
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok Meta OEE FY27: títulos com código de letras e dígitos (FX1, E2DTA) lidos igual na Produção e na Administração: ' + JSON.stringify(prod.fams) + ' ' + JSON.stringify(prod.meses));
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
