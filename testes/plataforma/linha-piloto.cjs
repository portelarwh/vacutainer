// Linha 360° 1.2.0 · Piloto de consulta (docs/linha-360-piloto.md).
// Somente dados fictícios: pasta em OPFS ("Somente-Ficticio") e demonstração. Nenhuma pasta real é lida ou gravada.
// O que este teste prova:
//  1. a aba do piloto só abre por link (não aparece na barra da página nem nas abas da casca);
//  2. abrir, usar e fechar o piloto não grava nada: arquivos da pasta, fila, cache do navegador e chamadas de gravação
//     ficam idênticos ao estado medido DEPOIS da inicialização do módulo (a inicialização pode regravar o resumo do dia);
//  3. isso vale para três situações de acesso: perfil que grava, perfil só de consulta e sem sessão;
//  4. o estado das abas atuais (ponto selecionado, camada, filtros, zoom) é preservado;
//  5. o link direto funciona na demonstração e no módulo isolado (#aba=piloto);
//  6. a ficha mostra os mesmos números da Visão da linha, diz o recorte de tempo de cada bloco, e fonte ausente ou ponto
//     sem equipamento aparecem como "sem dados" / "sem vínculo", nunca como zero.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const FILES = { portal: 'portal-base.json', oee: 'oee-vacutainer-base.json', perdas: 'perdas-base.json', gel: 'fifo-base.json', paradas: 'paradas-base.json', equip: 'equipamentos-base.json', inic: 'iniciativas-base.json', linha: 'linha360-base.json', cad: 'vacutainer-cadastros.json' };
const ABAS_ATUAIS = ['mapa', 'pessoas', 'checklists', 'config'];
const HOJE = '2026-11-15';

function basesFicticias(semFontes) {
  const bases = structuredClone(require('../bases/consolidacao-referencia.json').bases);
  // Linha 360° fictícia: o ponto 2 (EQ03) com dois checklists (um feito hoje) e um posto com pessoa pelo ID
  // (o nome gravado é antigo de propósito: a tela tem de mostrar o nome atual do cadastro)
  Object.assign(bases.linha, {
    checklists: [{ id: 'CK-P-1', titulo: 'Conferir nível de gel (fictício)', ponto: '2', posto: 'OP3-E', frequencia: 'turno', ativo: true },
      { id: 'CK-P-2', titulo: 'Limpeza do bico (fictício)', ponto: '2', posto: null, frequencia: 'dia', ativo: true },
      { id: 'CK-P-3', titulo: 'Inspeção das guias (fictício)', ponto: '10', posto: null, frequencia: 'semana', ativo: true }],
    feitos: [{ id: 'CK-P-2|' + HOJE + '|', checklist: 'CK-P-2', dia: HOJE, turno: 'T1', por: 'Pessoa Fictícia de Verificação', porId: '9099', em: HOJE + 'T08:00:00.000Z' }],
    postos: [{ id: 'OP3-E', ponto: '2', pessoas: { T1: 'Nome Antigo Fictício' }, pessoasIds: { T1: '9099' } }],
  });
  if (semFontes) { delete bases.paradas; delete bases.equip; }
  // pessoa fictícia com perfil só de consulta (o perfil CONSULTA já existe no cadastro de referência)
  bases.cad.usuarios.push({ codigo: '7007', nome: 'Pessoa Fictícia de Consulta', perfil: 'CONSULTA', ativo: true });
  return bases;
}

async function abrir(browser, porta, usuario, semFontes) {
  const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
  const erros = []; page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.dismiss());
  await page.clock.setFixedTime(new Date(HOJE + 'T12:00:00Z'));
  await page.goto('http://127.0.0.1:' + porta + '/');
  await page.evaluate(async ({ bases, files }) => {
    const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio', { create: true }), dir = await root.getDirectoryHandle('00. Bases', { create: true });
    for (const [id, file] of Object.entries(files)) { if (!bases[id]) continue; const w = await (await dir.getFileHandle(file, { create: true })).createWritable(); await w.write(JSON.stringify(bases[id])); await w.close(); }
    window.fixtureRoot = root; window.showDirectoryPicker = async () => root;
  }, { bases: basesFicticias(semFontes), files: FILES });
  await page.locator('.heading-actions').getByRole('button', { name: 'Conectar pasta', exact: true }).click();
  await page.locator('.folder-info strong').filter({ hasText: 'Somente-Ficticio' }).waitFor();
  if (usuario) await page.evaluate(u => { const p = 'vac.app.' + vacAppHost.scope + '.'; localStorage.setItem(p + 'vac.userId', u.id); localStorage.setItem(p + 'vac.user', u.nome); localStorage.setItem(p + 'vac.sessao', JSON.stringify({ id: u.id, ate: Date.now() + 3600000 })); }, usuario);
  return { context, page, erros };
}

async function moduloLinha(page, hash) {
  await page.evaluate(h => { location.hash = h; }, hash);
  const iframe = page.locator('iframe[title="Módulo Linha 360°"]'); await iframe.waitFor();
  const frame = await (await iframe.elementHandle()).contentFrame();
  await frame.waitForFunction(() => window.vacPagina?.conectado());
  return frame;
}

// a inicialização pode gravar sozinha (resumo do dia, fila pendente): espera acabar antes de medir
async function assentar(frame) {
  for (let i = 0; i < 3; i++) { await frame.waitForTimeout(900); await frame.waitForFunction(() => !Store.saving && !Store.again); }
}

// tudo o que o piloto não pode mudar: arquivos da pasta (bases, backups, logs, preferências), fila, base em memória e o navegador
async function retrato(page, frame) {
  const pasta = await page.evaluate(async () => {
    const out = {};
    async function andar(dir, pre) { for await (const [nome, h] of dir.entries()) { if (h.kind === 'directory') await andar(h, pre + nome + '/'); else out[pre + nome] = await (await h.getFile()).text(); } }
    await andar(window.fixtureRoot, ''); return out;
  });
  const navegador = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  const modulo = await frame.evaluate(async () => ({
    rev: Store.data.rev, revId: Store.data.revId, fila: JSON.stringify(Store.queue), salvando: Store.saving, ultimaGravacao: Store.lastSaved ? Store.lastSaved.toISOString() : null,
    filaDuravel: JSON.stringify(typeof vacFila !== 'undefined' && vacFila.contar ? await vacFila.contar() : null), base: JSON.stringify(Store.data),
  }));
  return { pasta, navegador, modulo };
}

const GRAVADORES = ['commit', 'save', 'reload', 'cache', 'escrever', 'backupDiario', 'backupAgora', 'usar', 'reconnect', 'recriar'];
async function vigiar(frame) {
  await frame.evaluate(nomes => {
    window.__piloto = { chamadas: {}, errosNovos: [], errosAntes: [...document.querySelectorAll('.toast.err')].map(t => t.textContent), pendenciaAntes: Store.lastErr || Store.readErr || '' };
    // avisos de erro que aparecerem a partir de agora (os anteriores somem sozinhos depois de alguns segundos)
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('toast') && n.classList.contains('err')) window.__piloto.errosNovos.push(n.textContent); }))).observe(document.querySelector('#toasts'), { childList: true });
    for (const n of nomes) { const f = Store[n]; window.__piloto.chamadas[n] = 0; Store[n] = function () { window.__piloto.chamadas[n]++; return f.apply(this, arguments); }; }
    const le = window.lerExt; window.__piloto.chamadas.lerExt = 0; window.lerExt = function () { window.__piloto.chamadas.lerExt++; return le.apply(this, arguments); };
  }, GRAVADORES);
}

async function casoPasta(browser, porta, rotulo, usuario, semFontes) {
  const { context, page, erros } = await abrir(browser, porta, usuario, semFontes);
  try {
    const frame = await moduloLinha(page, '#/linha');
    // O kit comum relê os dados quando a janela do módulo ganha foco (vacAoVoltar), em qualquer aba. O primeiro clique dentro do
    // módulo dispara isso; acontece aqui, antes do retrato, para que a medição pegue só o que o piloto faz.
    await frame.locator('#main h2').first().click();
    await assentar(frame);
    // estado próprio das abas atuais, para conferir que o piloto não o perde
    await frame.evaluate(() => { App.sel = '2'; App.camada = 'oc'; App.f.per = '30'; App.zoom = 1.5; render(); });
    // referência: o que a Visão da linha mostra na ficha do ponto 2 com os mesmos filtros (tempo, ocorrências, quebras, OS, ações)
    const referencia = await frame.evaluate(() => [...document.querySelectorAll('#ficha .l3-tl b')].map(b => b.textContent.trim()));
    assert.equal(referencia.length, 5, rotulo + ': ficha da Visão da linha lida como referência');
    const estado = () => frame.evaluate(() => JSON.stringify({ sel: App.sel, camada: App.camada, f: App.f, zoom: App.zoom, fluxo: App.fluxo, zonas: App.zonas, posto: App.posto }));
    const estadoAntes = await estado();
    await assentar(frame);
    const antes = await retrato(page, frame);
    await vigiar(frame);

    // 1. só por link: fora da barra da página, fora das abas da casca e fora do contrato de abas
    assert.deepEqual(await frame.evaluate(() => vacPagina.abas().map(a => a.id)), ABAS_ATUAIS, rotulo + ': contrato de abas sem o piloto');
    assert.deepEqual(await frame.evaluate(() => [...document.querySelectorAll('#nav [data-t]')].map(b => b.dataset.t)), ABAS_ATUAIS, rotulo + ': barra da página sem o piloto');
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.module-tabs button')].map(b => b.dataset.tabId)), ABAS_ATUAIS, rotulo + ': abas da casca sem o piloto');

    // 2. abrir pelo link da plataforma
    await page.evaluate(() => { location.hash = '#/linha?tab=piloto'; });
    await frame.locator('#piloto').waitFor();
    assert.equal(await frame.locator('#piloto h2').textContent(), 'Piloto de consulta');
    assert.equal(await frame.evaluate(() => App.tab), 'piloto');
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.module-tabs button')].map(b => b.dataset.tabId)), ABAS_ATUAIS, rotulo + ': abas da casca continuam sem o piloto com ele aberto');
    await usarPiloto(frame, rotulo, { referencia, semFontes });
    await frame.waitForTimeout(1200);   // tempo para qualquer gravação agendada (600 ms) aparecer

    // 3. fechar: voltar para a Visão da linha
    await page.evaluate(() => { location.hash = '#/linha?tab=mapa'; });
    await frame.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await frame.waitForTimeout(1200);
    assert.equal(await estado(), estadoAntes, rotulo + ': estado das abas atuais preservado');

    const depois = await retrato(page, frame), vig = await frame.evaluate(() => ({ chamadas: window.__piloto.chamadas, errosNovos: window.__piloto.errosNovos, errosAntes: window.__piloto.errosAntes, pendenciaAntes: window.__piloto.pendenciaAntes }));
    assert.deepEqual(vig.chamadas, Object.fromEntries(GRAVADORES.concat('lerExt').map(n => [n, 0])), rotulo + ': nenhuma chamada de gravação, releitura ou sincronização');
    assert.deepEqual(Object.keys(depois.pasta).sort(), Object.keys(antes.pasta).sort(), rotulo + ': mesmos arquivos na pasta');
    for (const arq of Object.keys(antes.pasta)) assert.equal(depois.pasta[arq], antes.pasta[arq], rotulo + ': arquivo intacto ' + arq);
    assert.deepEqual(depois.modulo, antes.modulo, rotulo + ': fila, revisão e base em memória intactas');
    assert.deepEqual(depois.navegador, antes.navegador, rotulo + ': armazenamento do navegador intacto');
    assert.deepEqual(vig.errosNovos, [], rotulo + ': nenhum aviso de erro causado pelo piloto');
    assert.deepEqual(erros, [], rotulo + ': sem erro de JavaScript');
    console.log('ok piloto ' + rotulo + ': só por link, zero escrita (' + Object.keys(antes.pasta).length + ' arquivos, fila e navegador intactos), estado das abas preservado' + (vig.pendenciaAntes ? ' · já existia antes do piloto: "' + vig.pendenciaAntes + '"' : ''));
  } finally { await context.close(); }
}

const txt = (frame, sel) => frame.locator(sel).first().textContent().then(t => t.replace(/\s+/g, ' ').trim());
const tres = frame => frame.evaluate(() => [...document.querySelectorAll('#pilPar .l3-tl b')].map(b => b.textContent.trim()));

async function usarPiloto(frame, rotulo, { referencia, semFontes }) {
  assert.match(await txt(frame, '#piloto'), /Somente leitura/, rotulo + ': a tela diz que é somente leitura');
  assert.equal(await frame.locator('#piloto ~ * form, #pilFicha button, #pilFicha input, #pilFicha select').count(), 0, rotulo + ': a ficha não tem formulário nem controle de edição');
  // abre no mesmo ponto e nos mesmos filtros que a Visão da linha tinha (ponto 2, 30 dias)
  assert.match(await txt(frame, '#pilFicha h3'), /Aplicação de gel/);
  // cada bloco diz o seu recorte de tempo
  assert.match(await txt(frame, '#pilPar h4'), /no período/); assert.match(await txt(frame, '#pilOS h4'), /agora/); assert.match(await txt(frame, '#pilAc h4'), /agora/);
  assert.match(await txt(frame, '#pilCk h4'), /previstos agora/); assert.match(await txt(frame, '#pilPes h4'), /cadastro/);

  if (semFontes) {
    // Paradas e Equipamentos não estão na pasta: "sem dados", nunca zero, na ficha, nos marcadores e na lista
    assert.deepEqual(await tres(frame), ['sem dados', 'sem dados', 'sem dados'], rotulo + ': paradas sem dados na ficha');
    assert.match(await txt(frame, '#pilOS'), /sem dados/); assert.doesNotMatch(await txt(frame, '#pilOS'), /\d+ aberta/);
    assert.equal(await frame.locator('#pilArea [data-pin] .vl').count(), 0, rotulo + ': nenhum marcador com número');
    assert.match(await frame.locator('#pilArea [data-pin="2"]').getAttribute('title'), /sem dados \(Paradas não lido\)/);
    assert.doesNotMatch(await frame.locator('#pilArea [data-pin="2"]').getAttribute('title'), /\b0 min/);
    const linha2 = await frame.evaluate(() => [...document.querySelectorAll('#pilTab tr[data-ppt="2"] td')].map(td => td.textContent.trim()));
    assert.equal(linha2[2], 'sem dados'); assert.equal(linha2[3], 'sem dados'); assert.match(linha2[4], /^\d+/, rotulo + ': Iniciativas foi lido e continua com número');
    assert.deepEqual(await frame.evaluate(() => [...document.querySelectorAll('#pilFontes li[data-fonte]')].map(li => li.dataset.fonte + ':' + (/sem dados/.test(li.textContent) ? 'sem dados' : 'ok'))), ['par:sem dados', 'equip:sem dados', 'inic:ok', 'oee:ok']);
    assert.doesNotMatch(await txt(frame, '#pilFicha'), /\b0 min\b/, rotulo + ': nenhum "0 min" na ficha sem a fonte');
    return;
  }

  // mesmos números da Visão da linha no mesmo período (tempo, ocorrências, quebras, OS e ações)
  assert.deepEqual(await tres(frame), referencia.slice(0, 3), rotulo + ': paradas iguais às da Visão da linha');
  assert.equal(await txt(frame, '#pilOS b.n'), referencia[3], rotulo + ': OS abertas iguais'); assert.equal(await txt(frame, '#pilAc b.n'), referencia[4], rotulo + ': ações abertas iguais');
  assert.match(referencia[0], /^[1-9][\d.]* min$/, rotulo + ': o cenário tem parada no ponto 2'); assert.match(await txt(frame, '#pilOS'), /1 atrasada/);
  assert.match(await frame.locator('#pilArea [data-pin="2"] .vl').textContent(), /min/);
  assert.deepEqual(await frame.evaluate(() => [...document.querySelectorAll('#pilFontes li[data-fonte]')].map(li => /resumo gerado em \d\d\/\d\d/.test(li.textContent))), [true, true, true, true], rotulo + ': cada fonte diz quando foi gerada');

  // os filtros valem só para as paradas: em "Ontem" não há parada, e OS, ações e checklists continuam como estavam
  const osAntes = await txt(frame, '#pilOS'), acAntes = await txt(frame, '#pilAc'), ckAntes = await txt(frame, '#pilCk');
  await frame.locator('#pPer').selectOption('1'); await frame.locator('#pilPar').getByText('Nenhuma parada deste ponto').waitFor();
  assert.deepEqual(await tres(frame), ['0 min', '0', '0']); assert.equal(await txt(frame, '#pilOS'), osAntes); assert.equal(await txt(frame, '#pilAc'), acAntes); assert.equal(await txt(frame, '#pilCk'), ckAntes);
  await frame.locator('#pPer').selectOption('30'); await frame.locator('#pilArea [data-pin="2"] .vl').waitFor();
  assert.deepEqual(await tres(frame), referencia.slice(0, 3));

  // checklists previstos agora (um feito hoje, um pendente) e pessoas do posto pelo ID (nome atual do cadastro)
  assert.deepEqual(await frame.evaluate(() => [...document.querySelectorAll('#pilCk li .pill')].map(x => x.textContent).sort()), ['Feito', 'Pendente']);
  assert.match(await frame.evaluate(() => document.querySelector('#pilTab tr[data-ppt="2"]').lastElementChild.textContent), /1 de 2 pendente/);
  const pes = await txt(frame, '#pilPes'); assert.match(pes, /OP3-E/); assert.match(pes, /Pessoa Fictícia de Verificação/); assert.doesNotMatch(pes, /Nome Antigo/); assert.match(pes, /não definido/);

  // escolher pela lista: ponto 10 (equipamento sugerido pelo nome, ação atrasada pelo vínculo de equipamento)
  await frame.locator('#pilTab tr[data-ppt="10"]').click(); await frame.locator('#pilFicha h3').filter({ hasText: 'Rotulagem de tubos A' }).waitFor();
  assert.match(await txt(frame, '#pilEq'), /sugerido/); assert.match(await txt(frame, '#pilAc'), /AC-T-0153/); assert.match(await txt(frame, '#pilAc'), /1 atrasada/);
  // escolher pela planta: ponto 18 não tem equipamento; a tela diz "sem vínculo" em vez de zero
  await frame.locator('#pilArea [data-pin="18"]').click(); await frame.locator('#pilFicha h3').filter({ hasText: 'Saída da linha' }).waitFor();
  assert.deepEqual(await tres(frame), ['sem vínculo', 'sem vínculo', 'sem vínculo']); assert.match(await txt(frame, '#pilOS'), /sem vínculo/);
  assert.match(await frame.locator('#pilArea [data-pin="18"]').getAttribute('title'), /sem equipamento vinculado/);
  assert.equal(await frame.locator('#pilArea [data-pin="18"]').getAttribute('aria-pressed'), 'true');
  // arrastar um marcador não move nada (o piloto tira o arraste dos pinos)
  const pino = frame.locator('#pilArea [data-pin="2"]'), antes = await pino.getAttribute('style'); await pino.dragTo(frame.locator('#pilArea [data-pin="6"]')).catch(() => {});
  assert.equal(await frame.locator('#pilArea [data-pin="2"]').getAttribute('style'), antes, rotulo + ': marcador não se move');
}

async function casoDemo(browser, porta) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage(), erros = []; page.on('pageerror', e => erros.push(e.message));
  try {
    await page.goto('http://127.0.0.1:' + porta + '/?demo=1#/linha?tab=piloto');
    const iframe = page.locator('iframe[title="Módulo Linha 360°"]'); await iframe.waitFor();
    const frame = await (await iframe.elementHandle()).contentFrame();
    await frame.locator('#piloto').waitFor();
    assert.equal(await frame.evaluate(() => Store.test), true, 'demonstração: módulo em modo de teste (nada é gravado)');
    assert.deepEqual(erros, []);
    console.log('ok piloto na demonstração: link direto abre a tela, dados fictícios');
  } finally { await context.close(); }
}

async function casoIsolado(browser) {
  const server = require('../../scripts/servidor-testes.cjs').server(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const context = await browser.newContext(), page = await context.newPage(), erros = []; page.on('pageerror', e => erros.push(e.message));
  try {
    const base = 'http://127.0.0.1:' + server.address().port + '/__modulos__/Linha-360.html?demo=piloto-isolado';
    await page.goto(base + '#aba=piloto'); await page.locator('#piloto').waitFor();
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('#nav [data-t]')].map(b => b.dataset.t)), ABAS_ATUAIS);
    await page.evaluate(() => { location.hash = '#aba=mapa'; }); await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    await page.evaluate(() => { location.hash = '#aba=piloto'; }); await page.locator('#piloto').waitFor();
    await page.evaluate(() => { location.hash = '#aba=nao-existe'; }); await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => App.tab), 'piloto', 'aba desconhecida continua ignorada');
    assert.deepEqual(erros, []);
    console.log('ok piloto no módulo isolado: #aba=piloto na carga e na troca de endereço');
  } finally { await context.close(); server.close(); }
}

(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html')), srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const porta = srv.address().port;
    await casoPasta(browser, porta, 'com perfil que grava', { id: '9099', nome: 'Pessoa Fictícia de Verificação' });
    await casoPasta(browser, porta, 'com perfil de consulta', { id: '7007', nome: 'Pessoa Fictícia de Consulta' });
    await casoPasta(browser, porta, 'sem sessão', null);
    await casoPasta(browser, porta, 'sem Paradas e Equipamentos na pasta', { id: '9099', nome: 'Pessoa Fictícia de Verificação' }, true);
    await casoDemo(browser, porta);
    await casoIsolado(browser);
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
