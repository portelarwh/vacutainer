// Linha 360° 1.7.1 · PDF leve (pedido do responsável, 23/11/2026): o Chrome não copia WebP para o PDF e guarda os pixels sem compressão
// (foto de ~430 KB virava ~4,4 MB). Na impressão do formulário A4 as fotos devem ir como JPEG de até 1200 px; a foto gravada continua WebP,
// o texto fica selecionável e o PDF não passa de ~1,5 vez o peso dos JPEG. Fotos fictícias geradas no navegador.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('teste'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.getByRole('button', { name: 'Relatórios e formulários' }).first().click();
    await page.getByRole('tab', { name: 'Formulários' }).or(page.getByRole('button', { name: 'Formulários', exact: true })).first().click();
    const fr = await (await page.locator('iframe[title="Módulo Linha 360°"]').elementHandle()).contentFrame();
    await fr.waitForSelector('#fmNovo'); await fr.click('#fmNovo');
    await fr.fill('#fmTitulo', 'PDF leve (teste)');
    // 4 fotos com textura (ruído), 2000 × 1500 px: a gravação reduz para 1600 px WebP
    const fotos = await fr.evaluate(() => [0, 1, 2, 3].map(i => { const cv = document.createElement('canvas'); cv.width = 2000; cv.height = 1500; const x = cv.getContext('2d');
      const g = x.createLinearGradient(0, 0, 2000, 1500); g.addColorStop(0, '#345'); g.addColorStop(.5 + i / 20, '#a86'); g.addColorStop(1, '#cde'); x.fillStyle = g; x.fillRect(0, 0, 2000, 1500);
      for (let k = 0; k < 200; k++) { x.fillStyle = `hsla(${Math.random() * 360},40%,50%,.5)`; x.beginPath(); x.arc(Math.random() * 2000, Math.random() * 1500, 10 + Math.random() * 120, 0, 7); x.fill(); }
      const d = x.getImageData(0, 0, 2000, 1500); for (let p = 0; p < d.data.length; p += 4) { const n = (Math.random() - .5) * 28; d.data[p] += n; d.data[p + 1] += n; d.data[p + 2] += n; } x.putImageData(d, 0, 0);
      return cv.toDataURL('image/png').split(',')[1]; }));
    await fr.setInputFiles('#fmArq', fotos.map((b, i) => ({ name: 'f' + i + '.png', mimeType: 'image/png', buffer: Buffer.from(b, 'base64') })));
    await fr.waitForSelector('#fmEdModal #edSvg'); await fr.click('#edOk');
    const gravada = await fr.evaluate(async () => Promise.all(App.fm.d.fotos.map(async f => (await (await fetch(await fmUrl(f))).blob()).type)));
    assert.deepEqual(gravada, ['image/webp', 'image/webp', 'image/webp', 'image/webp'], 'a foto guardada continua WebP');
    const r = await fr.evaluate(async () => {
      window.print = () => {}; fmImprimir(); await new Promise(x => setTimeout(x, 2500));
      const out = [];
      for (const im of document.querySelectorAll('#fmPrint img[data-fid]')) { const b = await (await fetch(im.src)).blob(); const bm = await createImageBitmap(b); out.push({ tipo: b.type, kb: Math.round(b.size / 1024), w: bm.width, h: bm.height, url: await new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); }) }); }
      return { texto: !!document.querySelector('#fmPrint .fm-pg'), fotos: out };
    });
    assert.ok(r.texto && r.fotos.length >= 4, 'a folha tem as fotos: ' + r.fotos.length);
    for (const f of r.fotos) { assert.equal(f.tipo, 'image/jpeg', 'na impressão a foto é JPEG'); assert.ok(Math.max(f.w, f.h) <= 1200, 'até 1200 px: ' + f.w + '×' + f.h); }
    console.log('ok impressão: ' + r.fotos.length + ' fotos em JPEG de até 1200 px (' + r.fotos.map(f => f.kb + ' KB').join(', ') + '); a gravada segue WebP');
    // o PDF de verdade: o peso fica perto do peso dos JPEG (WebP viraria ~10 vezes mais)
    const p2 = await browser.newPage(); await p2.setContent('<style>@page{size:A4;margin:10mm}img{width:190mm;display:block;page-break-inside:avoid}</style>' + r.fotos.map(f => '<img src="' + f.url + '">').join(''));
    const pdf = await p2.pdf({ format: 'A4' }), soma = r.fotos.reduce((s, f) => s + f.kb, 0);
    assert.ok(pdf.length / 1024 < soma * 1.5 + 100, 'PDF leve: ' + Math.round(pdf.length / 1024) + ' KB para ' + soma + ' KB de JPEG');
    console.log('ok PDF com ' + r.fotos.length + ' fotos: ' + Math.round(pdf.length / 1024) + ' KB (JPEG somam ' + soma + ' KB)');
    assert.deepEqual(erros, [], 'sem erro de página: ' + erros.join(' | '));
    console.log('sem erros');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error('FALHA', e.message); process.exit(1); });
