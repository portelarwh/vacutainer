// C46/I07 (análise comum 26/11/2026): planilha (SheetJS) e PDF (jsPDF/AutoTable) vêm só do código incorporado ao HTML. Os carregadores
// dos motores não listam a pasta lib/ nem endereços da internet, as mensagens não pedem para copiar arquivos ou ligar a internet, e cada
// carregador funciona de fato, sem nenhum pedido externo. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const helpers = require('../../scripts/html.cjs');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html')), fontes = helpers.parse(html.toString());

// 1) estática: nenhum motor carrega biblioteca de CDN ou da pasta lib/
const proibido = /cdnjs\.cloudflare\.com|cdn\.sheetjs\.com|cdn\.jsdelivr\.net|unpkg\.com|['"]lib\/(xlsx|jspdf)[^'"]*['"]\s*[,\]).]|ao lado do HTML ou conecte-se|conexão com a internet \(ou a pasta lib/;
const achados = [];
for (const [id, txt] of fontes) if (id.startsWith('motor/')) txt.split('\n').forEach((l, i) => { if (proibido.test(l) && !/VERS_LIBS=/.test(l)) achados.push(id + ':' + (i + 1) + ' ' + l.trim().slice(0, 120)); });
assert.deepEqual(achados, [], 'carregador de biblioteca com lib/ ou internet:\n' + achados.join('\n'));
console.log('ok nenhum motor lista a pasta lib/ ou a internet para carregar SheetJS ou jsPDF');

(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port, ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [], externos = [];
    p.on('pageerror', e => erros.push(e.message)); ctx.on('request', r => { const u = r.url(); if (!/^(data|blob|about):/.test(u) && !u.startsWith(base)) externos.push(u); });
    // 2) cada carregador entrega a biblioteca (motor, título do módulo, chamada)
    const casos = [
      ['portal', 'Administração', 'Promise.all([Libs.xlsx(), Libs.pdf()]).then(([x, P]) => [x.version, typeof P])'],
      ['oee', 'Produção', 'Promise.all([Libs.loadXLSX(), Libs.loadPDF()]).then(([x, P]) => [x.version, typeof P])'],
      ['perdas', 'Waste', 'Promise.all([loadXLSX(), Libs.xlsx(), Libs.pdf()]).then(([x, y, P]) => [x.version, typeof P])'],
      ['gel', 'Gestão de Gel', 'Promise.all([needLib("xlsx"), needLib("pdf")]).then(([a, b]) => [a && window.XLSX.version, b && typeof window.jspdf.jsPDF])'],
      ['paradas', 'Paradas', 'Promise.all([loadXLSX(), RepLibs.pdf()]).then(([x, P]) => [x.version, typeof P])']];
    const r = {};
    for (const [m, t, chamada] of casos) {
      await p.goto(base + '/?demo=1#/' + m);
      const q = p.locator(`iframe[title="Módulo ${t}"]`); await q.waitFor({ state: 'attached', timeout: 60000 });
      const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto?.(), null, { timeout: 60000 });
      r[m] = await f.evaluate(c => (0, eval)(c).catch(e => 'ERRO ' + e.message), chamada);
    }
    for (const [m] of casos) assert.deepEqual(r[m], ['0.20.3', 'function'], m + ': ' + JSON.stringify(r));
    assert.deepEqual(externos, [], 'nenhum pedido fora do próprio arquivo');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok SheetJS 0.20.3 e jsPDF carregam do código incorporado em Administração, Produção, Waste, Gel e Paradas, sem pedido externo');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
