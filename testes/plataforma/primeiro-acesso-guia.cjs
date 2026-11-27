// Primeiro acesso (1.8.96, pedido do responsável em 27/11/2026): na tela de entrada, o botão "Primeiro acesso" abre um guia que confere
// sozinho cada etapa e mostra OK: navegador, pasta, permissão de gravação, cadastro e entrada. Usa as mesmas ações da entrada (conectar,
// permissão, "Criar o cadastro inicial", exceção do primeiro uso, contrato 4). Pasta fictícia em OPFS; dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/');
    const card = p.locator('.porta-card');
    await card.getByRole('button', { name: /Conectar pasta da linha/ }).waitFor({ timeout: 30000 });
    const estados = () => p.$$eval('.porta-guia li', ls => ls.map(l => l.querySelector('b').firstChild.textContent.trim() + ':' + l.dataset.estado));
    await card.getByRole('button', { name: 'Primeiro acesso' }).click();
    await p.locator('.porta-guia').waitFor();
    assert.deepEqual(await estados(), ['Navegador:ok', 'Pasta da linha:agora', 'Permissão de gravação:espera', 'Cadastro de usuários:espera', 'Entrar:espera']);
    assert.match(await card.innerText(), /1 de 5 etapas prontas/);
    console.log('ok o guia abre pela entrada: navegador OK e a próxima etapa é escolher a pasta');

    // pasta escolhida, ainda sem permissão de gravação: o guia pede a permissão
    await p.evaluate(async () => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Guia-Ficticia', { create: true }); let perm = 'prompt';
      root.queryPermission = async () => perm; root.requestPermission = async () => (perm = 'granted'); window.showDirectoryPicker = async () => root; });
    await card.getByRole('button', { name: 'Escolher a pasta' }).click();
    await p.waitForFunction(() => document.querySelectorAll('.porta-guia li')[2]?.dataset.estado === 'agora', null, { timeout: 30000 });
    assert.deepEqual((await estados()).slice(1, 3), ['Pasta da linha:ok', 'Permissão de gravação:agora']);
    assert.match(await card.innerText(), /Pasta: Pasta-Guia-Ficticia/);
    console.log('ok pasta escolhida: OK com o nome; a permissão de gravação fica como a etapa da vez');

    await card.getByRole('button', { name: 'Permitir gravação' }).click();
    await p.waitForFunction(() => document.querySelectorAll('.porta-guia li')[3]?.dataset.estado === 'agora', null, { timeout: 30000 });
    assert.deepEqual(await estados(), ['Navegador:ok', 'Pasta da linha:ok', 'Permissão de gravação:ok', 'Cadastro de usuários:agora', 'Entrar:espera']);
    assert.match(await card.innerText(), /3 de 5 etapas prontas/);
    console.log('ok permissão dada: OK; a pasta vazia pede o cadastro inicial');

    // o botão do guia leva ao formulário do primeiro administrador (o mesmo da entrada)
    await p.evaluate(() => localStorage.setItem('vac.app.' + vacAppHost.scope + '.vac.login.forcar', '1'));
    await card.getByRole('button', { name: 'Criar o cadastro inicial' }).click();
    const f = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    await f.waitForSelector('#cnId', { timeout: 30000 }); await p.waitForTimeout(2500);
    await f.evaluate(() => { document.querySelector('#cnId').value = '9001'; document.querySelector('#cnNome').value = 'Admin Fictício'; document.querySelector('#cnS1').value = '482915'; document.querySelector('#cnS2').value = '482915'; document.querySelector('#cadNovoVazio').click(); });
    await p.waitForFunction(() => document.querySelector('.porta-login'), null, { timeout: 30000 });
    const fl = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    await fl.waitForSelector('.vlog #vlId', { timeout: 30000 });
    console.log('ok "Criar o cadastro inicial" do guia grava o primeiro administrador e a tela pede o ID e a senha');

    // com falha de permissão, o motivo aparece no guia
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } }); await ctx2.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
    const p2 = await ctx2.newPage(); p2.on('pageerror', e => erros.push(e.message));   /* contexto novo: sem a pasta lembrada da primeira página */
    await p2.goto('http://127.0.0.1:' + srv.address().port + '/');
    await p2.evaluate(async () => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Guia-Negada', { create: true });
      root.queryPermission = async () => 'prompt'; root.requestPermission = async () => { const e = new Error('x'); e.name = 'NotAllowedError'; throw e; }; window.showDirectoryPicker = async () => root; });
    const c2 = p2.locator('.porta-card'); await c2.getByRole('button', { name: 'Primeiro acesso' }).click({ timeout: 30000 });
    await c2.getByRole('button', { name: 'Escolher a pasta' }).click(); await c2.getByRole('button', { name: 'Permitir gravação' }).click({ timeout: 30000 });
    assert.match(await c2.locator('.porta-erro').innerText({ timeout: 5000 }), /não deu permissão/);
    await c2.getByRole('button', { name: 'Voltar para a entrada' }).click();
    assert.equal(await p2.locator('.porta-guia').count(), 0, 'Voltar fecha o guia');
    console.log('ok permissão negada: o motivo aparece no guia; Voltar para a entrada fecha o guia');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
