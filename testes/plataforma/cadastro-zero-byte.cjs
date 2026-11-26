// E02 (26/11/2026, decisão do responsável): vacutainer-cadastros.json com exatamente 0 bytes (gravação interrompida) conta como ausente.
// A porta oferece "Criar o cadastro inicial", a Administração grava a rev 1 por cima do arquivo vazio e a pessoa chega ao login.
// Arquivo com conteúdo inválido continua erro (não vira ausente) e fica como estava. Dados fictícios; pasta em memória (OPFS).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
async function abrir(browser, url, pasta, conteudo) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.type() === 'beforeunload' ? d.accept() : d.accept('Pessoa Fictícia'));
  await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
  await p.goto(url + '/#/inicio');
  await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).waitFor({ timeout: 30000 });
  await p.evaluate(async ([pasta, conteudo]) => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle(pasta, { create: true }), d = await root.getDirectoryHandle('00. Bases', { create: true }); const w = await (await d.getFileHandle('vacutainer-cadastros.json', { create: true })).createWritable(); await w.write(conteudo); await w.close(); window.showDirectoryPicker = async () => root; }, [pasta, conteudo]);
  await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).click();
  return { ctx, p, erros };
}
const ler = (p, pasta) => p.evaluate(async pasta => { const r = await (await navigator.storage.getDirectory()).getDirectoryHandle(pasta), d = await r.getDirectoryHandle('00. Bases'); return (await (await d.getFileHandle('vacutainer-cadastros.json')).getFile()).text(); }, pasta);
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const url = 'http://127.0.0.1:' + srv.address().port;

    // 1) 0 bytes: sem erro de leitura, a porta oferece a criação inicial e ela conclui
    const a = await abrir(browser, url, 'Zero-Byte-Ficticio', '');
    const criar = a.p.locator('.porta-card').getByRole('button', { name: /Criar o cadastro inicial/ });
    await criar.waitFor({ timeout: 30000 });
    const txt = await a.p.locator('.porta-card').innerText();
    assert.match(txt, /Cadastro não encontrado/); assert.doesNotMatch(txt, /Unexpected end|JSON válido|Cadastro geral:/i, 'arquivo vazio não aparece como erro de JSON: ' + txt);
    console.log('ok 0 bytes: a porta mostra "Cadastro não encontrado" sem erro de JSON e oferece a criação inicial');
    await a.p.evaluate(() => localStorage.setItem('vac.app.' + vacAppHost.scope + '.vac.login.forcar', '1'));
    await criar.click();
    const f = await (await a.p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    await f.waitForSelector('#cnId', { timeout: 30000 }); await a.p.waitForTimeout(2500);
    assert.equal(await f.evaluate(() => Cad.fonte), 'nenhum', 'a Administração trata o arquivo vazio como ausente');
    await f.evaluate(() => { document.querySelector('#cnId').value = '9001'; document.querySelector('#cnNome').value = 'Admin Fictício'; document.querySelector('#cnS1').value = '482915'; document.querySelector('#cnS2').value = '482915'; document.querySelector('#cadNovoVazio').click(); });
    await a.p.waitForFunction(() => document.querySelector('.porta-login'), null, { timeout: 30000 });
    const doc = JSON.parse(await ler(a.p, 'Zero-Byte-Ficticio'));
    assert.equal(doc.rev, 1); assert.equal(doc.usuarios.length, 1); assert.equal(doc.usuarios[0].perfil, 'ADMIN');
    assert.deepEqual(a.erros, [], 'sem erro de JavaScript');
    console.log('ok 0 bytes: o cadastro inicial é gravado por cima (rev 1, um administrador) e a tela vai para o login');
    await a.ctx.close();

    // 2) conteúdo inválido (não vazio) continua erro: nada é gravado por cima
    const b = await abrir(browser, url, 'Cadastro-Corrompido-Ficticio', '{"schema":"vac-cad');
    await b.p.locator('.porta-card').getByRole('button', { name: /Criar o cadastro inicial/ }).waitFor({ timeout: 30000 });
    assert.match(await b.p.locator('.porta-card').innerText(), /Cadastro geral:/, 'JSON inválido mostra o erro de leitura');
    assert.equal(await ler(b.p, 'Cadastro-Corrompido-Ficticio'), '{"schema":"vac-cad', 'o arquivo corrompido fica como estava');
    console.log('ok conteúdo inválido: continua erro de leitura na entrada e o arquivo fica como estava');
    await b.ctx.close();
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
