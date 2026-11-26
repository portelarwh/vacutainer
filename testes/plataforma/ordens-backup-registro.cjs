// C15/B06 (análise comum 26/11/2026; contrato 9): quando o backup diário de ordens-base.json falha, a gravação segue (o diário é rotina),
// mas a falha vai para o registro de backup (vacBackupRegistro, módulo "ordens") em 00. Backups/Ordens, e não só para o console.
// Antes de substituir uma competência o backup é obrigatório: a falha impede a gravação. Pasta fictícia em OPFS.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('oee', 'Módulo Produção', async f => {
    await f.waitForFunction(() => Store.S && Store.S.mode === 'pasta' && Store.S.backend && Store.S.backend.backupSub, null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      await Ord.carregar(true);
      const comp = '2026-10';
      Ord.B.competencias[comp] = { planta: 'PF01', linhas: [], importadoEm: new Date().toISOString() }; Ord.aud('teste', 'C15'); await Ord.gravar(comp, 'importação');   /* cria o arquivo na pasta */
      const orig = Store.S.backend.backupSub; Store.S.backend.backupSub = async () => { throw new DOMException('cópia negada (teste)', 'NotAllowedError'); };
      try { localStorage.removeItem('ordens.bk'); } catch (e) { }
      const revAntes = Ord.B.rev; Ord.B.competencias[comp].planta = 'PF02'; Ord.aud('teste', 'C15 de novo');
      let erroDiario = null; try { await Ord.gravar(comp, 'importação'); } catch (e) { erroDiario = e.message; }
      const reg = await vacBackupRegistro.ler('ordens', await (await Store.S.backend.backupRoot()).getDirectoryHandle(ORD_BK, { create: true }));
      const revDepois = Ord.B.rev;
      Ord.B.competencias[comp].linhas = [{ ordem: '1' }];
      let erroSubst = null; try { await Ord.gravar(comp, 'substituição'); } catch (e) { erroSubst = e.message; }
      Store.S.backend.backupSub = orig;
      return { erroDiario, revAntes, revDepois, falha: reg.falha && { erro: reg.falha.erro, soLocal: reg.falha.soLocal, arq: reg.falha.registroArquivo }, erroSubst };
    });
    assert.equal(r.erroDiario, null, 'falha do backup diário não impede a gravação: ' + JSON.stringify(r));
    assert.ok(r.revDepois > r.revAntes, 'a base de ordens foi gravada: ' + JSON.stringify(r));
    assert.ok(r.falha && /Backup diário de ordens-base\.json/.test(r.falha.erro) && /cópia negada/.test(r.falha.erro), 'a falha está no registro de backup: ' + JSON.stringify(r));
    assert.equal(r.falha.soLocal, false, 'o registro foi gravado na pasta (00. Backups/Ordens), não só no navegador');
    console.log('ok backup diário das Ordens: a falha vai para o registro de backup da pasta (' + r.falha.arq + ') e a gravação segue');
    assert.match(r.erroSubst || '', /antes de substituir/, 'substituir competência sem backup é recusado: ' + JSON.stringify(r));
    console.log('ok antes de substituir competência, sem backup nada é gravado');
  });
})().catch(e => { console.error(e); process.exit(1); });
