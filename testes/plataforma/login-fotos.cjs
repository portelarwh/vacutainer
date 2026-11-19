// Plataforma 1.8.22 · LOGIN-FOTOS: fundo da tela de entrada menos desfocado e com várias fotos (Marca/login1, login2, login3…), trocando
// a cada 3 s com transição; a busca para no primeiro número que falta; sem fotos numeradas fica o login.png/azul de antes; com "menos
// movimento" no sistema não troca. Fotos fictícias geradas aqui (1 pixel de cor), nada fica no repositório.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const PX = { // PNG de 1 pixel (vermelho, verde, azul): o JPG fictício é servido com o mesmo conteúdo (o navegador lê pelo conteúdo)
  r: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  g: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg+M8AAAMBAQCxGYtgAAAAAElFTkSuQmCC',
  b: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC' };
(async () => {
  let fotos = {}; const pedidos = [];
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]);
    if (u.startsWith('/Marca/')) { pedidos.push(u); const f = fotos[u.slice(7)]; if (!f) { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', /\.jpg$/.test(u) ? 'image/jpeg' : /\.webp$/.test(u) ? 'image/webp' : 'image/png'); return r.end(Buffer.from(f, 'base64')); }
    r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = 'http://127.0.0.1:' + srv.address().port + '/';
    browser = await chromium.launch(require('./chromium.cjs')());
    const abrir = async (opts = {}) => { const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts }), p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
      await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });   // a tela de entrada não aparece em teste automático sem isto
      await p.goto(url + '#/oee'); await p.locator('.porta-card').waitFor(); return { ctx, p, erros }; };
    const estado = p => p.evaluate(() => { const f = document.querySelector('.porta-fundo'); return { n: +(f.dataset.fotos || 0), on: [...f.querySelectorAll('.porta-foto')].findIndex(x => x.classList.contains('on')), blur: getComputedStyle(f).filter }; });

    // 1) login1.png, login2.png e login3.jpg (sem login4): três fotos, a busca para no 4; desfoque menor (4px)
    fotos = { 'login1.png': PX.r, 'login2.jpg': PX.g, 'login3.webp': PX.b };
    { const { ctx, p, erros } = await abrir(); await p.waitForFunction(() => +document.querySelector('.porta-fundo').dataset.fotos === 3, null, { timeout: 10000 });
      const a = await estado(p); assert.equal(a.n, 3); assert.equal(a.on, 0); assert.match(a.blur, /blur\(4px\)/, 'desfoque menor ' + a.blur);
      assert.ok(pedidos.some(u => u === '/Marca/login4.webp') && !pedidos.some(u => /login5/.test(u)), 'a busca para no primeiro número que falta');
      await p.waitForTimeout(3300); const b = await estado(p); await p.waitForTimeout(3100); const c = await estado(p); await p.waitForTimeout(3100); const d = await estado(p);
      assert.deepEqual([b.on, c.on, d.on], [1, 2, 0], 'troca a cada 3 s e volta à primeira');
      assert.deepEqual(erros, []); await ctx.close(); }
    console.log('ok três fotos (login1.png, login2.jpg, login3.webp): trocam a cada 3 s e voltam à primeira; desfoque 4px; busca para no login4');

    // 2) menos movimento no sistema: só a primeira foto, sem troca
    { const { ctx, p } = await abrir({ reducedMotion: 'reduce' }); await p.waitForFunction(() => +document.querySelector('.porta-fundo').dataset.fotos === 3, null, { timeout: 10000 });
      await p.waitForTimeout(3500); assert.equal((await estado(p)).on, 0, 'sem troca com menos movimento'); await ctx.close(); }
    console.log('ok "menos movimento" no sistema: fica a primeira foto');

    // 3) sem fotos numeradas: nenhuma camada de foto (vale o login.png/login.svg ou o azul, como antes)
    fotos = {};
    { const { ctx, p } = await abrir(); await p.waitForTimeout(1200); const e = await estado(p); assert.equal(e.n, 0);
      assert.match(await p.evaluate(() => getComputedStyle(document.querySelector('.porta-fundo')).backgroundImage), /login\.png/); await ctx.close(); }
    console.log('ok sem login1…: vale o login.png ou login.svg (ou o azul), como antes');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
