// Plataforma 1.8.9 · tela de entrada: ao abrir, a plataforma só aparece depois do login (vacLogin da Administração) ou de
// "Entrar só para consulta". Fundo: Marca/login.png ou login.svg desfocado (aqui, sem arquivo: o azul da marca).
// Pasta e pessoas fictícias (OPFS). O teste liga a tela com vac.login.forcar = 1, como o teste do login.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const FILES = { portal: 'portal-base.json', oee: 'oee-vacutainer-base.json', perdas: 'perdas-base.json', gel: 'fifo-base.json', paradas: 'paradas-base.json', equip: 'equipamentos-base.json', inic: 'iniciativas-base.json', linha: 'linha360-base.json', cad: 'vacutainer-cadastros.json' };
const PIN = '482915', SAL = 'sal-ficticio-0001', ITER = 150000;

function bases() {
  const b = structuredClone(require('../bases/consolidacao-referencia.json').bases);
  const hash = crypto.pbkdf2Sync(PIN, SAL, ITER, 32, 'sha256').toString('hex');
  b.cad.usuarios.push({ codigo: '7101', nome: 'Pessoa Fictícia de Entrada', perfil: 'ADM', ativo: true, senha: { alg: 'PBKDF2-SHA256', iter: ITER, sal: SAL, hash, provisoria: false, em: '2026-11-01T08:00:00', por: 'teste' } });
  return b;
}

(async () => {
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); if (u.startsWith('/Marca/')) { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const url = 'http://127.0.0.1:' + srv.address().port + '/';

    // 1) testes automáticos e demonstração: sem tela de entrada (mesma regra do vacLogin)
    { const ctx = await browser.newContext(), p = await ctx.newPage();
      await p.goto(url + '?demo=1'); await p.getByRole('heading', { name: 'Visão da linha' }).waitFor();
      assert.equal(await p.locator('.porta').count(), 0, 'demonstração sem tela de entrada');
      await p.goto(url); await p.waitForTimeout(1500);
      assert.equal(await p.locator('.porta').count(), 0, 'teste automático sem vac.login.forcar: sem tela de entrada');
      await ctx.close(); }
    console.log('ok sem tela de entrada na demonstração e nos testes automáticos');

    const abrir = async () => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
      p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.type() === 'beforeunload' ? d.accept() : d.dismiss());
      await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
      await p.goto(url + '#/oee'); await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).waitFor();
      return { ctx, p, erros };
    };
    const conectar = async p => {
      await p.evaluate(async ({ bases, files }) => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio', { create: true }), dir = await root.getDirectoryHandle('00. Bases', { create: true });
        for (const [id, file] of Object.entries(files)) { const w = await (await dir.getFileHandle(file, { create: true })).createWritable(); await w.write(JSON.stringify(bases[id])); await w.close(); }
        window.showDirectoryPicker = async () => root; }, { bases: bases(), files: FILES });
      await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).click();
      await p.locator('.porta-login').waitFor({ timeout: 30000 });
      await p.evaluate(() => localStorage.setItem('vac.app.' + vacAppHost.scope + '.vac.login.forcar', '1'));
      const f = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame();
      await f.waitForSelector('.vlog #vlId', { timeout: 30000 }); return f;
    };

    // 2) sem pasta: cartão com Conectar, Consulta e Demonstração; a plataforma fica escondida atrás
    { const { ctx, p, erros } = await abrir();
      const t = (await p.locator('.porta').innerText()) + (await p.locator('.porta-acoes').innerText());
      assert.match(t, /Conectar pasta da linha/); assert.match(t, /Entrar só para consulta/); assert.match(t, /Ver a demonstração/);
      assert.match(await p.evaluate(() => getComputedStyle(document.querySelector('.porta-fundo')).filter), /blur/, 'fundo desfocado');
      console.log('ok sem pasta: cartão com Conectar, Consulta e Demonstração sobre o fundo desfocado');

      // 3) com a pasta: a janela de login da Administração aparece sozinha, centrada, sobre o fundo
      const f = await conectar(p);
      const m = await f.evaluate(() => ({ porta: document.documentElement.classList.contains('vac-porta'), y: document.querySelector('.vl-d').getBoundingClientRect().y }));
      assert.ok(m.porta && m.y > 100, 'login da Administração centrado sobre o fundo');
      await f.fill('#vlId', '7101'); await f.click('#vlOk');
      await f.waitForSelector('#vlP1 input'); const caixas = f.locator('#vlP1 input'); for (let i = 0; i < 6; i++) await caixas.nth(i).fill(PIN[i]);   /* o sexto número já envia */
      await p.waitForFunction(() => !document.querySelector('.porta'), null, { timeout: 15000 });
      const fim = await p.evaluate(() => ({ hash: location.hash, nome: vacAppHost.usuario && vacAppHost.usuario.nome, classe: document.body.classList.contains('vac-porta') }));
      assert.equal(fim.nome, 'Pessoa Fictícia de Entrada'); assert.ok(!fim.classe); assert.match(fim.hash, /^#\/oee/, 'volta para onde estava: ' + fim.hash);
      assert.ok(!(await f.evaluate(() => document.documentElement.classList.contains('vac-porta'))), 'Administração volta ao normal');
      assert.deepEqual(erros, []); await ctx.close(); }
    console.log('ok login com ID e senha: a plataforma abre na página pedida, com a pessoa identificada');

    // 4) consulta: fecha a entrada nesta aba, sem sessão e sem janela de login nas páginas
    { const { ctx, p, erros } = await abrir(); const f = await conectar(p);
      await p.getByRole('button', { name: 'Entrar só para consulta' }).click();
      await p.waitForFunction(() => !document.querySelector('.porta'));
      const c = await p.evaluate(() => ({ consulta: vacAppHost.consulta, usuario: vacAppHost.usuario }));
      assert.equal(c.consulta, true); assert.equal(c.usuario, null, 'consulta não cria sessão');
      assert.equal(await f.locator('.vlog').count(), 0, 'login da Administração fecha');
      assert.equal(await p.evaluate(() => sessionStorage.getItem('vac.platform.consulta')), '1', 'consulta guardada nesta aba (vale ao recarregar; recarregar com a pasta derruba o Chromium deste ambiente)');
      assert.deepEqual(erros, []); await ctx.close(); }
    console.log('ok consulta: sem sessão, sem gravação e sem janela de login nas páginas; vale nesta aba');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
