process.env.CAD_VAZIO = '1';
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), wt = process.argv[2];
(async () => {
  const fx = JSON.parse(fs.readFileSync(path.join(wt, '.test-cache/fixtures.json'))), html = fs.readFileSync(path.join(wt, 'Plataforma.html'));
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require(path.join(wt, 'testes/plataforma/chromium.cjs'))()), ctx = await b.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(); p.on('dialog', d => d.accept());
  await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
  await p.goto('http://127.0.0.1:' + srv.address().port + '/#/inicio'); await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).waitFor({ timeout: 30000 });
  await p.evaluate(async () => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Zero-Byte', { create: true }), d = await root.getDirectoryHandle('00. Bases', { create: true }); const w = await (await d.getFileHandle('vacutainer-cadastros.json', { create: true })).createWritable(); await w.write(''); await w.close(); window.showDirectoryPicker = async () => root; });
  await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).click(); await p.waitForTimeout(4000);
  const txt = (await p.locator('.porta-card').innerText()).replace(/\s+/g, ' ').slice(0, 500); const btns = await p.locator('.porta-card button').allInnerTexts();
  await p.evaluate(() => localStorage.setItem('vac.app.' + vacAppHost.scope + '.vac.login.forcar', '1'));
  await p.locator('.porta-card').getByRole('button', { name: /Criar o cadastro inicial/ }).click();
  await p.waitForTimeout(20000); const apos = (await p.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 700); const tam = await p.evaluate(async () => { const r = await (await navigator.storage.getDirectory()).getDirectoryHandle('Zero-Byte'), d = await r.getDirectoryHandle('00. Bases'), fh = await d.getFileHandle('vacutainer-cadastros.json'); return (await fh.getFile()).size; }); const ifr = await p.locator('iframe').count();
  console.log(JSON.stringify({ apos, tam, ifr })); await b.close(); srv.close(); return;
  console.log(JSON.stringify({ txt: txt.slice(0, 120), msgs, fm: fm.slice(0, 300), tamanhoDoArquivoDepois: tam })); await b.close(); srv.close();
})().catch(e => { console.error(e.message.slice(0, 400)); process.exit(1); });
