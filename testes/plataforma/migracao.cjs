// Migrador pontual (D02) · tela em Saúde dos dados. Pasta fictícia no formato da main (OPFS), dados só de teste.
// (a) a prévia mostra contagens por item e por arquivo e a tabela de exceções; "Baixar relatório" gera um CSV com uma linha por exceção;
// (b) sem sessão: só a prévia, sem o botão Aplicar; sessão de administrador de outra pasta (outro escopo) ou sem escopo também não libera;
// com exceção sem decisão, janela e palavra não liberam o botão; (c) com sessão ADMIN no escopo da pasta: decide as exceções, aplica com a confirmação digitada e os
// backups aparecem na pasta; (d) depois, Administração, Iniciativas, Equipamentos, Linha 360° e Paradas abrem sem "Base de versão anterior";
// (e) a Reunião diária mostra a mesma pauta e a Minha fila da pessoa mostra os itens dela; (f) o gel teórico (vacGel.teorico) e o BOM do
// catálogo migrado são os que a main calculava com o cadastro de antes (fórmula da main executada, não constantes);
// (g) segunda execução: "Nada a migrar"; (h) M6: com inic.fila e vac-portal › cadFila não vazios, "Esta estação" lista as duas filas;
// com tudo vazio, "Sem fila antiga nesta estação"; (i) nenhum erro de JavaScript.
const {chromium} = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const PASTA = 'Migracao-Ficticia', BLOQUEIO = 'Base de versão anterior';
(async () => {
  const {arqsTeste, M, ESC} = await import('./migracao-aplicar-comum.mjs'), {gelMain} = await import('./migracao-gel-main.mjs');
  const arqs = arqsTeste(), JS = x => JSON.parse(JSON.stringify(x));
  /* sem nenhuma decisão (a prévia ao abrir) e com todas (depois de decidir) */
  const esperado = await M.planejar(arqs, {__meta: ESC.__meta}), final = await M.planejar(arqs, ESC);
  const soma = P => Object.values(P.itens).reduce((n, l) => n + l.length, 0);
  const nExc = esperado.excecoes.length, nAlt = soma(esperado), nArq = Object.keys(esperado.alteracoes).length;
  assert.equal(final.excecoes.length, nExc);
  assert.ok(nExc > 5 && nAlt > 5 && nArq > 5, 'a pasta fictícia tem o que migrar');
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser; const erros = [];
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const ctx = await browser.newContext({viewport: {width: 1440, height: 1000}, timezoneId: 'UTC', acceptDownloads: true});
    /* a mesma pasta para a plataforma e para a ferramenta (a janela da ferramenta herda o script) */
    await ctx.addInitScript(nome => { window.showDirectoryPicker = async () => (await navigator.storage.getDirectory()).getDirectoryHandle(nome, {create: true}); }, PASTA);
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date('2026-11-30T12:00:00Z'));
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    await page.goto('http://127.0.0.1:' + srv.address().port + '/');
    await page.evaluate(async ({nome, arqs}) => {
      const raiz = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome, {create: true}), dir = await raiz.getDirectoryHandle('00. Bases', {create: true});
      for (const [f, c] of Object.entries(arqs)) { const w = await (await dir.getFileHandle(f, {create: true})).createWritable(); await w.write(JSON.stringify(c)); await w.close(); }
      localStorage.setItem('inic.fila', JSON.stringify([{id: 'q1', tipo: 'acao'}, {id: 'q2', tipo: 'acao'}]));
      await new Promise((ok, no) => { const r = indexedDB.open('vac-portal', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { const t = r.result.transaction('kv', 'readwrite'); t.objectStore('kv').put([{id: 'c1', op: 'x'}], 'cadFila'); t.oncomplete = () => { r.result.close(); ok(); }; t.onerror = () => no(t.error); }; r.onerror = () => no(r.error); });
    }, {nome: PASTA, arqs: JS(arqs)});
    await page.evaluate(() => { location.hash = '#/saude'; });
    await page.getByRole('heading', {name: 'Saúde dos dados.'}).waitFor({timeout: 60000});

    // (h) M6 com filas antigas, na janela da ferramenta
    const aberta = page.waitForEvent('popup');
    await page.getByRole('button', {name: 'Migração pontual (uso único)', exact: true}).click();
    const t = await aberta; await t.waitForLoadState('domcontentloaded');
    t.on('pageerror', e => erros.push('ferramenta: ' + e.message)); t.on('dialog', d => d.accept());
    await t.locator('#sEstacao').getByText('Há fila antiga nesta estação').waitFor();
    const est = await t.locator('#sEstacao').innerText();
    assert.match(est, /inic\.fila\s+2/); assert.match(est, /vac-portal › cadFila\s+1/); assert.match(est, /antes do corte/i);
    assert.match(est, /só.*estação.*em que.*feita/i); assert.match(est, /não prova que todas as estações/i);
    console.log('ok (h) M6: lista as duas filas e orienta enviá-las antes do corte; vale só para esta estação');

    // (a) prévia
    await t.locator('#bPasta').click();
    await t.locator('#sPrevia .cards').waitFor();
    const cards = await t.locator('#sPrevia .cards .k b').allInnerTexts();
    assert.deepEqual(cards.map(Number), [nAlt, nArq, nExc, nExc], 'alterações, arquivos, exceções e exceções sem decisão');
    const porItem = await t.locator('#sPrevia table').first().locator('tbody tr').allInnerTexts();
    assert.ok(porItem.some(l => /M5 · Ações antigas/.test(l)) && porItem.length === 6);
    assert.equal(await t.locator('#sPrevia table').nth(1).locator('tbody tr').count(), nArq, 'uma linha por arquivo');
    assert.equal(await t.locator('#tExc tbody tr').count(), nExc, 'tabela de exceções');
    const baixar = t.waitForEvent('download'); await t.locator('#bCsv').click();
    const csv = fs.readFileSync(await (await baixar).path(), 'utf8').replace(/^\ufeff/, '').trim().split(/\r\n/);
    assert.equal(csv.length, nExc + 1, 'CSV: cabeçalho e uma linha por exceção'); assert.match(csv[0], /^"Item";"Tipo";"Arquivo"/);
    console.log('ok (a) prévia com contagens por item e por arquivo, exceções e relatório CSV (' + nExc + ' linhas)');

    // (b) sem sessão: só a prévia
    assert.equal(await t.locator('#apB').count(), 0, 'sem sessão não há botão Aplicar');
    assert.match(await t.locator('#sAplicar').innerText(), /Sem sessão, só a prévia/);
    /* a plataforma conecta a pasta (escopo dela em vac-nova-plataforma › scopes); sessões de outro escopo e sem escopo não valem */
    await page.evaluate(() => { location.hash = '#/'; });
    await page.locator('.heading-actions').locator('[data-act="connect"]').click(); await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor();
    await page.evaluate(() => { const s = JSON.stringify({id: '9001', nome: 'Pessoa de demonstração', ate: Date.now() + 36e5});
      for (const p of ['', 'vac.app.outra-pasta.']) { localStorage.setItem(p + 'vac.sessao', s); localStorage.setItem(p + 'vac.userId', '9001'); } });
    await t.locator('#bRefazer').click(); await t.locator('#tExc').waitFor();
    assert.equal(await t.locator('#apB').count(), 0, 'sessão de outra pasta ou sem escopo não libera Aplicar');
    assert.match(await t.locator('#sAplicar').innerText(), /Sem sessão nesta pasta: só a prévia/);
    console.log('ok (b) sem sessão: só a prévia; sessão de administrador de outra pasta ou sem escopo também');

    // (c) sessão ADMIN: decide as exceções, aplica
    await page.evaluate(() => { const s = JSON.stringify({id: '9001', nome: 'Pessoa de demonstração', ate: Date.now() + 36e5}), p = 'vac.app.' + vacAppHost.scope + '.';
      for (const k of ['', 'vac.app.outra-pasta.']) { localStorage.removeItem(k + 'vac.sessao'); localStorage.removeItem(k + 'vac.userId'); }
      localStorage.setItem(p + 'vac.sessao', s); localStorage.setItem(p + 'vac.userId', '9001'); });
    await t.locator('#bRefazer').click();
    await t.locator('#tExc').waitFor();
    assert.match(await t.locator('#sAplicar').innerText(), /Sessão de Pessoa de demonstração/);
    /* exceções sem decisão: marcar a janela e digitar a palavra não libera */
    await t.locator('#apJ').check(); await t.locator('#apP').fill('MIGRAR');
    assert.equal(await t.locator('#apB').isDisabled(), true, 'com exceção sem decisão, o botão continua bloqueado');
    await t.locator('#apJ').uncheck(); await t.locator('#apP').fill('');
    for (let n = 0; n < nExc; n++) {
      const sel = t.locator('#tExc select').nth(n), tipo = esperado.excecoes[n].tipo, ops = esperado.excecoes[n].opcoes;
      let i = ops.findIndex(o => o.valor === 'sem' || o.valor === 'manter');
      if (tipo === 'M2-ambiguo') i = ops.findIndex(o => o.valor && o.valor.id === '1003');
      if (tipo === 'M3-data') i = ops.findIndex(o => o.campo === 'from');
      assert.ok(i >= 0, tipo);
      await sel.selectOption(String(i));
      if (tipo === 'M3-data') await t.locator('#tExc input[data-t]').first().fill('2025-01-01').then(() => t.locator('#tExc input[data-t]').first().dispatchEvent('change'));
    }
    await t.waitForFunction(() => document.querySelectorAll('#tExc .st.aviso').length === 0);
    assert.deepEqual((await t.locator('#sPrevia .cards .k b').allInnerTexts()).map(Number), [soma(final), Object.keys(final.alteracoes).length, nExc, 0]);
    assert.equal(await t.locator('#apB').isDisabled(), true, 'sem a janela e a palavra, não aplica');
    await t.locator('#apJ').check(); await t.locator('#apP').fill('MIGRA');
    assert.equal(await t.locator('#apB').isDisabled(), true, 'palavra incompleta');
    await t.locator('#apP').fill('MIGRAR');
    await t.locator('#apB').click();
    await t.locator('#sAplicar').getByText('Concluído.', {exact: true}).waitFor({timeout: 60000});
    const res = await t.locator('#sAplicar').innerText();
    assert.match(res, /não recalcula|ainda são os de antes da migração/i);
    const bk = await page.evaluate(async nome => {
      const raiz = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome), m = await (await raiz.getDirectoryHandle('00. Backups')).getDirectoryHandle('Migracao'), L = [];
      for await (const [n, h] of m.entries()) { if (h.kind === 'directory') for await (const [f] of h.entries()) L.push(n + '/' + f); else L.push(n); }
      return L;
    }, PASTA);
    assert.equal(bk.filter(x => /\/antes-da-migracao-\d{4}-\d\d-\d\d\.json$/.test(x)).length, Object.keys(final.alteracoes).length, 'um backup por arquivo gravado: ' + bk.join(', '));
    assert.ok(bk.some(x => /^registro-\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d-\d{3}Z\.json$/.test(x)), 'registro da migração, com a hora em UTC: ' + bk.join(', '));
    console.log('ok (c) com sessão ADMIN: exceções decididas, aplicada com a confirmação digitada, backups na pasta');

    // (g) segunda execução
    await t.locator('#bRefazer').click();
    await t.locator('#sPrevia').getByText('Nada a migrar').waitFor();
    assert.equal(await t.locator('#apB').count(), 0);
    console.log('ok (g) segunda execução: Nada a migrar');

    // (g2) exceção só de relatório (config da Administração em lista, sem versão): sem controle de decisão, sem "Nada a migrar"
    const portalOpfs = async texto => page.evaluate(async ({nome, texto}) => {
      const dir = await (await (await navigator.storage.getDirectory()).getDirectoryHandle(nome)).getDirectoryHandle('00. Bases'), fh = await dir.getFileHandle('portal-base.json');
      const antes = await (await fh.getFile()).text();
      if (texto != null) { const w = await fh.createWritable(); await w.write(texto); await w.close(); }
      return antes;
    }, {nome: PASTA, texto});
    const portalMigrado = await portalOpfs(null), quebrado = JS(JSON.parse(portalMigrado)); delete quebrado.schemaVersion; quebrado.config = [];
    await portalOpfs(JSON.stringify(quebrado));
    await t.locator('#bRefazer').click(); await t.locator('#tExc').waitFor();
    const linhaM1 = t.locator('#tExc tbody tr').filter({hasText: 'A configuração não é um objeto'});
    assert.equal(await linhaM1.count(), 1); assert.equal(await linhaM1.locator('select').count(), 0, 'sem opção de decisão para exceção só de relatório');
    assert.match(await linhaM1.innerText(), /Sem opção: corrija a causa/);
    assert.equal(await t.locator('#sPrevia').getByText('Nada a migrar').count(), 0, 'não diz "Nada a migrar" com exceção sem decisão possível');
    assert.match(await t.locator('#sPrevia').innerText(), /Nada é gravado/);
    await portalOpfs(portalMigrado);
    await t.locator('#bRefazer').click(); await t.locator('#sPrevia').getByText('Nada a migrar').waitFor();
    console.log('ok (g2) exceção só de relatório: sem controle de decisão e sem "Nada a migrar"');

    // (g3) Conferir M5: só leitura, mesmo resultado do núcleo sobre a pasta migrada
    const perdasM = (final.alteracoes['perdas-base.json'] || {}).depois || arqs['perdas-base.json'], esperadoM5 = JS(M.conferirM5(perdasM, final.alteracoes['iniciativas-base.json'].depois));
    await t.locator('#bM5').click();
    await t.locator('#sM5').getByText(esperadoM5.ok ? 'Conferido.' : 'Há diferenças.').waitFor();
    const m5 = await t.locator('#sM5').innerText();
    assert.equal(/Faltam \(/.test(m5), esperadoM5.faltam.length > 0); assert.equal(/Divergentes \(/.test(m5), esperadoM5.divergentes.length > 0);
    if (esperadoM5.faltam.length) { assert.match(m5, new RegExp('Faltam \\(' + esperadoM5.faltam.length + '\\)')); assert.match(m5, /adiadas à espera da decisão/); }
    console.log('ok (g3) Conferir M5: ' + (esperadoM5.ok ? 'conferido' : esperadoM5.faltam.length + ' faltam, ' + esperadoM5.divergentes.length + ' divergentes'));

    // (h) com tudo vazio
    await page.evaluate(async () => {
      localStorage.removeItem('inic.fila');
      await new Promise((ok, no) => { const r = indexedDB.open('vac-portal', 1); r.onsuccess = () => { const t = r.result.transaction('kv', 'readwrite'); t.objectStore('kv').put(null, 'cadFila'); t.oncomplete = () => { r.result.close(); ok(); }; t.onerror = () => no(t.error); }; r.onerror = () => no(r.error); });
    });
    await t.locator('#bFilas').click();
    await t.locator('#sEstacao').getByText('Sem fila antiga nesta estação').waitFor();
    console.log('ok (h) tudo vazio: Sem fila antiga nesta estação');
    await t.close();

    // (d) a plataforma na pasta migrada: nenhuma página abre como "Base de versão anterior"
    await page.evaluate(() => { location.hash = '#/'; });
    const conectar = page.locator('.heading-actions').locator('[data-act="connect"]');
    await conectar.waitFor(); await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor();
    await page.evaluate(() => { const p = 'vac.app.' + vacAppHost.scope + '.'; localStorage.setItem(p + 'vac.userId', '1001'); localStorage.setItem(p + 'vac.user', 'Ana Líder (TESTE)');
      localStorage.setItem(p + 'vac.sessao', JSON.stringify({id: '1001', nome: 'Ana Líder (TESTE)', ate: Date.now() + 36e5})); });
    const NOMES = {portal: 'Administração', inic: 'Iniciativas / Ações', equip: 'Equipamentos', linha: 'Linha 360°', paradas: 'Paradas', gel: 'Gestão de Gel', perdas: 'Waste', oee: 'Produção'};
    const quadros = {};
    for (const id of ['portal', 'inic', 'equip', 'linha', 'paradas']) {
      await page.evaluate(id => { location.hash = '#/' + id; }, id);
      const f = page.locator('iframe[title="Módulo ' + NOMES[id] + '"]'); await f.waitFor({timeout: 60000});
      const fr = await (await f.elementHandle()).contentFrame(); await fr.waitForFunction(() => window.vacPagina?.conectado(), null, {timeout: 60000});
      await page.waitForTimeout(800);
      const texto = await fr.evaluate(() => document.body.innerText);
      assert.ok(!texto.includes(BLOQUEIO), NOMES[id] + ' abre sem "' + BLOQUEIO + '"');
      quadros[id] = fr;
    }
    console.log('ok (d) Administração, Iniciativas, Equipamentos, Linha 360° e Paradas abrem sem "Base de versão anterior"');

    // (e) Reunião diária com a mesma pauta; Minha fila da pessoa mostra os itens dela (depois de cada módulo republicar o seu resumo)
    const lerPortal = () => page.evaluate(async nome => JSON.parse(await (await (await (await (await (await navigator.storage.getDirectory()).getDirectoryHandle(nome)).getDirectoryHandle('00. Bases')).getFileHandle('portal-base.json')).getFile()).text()), PASTA);
    assert.deepEqual((await lerPortal()).reunioes, arqs['portal-base.json'].reunioes, 'a pauta gravada não mudou');
    await page.evaluate(() => { location.hash = '#/portal'; });
    const pf = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame();
    await pf.waitForFunction(() => window.vacPagina?.conectado());
    await pf.evaluate(() => { location.hash = '#reuniao=2026-11-19|diaria'; });
    await pf.getByText('Pauta fictícia', {exact: true}).waitFor({timeout: 30000});
    const reu = await pf.evaluate(() => document.body.innerText);
    assert.match(reu, /Pauta fictícia/); assert.match(reu, /Conferir tampa/); assert.match(reu, /Carla Souza \(TESTE\)/);
    assert.equal(await pf.locator('.reu-dec').first().inputValue(), 'Seguir', 'a decisão da pauta continua');
    const fila = async (id, nome) => {
      await page.evaluate(({id, nome}) => { const p = 'vac.app.' + vacAppHost.scope + '.'; localStorage.setItem(p + 'vac.userId', id); localStorage.setItem(p + 'vac.user', nome);
        localStorage.setItem(p + 'vac.sessao', JSON.stringify({id, nome, ate: Date.now() + 36e5})); }, {id, nome});
      await pf.evaluate(async () => { await vacFicha.carregar(true); await readModules(true); Fila.seg = 'minhas'; App.show('fila'); });
      return pf.evaluate(() => document.body.innerText);
    };
    const ana = await fila('1001', 'Ana Líder (TESTE)');
    assert.match(ana, /MINHAS \(1\)/); assert.match(ana, /Ação fictícia única/);
    const carla = await fila('1003', 'Carla Souza (TESTE)');
    assert.match(carla, /MINHAS \(2\)/); assert.match(carla, /Ação fictícia homônima/); assert.match(carla, /Ação antiga de homônimo/);
    console.log('ok (e) Reunião diária com a mesma pauta; Minha fila mostra as ações da Ana (1) e da Carla (2, uma delas vinda do Waste)');

    // (f) gel teórico e BOM: a fórmula da main (vigList/bomVals + procAt) sobre o cadastro de antes × o vacGel atual sobre o migrado
    const DATA = '2026-11-19', TUBOS = {'cat-a': 12000, 'cat-b': 8000, 'cat-c': 5000}, CATS = Object.keys(TUBOS), G0 = gelMain(arqs['vacutainer-cadastros.json']);
    const antes = {teo: JS(G0.teorico(TUBOS, DATA)), bom: Object.fromEntries(CATS.map(c => [c, JS(G0.bom(c, DATA))]))};
    const depois = await pf.evaluate(({TUBOS, DATA, CATS}) => { const cat = vacGel.ctx().cat;
      return {teo: vacGel.teorico({tubosPorCat: TUBOS, date: DATA, cg: cat}), bom: Object.fromEntries(CATS.map(c => [c, vacGel.bom(cat(c), DATA)]))}; }, {TUBOS, DATA, CATS});
    const aprox = (a, b, o) => assert.ok(typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9, o + ': main ' + a + ', migrado ' + b);
    assert.ok(antes.teo && depois.teo, 'teórico calculado nos dois lados: ' + JSON.stringify(depois.teo));
    for (const k of ['gelBons', 'teo']) aprox(antes.teo[k], depois.teo[k], k);
    for (const k of ['T', 'B', 'P']) aprox(antes.teo.sTeo[k], depois.teo.sTeo[k], 'sTeo.' + k);
    for (const k of ['g', 'pT', 'pB', 'pP']) aprox(+antes.teo.perdas[k], +depois.teo.perdas[k], 'perdas.' + k);
    for (const c of CATS) { for (const k of ['allowed', 'meta', 'kg', 'base']) aprox(antes.bom[c][k], depois.bom[c][k], c + ' bom.' + k); assert.equal(depois.bom[c].tol, antes.bom[c].tol, c + ' tol'); }
    console.log('ok (f) gel teórico (' + depois.teo.teo.toFixed(3) + ' kg) e BOM do catálogo migrado iguais aos da fórmula da main');

    assert.deepEqual(erros, [], 'nenhum erro de JavaScript');
    console.log('ok (i) nenhum erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
