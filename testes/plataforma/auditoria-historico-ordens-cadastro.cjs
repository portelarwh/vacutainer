// P4 (análise comum 26/11/2026): também nas Ordens da Produção (lista ativa de 5.000) e no cadastro (20.000), o que sai da lista ativa
// da trilha vai, depois da gravação confirmada, para o arquivo mensal historico-auditoria_AAAA-MM.jsonl em 00. Backups/Ordens e
// 00. Backups/Cadastros. Pasta fictícia em OPFS.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('oee', 'Módulo Produção', async f => {
    await f.waitForFunction(() => Store.S && Store.S.mode === 'pasta' && Store.S.backend && Store.S.backend.backupSub, null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      await Ord.carregar(true); const comp = '2026-10';
      Ord.B.competencias[comp] = { planta: 'PF01', linhas: [], importadoEm: new Date().toISOString() }; Ord.aud('teste', 'cria'); await Ord.gravar(comp, 'importação');
      Ord.B.auditoria = Array.from({ length: 5000 }, (_, i) => ({ em: (i < 3 ? '2026-09-0' + (i + 1) : '2026-11-10') + 'T10:00:00.000Z', por: 'Pessoa Fictícia', acao: 'a' + i, comp, det: '' }));
      Ord.aud('teste', 'mais uma'); Ord.B.competencias[comp].planta = 'PF02'; await Ord.gravar(comp, 'importação'); await new Promise(r => setTimeout(r, 1200));
      const d = await (await Store.S.backend.backupRoot()).getDirectoryHandle(ORD_BK);
      let L = null; try { L = (await (await (await d.getFileHandle('historico-auditoria_2026-09.jsonl')).getFile()).text()).trim().split('\n').map(x => JSON.parse(x).acao); } catch (e) { L = 'ERRO ' + e.message; }
      return { ativa: Ord.B.auditoria.length, hist: L };
    });
    assert.equal(r.ativa, 5000, 'a lista ativa das Ordens continua com 5.000: ' + JSON.stringify(r));
    assert.deepEqual(r.hist, ['a0'], 'a entrada que saiu ficou no histórico das Ordens: ' + JSON.stringify(r));
    console.log('ok Ordens: o que sai da lista ativa (5.000) vai para 00. Backups/Ordens/historico-auditoria_2026-09.jsonl');
  });
  await abrir('portal', 'Módulo Administração', async f => {
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Store.mode === 'pasta' && Cad.base && Cad.fonte === 'pasta', null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      const h = await Store.dir.getFileHandle(CAD_FILE), doc = JSON.parse(await (await h.getFile()).text());
      doc.auditoria = Array.from({ length: CAD_AUD_MAX }, (_, i) => ({ em: (i < 2 ? '2026-08-0' + (i + 1) : '2026-11-10') + 'T10:00:00', por: 'Pessoa Fictícia', acao: 'edição', tipo: 'linhas', codigo: 'c' + i, campo: null, antes: null, depois: null, motivo: null }));
      const eu = (doc.usuarios || []).find(u => String(u.codigo) === '9099'); if (eu) eu.perfil = 'ADMIN'; else doc.usuarios.push({ codigo: '9099', nome: 'Pessoa Fictícia de Verificação', perfil: 'ADMIN', ativo: true });   /* quem grava no teste pode editar o cadastro */
      const w = await h.createWritable(); await w.write(JSON.stringify(doc)); await w.close(); Cad.mod = 0; await Cad.ler();
      if (!Lock.ok()) Lock.on(Cad.D.seguranca && Cad.D.seguranca.senhaHash);   /* desbloqueio da edição, como na tela (senha do cadastro fictício) */
      const L0 = Cad.D.linhas[0];
      const ret = await Cad.ops([{ acao: 'edição', tipo: 'linhas', codigo: L0.codigo, mudancas: { nome: { antes: L0.nome, depois: L0.nome + ' (teste)' } }, motivo: 'teste do histórico' }]);
      for (let i = 0; i < 60 && Cad.status !== 'salvo'; i++) await new Promise(r => setTimeout(r, 250)); await new Promise(r => setTimeout(r, 1200));
      let L = null;
      try { const d = await Store.sub(CAD_BKP, false); L = (await (await (await d.getFileHandle('historico-auditoria_2026-08.jsonl')).getFile()).text()).trim().split('\n').map(x => JSON.parse(x).codigo); } catch (e) { L = 'ERRO ' + e.message; }
      return { ret, m: Cad._m, formato: Cad.formato, rev: Cad.base.rev, status: Cad.status, conf: (Cad.conflitos || []).map(c => c.motivo), ativa: Cad.base.auditoria.length, hist: L };
    });
    assert.equal(r.status, 'salvo', JSON.stringify(r));
    assert.equal(r.ativa, 20000, 'a lista ativa do cadastro continua com 20.000: ' + JSON.stringify(r));
    assert.deepEqual(r.hist, ['c0'], 'a entrada que saiu ficou no histórico do cadastro: ' + JSON.stringify(r));
    console.log('ok cadastro: o que sai da lista ativa (20.000) vai para 00. Backups/Cadastros/historico-auditoria_2026-08.jsonl');
  });
})().catch(e => { console.error(e); process.exit(1); });
