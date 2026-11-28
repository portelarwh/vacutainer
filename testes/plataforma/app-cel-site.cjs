// APP-CEL fase 4 (plataforma 1.8.105, Linha no celular 0.4; liberado pelo responsável em 28/11/2026): a página do app da linha para o
// GitHub Pages (scripts/celular-site.mjs; publicação em .github/workflows/app-linha.yml). Prova: só o código vai na página (sem cadastro
// embutido e sem os nomes de exemplo de máquinas e catálogos); sem cadastro, os módulos ficam desligados com o aviso; com o cadastro
// recebido (o mesmo pacote do QR ou arquivo da plataforma), os módulos abrem; manifesto de instalação; depois da primeira abertura,
// a página abre sem internet (service worker). Dados fictícios.
const { chromium, devices } = require('playwright'), http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert/strict'), { execFileSync } = require('child_process');
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'app-linha-site-'));
  execFileSync(process.execPath, [path.resolve(__dirname, '../../scripts/celular-site.mjs'), dir], { stdio: 'pipe' });
  const idx = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const f of ['manifest.webmanifest', 'sw.js', 'icone.svg', 'versao.json', '.nojekyll']) assert.ok(fs.existsSync(path.join(dir, f)), f + ' na página');
  for (const w of ['Tullip', 'Kallfass', 'Cap Placer', 'Evacuator', 'Vacutainer', '100234567']) assert.ok(!idx.includes(w), 'a página não leva "' + w + '"');
  const man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.webmanifest'), 'utf8')); assert.equal(man.display, 'standalone'); assert.equal(man.start_url, './');
  console.log(`ok página montada (${Math.round(idx.length / 1024)} KB): index, manifesto, service worker e ícone; sem nomes da linha`);
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(dir, u === '/' ? 'index.html' : u.slice(1));
    if (!f.startsWith(dir) || !fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', tipos[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port + '/', erros = [], externos = [];
    const cel = await browser.newContext({ ...devices['Pixel 7'], timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
    await cel.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, r => { externos.push(r.request().url()); r.abort(); });
    const m = await cel.newPage(); m.on('pageerror', e => erros.push(e.message)); m.on('dialog', d => d.accept());
    await m.goto(base); await m.locator('#semcad').waitFor();
    const mods = await m.evaluate(() => [VAC_MODS.op, VAC_MODS.man].map(h => /const CFG_EMB=\/\*CFG\*\/null\/\*CFG\*\//.test(h)));
    assert.deepEqual(mods, [true, true], 'os dois apps sem cadastro embutido');
    assert.ok(await m.locator('[data-m="op"]').isDisabled() && await m.locator('[data-m="man"]').isDisabled(), 'sem cadastro, os módulos ficam desligados');
    assert.equal(await m.locator('link[rel="manifest"]').getAttribute('href'), 'manifest.webmanifest');
    console.log('ok sem cadastro: aviso "receba o cadastro da linha" e Operação e Manutenção desligadas');

    // cadastro recebido (o mesmo pacote que a plataforma manda por QR ou arquivo)
    const o = { a: 'linha-cadastro', v: 1, id: 'abc123', meta: { linha: 'Linha Fictícia', geradoEm: '2026-11-28T10:00:00.000Z', cadRev: 3 },
      op: { linha: 'Linha Fictícia', unidade: 'mil', junta: 45, turnos: [{ c: 'T1', n: 'Turno 1', i: '06:00', f: '14:00' }, { c: 'T2', n: 'Turno 2', i: '14:00', f: '22:00' }, { c: 'T3', n: 'Turno 3', i: '22:00', f: '06:00' }],
        cats: [{ c: 'C1', n: 'Produto fictício', meta: 40, gel: 0 }], maqs: ['Máquina fictícia'], maqsCod: { 'Máquina fictícia': 'MF1' }, motivos: ['Setup'], motivosCod: { Setup: 'S1' }, pessoas: [{ id: '9001', n: 'Pessoa Fictícia', t: 'T1' }], scrapGel: ['Purga'], modeloWa: '', fonte: { cadRev: 3, geradoEm: '2026-11-28T10:00:00.000Z' }, rev: Date.now() },
      man: { linha: 'Linha Fictícia', maqs: [{ c: 'MF1', n: 'Máquina fictícia' }], modos: [], pessoas: [], fonte: { cadRev: 3 }, rev: Date.now() } };
    await m.click('#atu'); await m.setInputFiles('#arq', { name: 'cadastro-linha.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(o)) });
    await m.locator('h1', { hasText: 'Cadastro atualizado' }).waitFor({ timeout: 10000 }); await m.click('#volta');
    assert.equal(await m.locator('#semcad').count(), 0); assert.ok(!(await m.locator('[data-m="op"]').isDisabled()));
    await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor(); assert.match(await m.locator('header h1').first().innerText(), /Linha Fictícia/);
    console.log('ok com o cadastro recebido pelo arquivo, os módulos ligam e a Operação abre com a linha do cadastro');

    // instalada e sem internet
    await m.goto(base); await m.evaluate(() => navigator.serviceWorker.ready); await m.reload(); await m.evaluate(() => navigator.serviceWorker.ready);
    await m.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
    await cel.setOffline(true); await m.reload(); await m.locator('[data-m="op"]').waitFor({ timeout: 15000 });
    await m.click('[data-m="op"]'); await m.locator('#lancar').waitFor();
    console.log('ok depois da primeira abertura, a página abre sem internet (service worker) e o módulo funciona');
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); assert.deepEqual(externos, [], 'sem pedido à internet');
  } finally { if (browser) await browser.close(); srv.close(); fs.rmSync(dir, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
