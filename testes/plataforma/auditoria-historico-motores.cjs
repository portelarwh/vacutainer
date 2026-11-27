// P4 (análise comum 26/11/2026): em Paradas, Equipamentos, Iniciativas e Linha 360° (lista ativa de 5.000), o que sai da trilha vai,
// depois da gravação confirmada, para historico-auditoria_AAAA-MM.jsonl na pasta de backups do módulo. Pasta fictícia em OPFS.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
const CASOS = [['paradas', 'Módulo Paradas'], ['equip', 'Módulo Equipamentos'], ['inic', 'Módulo Iniciativas / Ações'], ['linha', 'Módulo Linha 360°']];
(async () => {
  for (const [rota, titulo] of CASOS) {
    await abrir(rota, titulo, async f => {
      await f.waitForFunction(() => typeof Store !== 'undefined' && Store.dir && !Store.test && Store.baseFound !== false, null, { timeout: 60000 });
      const r = await f.evaluate(async () => {
        const velhas = Array.from({ length: 5000 }, (_, i) => ({ em: (i < 2 ? '2026-06-0' + (i + 1) : '2026-11-10') + 'T10:00:00.000Z', por: 'Pessoa Fictícia', k: 'teste', acao: 'teste', id: 'v' + i, ref: 'r' + i }));
        if (Store.findBase) { const b = await Store.findBase(); b.obj.auditoria = velhas; await Store.writeJSON(PAGE.baseFile, b.obj, Store.baseDir || Store.dir); }
        else { const b = await Store.ler(); b.auditoria = velhas; await Store.escrever(b); }
        while (Store.saving) await new Promise(r => setTimeout(r, 100));
        Store.commit({ k: '__teste-historico' }); clearTimeout(Store.t); await Store.save();   /* operação neutra, carimbada como a tela faz */
        for (let i = 0; i < 40 && Store.saving; i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 1200));
        let L = null; try { const d = await Store.sub(PAGE.backupDir, false); L = (await (await (await d.getFileHandle('historico-auditoria_2026-06.jsonl')).getFile()).text()).trim().split('\n').map(x => JSON.parse(x).id); } catch (e) { L = 'ERRO ' + e.message; }
        return { erro: Store.lastErr || '', fila: Store.queue.length, ativa: Store.data.auditoria.length, hist: L, dir: PAGE.backupDir };
      });
      assert.equal(r.fila, 0, rota + ': a operação foi gravada: ' + JSON.stringify(r));
      assert.equal(r.ativa, 5000, rota + ': a lista ativa continua com 5.000: ' + JSON.stringify(r));
      assert.deepEqual(r.hist, ['v0'], rota + ': a entrada que saiu ficou no histórico: ' + JSON.stringify(r));
      console.log(`ok ${rota}: o que sai da lista ativa (5.000) vai para ${r.dir}/historico-auditoria_2026-06.jsonl`);
    });
  }
})().catch(e => { console.error(e); process.exit(1); });
