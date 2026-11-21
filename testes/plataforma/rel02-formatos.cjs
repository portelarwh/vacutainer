// Plataforma 1.8.45 · REL-02 (pedido do responsável, 21/11/2026): todos os relatórios no mesmo formato de PDF e de e-mail para o Outlook.
// Demonstração: dados fictícios. O que este teste prova, para Produção (mês, dia e paradas), Waste, Paradas, Administração e Gestão de Gel:
//  1. "Copiar para Outlook" gera o e-mail no molde comum (vacEmail): tabela de 680 px, faixa e cabeçalho da marca, sem flex nem grid,
//     no máximo 4 cartões de indicador e o rodapé "Uso interno";
//  2. o PDF usa o cabeçalho e o rodapé comuns (vacPdf.cabecalho e vacPdf.rodape), com o título do relatório em caixa de frase;
//  3. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const PREP = () => {
  window.__clip = []; window.__pdf = [];
  navigator.clipboard.write = async it => { for (const i of it) if (i.types.includes('text/html')) window.__clip.push(await (await i.getType('text/html')).text()); };
  navigator.clipboard.writeText = async t => { window.__clip.push('TXT:' + t); };
  for (const f of ['cabecalho', 'rodape']) { const o = vacPdf[f]; vacPdf[f] = function (doc, a) { window.__pdf.push([f, f === 'cabecalho' ? a.titulo : a]); return o.apply(this, arguments); }; }
};
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await ctx.newPage(), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-19T10:00:00'));
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const frame = async (rota, nome) => {
      await page.goto(base + rota);
      const f = await (await page.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame();
      await f.waitForFunction(() => document.readyState === 'complete' && typeof vacPdf === 'object' && typeof vacEmail === 'object');
      await page.waitForTimeout(1500); await f.evaluate(PREP); return f;
    };
    const baixar = async (f, fn) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), f.evaluate(fn)]); return d.suggestedFilename(); };
    const conferirEmail = (h, nome) => {
      assert.ok(h && h.length > 500, nome + ': e-mail gerado');
      assert.match(h, /width="680"/, nome + ': moldura de 680 px');
      assert.match(h, /BD (·|&middot;) SISTEMAS DA LINHA VACUTAINER/i, nome + ': cabeçalho da marca');
      assert.match(h, /Uso interno/, nome + ': rodapé comum');
      assert.ok(!/display:\s*(flex|grid)/.test(h), nome + ': sem flex nem grid (o Outlook não lê)');
      const cartoes = (h.match(/border-left:4px solid/g) || []).length;
      assert.ok(cartoes <= 4, nome + ': no máximo 4 cartões de indicador (' + cartoes + ')');
    };
    const conferirPdf = async (f, nome, arquivo) => {
      const P = await f.evaluate(() => window.__pdf);
      const cab = P.filter(x => x[0] === 'cabecalho'), rod = P.filter(x => x[0] === 'rodape');
      assert.ok(cab.length >= 1 && rod.length === 1, nome + ': PDF com cabeçalho e rodapé comuns (' + arquivo + ')');
      assert.ok(cab[0][1] && cab[0][1] !== cab[0][1].toUpperCase(), nome + ': título em caixa de frase ("' + cab[0][1] + '")');
      console.log('ok', nome, '· PDF', arquivo, '· título "' + cab[0][1] + '" · rodapé "' + rod[0][1] + '"');
      await f.evaluate(() => { window.__pdf = []; });
    };

    // Produção: mês, dia e paradas
    let f = await frame('#/oee?tab=reports', 'Produção');
    for (const t of ['month', 'day', 'stops']) {
      await f.evaluate(t => { rpState().type = t; rpState().month = '2026-11'; rpState().date = '2026-11-09'; rpState().summary = null; render(); }, t);
      await page.waitForTimeout(1800);
      await f.evaluate(() => { window.__clip = []; document.querySelector('#rpOut').click(); });
      await f.waitForFunction(() => window.__clip.length > 0, null, { timeout: 30000 });
      conferirEmail((await f.evaluate(() => window.__clip))[0], 'Produção ' + t);
      await conferirPdf(f, 'Produção ' + t, await baixar(f, () => document.querySelector('#rpPdf').click()));
    }
    // Relatórios do molde Report: Waste, Paradas, Administração
    for (const [rota, nome, abrir] of [['#/perdas', 'Waste', () => Report.open(docMensal('2026-11'))], ['#/paradas', 'Paradas', () => Report.open(relParadas())], ['#/portal', 'Administração', () => Report.open(relDoc())]]) {
      f = await frame(rota, nome);
      await f.evaluate(abrir); await page.waitForTimeout(1200);
      await f.evaluate(() => { window.__clip = []; document.querySelector('[data-r="mail"]').click(); });
      await f.waitForFunction(() => window.__clip.length > 0, null, { timeout: 30000 });
      const h = (await f.evaluate(() => window.__clip))[0]; conferirEmail(h, nome); console.log('ok', nome, '· e-mail no molde comum (' + Math.round(h.length / 1024) + ' KB)');
      await conferirPdf(f, nome, await baixar(f, () => document.querySelector('[data-r="pdf"]').click()));
    }
    // Gestão de Gel: um PDF próprio do Gel (estoque, retrato)
    f = await frame('#/gel', 'Gestão de Gel');
    await f.evaluate(() => needLib('pdf'));
    await conferirPdf(f, 'Gestão de Gel', await baixar(f, () => { const { doc, name } = pdfEstoque(false); savePdf(name, doc.output('blob')); }));

    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
