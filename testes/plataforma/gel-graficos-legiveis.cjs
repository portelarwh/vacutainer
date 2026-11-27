// C52/K01 e C53/K02 (análise comum 26/11/2026; P9: operador e líder em Android comum, 360–412 px). Gestão de Gel › Visão geral:
// no tema escuro o rótulo branco dentro da barra tem contorno escuro (contraste do texto com o contorno ≥ 4,5:1, já que as barras ficam
// claras e o texto sobre elas dava 1,8:1); no celular nenhum texto dos gráficos fica abaixo de 10 px (antes 2,5 px) e a página não rola
// para o lado. Só aparência: números, filtros e períodos não mudam. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
async function medir(browser, base, largura, tema) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: 900 }, colorScheme: tema, timezoneId: 'UTC' }), p = await ctx.newPage(), erros = [];
  /* relógio fixo às 15:00 do dia: de madrugada o período padrão ainda não tem barras com rótulo */
  { const a = new Date(); await p.clock.setFixedTime(new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), 15, 0, 0))); }
  p.on('pageerror', e => erros.push(e.message));
  await ctx.addInitScript(t => { try { localStorage.setItem('vac.platform.demo.theme', t); } catch (e) { } }, tema);
  await p.goto(base + '/?demo=1#/gel'); const q = p.locator('iframe[title="Módulo Gestão de Gel"]'); await q.waitFor({ state: 'attached', timeout: 60000 });
  const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => window.vacPagina?.pronto?.() && document.querySelectorAll('svg.dbsvg').length >= 3, null, { timeout: 60000 }); await p.waitForTimeout(800);
  const r = await f.evaluate(() => {
    const rgb = c => (c.match(/[\d.]+/g) || []).map(Number).slice(0, 3), lum = c => { const m = rgb(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * m[0] + .7152 * m[1] + .0722 * m[2]; };
    const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const g = [];
    for (const s of document.querySelectorAll('svg.dbsvg')) { const k = s.getScreenCTM().a; let minPx = 99, rot = [];
      s.querySelectorAll('text').forEach(t => { if (!t.getClientRects().length) return; const cs = getComputedStyle(t); minPx = Math.min(minPx, parseFloat(cs.fontSize) * k);
        if (t.classList.contains('blbl')) rot.push(cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) >= 2 ? cr(cs.fill, cs.stroke) : 1); });
      g.push({ t: s.getAttribute('aria-label'), minPx: +minPx.toFixed(1), rotulos: rot.length, minContornoContraste: rot.length ? +Math.min(...rot).toFixed(2) : null }); }
    return { g, rolagem: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  const rolagemCasca = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await ctx.close(); return { ...r, rolagemCasca, erros };
}
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port;
    const escuro = await medir(browser, base, 1440, 'dark');
    const comRotulo = escuro.g.filter(x => x.rotulos);
    assert.ok(comRotulo.length >= 2, 'há gráficos com rótulo dentro da barra: ' + JSON.stringify(escuro.g));
    for (const x of comRotulo) assert.ok(x.minContornoContraste >= 4.5, 'rótulo das barras no escuro com contorno escuro: ' + JSON.stringify(x));
    assert.deepEqual(escuro.erros, []);
    console.log('ok tema escuro: rótulos dentro das barras com contorno escuro (contraste mínimo ' + Math.min(...comRotulo.map(x => x.minContornoContraste)) + ':1)');
    for (const [w, tema] of [[360, 'light'], [390, 'dark'], [412, 'light']]) {
      const m = await medir(browser, base, w, tema);
      for (const x of m.g) assert.ok(x.minPx >= 10, `${w} px: texto do gráfico "${x.t}" com ${x.minPx} px`);
      assert.ok(m.rolagem <= 1 && m.rolagemCasca <= 1, `${w} px: sem rolagem horizontal (${m.rolagem}, ${m.rolagemCasca})`);
      assert.deepEqual(m.erros, []);
      console.log(`ok celular ${w} px (${tema}): ${m.g.length} gráficos, menor texto ${Math.min(...m.g.map(x => x.minPx))} px, sem rolagem horizontal`);
    }
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
