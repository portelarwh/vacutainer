/* ===== vac-bases v2 · 06/11/2026 · bases .json na subpasta "00. Bases" da pasta principal (igual em todas as páginas; não editar só numa) =====
   Arquivo-fonte: fontes/kit/kit_bases.js. Vai num <script id="vac-bases"> no topo de cada página (aplicar_kit21.py e build da Produção),
   antes do código da página. Na raiz da pasta principal ficam só os HTML, lib\, Logo.png e as pastas.
   - vacRaiz(pasta): a pasta principal "com bases". Para as 7 bases, grava em 00. Bases; para ler, procura em 00. Bases e, se a base
     ainda não foi movida (ou se lá só existe um arquivo vazio de uma cópia interrompida), na raiz. O resto continua na raiz.
     A pasta original (do seletor) é a que vai para o IndexedDB; vacRaiz só envolve, nunca é gravada.
   - vacMoverBases(pasta, [[nome, pastaBackup], …]): cada página move SÓ as próprias bases, ao conectar. Regras (v2, revisão c341f8e):
     · trava por arquivo em 00. Bases (.<base>.migrando, vale entre computadores; expira em 2 min): outra sessão no meio da mudança = espera;
     · erro de leitura NÃO é ausência: só "não encontrado" conta como não existe; qualquer outro erro = estado desconhecido, nada muda (B04);
     · cópia por arquivo temporário, conferida antes de entrar no lugar: nunca deixa base vazia como preferida (B05);
     · antes de pôr no lugar, confere de novo o destino: se outra sessão já gravou lá, não sobrescreve (B02);
     · se o destino divergir depois da cópia, não apaga nada (nem destino nem raiz) (B03);
     · a base sai da raiz MOVIDA para 00. Backups/<módulo> (nunca apagada), depois de conferir que a raiz não mudou desde a leitura;
       uma gravação de último instante fica guardada no backup e a página avisa (B01); assim o backup existe também ao retomar (B07);
     · raiz mais nova que 00. Bases (página antiga gravando na raiz): não mexe em nada, avisa; Portal › Versões mostra as duas cópias. */
const VAC_BASES_DIR = '00. Bases';
const VAC_BASES = ['portal-base.json', 'vacutainer-cadastros.json', 'oee-vacutainer-base.json', 'ordens-base.json', 'perdas-base.json', 'fifo-base.json', 'paradas-base.json'];
function vacEhBase(nome) { return VAC_BASES.includes(String(nome)); }
const vacNaoAchou = e => !!e && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError');
function vacRaiz(raiz) {
  if (!raiz || raiz.__vacRaiz) return raiz;
  let sub = null;
  const pastaBases = async criar => {
    if (sub) return sub;
    try { const d = await raiz.getDirectoryHandle(VAC_BASES_DIR, { create: !!criar }); sub = d; return d; }
    catch (e) { if (criar || !vacNaoAchou(e)) throw e; return null; }   // só "não existe" vira ausência
  };
  return {
    __vacRaiz: true, raiz, kind: 'directory',
    get name() { return raiz.name; },
    async getFileHandle(nome, o) {
      if (!vacEhBase(nome)) return raiz.getFileHandle(nome, o);
      if (o && o.create) return (await pastaBases(true)).getFileHandle(nome, o);
      const d = await pastaBases(false);
      if (d) {
        try {
          const fh = await d.getFileHandle(nome);
          if ((await fh.getFile()).size > 0) return fh;
          try { return await raiz.getFileHandle(nome); } catch (e) { if (!vacNaoAchou(e)) throw e; return fh; }   // vazio (cópia interrompida): usa a raiz se houver
        } catch (e) { if (!vacNaoAchou(e)) throw e; }
      }
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
const VAC_SESSAO = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
async function vacMoverBases(pasta, lista, opts = {}) {
  const raiz = pasta && pasta.__vacRaiz ? pasta.raiz : pasta, res = [];
  if (!raiz) return res;
  const espera = opts.esperaTrava ?? 300, h = opts.ganchos || {};   // ganchos: só para os testes simularem falhas no meio
  let dest; try { dest = await raiz.getDirectoryHandle(VAC_BASES_DIR, { create: true }); } catch (e) { return [{ erro: 'Não consegui criar a pasta ' + VAC_BASES_DIR + ': ' + (e.message || e) }]; }
  const ler = async (dir, nome) => { try { const fh = await dir.getFileHandle(nome); const f = await fh.getFile(); return { fh, f, txt: await f.text() }; } catch (e) { if (vacNaoAchou(e)) return null; throw e; } };
  const gravar = async (dir, nome, txt) => { const fh = await dir.getFileHandle(nome, { create: true }); const w = await fh.createWritable(); await w.write(txt); await w.close(); return fh; };
  const pastaBk = async sub => { let b = raiz; for (const p of String(sub || '00. Backups').split('/').filter(Boolean)) b = await b.getDirectoryHandle(p, { create: true }); return b; };
  const carimbo = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}h${p(d.getMinutes())}m${p(d.getSeconds())}s`; };
  const dorme = ms => new Promise(r => setTimeout(r, ms));
  // limpa temporários de cópias interrompidas há mais de 10 min (de qualquer sessão)
  try { for await (const [n, x] of dest.entries()) if (x.kind === 'file' && /\.copiando-/.test(n)) { const f = await x.getFile(); if (Date.now() - f.lastModified > 600000) await dest.removeEntry(n); } } catch (e) { }
  for (const [nome, sub] of lista) {
    const trava = '.' + nome + '.migrando';
    let dono = false;
    try {
      // trava entre computadores: arquivo na pasta compartilhada, conferido depois de uma pausa
      const L = await ler(dest, trava);
      if (L) { let j = null; try { j = JSON.parse(L.txt); } catch (e) { } if (j && j.id !== VAC_SESSAO && Date.now() - (+j.em || 0) < 120000) { res.push({ nome, aguardando: true }); continue; } }
      await gravar(dest, trava, JSON.stringify({ id: VAC_SESSAO, em: Date.now() }));
      await dorme(espera);
      const L2 = await ler(dest, trava); let j2 = null; try { j2 = JSON.parse(L2 && L2.txt); } catch (e) { }
      if (!j2 || j2.id !== VAC_SESSAO) { res.push({ nome, aguardando: true }); continue; }
      dono = true;
      res.push(await vacMoverUma(nome, sub));
    } catch (e) { res.push({ nome, erro: 'estado desconhecido (' + (e && (e.name || e.message) || e) + '); nada foi mudado' }); }
    finally { if (dono) { try { const L = await ler(dest, trava); if (L && JSON.parse(L.txt).id === VAC_SESSAO) await dest.removeEntry(trava); } catch (e) { } } }
  }
  return res;

  async function vacMoverUma(nome, sub) {
    const R = await ler(raiz, nome);
    if (!R) return { nome, ok: true };                                    // já não está na raiz
    if (h.depoisDeLerRaiz) await h.depoisDeLerRaiz(nome);
    const D = await ler(dest, nome);
    if (D && D.txt.trim()) return decidir(nome, sub, R, D);
    // destino ausente (ou vazio de cópia interrompida): copia por temporário
    const tmp = '.' + nome + '.copiando-' + VAC_SESSAO;
    const T0 = await gravar(dest, tmp, R.txt);
    if (h.depoisDoTemporario) await h.depoisDoTemporario(nome);
    const T = await ler(dest, tmp);
    if (!T || T.txt !== R.txt) { try { await dest.removeEntry(tmp); } catch (e) { } return { nome, erro: 'a cópia temporária não conferiu; a base continua na raiz' }; }
    const D2 = await ler(dest, nome);                                     // outra sessão gravou o destino nesse meio-tempo? (B02)
    if (D2 && D2.txt.trim()) { try { await dest.removeEntry(tmp); } catch (e) { } return decidir(nome, sub, R, D2); }
    if (typeof T0.move === 'function') { try { await T0.move(nome); } catch (e) { await gravar(dest, nome, R.txt); try { await dest.removeEntry(tmp); } catch (x) { } } }
    else { await gravar(dest, nome, R.txt); try { await dest.removeEntry(tmp); } catch (e) { } }
    if (h.depoisDeColocar) await h.depoisDeColocar(nome);
    const D3 = await ler(dest, nome);                                     // conferência: divergiu = outra sessão gravou; não apaga nada (B03)
    if (!D3 || D3.txt !== R.txt) return { nome, conflito: true, detalhe: 'a base em ' + VAC_BASES_DIR + ' mudou durante a cópia; nada foi apagado' };
    return tirarDaRaiz(nome, sub, R, 'antes-de-mover-para-00-Bases');
  }
  async function decidir(nome, sub, R, D) {
    if (D.txt === R.txt) return tirarDaRaiz(nome, sub, R, 'antes-de-mover-para-00-Bases');   // retomada: garante o backup (B07)
    if (R.f.lastModified > D.f.lastModified) return { nome, conflito: true };                   // raiz mais nova: não decide sozinho
    return tirarDaRaiz(nome, sub, R, 'raiz-antiga');
  }
  async function tirarDaRaiz(nome, sub, R, tipo) {
    const bk = await pastaBk(sub), nb = nome.replace(/\.json$/i, '') + '_' + tipo + '_' + carimbo() + '.json';
    if (h.antesDeTirar) await h.antesDeTirar(nome);
    const R2 = await ler(raiz, nome);                                     // a raiz mudou desde a leitura? (gravação de página antiga: B01)
    if (!R2) return { nome, ok: true };
    if (R2.txt !== R.txt || R2.f.lastModified !== R.f.lastModified) return { nome, conflito: true, detalhe: 'a base da raiz foi gravada durante a mudança; nada foi apagado' };
    if (typeof R2.fh.move === 'function') {
      // move a base da raiz para o backup (não apaga): o arquivo inteiro vira a cópia de segurança, inclusive uma gravação de último instante
      try { await R2.fh.move(bk, nb); } catch (e) { await gravar(bk, nb, R.txt); await raiz.removeEntry(nome); }
      const M = await ler(bk, nb);
      if (!M || M.txt !== R.txt) return { nome, movida: true, conflito: true, detalhe: 'a raiz recebeu uma gravação no último instante; ela está guardada em ' + (sub || '00. Backups') + '/' + nb };
    } else { await gravar(bk, nb, R.txt); await raiz.removeEntry(nome); }
    return { nome, ok: true, movida: tipo !== 'raiz-antiga', limpou: tipo === 'raiz-antiga', backup: (sub || '00. Backups') + '/' + nb };
  }
}
/* mensagem para a pessoa (toast da página, se houver) */
function vacAvisoBases(res) {
  const m = [];
  for (const r of res || []) {
    if (r.movida && !r.conflito) m.push(`${r.nome} foi para ${VAC_BASES_DIR} (cópia de segurança em ${r.backup || '00. Backups'}).`);
    if (r.conflito) m.push(`Atenção: ${r.nome} — ${r.detalhe || 'há uma cópia MAIS NOVA na raiz da pasta (página antiga aberta em outro computador?)'}. Esta página usa a de ${VAC_BASES_DIR}; nada foi apagado. Confira em Portal › Versões das páginas.`);
    if (r.erro) m.push(`Não consegui mover ${r.nome || 'as bases'}: ${r.erro}`);
    if (r.aguardando) m.push(`${r.nome}: outra sessão está mudando a base para ${VAC_BASES_DIR} agora; esta página lê a base onde ela estiver e tenta de novo na próxima abertura.`);
  }
  if (!m.length) return;
  console.warn('[vac-bases]', m.join(' '));
  try { if (typeof toast === 'function') toast(m.join(' '), 9000); } catch (e) { }
}
/* ===== vac-prefs · preferências comuns em texto simples =====
   O Paradas até a 1.0.7 gravava vac.theme/vac.user/vac.logo… com aspas (JSON). Normaliza uma vez, antes de qualquer página ler,
   para todas as páginas reconhecerem o valor (ex.: "\"dark\"" → dark). */
(function () {
  try {
    for (const k of ['vac.theme', 'vac.user', 'vac.userId', 'vac.perfil', 'vac.logo']) {
      const v = localStorage.getItem(k);
      if (v != null && /^".*"$/s.test(v)) { try { const p = JSON.parse(v); if (typeof p === 'string') localStorage.setItem(k, p); } catch (e) { } }
    }
    const t = localStorage.getItem('vac.theme'); if (t != null && !['auto', 'light', 'dark'].includes(t)) localStorage.setItem('vac.theme', 'auto');
  } catch (e) { }
})();
/* ===== fim vac-bases v2 ===== */
