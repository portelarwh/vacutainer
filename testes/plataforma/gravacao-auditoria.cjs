// Plataforma 1.8.107 · auditoria técnica de 28/11/2026 (Codex, revisada): fluxos de gravação. Demonstração, dados fictícios; a pasta é
// simulada nas funções de leitura e gravação do próprio motor (nenhum arquivo da linha é aberto). O que este teste prova:
//  A01 Gel: uma edição feita enquanto a gravação relê a base que outra pessoa gravou entra na gravação e não se perde;
//  A09 Gel: base já lida que sumiu da pasta não é recriada com a cópia local; a fila continua guardada;
//  A02 Administração: se a releitura final antes de gravar falhar, nada é gravado e a alteração fica pendente;
//  A11 Equipamentos: a reaplicação da fila não aceita segunda vigência da TAG com a mesma data de início;
//  A12 Linha 360°: "Desfazer a marcação" anula a conclusão do checklist.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const base = 'http://127.0.0.1:' + srv.address().port + '/?demo=1';
    const erros = [];
    const modulo = async (rota, nome) => {
      const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => erros.push(nome + ': ' + e.message)); p.on('dialog', d => d.accept());
      await p.goto(base + '#/' + rota);
      const f = await (await p.locator(`iframe[title="Módulo ${nome}"]`).elementHandle({ timeout: 60000 })).contentFrame();
      await f.waitForFunction(() => window.vacPagina && vacPagina.pronto(), null, { timeout: 60000 }); return { p, f };
    };

    // A01 e A09 · Gestão de Gel
    { const { p, f } = await modulo('gel', 'Gestão de Gel');
      const r = await f.evaluate(async () => {
        const mud = cfg => ({ lps: { del: [], set: [] }, closed: { del: [], set: [] }, events: [], imports: [], config: cfg });
        const externa = (() => { const d = JSON.parse(JSON.stringify(snapshotData())); d.config = { ...d.config, testeExterno: 'outra estação' }; return d; })();
        const gravadas = []; let leituras = 0, segunda = null;
        FS.base = { getFileHandle: async () => ({}) }; FS.on = true; FS.pending = []; FS.err = ''; FS.mod = 1; FS.rev = 4; FS.revBy = 'eu';
        fsReadHead = async () => ({ rev: FS.rev, by: FS_WRITER });
        fsWriteBase = async obj => { gravadas.push(JSON.parse(JSON.stringify(obj.config))); FS.rev = (FS.rev || 0) + 1; FS.revBy = FS_WRITER; };
        fsReadBase = async () => { leituras++; if (leituras === 1) { segunda = mud({ testeB: 'durante a releitura' }); applyLocal(segunda); FS.pending.push(segunda); return { data: externa, mod: 2, rev: 5, by: 'outra' }; } return { same: true }; };
        const a = mud({ testeA: 'antes' }); applyLocal(a); FS.pending.push(a);
        await fsFlush();
        const ultima = gravadas[gravadas.length - 1] || {}, fila = FS.pending.length;
        // A09: a base sumiu da pasta
        fsReadBase = async () => null; gravadas.length = 0; FS.mod = 0; const c = mud({ testeC: 'base sumiu' }); applyLocal(c); FS.pending.push(c);
        await fsFlush();
        return { ultima, fila, sumiu: { gravou: gravadas.length, fila: FS.pending.length, err: FS.err } };
      });
      assert.equal(r.ultima.testeA, 'antes', 'a alteração da captura entra'); assert.equal(r.ultima.testeB, 'durante a releitura', 'a edição feita durante a releitura também entra (A01)');
      assert.equal(r.ultima.testeExterno, 'outra estação', 'o que a outra estação gravou fica'); assert.equal(r.fila, 0, 'fila vazia só depois de gravar tudo');
      console.log('ok A01 Gel: edição feita durante a releitura entra na gravação junto com a da outra estação; fila vazia no fim');
      assert.equal(r.sumiu.gravou, 0, 'base sumida não é recriada (A09)'); assert.equal(r.sumiu.fila, 1, 'a alteração continua na fila'); assert.match(r.sumiu.err, /sumiu da pasta/);
      console.log('ok A09 Gel: base que sumiu da pasta não é recriada; a alteração continua guardada ("' + r.sumiu.err.slice(0, 60) + '…")');
      await p.close(); }

    // A02 · Administração
    { const { p, f } = await modulo('portal', 'Administração');
      const r = await f.evaluate(async () => {
        const S = Store, b0 = JSON.parse(JSON.stringify(S.B)), lida = { data: JSON.parse(JSON.stringify(b0)), mod: 10 };
        let leituras = 0, gravou = 0; const modo = S.mode;
        S.mode = 'pasta'; S.pending = false; S.formato = '';
        S.readRemote = async () => { leituras++; if (leituras === 1) return lida; throw new Error('rede caiu (fictício)'); };
        S.writeRemote = async () => { gravou++; };
        S.idb = { set: async () => {}, get: async () => null };
        try { await S._commit('teste A02', b => { b.testeA02 = 1; }); } catch (e) { return { erro: e.message }; }
        const out = { leituras, gravou, pending: S.pending, aplicada: S.B.testeA02 === 1 };
        S.mode = modo; S.pending = false; return out;
      });
      assert.equal(r.leituras, 2, 'leu antes e na conferência final'); assert.equal(r.gravou, 0, 'releitura final falhou: nada gravado (A02)');
      assert.equal(r.pending, true, 'a alteração fica pendente neste computador'); assert.equal(r.aplicada, true, 'e continua na tela');
      console.log('ok A02 Administração: releitura final que falha não grava; a alteração fica pendente neste computador');
      await p.close(); }

    // A11 · Equipamentos
    { const { p, f } = await modulo('equip', 'Equipamentos');
      const r = await f.evaluate(() => {
        const D = { tags: [{ codigo: 'TAG-FICT', vigencias: [{ id: 'v1', de: '2026-11-01', tipo: 'contador' }] }] };
        applyOp(D, { k: 'tagvig', cod: 'TAG-FICT', vig: { id: 'v2', de: '2026-11-01', tipo: 'nível' }, em: '2026-11-28T10:00:00Z', por: 'teste' });
        applyOp(D, { k: 'tagvig', cod: 'TAG-FICT', vig: { id: 'v3', de: '2026-11-15', tipo: 'nível' }, em: '2026-11-28T10:00:00Z', por: 'teste' });
        return D.tags[0].vigencias.map(v => v.id);
      });
      assert.deepEqual(r, ['v1', 'v3'], 'segunda vigência com a mesma data não entra; outra data entra (A11)');
      console.log('ok A11 Equipamentos: a fila não grava duas vigências da TAG com a mesma data de início');
      await p.close(); }

    // A12 · Linha 360°
    { const { p, f } = await modulo('linha', 'Linha 360°');
      const r = await f.evaluate(() => {
        const id = 'feito-ficticio-a12'; Store.data.feitos = Store.data.feitos || [];
        Store.data.feitos.push({ id, checklist: 'CK-FICT', em: '2026-11-28T09:00:00Z', por: 'teste' });
        Store.commit({ k: 'desfeito', alvo: id }, { silencio: true });
        const x = Store.data.feitos.find(y => y.id === id); return { anulado: !!(x && x.anulado) };
      });
      assert.equal(r.anulado, true, 'Desfazer a marcação anula a conclusão (A12)');
      console.log('ok A12 Linha 360°: Desfazer a marcação anula a conclusão do checklist');
      await p.close(); }

    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
