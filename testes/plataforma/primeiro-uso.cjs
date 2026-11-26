// Primeiro uso (26/11/2026): pasta nova, sem cadastro nem ID. A plataforma cria o cadastro inicial com o primeiro administrador (única
// gravação liberada sem login), a pessoa entra com ID e senha, cadastra linha, família, equipamento, catálogo e turno, e a Produção monta
// tudo a partir do cadastro. Também prova que a exceção não serve para mais nada. Dados fictícios; pasta em memória (OPFS).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.type() === 'beforeunload' ? d.accept() : d.accept('Pessoa Fictícia'));
    await ctx.addInitScript(() => { try { localStorage.setItem('vac.login.forcar', '1'); } catch (e) { } });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/#/inicio');
    await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).waitFor({ timeout: 30000 });
    await p.evaluate(async () => { const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Nova-Ficticia', { create: true }); await root.getDirectoryHandle('00. Bases', { create: true }); window.showDirectoryPicker = async () => root; });
    await p.locator('.porta-card').getByRole('button', { name: 'Conectar pasta da linha' }).click();

    // 1) sem cadastro: a tela de entrada oferece criar o cadastro inicial
    const criar = p.locator('.porta-card').getByRole('button', { name: /Criar o cadastro inicial/ });
    await criar.waitFor({ timeout: 30000 }); assert.match(await p.locator('.porta-card').innerText(), /Cadastro não encontrado/);
    await p.evaluate(() => localStorage.setItem('vac.app.' + vacAppHost.scope + '.vac.login.forcar', '1'));   /* o navegador automático dispensa o login; aqui ele vale */
    await criar.click();
    const f = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    await f.waitForSelector('#cnId', { timeout: 30000 }); await p.waitForTimeout(2500);   /* a tela termina de ler a pasta antes de receber a digitação */
    console.log('ok pasta nova: "Criar o cadastro inicial (primeiro administrador)" leva ao formulário');

    // 2) senha fraca e ID inválido são recusados; depois cria
    const tenta = (id, nome, s1, s2) => f.evaluate(([id, nome, s1, s2]) => { document.querySelector('#cnId').value = id; document.querySelector('#cnNome').value = nome; document.querySelector('#cnS1').value = s1; document.querySelector('#cnS2').value = s2; document.querySelector('#cadNovoVazio').click(); }, [id, nome, s1, s2]);
    await tenta('9001', 'Admin Fictício', '111111', '111111'); await p.waitForTimeout(400);
    assert.match(await f.locator('#cnErr').innerText(), /6 números/);
    await tenta('90/01', 'Admin Fictício', '482915', '482915'); await p.waitForTimeout(400);
    assert.match(await f.locator('#cnErr').innerText(), /ID válido/);
    await tenta('9001', 'Admin Fictício', '482915', '482916'); await p.waitForTimeout(400);
    assert.match(await f.locator('#cnErr').innerText(), /não são iguais/);
    await tenta('9001', 'Admin Fictício', '482915', '482915');
    await p.waitForFunction(() => document.querySelector('.porta-login'), null, { timeout: 30000 });
    const doc = await p.evaluate(async () => { const r = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Nova-Ficticia'), b = await r.getDirectoryHandle('00. Bases'), t = await (await (await b.getFileHandle('vacutainer-cadastros.json')).getFile()).text(); return JSON.parse(t); });
    assert.equal(doc.rev, 1); assert.equal(doc.usuarios.length, 1); assert.equal(doc.usuarios[0].perfil, 'ADMIN'); assert.equal(doc.usuarios[0].codigo, '9001');
    assert.ok(doc.usuarios[0].senha.hash && !JSON.stringify(doc).includes('482915'), 'só o hash da senha vai para o arquivo');
    assert.ok(doc.perfis.length >= 5 && doc.linhas.length === 0 && doc.catalogos.length === 0, 'perfis padrão e nenhuma outra tabela');
    console.log('ok cadastro inicial gravado: rev 1, um administrador, perfis padrão, só o hash da senha; a tela volta para a entrada');

    // 2b) a exceção não serve para mais nada: já com o cadastro criado e sem sessão, nenhuma gravação passa
    const f0 = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    const neg = await f0.evaluate(async () => { const o = {}, root = await window.showDirectoryPicker(), b = await root.getDirectoryHandle('00. Bases');
      const tenta = async (nome, create) => { try { const h = await b.getFileHandle(nome, { create }), w = await h.createWritable(); await w.write('{"x":1}'); await w.close(); return 'GRAVOU'; } catch (e) { return e.name; } };
      o.cadastro = await tenta('vacutainer-cadastros.json', false); o.outro = await tenta('outro-arquivo.json', true); o.dir = await (async () => { try { await root.getDirectoryHandle('Outra-Pasta', { create: true }); return 'CRIOU'; } catch (e) { return e.name; } })();
      return o; });
    assert.ok(neg.cadastro !== 'GRAVOU' && neg.outro !== 'GRAVOU' && neg.dir !== 'CRIOU', 'sem sessão e com cadastro criado nada grava: ' + JSON.stringify(neg));
    const intacto = await p.evaluate(async () => { const r = await (await navigator.storage.getDirectory()).getDirectoryHandle('Pasta-Nova-Ficticia'), b = await r.getDirectoryHandle('00. Bases'); return JSON.parse(await (await (await b.getFileHandle('vacutainer-cadastros.json')).getFile()).text()).rev; });
    assert.equal(intacto, 1, 'o cadastro continua na rev 1');
    console.log('ok sem sessão, com o cadastro criado: nenhuma gravação passa (' + JSON.stringify(neg) + ')');

    // 3) entra com ID e senha
    const fl = await (await p.locator('iframe[title="Módulo Administração"]').elementHandle({ timeout: 30000 })).contentFrame();
    await fl.waitForSelector('.vlog #vlId', { timeout: 30000 }); await fl.fill('#vlId', '9001'); await fl.click('#vlOk');
    await fl.waitForSelector('#vlP1 input'); for (let i = 0; i < 6; i++) await fl.locator('#vlP1 input').nth(i).fill('482915'[i]);
    await p.waitForFunction(() => !document.querySelector('.porta'), null, { timeout: 30000 });
    const sess = await fl.evaluate(() => ({ sessao: !!vacLogin.sessao(), pode: Cad.podeEditar(true) }));
    assert.deepEqual(sess, { sessao: true, pode: true }); console.log('ok o administrador entra com ID e senha e pode editar o cadastro');

    // 5) cadastra pelas operações de sempre e a Produção monta
    const ok = await fl.evaluate(async () => {
      const h = todayISO(), V = x => [{ de: '2025-01-01', ate: null, ...x }];
      await Cad.ops([
        { acao: 'criação', tipo: 'linhas', codigo: 'VAC', item: { codigo: 'VAC', nome: 'Linha Vacutainer', unidade: 'Unidade X', setor: 'Setor Y', ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'familias', codigo: 'SST', item: { codigo: 'SST', nome: 'SST', cor: '#b52f6d', ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'equipamentos', codigo: 'EQ01', item: { codigo: 'EQ01', nome: 'Máquina 1', linha: 'VAC', posicao: 1, tipo: 'equipamento', papel: 'oee', dados: {}, ativo: true }, motivo: 'teste' },
        { acao: 'criação', tipo: 'catalogos', codigo: '360060', item: { codigo: '360060', tipoItem: 'tubo', unidade: 'UN', nome: 'Tubo SST', familia: 'SST', linha: 'VAC', ativo: true, vigencias: V({ pphNominal: 72000, tubosPorCaixa: 1000, caixasPorLote: 900 }) }, motivo: 'teste' },
        { acao: 'criação', tipo: 'turnos', codigo: 'T1', item: { codigo: 'T1', nome: '1º Turno', linha: 'VAC', ativo: true, vigencias: V({ inicio: '06:00', fim: '14:30', dias: [1, 2, 3, 4, 5, 6], ativo: true, pausas: [], regraPedacoFinal: 30, intervalos: [] }) }, motivo: 'teste' }]);
      for (let i = 0; i < 40 && Cad.status !== 'salvo'; i++) await new Promise(r => setTimeout(r, 250)); return { rev: Cad.base.rev, status: Cad.status, fila: Cad.fila.length, conf: (Cad.conflitos || []).map(c => c.motivo), err: Cad.err, linhas: Cad.D.linhas.length, h }; });
    assert.equal(ok.status, 'salvo', JSON.stringify(ok)); assert.ok(ok.rev >= 2 && ok.linhas === 1, JSON.stringify(ok));
    await p.locator('.nav-item[aria-label="Produção"]').dispatchEvent('click');   /* sem esperar toast ou janela em cima do menu */
    const fo = await (await p.locator('iframe[title="Módulo Produção"]').elementHandle({ timeout: 60000 })).contentFrame();
    /* cada página pergunta uma vez se cria a própria base na pasta (o cadastro já existe; a base guarda só o que se lança) */
    await fo.getByRole('button', { name: 'Criar base' }).click({ timeout: 60000 });
    await fo.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && Store.S.cadastroEstado === 'ok' && db().lines.length > 0, null, { timeout: 60000 });
    const pr = await fo.evaluate(() => ({ linhas: db().lines.map(x => x.code), cat: db().catalogs.map(x => x.code), tur: db().shifts.map(x => x.code), maq: db().machines.length, estado: Store.S.cadastroEstado, sector: db().settings.sector, unit: db().settings.unitName }));
    assert.deepEqual([pr.linhas, pr.cat, pr.tur, pr.estado], [['VAC'], ['360060'], ['T1'], 'ok']); assert.ok(pr.maq >= 1);
    console.log('ok a Produção monta linha, catálogo, turno e máquina do cadastro recém-criado (' + JSON.stringify({ sector: pr.sector, unit: pr.unit }) + ')');
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
