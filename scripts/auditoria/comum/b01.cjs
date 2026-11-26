const abrir = require('./h2.cjs'), wt = process.argv[2];
abrir(wt, 'gel', 'Módulo Gestão de Gel', async (f, p) => {
  const r = await f.evaluate(async () => {
    const lerArq = async () => JSON.parse(await (await (await parent.fixtureDir.getFileHandle('fifo-base.json')).getFile()).text());
    const a = await lerArq(); const out = { revInicial: a.rev, modo: S.mode };
    // outra estação grava rev 8 com um campo novo
    const ext = { ...a, rev: 8, revBy: 'Outra Estação', config: { ...(a.config || {}), notaExterna: 'ALTERACAO-DA-OUTRA-ESTACAO' } }; const w = await (await parent.fixtureDir.getFileHandle('fifo-base.json')).createWritable(); await w.write(JSON.stringify(ext)); await w.close();
    // leitura transitória negada (uma única vez) no caminho de releitura
    const orig = FileSystemDirectoryHandle.prototype.getFileHandle; let negou = 0;
    FileSystemDirectoryHandle.prototype.getFileHandle = function (n, o) { if (n === 'fifo-base.json' && !(o && o.create) && !negou) { negou = 1; const e = new Error('transitório'); e.name = 'NotAllowedError'; return Promise.reject(e); } return orig.call(this, n, o); };
    try { const ch = newCh(); ch.config = { notaGeral: 'ALTERACAO-LOCAL' }; await fileBackend.commit(ch); await new Promise(r => setTimeout(r, 1500)); if (FS.pending.length) await fsFlush(); await new Promise(r => setTimeout(r, 1500)); } catch (e) { out.erro = String(e.message || e).slice(0, 160); }
    FileSystemDirectoryHandle.prototype.getFileHandle = orig; out.negou = negou;
    const b = await lerArq(); out.revFinal = b.rev; out.temExterna = !!(b.config && b.config.notaExterna); out.temLocal = !!(b.config && b.config.notaGeral === 'ALTERACAO-LOCAL'); out.pendentes = FS.pending.length; out.err = FS.err ? String(FS.err.message || FS.err).slice(0, 120) : null; return out; });
  console.log(JSON.stringify(r));
}).catch(e => { console.error(e.message.slice(0, 700)); process.exit(1); });
