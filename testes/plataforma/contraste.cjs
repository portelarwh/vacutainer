// T1 (16/11/2026): contraste renderizado (texto × fundo efetivo) na casca e nos nove módulos, nos dois temas, na demonstração.
// Mínimo WCAG AA: 4,5:1 (3:1 para texto grande). Os módulos são abertos em sequência, como a pessoa faz: é assim que um
// módulo fica com tema diferente do da casca (achado A1 da revisão da PR #77). Reprova qualquer texto abaixo do mínimo.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const NOMES = { oee: 'Produção', perdas: 'Waste', gel: 'Gestão de Gel', paradas: 'Paradas', equip: 'Equipamentos', inic: 'Iniciativas / Ações', linha: 'Linha 360°', portal: 'Administração', projetos: 'Projetos' };

function sonda() {
  // cores computadas: rgb()/rgba() e color(srgb …) (resultado de color-mix)
  const cor = c => { let m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[, /]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; }
    m = c.match(/color\(srgb ([^)]+)\)/); if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] === undefined ? 1 : p[3] }; } return null; };
  const lum = c => { const f = x => { x /= 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const sobre = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const fundo = el => { const pilha = []; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage && s.backgroundImage !== 'none') return null;
      const c = cor(s.backgroundColor); if (c && c.a > 0) { pilha.push(c); if (c.a >= 1) break; } }
    let b = { r: 255, g: 255, b: 255, a: 1 }; for (const c of pilha.reverse()) b = sobre(c, b); return b; };
  const ruins = new Map(); let n = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) {
    const txt = t.nodeValue.trim(); if (txt.length < 2) continue; const el = t.parentElement;
    if (!el || !el.getClientRects().length || el.closest('svg,script,style,[hidden],[aria-hidden="true"],option')) continue;
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity === 0) continue;
    const f0 = cor(s.color), b = fundo(el); if (!f0 || !b) continue; const f = sobre(f0, b);
    const x = lum(f), y = lum(b), cr = (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
    const px = parseFloat(s.fontSize), grande = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700); n++;
    if (cr < (grande ? 3 : 4.5)) { const k = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '');
      const r = ruins.get(k) || { n: 0, cr, ex: txt.slice(0, 30) }; r.n++; if (cr < r.cr) Object.assign(r, { cr, ex: txt.slice(0, 30) }); ruins.set(k, r); }
  }
  return { n, ruins: [...ruins].map(([k, r]) => `${k} ×${r.n} ${r.cr.toFixed(2)}:1 "${r.ex}"`) };
}

(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()); const falhas = [];
  try {
    for (const tema of ['light', 'dark']) {
      const c = await b.newContext({ viewport: { width: 1440, height: 1000 } }); await c.addInitScript(t => localStorage.setItem('vac.platform.demo.theme', t), tema);
      const p = await c.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1'); await p.waitForTimeout(1500);
      const casca = await p.evaluate(sonda); casca.ruins.forEach(x => falhas.push(`${tema} casca: ${x}`));
      let medidos = casca.n;
      for (const id of Object.keys(NOMES)) {
        await p.evaluate(id => location.hash = '#/' + id, id); const el = p.locator('iframe[title="Módulo ' + NOMES[id] + '"]'); await el.first().waitFor({ timeout: 30000 });
        const fr = await (await el.first().elementHandle()).contentFrame(); await fr.waitForFunction(() => window.vacPagina && vacPagina.pronto(), null, { timeout: 30000 }); await p.waitForTimeout(800);
        const r = await fr.evaluate(sonda); medidos += r.n; r.ruins.forEach(x => falhas.push(`${tema} ${id}: ${x}`));
      }
      assert.deepEqual(erros, [], tema + ': erro de página');
      console.log(`ok ${tema}: ${medidos} textos medidos na casca e nos nove módulos`);
      await c.close();
    }
    assert.deepEqual(falhas, [], 'texto abaixo do contraste mínimo (WCAG AA):\n' + falhas.join('\n'));
    console.log('ok contraste: nenhum texto abaixo de 4,5:1 (3:1 grande) nos dois temas');
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
