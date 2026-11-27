// Tela de entrada (1.8.94, relato do responsável em 27/11/2026: "ao selecionar a pasta ele não abre nada"): quando a pasta escolhida não
// conecta, o motivo aparece no cartão da entrada, em português. Antes ele ia só para o aviso (toast), que fica atrás da tela de entrada.
// Casos: permissão negada, pasta do sistema, pasta que sumiu, erro qualquer; e a escolha cancelada não mostra erro. Pasta fictícia (OPFS).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const CASOS = [
  ['NotAllowedError', 'The request is not allowed by the user agent', /não deu permissão.*Editar arquivos/],
  ['SecurityError', 'Blocked', /não abre essa pasta.*subpasta/],
  ['NotFoundError', 'gone', /não foi encontrada/],
  ['TypeError', 'falha fictícia', /Não foi possível conectar a pasta: falha fictícia/],
  ['AbortError', 'The user aborted a request.', null]];
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/');
    const botao = p.locator('.porta-card').getByRole('button', { name: /Conectar pasta da linha/ }); await botao.waitFor({ timeout: 30000 });
    for (const [nome, msg, esperado] of CASOS) {
      await p.evaluate(([nome, msg]) => { window.showDirectoryPicker = async () => { const e = new Error(msg); e.name = nome; throw e; }; }, [nome, msg]);
      await botao.click(); await p.waitForTimeout(400);
      const erro = p.locator('.porta-card .porta-erro');
      if (!esperado) { assert.equal(await erro.count(), 0, 'escolha cancelada não mostra erro'); continue; }
      await erro.waitFor({ timeout: 5000 }); const txt = await erro.innerText();
      assert.match(txt, esperado, nome + ': ' + txt);
      const visivel = await erro.evaluate(el => { const r = el.getBoundingClientRect(), x = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el.contains(x); });
      assert.ok(visivel, nome + ': o motivo fica à vista, por cima de tudo');
    }
    console.log('ok pasta recusada: permissão negada, pasta do sistema, pasta sumida e erro qualquer aparecem no cartão da entrada; cancelar não mostra erro');
    // depois de um erro, uma pasta boa conecta e o erro some
    await p.evaluate(async () => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Nova-Ficticia', { create: true }); window.showDirectoryPicker = async () => { const e = new Error('x'); e.name = 'NotAllowedError'; throw e; }; await document.querySelector('.porta-card button').click(); await new Promise(r => setTimeout(r, 300)); window.showDirectoryPicker = async () => root; });
    await p.locator('.porta-card .porta-erro').waitFor({ timeout: 5000 });
    await botao.click();
    await p.locator('.porta-card').getByRole('button', { name: /Criar o cadastro inicial/ }).waitFor({ timeout: 30000 });
    assert.equal(await p.locator('.porta-card .porta-erro').count(), 0, 'o erro anterior some quando a pasta conecta');
    console.log('ok depois do erro, uma pasta nova (vazia) conecta e a entrada oferece criar o cadastro inicial');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
