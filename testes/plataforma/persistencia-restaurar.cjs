// Análise comum 26/11/2026 (C13/P5 e C14): Paradas recusa backup sem versão e a restauração espera a fila gravada; o status local de backup é por pasta.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('paradas', 'Módulo Paradas', async f => {
    await f.waitForFunction(() => Store.dir && Store.baseFound !== undefined, null, { timeout: 30000 }); await new Promise(r => setTimeout(r, 2500));
    const r = await f.evaluate(async () => {
      const arq = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('paradas-base.json')).getFile()).text()), a = await arq(), out = { rev0: a.rev };
      const bk = o => ({ nome: 'paradas-base_2026-11-01.json', h: { getFile: async () => new File([JSON.stringify(o)], 'b.json') } });
      const { schemaVersion: _v, ...semVersao } = a;
      await Store.restaurar(bk({ ...semVersao, rev: 3 })); out.semVersao = (await arq()).rev;
      Store.queue.push({ id: 'pend-ficticia', op: 'x', t: Date.now() }); await Store.restaurar(bk({ ...a, rev: 3 })); out.comFila = { rev: (await arq()).rev, fila: Store.queue.length };
      Store.queue.length = 0; await Store.restaurar(bk({ ...a, rev: 3 })); out.ok = (await arq()).rev; return out;
    });
    assert.equal(r.semVersao, r.rev0, 'backup sem schemaVersion é recusado: a base não muda');
    assert.deepEqual(r.comFila, { rev: r.rev0, fila: 1 }, 'com fila pendente a restauração é recusada e a fila continua');
    assert.equal(r.ok, r.rev0 + 1, 'backup válido e fila vazia: restaura (revisão +1)');
    console.log('ok Paradas: recusa backup sem versão, espera a fila gravada e restaura quando está limpo');
  });
  await abrir('perdas', 'Módulo Waste', async f => {
    await f.waitForFunction(() => ST.mode === 'pasta', null, { timeout: 30000 });
    const r = await f.evaluate(async () => {
      let pasta = 'A'; const real = window.vacPastaAtual; window.vacPastaAtual = () => ({ name: 'Pasta-' + pasta });
      await vacBackupRegistro.registrar('perdas', { erro: 'falha fictícia na pasta A' }); pasta = 'B';
      const falhaEmB = /pasta A/.test(((await vacBackupRegistro.ler('perdas')).falha || {}).erro || '');
      pasta = 'A'; const falhaEmA = /pasta A/.test(((await vacBackupRegistro.ler('perdas')).falha || {}).erro || '');
      window.vacPastaAtual = real; return { falhaEmB, falhaEmA };
    });
    assert.equal(r.falhaEmA, true, 'a falha aparece na pasta onde aconteceu'); assert.equal(r.falhaEmB, false, 'e não aparece na outra pasta');
    console.log('ok backup: o status local fica por pasta');
  });
})().catch(e => { console.error(e); process.exit(1); });
