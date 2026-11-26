const { chromium } = require('/home/user/vacutainer/node_modules/playwright'), http = require('http'), fs = require('fs');
const html = fs.readFileSync('/home/user/vacutainer/Plataforma.html');
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(require('/home/user/vacutainer/testes/plataforma/chromium.cjs')({}));
  const out = { tamanhoKB: Math.round(html.length / 1024) };
  const medir = async (rot, hash) => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(); await p.clock.setFixedTime(new Date('2026-11-09T15:00:00Z'));
    const t0 = Date.now(); await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1' + hash, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('iframe', { state: 'attached', timeout: 60000 }).catch(() => {}); await p.waitForLoadState('load'); const tLoad = Date.now() - t0;
    await p.waitForFunction(() => [...document.querySelectorAll('iframe')].some(f => { try { return f.contentWindow.vacPagina && f.contentWindow.vacPagina.pronto(); } catch (e) { return false; } }), null, { timeout: 40000 }).catch(() => {});
    const dt = Date.now() - t0;
    const m = await p.evaluate(() => ({ nos: document.getElementsByTagName('*').length, iframes: document.querySelectorAll('iframe').length, nosFrames: [...document.querySelectorAll('iframe')].map(f => { try { return f.title + ':' + f.contentDocument.getElementsByTagName('*').length; } catch (e) { return f.title + ':?'; } }), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, recursos: performance.getEntriesByType('resource').length }));
    out[rot] = { loadMs: tLoad, prontoMs: dt, ...m }; await ctx.close();
  };
  await medir('inicio', '#/inicio'); await medir('producao', '#/oee'); await medir('gel', '#/gel'); await medir('admin', '#/portal');
  console.log(JSON.stringify(out, null, 1)); await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
