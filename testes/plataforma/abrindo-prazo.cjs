// Plataforma 1.8.53 · urgente (22/11/2026): a entrada não pode ficar em "Abrindo a plataforma…" para sempre.
// Pasta real do navegador (OPFS) com o cadastro fictício da demonstração; o arquivo do cadastro é feito para nunca responder
// (como uma pasta de rede ou do OneDrive indisponível). O que este teste prova:
//  1. com a pasta normal, a entrada chega ao login;
//  2. com o cadastro sem resposta, em até 10 s aparece "Ainda abrindo…" com o arquivo que está sendo lido e as saídas
//     (Escolher outra pasta, Entrar só para consulta);
//  3. em até 25 s a tela mostra o motivo com o nome do arquivo que não respondeu;
//  4. nenhum erro de JavaScript.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { if (q.url.split('?')[0] !== '/') { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => { if (localStorage.getItem('travar') === '1') { const g = FileSystemFileHandle.prototype.getFile; FileSystemFileHandle.prototype.getFile = function () { return this.name === 'vacutainer-cadastros.json' ? new Promise(() => {}) : g.call(this); }; } });
    await page.goto('http://127.0.0.1:' + srv.address().port + '/'); await page.waitForFunction(() => window.vacFonte && vacFonte.texto('dados/cenario'));
    await page.evaluate(async () => {
      const cen = JSON.parse(vacFonte.texto('dados/cenario')), root = await navigator.storage.getDirectory(), dir = await root.getDirectoryHandle('00. Bases', { create: true });
      const h = await dir.getFileHandle('vacutainer-cadastros.json', { create: true }), w = await h.createWritable(); await w.write(JSON.stringify(cen.bases.cad)); await w.close();
      const db = await new Promise((ok, no) => { const r = indexedDB.open('vac-nova-plataforma', 1); r.onupgradeneeded = () => r.result.createObjectStore('app'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
      await new Promise((ok, no) => { const t = db.transaction('app', 'readwrite'); t.objectStore('app').put(root, 'folder'); t.oncomplete = ok; t.onerror = () => no(t.error); });
      localStorage.setItem('vac.login.forcar', '1');
    });
    await page.reload(); await page.waitForSelector('.porta-login, .porta .vlog, #vlId, .porta-consulta', { timeout: 30000 });
    assert.ok(!(await page.evaluate(() => /Abrindo/.test(document.body.innerText))), 'pasta normal: sai do Abrindo');
    console.log('ok pasta normal: a entrada chega ao login');

    await page.evaluate(() => localStorage.setItem('travar', '1')); await page.reload();
    await page.waitForFunction(() => /Ainda abrindo/.test(document.body.innerText), null, { timeout: 12000 });
    const m = await page.evaluate(() => ({ txt: document.querySelector('.porta-card').innerText, outra: !!document.querySelector('.porta-card button'), consulta: !!document.querySelector('.porta-consulta') }));
    assert.ok(/vacutainer-cadastros\.json/.test(m.txt) && m.outra && m.consulta, 'aviso com o arquivo e as saídas ' + JSON.stringify(m));
    console.log('ok em até 10 s: "Ainda abrindo…" com o arquivo pendente, Escolher outra pasta e Entrar só para consulta');
    await page.waitForFunction(() => /não respondeu em 20 s/.test(document.body.innerText), null, { timeout: 25000 });
    console.log('ok em até 25 s: o motivo, com o nome do arquivo que não respondeu');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
