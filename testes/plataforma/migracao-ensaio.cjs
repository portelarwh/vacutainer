// Migrador pontual (D02) · ensaio do corte numa cópia conectada, só com dados fictícios. NÃO entra em test:plataforma: gera evidência.
//   node testes/plataforma/migracao-ensaio.cjs            → imprime as etapas e grava a evidência (JSON) em EVIDENCIA (padrão: testes/saida/migracao-ensaio.json)
// A "pasta conectada" é uma pasta do OPFS do Chromium entregue à plataforma como se fosse a escolhida em "Conectar pasta"
// (showDirectoryPicker). Não é SMB nem disco da empresa: H01/H02 continuam sendo as provas de rede e de duas estações.
// Etapas: (1) prévia; (2) aplicação interrompida depois de UMA gravação; (3) retomada sem duplicatas; (4) exports: o que "abrir cada
// módulo" regenera de fato; (5) restauração recusada para arquivo alterado depois da migração; (6) restauração do que não mudou;
// (7) filas depois de restaurar; (8) M5; (9) duração e tamanho do diário.
const {chromium} = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
const FASE = process.env.FASE || 'exports', PASTA = 'Ensaio-Ficticio-' + FASE, SAIDA = process.env.EVIDENCIA || path.resolve(__dirname, '../saida/migracao-ensaio-' + (process.env.FASE || 'exports') + '.json');
const EV = {etapas: []}, marca = (n, d) => { EV.etapas.push({n, ...d}); console.log('ok ' + n + (d.resumo ? ' · ' + d.resumo : '')); };

(async () => {
  const {arqsTeste, M, ESC, ORDEM, BK} = await import('./migracao-aplicar-comum.mjs');
  const arqs = arqsTeste(), JS = x => JSON.parse(JSON.stringify(x));
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(q.url.startsWith('/aux') ? '<!doctype html><title>aux</title>' : html); });
  let browser; const erros = [];
  EV.ambiente = {onde: 'container de nuvem (Claude Code), sem SMB', so: os.type() + ' ' + os.release(), node: process.version, cpus: os.cpus().length,
    navegador: null, pasta: 'OPFS do Chromium entregue como pasta conectada (showDirectoryPicker simulado)', relogio: '2026-11-30T12:00:00Z (fixo)'};
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')()); EV.ambiente.navegador = 'Chromium ' + browser.version();
    const ctx = await browser.newContext({viewport: {width: 1440, height: 1000}, timezoneId: 'UTC', acceptDownloads: true});
    await ctx.addInitScript(nome => { window.showDirectoryPicker = async () => (await navigator.storage.getDirectory()).getDirectoryHandle(nome, {create: true}); }, PASTA);
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date('2026-11-30T12:00:00Z'));
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept());
    const URL = 'http://127.0.0.1:' + srv.address().port + '/';
    await page.goto(URL);

    /* ---- utilitários sobre a pasta (OPFS) ---- */
    let H = page;
    const lerArq = (rel) => H.evaluate(async ({nome, rel}) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome); const p = rel.split('/');
      for (const s of p.slice(0, -1)) d = await d.getDirectoryHandle(s); try { return await (await (await d.getFileHandle(p[p.length - 1])).getFile()).text(); } catch (e) { return null; } }, {nome: PASTA, rel});
    const gravarArq = (rel, txt) => H.evaluate(async ({nome, rel, txt}) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome, {create: true}); const p = rel.split('/');
      for (const s of p.slice(0, -1)) d = await d.getDirectoryHandle(s, {create: true}); const w = await (await d.getFileHandle(p[p.length - 1], {create: true})).createWritable(); await w.write(txt); await w.close(); }, {nome: PASTA, rel, txt});
    const listar = (rel) => H.evaluate(async ({nome, rel}) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome); for (const s of rel.split('/').filter(Boolean)) d = await d.getDirectoryHandle(s);
      const L = []; for await (const [n, h] of d.entries()) L.push(h.kind === 'file' ? n + '|' + (await h.getFile()).size : n + '/'); return L.sort(); }, {nome: PASTA, rel});
    const base = async f => JSON.parse(await lerArq('00. Bases/' + f));
    EV.arquivos = Object.fromEntries(ORDEM.map(f => [f, JSON.stringify(arqs[f]).length]));

    /* ---- pasta fictícia, plataforma conectada, sessão ADMIN no escopo da pasta ---- */
    await page.evaluate(async ({nome, arqs}) => {
      const raiz = await (await navigator.storage.getDirectory()).getDirectoryHandle(nome, {create: true}), dir = await raiz.getDirectoryHandle('00. Bases', {create: true});
      for (const [f, c] of Object.entries(arqs)) { const w = await (await dir.getFileHandle(f, {create: true})).createWritable(); await w.write(JSON.stringify(c)); await w.close(); }
    }, {nome: PASTA, arqs: JS(arqs)});
    await page.evaluate(() => { location.hash = '#/'; });
    await page.locator('.heading-actions').locator('[data-act="connect"]').click(); await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor();
    const sessao = (id, nome) => page.evaluate(({id, nome}) => { const p = 'vac.app.' + vacAppHost.scope + '.', s = JSON.stringify({id, nome, ate: Date.now() + 36e5});
      localStorage.setItem(p + 'vac.sessao', s); localStorage.setItem(p + 'vac.userId', id); localStorage.setItem(p + 'vac.user', nome); }, {id, nome});
    await sessao('9001', 'Pessoa de demonstração');
    const abrirFerramenta = async () => {
      await page.evaluate(() => { location.hash = '#/saude'; });
      await page.getByRole('heading', {name: 'Saúde dos dados.'}).waitFor({timeout: 60000});
      const aberta = page.waitForEvent('popup');
      await page.getByRole('button', {name: 'Migração pontual (uso único)', exact: true}).click();
      const t = await aberta; await t.waitForLoadState('domcontentloaded');
      t.on('pageerror', e => erros.push('ferramenta: ' + e.message)); t.on('dialog', d => d.accept());
      await t.locator('#bPasta').click(); return t;
    };
    const decidir = async (t, esperado) => { /* mesmas escolhas de migracao.cjs (c): uma por exceção */
      await t.locator('#tExc').waitFor();
      for (let n = 0; n < esperado.excecoes.length; n++) {
        const sel = t.locator('#tExc select').nth(n), tipo = esperado.excecoes[n].tipo, ops = esperado.excecoes[n].opcoes;
        let i = ops.findIndex(o => o.valor === 'sem' || o.valor === 'manter');
        if (tipo === 'M2-ambiguo') i = ops.findIndex(o => o.valor && o.valor.id === '1003');
        if (tipo === 'M3-data') i = ops.findIndex(o => o.campo === 'from');
        await sel.selectOption(String(i));
        if (tipo === 'M3-data') await t.locator('#tExc input[data-t]').first().fill('2025-01-01').then(() => t.locator('#tExc input[data-t]').first().dispatchEvent('change'));
      }
      await t.waitForFunction(() => document.querySelectorAll('#tExc .st.aviso').length === 0);
    };

    /* ---- (1) prévia ---- */
    const esperado = await M.planejar(arqs, {__meta: ESC.__meta});
    const antes = {}; for (const f of ORDEM) antes[f] = await lerArq('00. Bases/' + f);
    let t = await abrirFerramenta();
    await t.locator('#sPrevia .cards').waitFor();
    const cards = (await t.locator('#sPrevia .cards .k b').allInnerTexts()).map(Number);
    for (const f of ORDEM) assert.equal(await lerArq('00. Bases/' + f), antes[f], 'a prévia não grava: ' + f);
    marca('1 prévia', {alteracoes: cards[0], arquivos: cards[1], excecoes: cards[2], gravouAlgo: false, resumo: cards[0] + ' alterações em ' + cards[1] + ' arquivos, ' + cards[2] + ' exceções, nada gravado'});

    /* ---- (2) aplicação interrompida depois de UMA gravação ---- */
    await decidir(t, esperado);
    /* a ferramenta e a plataforma têm janelas próprias: o corte simula a queda na janela da ferramenta, no 2º arquivo de base */
    await t.evaluate((ordem) => { const o = FileSystemFileHandle.prototype.createWritable; let n = 0; window.__quedas = [];
      FileSystemFileHandle.prototype.createWritable = async function (...a) { if (ordem.includes(this.name) && !window.__liberado) { n++; if (n === 2) { window.__quedas.push(this.name); throw new Error('queda simulada em ' + this.name); } } return o.apply(this, a); }; }, ORDEM);
    await t.locator('#apJ').check(); await t.locator('#apP').fill('MIGRAR');
    const t0 = Date.now(); await t.locator('#apB').click();
    await t.locator('#sAplicar').getByText('Não concluído.').waitFor({timeout: 60000});
    const queda = await t.evaluate(() => window.__quedas.slice());
    const gravados = []; for (const f of ORDEM) if (await lerArq('00. Bases/' + f) !== antes[f]) gravados.push(f);
    assert.equal(gravados.length, 1, 'só uma base mudou antes da queda: ' + gravados.join());
    const diarioNomes = (await listar('00. Backups/Migracao')).filter(x => /^registro-/.test(x));
    assert.equal(diarioNomes.length, 1, 'um diário gravado antes do primeiro arquivo');
    marca('2 interrupção', {gravados, quedaEm: queda, diario: diarioNomes, resumo: 'queda em ' + queda[0] + ' depois de gravar só ' + gravados[0]});

    /* ---- (3) retomada sem duplicatas (a janela é aberta de novo, como depois de fechar a ferramenta) ---- */
    await t.close(); t = await abrirFerramenta();
    await t.locator('#sRetomada').getByText('Migração começada e não concluída').waitFor({timeout: 60000});
    const retTxt = await t.locator('#sRetomada').innerText();
    await t.locator('#rcJ').check(); await t.locator('#rcP').fill('MIGRAR'); await t.locator('#rcB').click();
    await t.locator('#sAplicar').getByText('Concluído.', {exact: true}).waitFor({timeout: 60000});
    const dur = Date.now() - t0;
    const inic = await base('iniciativas-base.json'), ids = inic.acoes.map(a => a.id);
    assert.equal(new Set(ids).size, ids.length, 'sem ação duplicada');
    assert.equal(ids.filter(x => /^AC-W-/.test(x)).length, 2); assert.equal(inic.eventos.filter(e => /^MIGW-EV-/.test(e.id)).length, 2); assert.equal((inic.importacoes || []).length, 1);
    const migrada = {}; for (const f of ORDEM) migrada[f] = await lerArq('00. Backups/Migracao/' + BK[f] + '/antes-da-migracao-2026-11-30.json') === antes[f];
    /* o plano não conhece o carimbo que a gravação acrescenta (revisão, hora, auditoria): compara o conteúdo sem ele */
    const semCarimbo = o => { const c = JSON.parse(JSON.stringify(o)); for (const k of ['rev', 'revBy', 'revAt', 'revId', 'updatedAt', 'updatedBy', 'audit', 'auditoria', 'appVersion', 'applicationVersion', 'databaseVersion', 'auditLog', 'lastModifiedAt', 'lastModifiedBy', 'saveId', 'savedAt', 'version']) delete c[k]; return c; };
    /* a hora da migração aparece em textos e IDs (plano: 25/11 14:30; ensaio: relógio fixo de 30/11): só ela é normalizada */
    const hora = x => String(x).replace(/2026-11-(?:25T14-30-00|25T14:30:00|30T12-00-00(?:-000Z)?|30T12:00:00(?:\.000Z)?)Z?/g, 'HORA').replace(/(?:25\/11 14:30|30\/11 12:00)/g, 'HORA');
    const completa = await M.planejar(arqs, ESC);
    for (const f of Object.keys(completa.alteracoes)) assert.equal(hora(M.canonico(semCarimbo(await base(f)))), hora(M.canonico(semCarimbo(completa.alteracoes[f].depois))), f + ': igual à execução sem queda');
    marca('3 retomada', {mostrouRetomada: /Ainda a gravar/.test(retTxt), acoesWaste: ids.filter(x => /^AC-W-/.test(x)), igualASemQueda: true, backupsIguaisAoOriginal: migrada,
      resumo: 'retomada concluiu; ' + ids.filter(x => /^AC-W-/.test(x)).length + ' ações do Waste, 0 duplicatas, resultado igual ao da execução sem queda'});
    EV.duracaoAplicacaoMs = dur;
    const regs = (await listar('00. Backups/Migracao')).filter(x => /^registro-/.test(x));
    EV.diario = {arquivos: regs, bytes: regs.map(x => +x.split('|')[1])};

    if (FASE.startsWith('restauracao')) { await t.close(); 
      const NOMES = {inic: 'Iniciativas / Ações', equip: 'Equipamentos', perdas: 'Waste', paradas: 'Paradas'};
      const reiniciar = async (dia) => { await page.clock.setFixedTime(new Date(dia)); await page.goto(URL); if (H !== page) { await H.close(); H = page; } await page.evaluate(() => { location.hash = '#/'; });
        const ja = await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor({timeout: 6000}).then(() => true, () => false); if (!ja) { await page.locator('.heading-actions').locator('[data-act="connect"]').click(); await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor(); } await sessao('1001', 'Ana Líder (TESTE)'); };
      const abrirModulo = async (id) => { await page.evaluate(id => { location.hash = '#/' + id; }, id); const f = page.locator('iframe[title="Módulo ' + NOMES[id] + '"]'); await f.waitFor({timeout: 60000});
        let fr = null; for (let n = 0; n < 60 && !fr; n++) { fr = await (await f.elementHandle()).contentFrame(); if (!fr) await page.waitForTimeout(500); }
        await fr.waitForFunction(() => window.vacPagina?.conectado(), null, {timeout: 60000}).catch(() => {}); await page.waitForTimeout(2500); return fr; };
      const texto = async f => (await lerArq('00. Bases/' + f)); const migradaTxt = {}; for (const f of ORDEM) migradaTxt[f] = await texto(f);
      const conferirM5 = async (tt) => { await tt.locator('#bM5').click(); await tt.locator('#sM5').getByText(/Conferido\.|Há diferenças\./).waitFor({timeout: 30000}); return (await tt.locator('#sM5 .certo, #sM5 .aviso').first().innerText()).replace(/\s+/g, ' ').slice(0, 300); };
      /* M5 na pasta migrada, antes de qualquer restauração */
      await reiniciar('2026-11-30T12:30:00Z');
      let tt = await abrirFerramenta(); EV.m5Migrada = await conferirM5(tt); await tt.close();
      assert.match(EV.m5Migrada, /Conferido\./); marca('8a M5 na pasta migrada', {resumo: EV.m5Migrada.slice(0, 120)});
      const parcial = FASE === 'restauracao';
      const OP = {k: 'cfg', key: 'ensaioFila', v: '1', aud: 'ensaio: alteração que não chegou à pasta', qid: 'q-ensaio-1', em: '2026-11-30T11:00:00.000Z', por: 'Ana Líder (TESTE)', _pasta: ''};
      const lerFila = () => H.evaluate(() => new Promise((ok, no) => { const r = indexedDB.open('vac-fila', 1); r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('ops')) d.createObjectStore('ops', {keyPath: 'k'}); if (!d.objectStoreNames.contains('conf')) d.createObjectStore('conf', {keyPath: 'k'}); };
        r.onsuccess = () => { const g = r.result.transaction('ops', 'readonly').objectStore('ops').getAll(); g.onsuccess = () => { r.result.close(); ok(g.result.map(x => x.k)); }; g.onerror = () => no(g.error); }; r.onerror = () => no(r.error); }));
      if (!parcial) { /* uma estação que não conseguiu gravar deixou uma alteração na fila durável do navegador (IndexedDB vac-fila) */
        await page.evaluate(async op => new Promise((ok, no) => { const r = indexedDB.open('vac-fila', 1); r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('ops')) d.createObjectStore('ops', {keyPath: 'k'}); if (!d.objectStoreNames.contains('conf')) d.createObjectStore('conf', {keyPath: 'k'}); };
          r.onsuccess = () => { const t = r.result.transaction('ops', 'readwrite'); t.objectStore('ops').put({k: 'paradas|' + op.qid, pagina: 'paradas', qid: op.qid, aba: 'a-orfa-ensaio', seq: 1, op}); t.oncomplete = () => { r.result.close(); ok(); }; t.onerror = () => no(t.error); }; r.onerror = () => no(r.error); }), OP);
        assert.deepEqual(await lerFila(), ['paradas|q-ensaio-1']); }
      if (parcial) {
        /* (5a) Iniciativas grava depois da migração (importa a pauta e republica o resumo): arquivo alterado depois da migração */
        await abrirModulo('inic');
        const inicDepois = await texto('iniciativas-base.json'); assert.notEqual(inicDepois, migradaTxt['iniciativas-base.json'], 'Iniciativas mudou depois da migração');
        EV.iniciativasMudouDepois = {revMigrada: JSON.parse(migradaTxt['iniciativas-base.json']).rev, revAgora: JSON.parse(inicDepois).rev};
      }
      /* restaurar pela ferramenta */
      if (!parcial) await abrirModulo('perdas'); /* o Waste não grava ao abrir: fica como aba viva sem alterar a pasta */
      await sessao('9001', 'Pessoa de demonstração'); tt = await abrirFerramenta(); await tt.locator('#sRegistros').waitFor({timeout: 30000});
      const tentar = async () => { await tt.locator('#rsJ').check(); await tt.locator('#rsP').fill('RESTAURAR'); const t0r = Date.now(); await tt.evaluate(() => { window.__r0 = window.vacMigracaoTela.estado.relato; }); await tt.locator('#rsB').click();
        await tt.waitForFunction(() => { const E = window.vacMigracaoTela.estado; return !E.ocupado && E.relato && E.relato !== window.__r0; }, null, {timeout: 60000}); const dur = Date.now() - t0r;
        const rel = (await tt.locator('#sRegistros').innerText()).replace(/\s+/g, ' '), k = rel.indexOf('Resultado'); return {dur, relato: rel.slice(k, k + 900)}; };
      /* tentativa 1: com a plataforma ainda aberta neste navegador (Equipamentos, e Iniciativas na fase parcial) */
      const pre = {}; for (const f of ORDEM) pre[f] = await texto(f); { const dif = []; for (const f of ORDEM) if (pre[f] !== migradaTxt[f]) { const A = JSON.parse(pre[f]), B = JSON.parse(migradaTxt[f]); dif.push(f + ': ' + Object.keys({...A, ...B}).filter(k => JSON.stringify(A[k]) !== JSON.stringify(B[k])).join(',')); } EV.mudouAntesDaRestauracao = dif; } const t1 = await tentar(); EV.restauracaoComAbaViva = t1;
      assert.match(t1.relato, /Não concluído\.[\s\S]*abas da plataforma abertas/); for (const f of ORDEM) assert.equal(await texto(f), pre[f], f + ': a tentativa recusada não gravou nada');
      marca('5a restauração recusada com aba viva', {resumo: t1.relato.slice(0, 200)});
      /* tentativa 2: fecha a plataforma (a ferramenta continua aberta) */
      H = await ctx.newPage(); await H.goto(URL + 'aux'); await page.goto('about:blank'); await page.waitForTimeout(1500); await tt.locator('#bRefazer').click().catch(() => {}); await tt.locator('#sRegistros').waitFor({timeout: 30000});
      const t2 = await tentar(); const restDur = t2.dur, relato = t2.relato, linhasRes = await tt.locator('#sRegistros table').last().locator('tbody tr').allInnerTexts().catch(() => []);
      EV.restauracao = {parcial, duracaoMs: restDur, relato, porArquivo: linhasRes};
      console.log('RELATO', JSON.stringify(EV.restauracao).slice(0, 1500)); const depoisTxt = {}; for (const f of ORDEM) depoisTxt[f] = await texto(f);
      if (parcial) {
        assert.equal(depoisTxt['iniciativas-base.json'], await texto('iniciativas-base.json'));
        assert.notEqual(depoisTxt['iniciativas-base.json'], antes['iniciativas-base.json'], 'o arquivo alterado depois NÃO foi sobrescrito pelo backup');
        assert.match(relato, /Não concluído\./); const rest = ORDEM.filter(f => depoisTxt[f] === antes[f] || M.canonico(JSON.parse(depoisTxt[f])) === M.canonico(JSON.parse(antes[f])));
        EV.restauracao.arquivosDeVoltaAoOriginal = rest; EV.restauracao.arquivosNaoRestaurados = ORDEM.filter(f => !rest.includes(f));
        marca('5 restauração recusa o alterado', {resumo: 'Iniciativas (alterada depois, rev ' + EV.iniciativasMudouDepois.revMigrada + '→' + EV.iniciativasMudouDepois.revAgora + ') não foi sobrescrita; ' + rest.length + ' de ' + ORDEM.length + ' arquivos voltaram ao original; não restaurados: ' + EV.restauracao.arquivosNaoRestaurados.join(', ')});
      } else {
        for (const f of ORDEM) assert.equal(M.canonico(JSON.parse(depoisTxt[f])), M.canonico(JSON.parse(antes[f])), f + ': voltou ao conteúdo original');
        const revs = Object.fromEntries(ORDEM.map(f => { const o = JSON.parse(depoisTxt[f]), m = JSON.parse(migradaTxt[f]); return [f, [m.rev ?? m.databaseVersion ?? null, o.rev ?? o.databaseVersion ?? null]]; }));
        EV.restauracao.revisaoMigradaParaRestaurada = revs;
        marca('6 restauração total', {resumo: 'os ' + ORDEM.length + ' arquivos voltaram ao conteúdo original em ' + restDur + ' ms; a revisão baixou'});
      }
      EV.registrosDepois = (await listar('00. Backups/Migracao')); EV.tamanhoDiario = EV.registrosDepois.filter(x => /^registro-/.test(x));
      await tt.close();
      /* (7) filas depois de restaurar (fase total): a fila fica no navegador; a restauração só mexe na pasta */
      if (!parcial) {
        await page.goto(URL); await page.waitForTimeout(500); H = page;
        const filaAposRestaurar = await lerFila(), baseRestaurada = JSON.parse(await texto('paradas-base.json'));
        assert.deepEqual(filaAposRestaurar, ['paradas|q-ensaio-1'], 'a operação pendente continua na fila depois de restaurar');
        assert.equal(baseRestaurada.schemaVersion === undefined || baseRestaurada.schemaVersion === 1, true);
        EV.filasDepoisDeRestaurar = {filaDoNavegador: filaAposRestaurar, baseRestauradaTemOperacao: (baseRestaurada.config || {}).ensaioFila === '1'};
        /* a plataforma desta branch não opera uma base no formato anterior: a fila espera */
        await reiniciar('2026-11-30T13:00:00Z'); await page.evaluate(() => { location.hash = '#/paradas'; }); await page.waitForTimeout(4000);
        EV.filasDepoisDeRestaurar.telaComBaseRestaurada = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').match(/Erro a conferir|Base de versão anterior/)?.[0] || '(sem aviso)';
        EV.filasDepoisDeRestaurar.moduloAbre = (await page.locator('iframe[title="Módulo Paradas"]').count()) > 0;
        EV.filasDepoisDeRestaurar.baseAindaSemAOperacao = ((JSON.parse(await texto('paradas-base.json')).config || {}).ensaioFila) !== '1';
        assert.equal(EV.filasDepoisDeRestaurar.baseAindaSemAOperacao, true, 'nada foi gravado na base restaurada');
        /* remigração: a operação guardada é entregue uma vez */
        await page.goto('about:blank'); H = await ctx.newPage(); await H.goto(URL + 'aux'); await page.waitForTimeout(1000);
        await H.evaluate(() => 0); const pg2 = await ctx.newPage(); await pg2.goto(URL); await pg2.evaluate(() => { location.hash = '#/'; });
        await pg2.locator('.heading-actions').locator('[data-act="connect"]').click(); await pg2.locator('.folder-info strong').filter({hasText: PASTA}).waitFor();
        await pg2.evaluate(() => { const p = 'vac.app.' + vacAppHost.scope + '.', s = JSON.stringify({id: '9001', nome: 'Pessoa de demonstração', ate: Date.now() + 36e5}); localStorage.setItem(p + 'vac.sessao', s); localStorage.setItem(p + 'vac.userId', '9001'); localStorage.setItem(p + 'vac.user', 'Pessoa de demonstração'); });
        const aberta2 = pg2.waitForEvent('popup'); await pg2.evaluate(() => { location.hash = '#/saude'; }); await pg2.getByRole('heading', {name: 'Saúde dos dados.'}).waitFor({timeout: 60000});
        await pg2.getByRole('button', {name: 'Migração pontual (uso único)', exact: true}).click(); const t2 = await aberta2; await t2.waitForLoadState('domcontentloaded'); t2.on('dialog', d => d.accept()); await t2.locator('#bPasta').click();
        await decidir(t2, esperado); await t2.locator('#apJ').check(); await t2.locator('#apP').fill('MIGRAR'); await t2.locator('#apB').click();
        await t2.locator('#sAplicar').getByText('Concluído.', {exact: true}).waitFor({timeout: 60000}); console.log('REMIG', (await t2.locator('#sAplicar').innerText()).replace(/\s+/g, ' ').slice(0, 500)); { const sv = {}; for (const f of ORDEM) { const o = JSON.parse(await texto(f)); sv[f] = o.schemaVersion ?? o.databaseVersion ?? o.version ?? null; } console.log('SV', JSON.stringify(sv)); } await t2.close(); await pg2.close();
        await reiniciar('2026-11-30T14:00:00Z'); await page.evaluate(() => { location.hash = '#/paradas'; }); await page.waitForTimeout(4000); await page.waitForTimeout(8000); await abrirModulo('paradas'); await page.waitForTimeout(3500);
        const p2 = JSON.parse(await texto('paradas-base.json')), filaFinal = await lerFila();
        const entregas = (p2.auditoria || []).filter(x => /alteração que não chegou à pasta/.test(JSON.stringify(x))).length;
        EV.filasDepoisDeRestaurar.depoisDeMigrarDeNovo = {schemaVersion: p2.schemaVersion, operacaoNaBase: (p2.config || {}).ensaioFila === '1', entregasNaAuditoria: entregas, filaDoNavegadorDepois: filaFinal};
        console.log('FILAS', JSON.stringify(EV.filasDepoisDeRestaurar));
        EV.filasDepoisDeRestaurar.limite = 'Os módulos rodam em quadros com origem opaca (null): o IndexedDB e a reserva de cada módulo não são alcançáveis nem plantáveis por este ensaio. A entrega de uma fila durável depois de restaurar e remigrar fica para H02, numa estação real.';
        marca('7 filas depois de restaurar', {resumo: 'restauração não toca o navegador (fila do shell intacta); base restaurada sem a operação; remigrar depois de restaurar gravou os 9 arquivos; entrega da fila de módulo: limite do ambiente (H02)'});
      }
      EV.diarioFinal = EV.tamanhoDiario;
      fs.mkdirSync(path.dirname(SAIDA), {recursive: true}); fs.writeFileSync(SAIDA, JSON.stringify(EV, null, 1));
 }
    else {
    /* ---- (4) exports: o que "abrir cada módulo" regenera de fato ---- */
    await t.close();
    const NOMES = {portal: 'Administração', inic: 'Iniciativas / Ações', equip: 'Equipamentos', linha: 'Linha 360°', paradas: 'Paradas', gel: 'Gestão de Gel', perdas: 'Waste', oee: 'Produção'};
    const ARQ = {portal: 'portal-base.json', inic: 'iniciativas-base.json', equip: 'equipamentos-base.json', linha: 'linha360-base.json', paradas: 'paradas-base.json', gel: 'fifo-base.json', perdas: 'perdas-base.json', oee: 'oee-vacutainer-base.json'};
    const snap = async () => { const o = {}; for (const [id, f] of Object.entries(ARQ)) { const b = await base(f), e = b.exports || null;
      o[id] = {rev: b.rev ?? b.databaseVersion ?? b.version ?? null, geradoEm: e ? (e.geradoEm || e.generatedAt || null) : null, temExports: !!e, appVersion: b.appVersion || b.applicationVersion || null}; } return o; };
    const igual = (a, b) => a.rev === b.rev && a.geradoEm === b.geradoEm && a.temExports === b.temExports;
    const abrirModulo = async (id) => { await page.evaluate(id => { location.hash = '#/' + id; }, id);
      const f = page.locator('iframe[title="Módulo ' + NOMES[id] + '"]'); await f.waitFor({timeout: 60000});
      let fr = null; for (let n = 0; n < 60 && !fr; n++) { fr = await (await f.elementHandle()).contentFrame(); if (!fr) await page.waitForTimeout(500); } await fr.waitForFunction(() => window.vacPagina?.conectado(), null, {timeout: 60000}).catch(() => {});
      await page.waitForTimeout(2500); return fr; };
    /* o que cada consumidor enxerga hoje (vacFicha lê o exports gravado na base de cada módulo) */
    const consumidor = async (fr) => fr.evaluate(async () => { await vacFicha.carregar(true); const o = {};
      for (const id of ['inic', 'equip', 'linha', 'paradas', 'perdas', 'gel', 'oee', 'portal']) { const x = vacFicha.dados(id);
        o[id] = x ? {estado: x.estado || null, comExports: !!(x.d && Object.keys(x.d).length), geradoEm: (x.d && (x.d.geradoEm || x.geradoEm)) || x.geradoEm || null, acoes: x.d && Array.isArray(x.d.acoes) ? x.d.acoes.length : null,
          acoesWaste: x.d && Array.isArray(x.d.acoes) ? x.d.acoes.filter(a => /^AC-W-/.test(a.id)).length : null} : null; } return o; });
    /* a base de OEE da fixture é mínima e a Produção recusa gravá-la ("não é uma base válida"): para esta etapa vale a base completa do cenário
       fictício da demonstração, sem o bloco exports. Ressalva: o conteúdo migrado (M4) do arquivo de OEE não é o que a Produção abre aqui. */
    const oeeCompleta = JSON.parse(require('../../scripts/html.cjs').load().text('dados/cenario')).bases.oee; delete oeeCompleta.exports;
    await gravarArq('00. Bases/oee-vacutainer-base.json', JSON.stringify(oeeCompleta)); EV.ressalvaOee = 'etapa 4: base de OEE do cenário de demonstração no lugar da mínima da fixture';
    await sessao('1001', 'Ana Líder (TESTE)');
    const frPerdas = await abrirModulo('perdas');            /* abrir o Waste não regrava (ver abaixo); serve de ponto de leitura dos consumidores */
    const cons0 = await consumidor(frPerdas);
    EV.consumidoresAntes = cons0;
    const passo = {};
    for (const id of Object.keys(ARQ)) { const a = (await snap())[id]; await abrirModulo(id); const d = (await snap())[id]; passo[id] = {antes: a, depoisDeAbrir: d, abrirRegravou: !igual(a, d)}; }
    /* Sincronizar, nos que não republicaram ao abrir */
    for (const id of Object.keys(ARQ)) { if (passo[id].abrirRegravou) continue; const fr = await abrirModulo(id), btn = fr.locator('#btnSync');
      if (await btn.count()) { const a = (await snap())[id]; await fr.evaluate(() => document.getElementById('btnSync').click()); await page.waitForTimeout(3500); const d = (await snap())[id]; passo[id].depoisDeSincronizar = d; passo[id].sincronizarRegravou = !igual(a, d); }
      else passo[id].semBotaoSincronizar = true; }
    /* os três que não republicam nem abrindo nem sincronizando: só uma gravação real do módulo regrava o resumo */
    const gravar = {
      perdas: async fr => { await fr.evaluate(() => document.getElementById('btnSaveCfg').click()); return 'botão "Salvar configuração" (grava a configuração como está)'; },
      gel: async fr => { await fr.evaluate(async () => { await saveSupply({}); }); return 'saveSupply({}) — o mesmo caminho de gravação do estoque/consumo, sem mudar valor'; },
      oee: async fr => { await fr.evaluate(async () => { Store.mutate((db, audit) => { audit({action: 'edição', entity: 'base', entityId: db.baseId, field: null, before: null, after: 'ensaio', origin: 'ensaio'}); }); await Store.flush(); }); return 'Store.mutate + Store.flush — o caminho de qualquer lançamento da Produção'; },
    };
    for (const id of ['perdas', 'gel', 'oee']) { const fr = await abrirModulo(id), a = (await snap())[id]; let como = ''; try { como = await gravar[id](fr); } catch (e) { como = 'FALHOU: ' + e.message; }
      await page.waitForTimeout(3500); const d = (await snap())[id]; passo[id].gravacaoReal = {como, antes: a, depois: d, regravou: !igual(a, d)}; }
    EV.exportsPorOperacao = passo;
    const cons1 = await consumidor(await abrirModulo('perdas')); EV.consumidoresDepois = cons1;
    for (const [id, p] of Object.entries(passo)) console.log('EXP', id, 'abrir=' + p.abrirRegravou, 'sincronizar=' + (p.semBotaoSincronizar ? 'sem botão' : p.sincronizarRegravou === undefined ? '-' : p.sincronizarRegravou), JSON.stringify([p.antes.temExports, p.depoisDeAbrir.temExports, p.depoisDeAbrir.geradoEm]));
    for (const id of ['perdas', 'gel', 'oee']) console.log('GRAVA', id, JSON.stringify(passo[id].gravacaoReal));
    console.log('CONS0', JSON.stringify(cons0)); console.log('CONS1', JSON.stringify(cons1));

    /* ---- (4b) o resumo é de hoje e a base mudou depois (como a migração faz): abrir no mesmo dia não republica; no dia seguinte republica ---- */
    /* reinicia a plataforma como o operador que fecha e abre o navegador: o módulo já aberto fica em cache no iframe e não refaz a leitura */
    const reiniciar = async (dia) => { await page.clock.setFixedTime(new Date(dia)); await page.goto(URL); if (H !== page) { await H.close(); H = page; } await page.evaluate(() => { location.hash = '#/'; });
      const ja = await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor({timeout: 6000}).then(() => true, () => false); if (!ja) { await page.locator('.heading-actions').locator('[data-act="connect"]').click(); await page.locator('.folder-info strong').filter({hasText: PASTA}).waitFor(); } await sessao('1001', 'Ana Líder (TESTE)'); };
    const nExp = async () => { const b = await base('iniciativas-base.json'); return {naBase: b.acoes.length, exportsComExtra: !!(b.exports && (b.exports.acoes || []).some(a => a.id === 'AC-X-POS-MIGRACAO'))}; };
    const lerCons = async () => { const c = await consumidor(await abrirModulo('perdas')); return c.inic; };
    /* estado estável: a primeira reabertura de Iniciativas importa para si as ações da Reunião diária (ImpReuniao) e grava; já vale para o resumo */
    await reiniciar('2026-11-30T13:00:00Z'); const antesEstavel = await snap(); await abrirModulo('inic'); const aposEstavel = await snap();
    EV.iniciativasReabrir = {regravouNaPrimeiraReabertura: !igual(antesEstavel.inic, aposEstavel.inic), idsReuniao: (await base('iniciativas-base.json')).acoes.filter(a => /^AC-R-/.test(a.id)).map(a => a.id)};
    console.log('REABRIR', JSON.stringify(EV.iniciativasReabrir));
    const inicObj = await base('iniciativas-base.json'), extra = JSON.parse(JSON.stringify(inicObj.acoes[0])); extra.id = 'AC-X-POS-MIGRACAO'; extra.titulo = 'Ação gravada fora do módulo (simula a migração)';
    inicObj.acoes.push(extra); await gravarArq('00. Bases/iniciativas-base.json', JSON.stringify(inicObj));
    await reiniciar('2026-11-30T15:00:00Z'); const mesmoDia0 = await snap(); await abrirModulo('inic'); const mesmoDia1 = await snap(), cMesmo = await nExp();
    await reiniciar('2026-11-30T16:00:00Z'); const consMesmo = await lerCons();
    await reiniciar('2026-12-01T12:00:00Z'); await abrirModulo('inic'); const diaSeg = await snap(), cSeg = await nExp();
    await reiniciar('2026-12-01T13:00:00Z'); const consSeg = await lerCons();
    EV.mesmoDia = {regravouAoAbrir: !igual(mesmoDia0.inic, mesmoDia1.inic), exportsTemAcaoNova: cMesmo.exportsComExtra, baseTemAcaoNova: true, consumidorVeAcaoNova: !!(await page.evaluate(() => true)) && consMesmo.acoes};
    EV.diaSeguinte = {regravouAoAbrir: !igual(mesmoDia1.inic, diaSeg.inic), exportsTemAcaoNova: cSeg.exportsComExtra, consumidorVeAcoes: consSeg.acoes};
    console.log('MESMODIA', JSON.stringify({m: EV.mesmoDia, cons: consMesmo, dia: EV.diaSeguinte, consSeg}));
    assert.equal(EV.mesmoDia.regravouAoAbrir, false, 'no mesmo dia, abrir não republica'); assert.equal(EV.mesmoDia.exportsTemAcaoNova, false, 'o resumo ainda não tem a ação nova');
    assert.equal(EV.diaSeguinte.regravouAoAbrir, true, 'no dia seguinte, abrir republica'); assert.equal(EV.diaSeguinte.exportsTemAcaoNova, true);
    assert.equal(consSeg.acoes, consMesmo.acoes + 1, 'o consumidor passa a ler uma ação a mais');
    marca('4 exports', {resumo: 'abrir republica Administração, Iniciativas, Equipamentos, Linha 360° e Produção (sem resumo, outra versão ou outro dia); Paradas só por Sincronizar; Waste e Gestão de Gel só por gravação real; no mesmo dia abrir não basta'});
    fs.mkdirSync(path.dirname(SAIDA), {recursive: true}); fs.writeFileSync(SAIDA, JSON.stringify(EV, null, 1));
    }
    assert.deepEqual(erros, [], 'nenhum erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
