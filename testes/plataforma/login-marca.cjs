// Plataforma 1.8.43 · tela de entrada sem a pasta da linha conectada: a foto de fundo (Marca/login (1).png…) e a logo
// (Marca/BD_2-Color_RGB.svg) aparecem pelo caminho ao lado do Plataforma.html, sem depender da pasta. A janela de login dos módulos
// também usa a logo da pasta Marca primeiro. Os arquivos daqui são fictícios (a marca não entra no repositório); sem eles, V e azul da marca.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48"><rect width="120" height="48" fill="#044ED7"/></svg>';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
function servidor(comMarca) {
  return http.createServer((q, r) => {
    const url = decodeURIComponent(q.url.split('?')[0]);
    if (url.startsWith('/Marca/')) {
      if (comMarca && url === '/Marca/BD_2-Color_RGB.svg') { r.setHeader('Content-Type', 'image/svg+xml'); return r.end(SVG); }
      if (comMarca && url === '/Marca/login (1).png') { r.setHeader('Content-Type', 'image/png'); return r.end(PNG); }
      r.statusCode = 404; return r.end();
    }
    if (/^https?:/.test(url)) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html);
  });
}
(async () => {
  const b = await chromium.launch();
  try {
    for (const comMarca of [true, false]) {
      const srv = servidor(comMarca); await new Promise(r => srv.listen(0, '127.0.0.1', r));
      const p = await b.newPage({ viewport: { width: 1280, height: 860 } }); const erros = []; p.on('pageerror', e => erros.push(String(e.message || e)));
      const base = 'http://127.0.0.1:' + srv.address().port + '/';
      await p.goto(base); await p.evaluate(() => localStorage.setItem('vac.login.forcar', '1')); await p.reload();
      await p.waitForSelector('.porta-card', { timeout: 30000 }); await p.waitForTimeout(1200);
      const r = await p.evaluate(() => { const im = document.querySelector('.porta-logo'), f = document.querySelector('.porta-fundo');
        return { logo: im ? im.naturalWidth > 0 : false, v: !!document.querySelector('.porta-v'), fotos: f ? +f.dataset.fotos : -1, pasta: !!(window.vacPasta && vacPasta.conectada && vacPasta.conectada()) }; });
      if (comMarca) { assert.ok(r.logo && !r.v, 'logo da pasta Marca no cartão de entrada, sem pasta conectada ' + JSON.stringify(r)); assert.equal(r.fotos, 1, 'foto de fundo da pasta Marca sem pasta conectada'); console.log('ok tela de entrada sem pasta conectada: logo e foto da pasta Marca'); }
      else { assert.ok(!r.logo && r.v && r.fotos === 0, 'sem a pasta Marca: V e azul da marca ' + JSON.stringify(r)); console.log('ok tela de entrada sem a pasta Marca: símbolo V e fundo azul, sem erro'); }
      if (comMarca) {
        await p.evaluate(() => { localStorage.removeItem('vac.login.forcar'); sessionStorage.setItem('vac.platform.consulta', '1'); }); await p.reload();
        await p.locator('.sidebar').getByRole('button', { name: 'Administração' }).first().click();
        const fr = await (await p.waitForSelector('iframe[title^="Módulo"]')).contentFrame(); await fr.waitForFunction(() => typeof vacLogin !== 'undefined');
        const j = await fr.evaluate(async () => { vacLogin.abrir({ trocar: true }); let im = null; for (let i = 0; i < 40 && !(im && im.complete && im.naturalWidth); i++) { await new Promise(r => setTimeout(r, 150)); im = document.querySelector('.vlog .vl-logo'); } return im ? { src: im.getAttribute('src'), ok: im.naturalWidth > 0 } : null; });
        assert.ok(j && j.ok && /^Marca\//.test(j.src), 'janela de login com a logo da pasta Marca ' + JSON.stringify(j)); console.log('ok janela de login com a logo da pasta Marca');
      }
      assert.deepEqual(erros, [], 'sem erro de JavaScript'); await p.close(); srv.close();
    }
    console.log('ok sem erro de JavaScript');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
