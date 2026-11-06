/* ===== vac-bases v1 · 06/11/2026 · bases .json na subpasta "00. Bases" da pasta principal (igual em todas as páginas; não editar só numa) =====
   Arquivo-fonte: fontes/kit/kit_bases.js. Vai num <script id="vac-bases"> no topo de cada página (aplicar_kit21.py e build da Produção),
   antes do código da página. Na raiz da pasta principal ficam só os HTML, lib\, Logo.png e as pastas.
   - vacRaiz(pasta): devolve a pasta principal "com bases". Para as 7 bases, grava em 00. Bases; para ler, procura em 00. Bases e,
     se a base ainda não foi movida, na raiz. Todo o resto (Logo.png, 00. Backups, lib, relatórios) continua na raiz, sem mudança.
     A pasta original (do seletor) é a que vai para o IndexedDB; vacRaiz só envolve, nunca é gravada.
   - vacMoverBases(pasta, [[nome, pastaBackup], …]): cada página move SÓ as próprias bases, ao conectar: copia para 00. Bases, confere,
     guarda uma cópia em 00. Backups/<módulo> e apaga da raiz. Se a raiz tiver uma versão MAIS NOVA que a de 00. Bases (página antiga
     ainda aberta gravando na raiz), não apaga nada: avisa, e o Portal › Versões das páginas mostra as duas cópias. */
const VAC_BASES_DIR = '00. Bases';
const VAC_BASES = ['portal-base.json', 'vacutainer-cadastros.json', 'oee-vacutainer-base.json', 'ordens-base.json', 'perdas-base.json', 'fifo-base.json', 'paradas-base.json'];
function vacEhBase(nome) { return VAC_BASES.includes(String(nome)); }
function vacRaiz(raiz) {
  if (!raiz || raiz.__vacRaiz) return raiz;
  let sub = null;
  const pastaBases = async criar => {
    if (sub) return sub;
    try { const d = await raiz.getDirectoryHandle(VAC_BASES_DIR, { create: !!criar }); sub = d; return d; }
    catch (e) { if (criar) throw e; return null; }
  };
  return {
    __vacRaiz: true, raiz, kind: 'directory',
    get name() { return raiz.name; },
    async getFileHandle(nome, o) {
      if (!vacEhBase(nome)) return raiz.getFileHandle(nome, o);
      if (o && o.create) return (await pastaBases(true)).getFileHandle(nome, o);
      const d = await pastaBases(false);
      if (d) { try { return await d.getFileHandle(nome); } catch (e) { if (!e || e.name !== 'NotFoundError') throw e; } }
      return raiz.getFileHandle(nome);
    },
    getDirectoryHandle: (n, o) => raiz.getDirectoryHandle(n, o),
    removeEntry: (n, o) => raiz.removeEntry(n, o),
    entries: () => raiz.entries(), values: () => raiz.values(), keys: () => raiz.keys(),
    [Symbol.asyncIterator]: () => raiz.entries(),
    queryPermission: o => raiz.queryPermission(o), requestPermission: o => raiz.requestPermission(o),
    isSameEntry: h => raiz.isSameEntry(h && h.__vacRaiz ? h.raiz : h), resolve: h => raiz.resolve(h)
  };
}
async function vacMoverBases(pasta, lista) {
  const raiz = pasta && pasta.__vacRaiz ? pasta.raiz : pasta, res = [];
  if (!raiz) return res;
  let dest; try { dest = await raiz.getDirectoryHandle(VAC_BASES_DIR, { create: true }); } catch (e) { return [{ erro: 'Não consegui criar a pasta ' + VAC_BASES_DIR + ': ' + (e.message || e) }]; }
  const dia = new Date().toISOString().slice(0, 10), hora = new Date().toTimeString().slice(0, 5).replace(':', 'h');
  const gravar = async (dir, nome, txt) => { const fh = await dir.getFileHandle(nome, { create: true }); const w = await fh.createWritable(); await w.write(txt); await w.close(); return fh; };
  const backup = async (sub, nome, txt, tipo) => { let b = raiz; for (const p of String(sub || '00. Backups').split('/').filter(Boolean)) b = await b.getDirectoryHandle(p, { create: true }); await gravar(b, nome.replace(/\.json$/i, '') + '_' + tipo + '_' + dia + '_' + hora + '.json', txt); };
  for (const [nome, sub] of lista) {
    try {
      let fr = null; try { fr = await (await raiz.getFileHandle(nome)).getFile(); } catch (e) { }
      if (!fr) { res.push({ nome, ok: true }); continue; }                                   // já está só em 00. Bases (ou ainda não existe)
      const tr = await fr.text();
      let fn = null; try { fn = await (await dest.getFileHandle(nome)).getFile(); } catch (e) { }
      if (fn) {
        const tn = await fn.text();
        if (tn !== tr && fr.lastModified > fn.lastModified) { res.push({ nome, conflito: true }); continue; }   // raiz mais nova: não decide sozinho
        if (tn !== tr) await backup(sub, nome, tr, 'raiz-antiga');                          // raiz antiga: guarda e tira
        await raiz.removeEntry(nome); res.push({ nome, ok: true, limpou: true }); continue;
      }
      const fh = await gravar(dest, nome, tr);
      if ((await (await fh.getFile()).text()) !== tr) { res.push({ nome, erro: 'a cópia em ' + VAC_BASES_DIR + ' não conferiu; a base continua na raiz' }); try { await dest.removeEntry(nome); } catch (e) { } continue; }
      await backup(sub, nome, tr, 'antes-de-mover-para-00-Bases');
      await raiz.removeEntry(nome); res.push({ nome, ok: true, movida: true });
    } catch (e) { res.push({ nome, erro: e && e.message || String(e) }); }
  }
  return res;
}
/* mensagem para a pessoa (toast da página, se houver) */
function vacAvisoBases(res) {
  const m = [];
  for (const r of res || []) {
    if (r.movida) m.push(`${r.nome} foi para ${VAC_BASES_DIR} (cópia de segurança em 00. Backups).`);
    if (r.conflito) m.push(`Atenção: há uma cópia MAIS NOVA de ${r.nome} na raiz da pasta (página antiga aberta em outro computador?). Esta página usa a de ${VAC_BASES_DIR}; confira em Portal › Versões das páginas antes de apagar.`);
    if (r.erro) m.push(`Não consegui mover ${r.nome || 'as bases'}: ${r.erro}`);
  }
  if (!m.length) return;
  console.warn('[vac-bases]', m.join(' '));
  try { if (typeof toast === 'function') toast(m.join(' '), 9000); } catch (e) { }
}
/* ===== fim vac-bases v1 ===== */
