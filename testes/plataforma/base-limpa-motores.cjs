// Base limpa · bloco 2 (25/11/2026): Ordens, Waste e Gestão de Gel não leem nem gravam base de versão anterior. Dados fictícios,
// pasta simulada em OPFS (não é SMB). Em cada motor:
//   (1) arquivo sem schemaVersion (versão anterior): o texto exato "Base de versão anterior. Comece uma base nova nesta pasta." aparece,
//       nada é convertido e o arquivo na pasta continua byte a byte igual;
//   (2) arquivo de versão atual: abre e grava como sempre (a trava não pega base boa).
// Ordens e Produção são o mesmo bloco (motor/oee); Waste e Gel têm a página própria.
const { chromium } = require('playwright'), assert = require('assert/strict');
const BLOQUEIO = 'Base de versão anterior. Comece uma base nova nesta pasta.';

// Prepara a pasta fictícia (00. Bases/<arquivo>) e devolve ajudantes de leitura/escrita. Roda dentro da página.
const PREPARAR = `(async (nome) => {
  const opfs = await navigator.storage.getDirectory();
  try { await opfs.removeEntry(nome, { recursive: true }); } catch (e) { }
  const raiz = await opfs.getDirectoryHandle(nome, { create: true }), bases = await raiz.getDirectoryHandle('00. Bases', { create: true });
  const grava = async (arq, txt) => { const w = await (await bases.getFileHandle(arq, { create: true })).createWritable(); await w.write(txt); await w.close(); };
  const le = async arq => (await (await bases.getFileHandle(arq)).getFile()).text();
  return { raiz, grava, le };
})`;

(async () => {
  const srv = require('../../scripts/servidor-testes.cjs').server(); await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  const abrir = async (arquivo, pronto) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage();
    p.on('pageerror', e => erros.push(arquivo + ': ' + e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/' + arquivo);
    await p.waitForFunction(pronto, null, { timeout: 60000 });
    return { p, ctx };
  };
  try {
    // ---------- Ordens (motor/oee) ----------
    {
      const { p, ctx } = await abrir('OEE-Vacutainer.html', () => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof Ord !== 'undefined');
      const r = await p.evaluate(async (PREP) => {
        const { raiz, grava, le } = await eval(PREP)('Pasta-Ficticia-Ordens');
        const root = vacRaiz(raiz); Store.S.backend = FolderBackend(root); Store.S.mode = 'pasta'; Store.S.user = 'Teste (fictício)';
        const out = {};
        // (1) versão anterior
        const velha = Ord.vazio(); delete velha.schemaVersion; velha.rev = 3; velha.revId = 'r-velha'; velha.competencias = { '2026-10': { planta: '4017', ordens: [] } };
        const txtVelha = JSON.stringify(velha); await grava('ordens-base.json', txtVelha);
        Ord.carregado = false; await Ord.carregar(true);
        out.velha = { formato: Ord.formato, err: Ord.err, mostra: !!(Ord.B && Ord.B.competencias['2026-10']) };
        try { await Ord.gravar('2026-10', 'teste'); out.grava = 'gravou'; } catch (e) { out.grava = e.message; }
        out.velhaIntacta = (await le('ordens-base.json')) === txtVelha;
        // (2) versão atual
        const boa = Ord.vazio(); boa.rev = 5; boa.revId = 'r-boa'; boa.competencias = { '2026-10': { planta: '4017', ordens: [] } };
        await grava('ordens-base.json', JSON.stringify(boa));
        Ord.carregado = false; await Ord.carregar(true);
        out.boa = { formato: Ord.formato, err: Ord.err };
        try { await Ord.gravar('2026-10', 'teste'); const g = JSON.parse(await le('ordens-base.json')); out.boaGrava = { rev: g.rev, sv: g.schemaVersion }; } catch (e) { out.boaGrava = e.message; }
        return out;
      }, PREPARAR);
      assert.equal(r.velha.formato, BLOQUEIO, 'Ordens: formato da base anterior ' + JSON.stringify(r));
      assert.match(r.velha.err, /Base de versão anterior\. Comece uma base nova nesta pasta\./, 'Ordens: o aviso aparece na tela');
      assert.equal(r.velha.mostra, true, 'Ordens: a base anterior continua visível para consulta');
      assert.match(r.grava, /Base de versão anterior/, 'Ordens: gravar é recusado (' + r.grava + ')');
      assert.equal(r.velhaIntacta, true, 'Ordens: o arquivo da pasta não foi tocado');
      assert.deepEqual(r.boa, { formato: '', err: '' }, 'Ordens: base atual abre sem aviso');
      assert.deepEqual(r.boaGrava, { rev: 6, sv: 1 }, 'Ordens: base atual grava normalmente ' + JSON.stringify(r.boaGrava));
      console.log('ok (1) Ordens: base anterior só consulta, sem gravar e sem converter; base atual grava como sempre');
      await ctx.close();
    }

    // ---------- Waste (motor/perdas) ----------
    {
      const { p, ctx } = await abrir('Perdas-Ordem.html', () => typeof connectBase === 'function' && typeof emptyBase === 'function' && typeof ST !== 'undefined');
      const r = await p.evaluate(async (PREP) => {
        const { raiz, grava, le } = await eval(PREP)('Pasta-Ficticia-Waste');
        const out = {};
        const velha = emptyBase(); delete velha.schemaVersion; velha.rev = 7; velha.updatedBy = 'Fictício';
        const txtVelha = JSON.stringify(velha); await grava('perdas-base.json', txtVelha);
        const ok1 = await connectBase(raiz);
        out.velha = { conectou: ok1, modo: ST.mode, rev: B.rev, intacta: (await le('perdas-base.json')) === txtVelha };
        try { await restoreBase(JSON.parse(txtVelha), 'cópia-anterior.json'); out.restaura = 'restaurou'; } catch (e) { out.restaura = e.message; }
        const boa = emptyBase(); boa.rev = 9; await grava('perdas-base.json', JSON.stringify(boa));
        const ok2 = await connectBase(raiz);
        out.boa = { conectou: ok2, modo: ST.mode, rev: B.rev };
        await commit('teste do bloqueio', b => { b.config.meta = 123; });
        const g = JSON.parse(await le('perdas-base.json')); out.boaGrava = { rev: g.rev, sv: g.schemaVersion, meta: g.config.meta };
        return out;
      }, PREPARAR);
      assert.deepEqual(r.velha, { conectou: false, modo: 'local', rev: 0, intacta: true }, 'Waste: base anterior não conecta, não é carregada e a pasta não é tocada ' + JSON.stringify(r.velha));
      assert.match(r.restaura, /Base de versão anterior/, 'Waste: restaurar cópia de versão anterior é recusado (' + r.restaura + ')');
      assert.deepEqual(r.boa, { conectou: true, modo: 'pasta', rev: 9 }, 'Waste: base atual conecta ' + JSON.stringify(r.boa));
      assert.deepEqual(r.boaGrava, { rev: 10, sv: 1, meta: 123 }, 'Waste: base atual grava como sempre ' + JSON.stringify(r.boaGrava));
      console.log('ok (2) Waste: base anterior não é lida nem gravada; cópia anterior recusada; base atual grava como sempre');
      await ctx.close();
    }

    // ---------- Gestão de Gel (motor/gel) ----------
    {
      const { p, ctx } = await abrir('Gestão-Gel-Vacutainer.html', () => typeof fsUse === 'function' && typeof S !== 'undefined' && typeof snapshotData === 'function');
      const r = await p.evaluate(async (PREP) => {
        const { raiz, grava, le } = await eval(PREP)('Pasta-Ficticia-Gel');
        const out = {};
        const base = (extra) => JSON.stringify({ rev: 4, revBy: 'Fictício', ...extra, version: 1, savedAt: '2026-11-20 10:00', lps: [], closed: [], events: [], imports: [], config: {}, plan: {}, catalogs: [], prodlog: {}, supply: {} });
        const txtVelha = base({}); await grava('fifo-base.json', txtVelha);
        try { out.velha = { r: await fsUse(raiz, {}) }; } catch (e) { out.velha = { erro: e.message }; }
        out.velhaIntacta = (await le('fifo-base.json')) === txtVelha; out.modo = S.mode;
        try { await restoreData(JSON.parse(txtVelha)); out.restaura = 'restaurou'; } catch (e) { out.restaura = e.message; }
        await grava('fifo-base.json', base({ schemaVersion: 1 }));
        out.boa = { r: await fsUse(raiz, {}), modo: S.mode };
        return out;
      }, PREPARAR);
      assert.match(r.velha.erro || '', /Base de versão anterior\. Comece uma base nova nesta pasta\./, 'Gel: base anterior é recusada com o texto exato ' + JSON.stringify(r));
      assert.equal(r.velhaIntacta, true, 'Gel: o arquivo da pasta não foi tocado');
      assert.notEqual(r.modo, 'file', 'Gel: não entrou em modo pasta com a base anterior');
      assert.match(r.restaura, /Base de versão anterior/, 'Gel: restaurar cópia de versão anterior é recusado (' + r.restaura + ')');
      assert.deepEqual(r.boa, { r: true, modo: 'file' }, 'Gel: base atual abre como sempre ' + JSON.stringify(r.boa));
      console.log('ok (3) Gestão de Gel: base anterior não é lida nem gravada; cópia anterior recusada; base atual abre como sempre');
      await ctx.close();
    }

    assert.deepEqual(erros, [], 'sem erro de JavaScript: ' + erros.join(' | '));
    console.log('ok (e) sem erro de JavaScript');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
