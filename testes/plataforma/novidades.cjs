// Plataforma 1.8.30 (Administração 1.9.53) · NOV-01: Administração › Novidades, o que mudou em cada versão em frases curtas.
// Regra: toda versão nova da plataforma ganha uma entrada; este teste reprova se a versão do rodapé não for a primeira das Novidades.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    const versao = (await page.locator('text=/Plataforma \\d+\\.\\d+\\.\\d+/').first().textContent()).match(/\d+\.\d+\.\d+/)[0];
    await page.evaluate(() => { location.hash = '#/portal'; });
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame(); await f.waitForFunction(() => typeof Cad !== 'undefined');
    await f.click('.cadside [data-sec="novidades"]'); await page.waitForTimeout(500);
    const r = await f.evaluate(() => ({ hash: location.hash, titulo: (document.querySelector('#cadMain h3') || {}).textContent || '', versoes: [...document.querySelectorAll('.nov-v h3')].map(h => h.textContent.match(/\d+\.\d+\.\d+/)[0]),
      tipos: [...new Set([...document.querySelectorAll('.nov-l .pill')].map(p => p.textContent))], itens: document.querySelectorAll('.nov-l li').length, primeira: NOVIDADES[0].v }));
    assert.match(r.titulo, /Novidades/); assert.equal(r.hash, '#cadastros/novidades');
    assert.equal(r.primeira, versao, `a versão ${versao} da plataforma precisa ser a primeira entrada das Novidades (Administração › Novidades)`);
    assert.equal(r.versoes[0], versao); assert.ok(r.versoes.length >= 10 && r.itens >= r.versoes.length);
    assert.deepEqual([...r.versoes].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })), r.versoes, 'mais recente primeiro');
    for (const t of r.tipos) assert.ok(['Novo', 'Melhoria', 'Correção'].includes(t), t);
    console.log(`ok Administração › Novidades: ${r.versoes.length} versões, a mais recente (${versao}) é a da plataforma; itens Novo / Melhoria / Correção`);
    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok novidades: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
