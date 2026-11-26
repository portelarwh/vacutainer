// Análise comum 26/11/2026 (C10, C11, C12, C17): o Gel não grava por cima quando a leitura é negada; a Administração não sobrescreve base de outro schema;
// Waste, Administração e Gel releem antes de gravar e não perdem o que outra estação gravou no intervalo; a trilha do Waste e da Administração guarda o ID.
// Pasta fictícia em OPFS; a janela de concorrência é simulada de forma determinística (não substitui a homologação em rede).
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  // C10 · Gel: leitura transitória negada não vira "arquivo ausente"
  await abrir('gel', 'Módulo Gestão de Gel', async f => {
    const r = await f.evaluate(async () => {
      const arq = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('fifo-base.json')).getFile()).text()), a = await arq();
      const ext = { ...a, rev: 8, revBy: 'Outra Estação', config: { ...(a.config || {}), notaExterna: 'DA-OUTRA-ESTACAO' } }; const w = await (await parent.fixtureDir.getFileHandle('fifo-base.json')).createWritable(); await w.write(JSON.stringify(ext)); await w.close();
      const orig = FileSystemDirectoryHandle.prototype.getFileHandle; let negou = 0;   // a leitura fica negada durante toda a janela (inclusive a releitura periódica de fundo), sem depender de qual chamada chega primeiro
      FileSystemDirectoryHandle.prototype.getFileHandle = function (n, o) { if (n === 'fifo-base.json' && !(o && o.create)) { negou++; const e = new Error('transitório'); e.name = 'NotAllowedError'; return Promise.reject(e); } return orig.call(this, n, o); };
      const ch = newCh(); ch.config = { notaGeral: 'LOCAL' }; await fileBackend.commit(ch); await new Promise(r => setTimeout(r, 1500));
      const durante = await arq(); const pend = FS.pending.length;
      FileSystemDirectoryHandle.prototype.getFileHandle = orig; await fsFlush(); await new Promise(r => setTimeout(r, 1500)); const depois = await arq();
      return { negou, durante: { rev: durante.rev, ext: !!(durante.config && durante.config.notaExterna) }, pend, depois: { rev: depois.rev, ext: !!(depois.config && depois.config.notaExterna), loc: !!(depois.config && depois.config.notaGeral === 'LOCAL') } };
    });
    assert.ok(r.negou >= 1); assert.deepEqual(r.durante, { rev: 8, ext: true }, 'com a leitura negada o arquivo da outra estação (rev 8) não é tocado: ' + JSON.stringify(r)); assert.ok(r.pend >= 1, 'a alteração fica na fila');
    assert.deepEqual(r.depois, { rev: 9, ext: true, loc: true }, 'depois que a leitura volta, as duas alterações estão no arquivo: ' + JSON.stringify(r));
    console.log('ok Gel: leitura negada não grava por cima e a fila segue; depois grava com a alteração da outra estação');
  });
  // C11 · Administração: pendência não sobrescreve base de outro schema · C12 · releitura antes de gravar · C17 · ID na trilha
  await abrir('portal', 'Módulo Administração', async f => {
    await f.waitForFunction(() => Store.mode === 'pasta', null, { timeout: 30000 });
    const r = await f.evaluate(async () => {
      const arq = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('portal-base.json')).getFile()).text()), esc = async o => { const w = await (await parent.fixtureDir.getFileHandle('portal-base.json')).createWritable(); await w.write(JSON.stringify(o)); await w.close(); };
      const a = await arq(), out = {};
      await esc({ ...a, schemaVersion: 99, campoNovo: 'NAO-APAGAR' }); Store.pending = true; Store.pendFrom = a.rev; await Store.idb.set('pending', { p: true, from: a.rev }); await Store.sync(true);
      const b = await arq(); out.schema = { v: b.schemaVersion, campo: b.campoNovo, pendente: Store.pending };
      await esc(a); Store.pending = false; await Store.idb.set('pending', { p: false });   // volta à base normal
      const orig = Store.readRemote; let feito = false; Store.readRemote = async function (...x) { const r = await orig.apply(this, x); if (!feito) { feito = true; const e = await arq(); await esc({ ...e, rev: (e.rev || 0) + 1, zzExterno: 'DA-OUTRA-ESTACAO' }); } return r; };
      await Store.commit('teste local', B => { B.zzLocal = 'LOCAL'; }); Store.readRemote = orig; const c = await arq();
      out.janela = { ext: c.zzExterno, loc: c.zzLocal, rev: c.rev }; const ult = c.audit[c.audit.length - 1]; out.audit = { uid: ult.uid, u: ult.u }; return out;
    });
    assert.deepEqual(r.schema, { v: 99, campo: 'NAO-APAGAR', pendente: true }, 'base de outro schema não é sobrescrita e a pendência continua: ' + JSON.stringify(r.schema));
    assert.equal(r.janela.ext, 'DA-OUTRA-ESTACAO', 'a gravação da outra estação no intervalo é preservada'); assert.equal(r.janela.loc, 'LOCAL', 'a alteração local também');
    assert.equal(r.audit.uid, '9099', 'a trilha da Administração guarda o ID da pessoa ao lado do nome');
    console.log('ok Administração: não sobrescreve outro schema, preserva a gravação do intervalo e guarda o ID na trilha');
  });
  // C12 · Waste · C17
  await abrir('perdas', 'Módulo Waste', async f => {
    await f.waitForFunction(() => ST.mode === 'pasta', null, { timeout: 30000 });
    const r = await f.evaluate(async () => {
      const arq = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('perdas-base.json')).getFile()).text());
      const orig = readRemote; let feito = false; readRemote = async function (...x) { const r = await orig.apply(this, x); if (!feito) { feito = true; const e = await arq(); const w = await (await parent.fixtureDir.getFileHandle('perdas-base.json')).createWritable(); await w.write(JSON.stringify({ ...e, rev: (e.rev || 0) + 1, zzExterno: 'DA-OUTRA-ESTACAO' })); await w.close(); } return r; };
      await commit('teste local', b => { b.zzLocal = 'LOCAL'; }); readRemote = orig; const c = await arq(), ult = c.audit[c.audit.length - 1]; return { ext: c.zzExterno, loc: c.zzLocal, uid: ult.uid };
    });
    assert.deepEqual(r, { ext: 'DA-OUTRA-ESTACAO', loc: 'LOCAL', uid: '9099' }, 'Waste preserva a gravação do intervalo e guarda o ID: ' + JSON.stringify(r));
    console.log('ok Waste: preserva a gravação do intervalo e guarda o ID na trilha');
  });
})().catch(e => { console.error(e); process.exit(1); });
