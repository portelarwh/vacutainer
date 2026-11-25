// Bloco 3 · Task 3: a base da Produção não guarda as tabelas de cadastro. Elas são montadas em memória pelo ProdCad a partir do
// cadastro da Administração e ficam fora do arquivo gravado. Cadastro ausente ou ilegível mostra o aviso (e é diferente entre si);
// mudar o cadastro com a página aberta remonta as tabelas sem gravar nada na base. Dados fictícios, pasta em memória.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { server } = require('../../scripts/servidor-testes.cjs');
const { CADASTRO } = require('./prodcad-fixture.cjs');
const TAB = ['lines', 'machines', 'families', 'catalogs', 'shifts', 'targets', 'downtimeCodes'];

(async () => {
  const srv = server(); await new Promise((resolve, reject) => { srv.once('error', reject); srv.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch(require('./chromium.cjs')()), erros = [];
  const abrir = async () => {
    const p = await (await browser.newContext({ timezoneId: 'America/Sao_Paulo', viewport: { width: 1280, height: 900 } })).newPage();
    p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('http://127.0.0.1:' + srv.address().port + '/__modulos__/OEE-Vacutainer.html');
    await p.waitForFunction(() => typeof Store !== 'undefined' && Store.S && Store.S.db && typeof ProdCad !== 'undefined', null, { timeout: 60000 });
    return p;
  };
  try {
    // (a) com cadastro: tabelas em memória, arquivo gravado sem elas, mudança do cadastro remonta sem auditar nem sujar a base
    const p = await abrir();
    const a = await p.evaluate(async ([C, TAB]) => {
      const out = {}, base = Model.emptyBase('teste'), be = MemoryBackend(JSON.stringify(base));
      be.files.siblings = { 'vacutainer-cadastros.json': JSON.stringify(C) };
      await Store.connect(be); await Store.readCadastro();
      out.estado = Store.S.cadastroEstado; out.contagens = TAB.map(k => k + '=' + db()[k].length).join(' ');
      Store.mutate(d => { d.settings.note = 'x'; }); await Store.flush();
      const g = JSON.parse(be.files.base);
      out.arquivoSemTabelas = TAB.every(k => !(k in g)); out.marcasPortalNoArquivo = (g.calendar || []).filter(c => c.origin === 'portal').length;
      out.marcasPortalNaMemoria = db().calendar.filter(c => c.origin === 'portal').length;
      out.auditAntes = db().auditLog.length;
      const C2 = JSON.parse(JSON.stringify(C)); C2.rev = 8; C2.revId = 'r2'; C2.catalogos[1].vigencias.push({ de: '2026-03-01', pphNominal: 95 });
      be.files.siblings['vacutainer-cadastros.json'] = JSON.stringify(C2); await Store.readCadastro();
      out.catalogosDepois = db().catalogs.filter(c => c.code === '360055').map(c => c.validFrom + ':' + c.pph);
      out.auditDepois = db().auditLog.length; out.sujo = Store.S.dirty;
      return out;
    }, [CADASTRO, TAB]);
    assert.equal(a.estado, 'ok', 'cadastro lido: estado ok');
    assert.equal(a.contagens, 'lines=1 machines=3 families=2 catalogs=3 shifts=3 targets=2 downtimeCodes=3', 'tabelas montadas em memória (os 3 códigos de parada são REF, FME e o RTB que o Model.ensure acrescenta por política de retrabalho): ' + a.contagens);
    assert.equal(a.arquivoSemTabelas, true, 'o arquivo gravado não tem as 7 tabelas');
    assert.equal(a.marcasPortalNoArquivo, 0, 'marcas de calendário do cadastro não vão para o arquivo');
    assert.equal(a.marcasPortalNaMemoria, 2, 'mas existem em memória');
    assert.deepEqual(a.catalogosDepois, ['2025-01-01:90', '2026-03-01:95'], 'nova vigência do cadastro remonta o catálogo');
    assert.equal(a.auditDepois, a.auditAntes, 'trocar o cadastro não grava auditoria na base da Produção');
    assert.equal(a.sujo, false, 'trocar o cadastro não suja a base');
    // (b) sem cadastro e com cadastro ilegível: estados diferentes, aviso visível, tabelas vazias (nada vira zero)
    for (const [nome, sib, esperado, texto] of [['ausente', {}, 'ausente', /Cadastro da Administração não encontrado/], ['ilegível', { 'vacutainer-cadastros.json': '{nao e json' }, 'erro', /Cadastro da Administração ilegível/]]) {
      const q = await abrir();
      const r = await q.evaluate(async ([sib, TAB]) => {
        const be = MemoryBackend(JSON.stringify(Model.emptyBase('teste'))); be.files.siblings = sib;
        await Store.connect(be); await Store.readCadastro(); render();
        return { estado: Store.S.cadastroEstado, vazias: TAB.every(k => db()[k].length === 0), aviso: (document.querySelector('[data-vac-cadastro]') || {}).innerText || '' };
      }, [sib, TAB]);
      assert.equal(r.estado, esperado, nome + ': estado');
      assert.equal(r.vazias, true, nome + ': tabelas vazias');
      assert.match(r.aviso, texto, nome + ': aviso visível (' + r.aviso.slice(0, 80) + ')');
    }
    assert.deepEqual(erros, []);
    console.log('ok base da Produção sem as tabelas de cadastro: montadas em memória, fora do arquivo; ausente e ilegível avisam; trocar o cadastro remonta sem gravar');
  } finally { await browser.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
