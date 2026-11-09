/* ===== vac-bases v2 · 06/11/2026 · bases .json na subpasta "00. Bases" da pasta principal (igual em todas as páginas; não editar só numa) =====
   Arquivo-fonte: fontes/kit/kit_bases.js. Vai num <script id="vac-bases"> no topo de cada página (aplicar_kit21.py e build da Produção),
   antes do código da página. Na raiz da pasta principal ficam só os HTML, lib\, Logo.png e as pastas.
   - vacRaiz(pasta): a pasta principal "com bases". Para as bases da lista VAC_BASES, grava em 00. Bases; para ler, procura em 00. Bases e, se a base
     ainda não foi movida (ou se lá só existe um arquivo vazio de uma cópia interrompida), na raiz. O resto continua na raiz.
     A pasta original (do seletor) é a que vai para o IndexedDB; vacRaiz só envolve, nunca é gravada.
   - vacMoverBases(pasta, [[nome, pastaBackup], …]): cada página move SÓ as próprias bases, ao conectar. Regras (v2, revisão c341f8e):
     · trava por arquivo em 00. Bases (.<base>.migrando, vale entre computadores; expira em 2 min), só quando a base ainda está na raiz: outra sessão no meio da mudança = espera;
     · erro de leitura NÃO é ausência: só "não encontrado" conta como não existe; qualquer outro erro = estado desconhecido, nada muda (B04);
     · cópia por arquivo temporário, conferida antes de entrar no lugar: nunca deixa base vazia como preferida (B05);
     · antes de pôr no lugar, confere de novo o destino: se outra sessão já gravou lá, não sobrescreve (B02);
     · se o destino divergir depois da cópia, não apaga nada (nem destino nem raiz) (B03);
     · a base sai da raiz MOVIDA para 00. Backups/<módulo> (nunca apagada), depois de conferir que a raiz não mudou desde a leitura;
       uma gravação de último instante fica guardada no backup e a página avisa (B01); assim o backup existe também ao retomar (B07);
     · raiz mais nova que 00. Bases (página antiga gravando na raiz): não mexe em nada, avisa; Portal › Versões mostra as duas cópias. */
const VAC_BASES_DIR = '00. Bases';
/* 08/11/2026 · E6/E11: + iniciativas-base.json e equipamentos-base.json (páginas que passaram a gravar) */
const VAC_BASES = ['portal-base.json', 'vacutainer-cadastros.json', 'oee-vacutainer-base.json', 'ordens-base.json', 'perdas-base.json', 'fifo-base.json', 'paradas-base.json', 'iniciativas-base.json', 'equipamentos-base.json'];
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
      // nada na raiz (o normal depois da mudança): não pega trava, não espera, não grava nada na pasta
      if (!(await ler(raiz, nome))) { res.push({ nome, ok: true }); continue; }
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
/* ----- vac-inicial · 07/11/2026: página e aba inicial por perfil (Portal › Cadastros › Perfis e Usuários, campo "Página inicial")
   Fica aqui (no topo de cada página) porque o Portal monta a lista de opções na carga. O alvo é [página, hash]:
   hash "aba=<id>" abre a aba; "turno" é a tela do operador da Produção. Ordem ao abrir uma página: link direto (#…) >
   aba do perfil (só na 1ª abertura da página na sessão) > preferência da pessoa (última aba, página inicial do Gel) > 1ª aba. */
const VAC_INICIAL_ALVO = {
  'Portal': ['portal', ''],
  'Produção': ['oee', ''], 'Produção › Visão geral': ['oee', 'aba=overview'], 'Produção › Painel': ['oee', 'aba=panel'],
  'Produção › Lançamento': ['oee', 'aba=launch'], 'Produção › Plano do mês': ['oee', 'aba=plan'], 'Produção › Tela do operador': ['oee', 'turno'],
  'Waste': ['perdas', ''],
  'Gestão de Gel': ['gel', ''], 'Gestão de Gel › Painel': ['gel', 'aba=painel'], 'Gestão de Gel › Operação': ['gel', 'aba=op'],
  'Paradas': ['paradas', ''], 'Paradas › Visão geral': ['paradas', 'aba=geral'], 'Paradas › Fila técnica': ['paradas', 'aba=fila'],
  'Equipamentos': ['equip', ''], 'Iniciativas': ['inic', ''], 'Projetos': ['projetos', '']
};
/* página inicial de quem entrou (vac.userId): a do usuário, senão a do perfil; lê a cópia do cadastro (vac.cadastros) */
function vacPaginaInicial() {
  try {
    const C = typeof vacCad === 'function' ? vacCad() : JSON.parse(localStorage.getItem('vac.cadastros') || 'null'); if (!C) return null;
    const id = localStorage.getItem('vac.userId') || ''; const u = id ? (C.usuarios || []).find(x => String(x.codigo) === id && x.ativo !== false) : null;
    if (u && u.paginaInicial && u.paginaInicial !== '(do perfil)') return u.paginaInicial;
    const pc = (u && u.perfil) || localStorage.getItem('vac.perfil') || ''; const p = pc ? (C.perfis || []).find(x => x.codigo === pc && x.ativo !== false) : null;
    return (p && p.paginaInicial) || null;
  } catch (e) { return null; }
}
/* hash da aba inicial desta página (ex.: "aba=panel"), só na 1ª abertura da página na sessão e sem link direto; senão null */
function vacAbaInicial(pagina) {
  try {
    if (location.hash) return null; const k = 'vac.inicial.' + pagina; if (sessionStorage.getItem(k)) return null; sessionStorage.setItem(k, '1');
    const a = VAC_INICIAL_ALVO[vacPaginaInicial()]; return a && a[0] === pagina && a[1] ? a[1] : null;
  } catch (e) { return null; }
}
/* ===== fim vac-bases v2 ===== */
/* vac-bases · C1 (08/11/2026), no <head> de todas as páginas (antes do código delas): alterações pendentes guardadas sem perda entre abas (AT-01), formato da própria base conferido antes de
   gravar (AT-03), links de origem só com endereço seguro (AT-11) e trava da 2ª aba para as páginas que guardam a base inteira.
   vacFila(pagina): fila durável no IndexedDB "vac-fila", UM registro por alteração (chave pagina|qid), com a aba dona.
   · cada aba só grava e apaga as próprias alterações (algumas operações não podem ser aplicadas duas vezes: cadastro, Gel);
   · alteração de aba que fechou (sem sinal de vida há 20 s) é adotada na abertura seguinte, com conferência depois de uma pausa;
   · espelhar(lista): grava as alterações da lista e apaga as desta aba que saíram dela (substitui o "gravar a fila inteira");
   · minhas(): alterações desta aba + as adotadas, na ordem em que foram feitas;
   · confirmar/confirmadas/esquecer: operações já confirmadas na pasta, guardadas 24 h (até 2000), para regravar se outra estação
     gravar por cima depois da releitura (R-01). Não mais que 24 h: depois de uma restauração de backup (procedimento manual), as
     alterações deste computador que não estão no backup voltariam a ser gravadas; a página avisa quando regrava;
   · falha do IndexedDB: erro visível em F.erro (a página avisa "alteração não protegida"), nunca silêncio.
   As abas vivas ficam em localStorage "vac.aba.<pagina>.<id>" = {t, pend}, renovado a cada 5 s e apagado ao fechar. */
/* NV-01/NV-03: identidade LOCAL da pasta. Não altera arquivos nem schemas de negócio.
   OPFS tem caminho relativo verificável; pastas externas usam handle persistido e isSameEntry.
   Sem identidade comprovável a gravação é recusada, nunca usa o nome da pasta como identidade. */
async function vacOrigemPasta(pasta) {
  const h = pasta && pasta.__vacRaiz ? pasta.raiz : pasta;
  if (!h) return '';
  try { const raiz = await navigator.storage.getDirectory(), caminho = await raiz.resolve(h); if (caminho) return 'opfs:' + JSON.stringify(caminho); } catch (e) { }
  if (!navigator.locks) throw new Error('Não foi possível identificar a pasta com segurança neste navegador. Use Chrome ou Edge atualizado.');
  return navigator.locks.request('vac-origens', async () => {
    const db = await new Promise((ok, no) => { const r = indexedDB.open('vac-origens', 1); r.onupgradeneeded = () => r.result.createObjectStore('pastas', { keyPath: 'id' }); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
    try {
      const lista = await new Promise((ok, no) => { const r = db.transaction('pastas').objectStore('pastas').getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
      for (const x of lista) { try { if (await h.isSameEntry(x.handle)) return x.id; } catch (e) { } }
      const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2);
      await new Promise((ok, no) => { const t = db.transaction('pastas', 'readwrite'); t.objectStore('pastas').put({ id, handle: h }); t.oncomplete = ok; t.onerror = () => no(t.error); t.onabort = () => no(t.error); });
      return id;
    } finally { db.close(); }
  });
}
async function vacVincularFila(store, pasta) {
  const origem = await vacOrigemPasta(pasta);
  if (!origem) throw new Error('A pasta não foi identificada. As alterações continuam neste navegador.');
  if (store.origem && store.origem !== origem && store.queue.some(o => o._pasta === store.origem)) throw new Error('Há alterações pendentes de outra pasta. Volte à pasta de origem para gravá-las; nada foi descartado.');
  const todas = store.queue.concat(store.outrasFilas || []), semOrigem = todas.filter(o => !o._pasta);
  if (semOrigem.length && !confirm(semOrigem.length + ' alteração(ões) deste navegador ainda não têm pasta de origem identificada. Vincular e gravar na pasta "' + pasta.name + '"? Cancele para manter tudo pendente.')) throw new Error('Alterações sem origem mantidas neste navegador; escolha a pasta e confirme o destino.');
  semOrigem.forEach(o => o._pasta = origem);
  store.queue = todas.filter(o => o._pasta === origem); store.outrasFilas = todas.filter(o => o._pasta !== origem);
  if(store.outrasFilas.length && !store._avisouOutrasFilas){store._avisouOutrasFilas=true;toast(store.outrasFilas.length+' alteração(ões) de outra pasta continuam neste navegador. Conecte a pasta de origem para recuperá-las.');}
  store.origem = origem;
  if (store.fila) { store.fila.origem = origem; store.fila.reservar(todas); await store.fila.espelhar(todas); }
  return origem;
}
/* Cópia explícita para recuperação, inclusive de operações antigas sem origem comprovada. */
function vacRecuperacaoBotao(store) {
  return !store.test && (store.queue.length || (store.outrasFilas || []).length || store.confirmadasSemOrigem || (store.fila && store.fila.erro))
    ? '<button class="b sm" data-vac-recuperacao title="Guarda as alterações locais para conferência; não altera nem limpa a fila">Baixar cópia de recuperação</button>' : '';
}
function vacDownloadBlob(blob, nome) {
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = nome;
  try { a.click(); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
async function vacBaixarRecuperacao(store) {
  const d = { pagina: store.fila.pagina, geradoEm: new Date().toISOString(), origem: store.origem || null,
    pendentes: store.queue.concat(store.outrasFilas || []), confirmadas: await store.fila.confirmadas() };
  vacDownloadBlob(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), 'recuperacao-' + store.fila.pagina + '-' + Date.now() + '.json');
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-vac-recuperacao]') && typeof Store !== 'undefined') vacBaixarRecuperacao(Store).catch(x => { if(typeof toast==='function')toast('Não foi possível baixar a cópia: '+x.message); }); });
/* NV-02: exclusão mútua durante TODO o acesso assíncrono. A trava do navegador é liberada
   inclusive no fechamento da aba. Sem Web Locks, falha fechada antes de qualquer mutação. */
function vacEditarBase(pagina, editar, pendente) {
  if (!navigator.locks) return Promise.reject(new Error('Edição indisponível: este navegador não oferece proteção entre abas. Use Chrome ou Edge atualizado.'));
  return navigator.locks.request('vac-editar-' + pagina, async () => {
    try { return await editar(); } finally { vacFila(pagina).marcarPendente(!!pendente()); }
  });
}
const vacFila = (() => {
  let dbP = null; const filas = {}, VIVA = 20000;
  const abre = () => dbP || (dbP = new Promise((ok, no) => { const r = indexedDB.open('vac-fila', 1); r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('ops')) d.createObjectStore('ops', { keyPath: 'k' }); if (!d.objectStoreNames.contains('conf')) d.createObjectStore('conf', { keyPath: 'k' }); }; r.onsuccess = () => ok(r.result); r.onerror = () => { dbP = null; no(r.error); }; }).catch(e => { dbP = null; throw e; }));
  const tx = async (st, modo, fn) => { const d = await abre(); return new Promise((ok, no) => { const t = d.transaction(st, modo), s = t.objectStore(st); let v; Promise.resolve(fn(s)).then(x => v = x); t.oncomplete = () => ok(v); t.onerror = () => no(t.error); t.onabort = () => no(t.error || new Error('transação abortada')); }); };
  const req = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const faixa = p => IDBKeyRange.bound(p + '|', p + '|\uffff');
  const uidq = () => 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const dorme = ms => new Promise(r => setTimeout(r, ms));
  function abas(pagina) { const L = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || !k.startsWith('vac.aba.' + pagina + '.')) continue; let v = null; try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { } if (v && Date.now() - (+v.t || 0) < VIVA) L.push({ id: k.slice(('vac.aba.' + pagina + '.').length), pend: !!v.pend }); } } catch (e) { } return L; }
  function cria(pagina) {
    const aba = 'a' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36), chaveLS = 'vac.aba.' + pagina + '.' + aba;
    const F = { pagina, aba, origem: '', erro: '', meus: new Set(), reservasMinhas: new Set(), seq: 0, pend: false, _p: Promise.resolve() };
    const sinal = () => { try { localStorage.setItem(chaveLS, JSON.stringify({ t: Date.now(), pend: F.pend })); } catch (e) { } };
    sinal(); setInterval(sinal, 5000); addEventListener('pagehide', () => { try { localStorage.removeItem(chaveLS); } catch (e) { } });
    const serie = fn => (F._p = F._p.then(fn, fn));          /* uma operação de cada vez, na ordem pedida */
    const falhou = e => { F.erro = 'alterações pendentes não estão protegidas neste navegador (' + ((e && (e.name || e.message)) || e) + ')'; console.warn('[vacFila]', pagina, e); return null; };
    const q = op => op.qid || (op.qid = uidq());
    const reg = op => ({ k: pagina + '|' + q(op), pagina, qid: op.qid, aba, seq: op._seq || (op._seq = Date.now() * 1000 + (F.seq++ % 1000)), op: JSON.parse(JSON.stringify(op)) });
    const chaveReserva = id => 'vac.reserva.' + pagina + '|' + id;
    /* NV-04: uma chave por operação. Nunca apaga uma reserva pertencente a outra aba. */
    F.reservar = lista => { try { const ks = new Set(); for (const op of lista) { reg(op); const k = chaveReserva(q(op)); localStorage.setItem(k, JSON.stringify({ pagina, aba, op })); ks.add(k); }
      for (const k of F.reservasMinhas) if (!ks.has(k)) { const x = JSON.parse(localStorage.getItem(k) || 'null'); if (x && x.aba === aba) localStorage.removeItem(k); } F.reservasMinhas = ks;
    } catch (e) { falhou(e); } };
    F.reservas = () => { const L = []; try { const vivas = new Set(abas(pagina).map(x => x.id)); for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('vac.reserva.' + pagina + '|')) continue; const x = JSON.parse(localStorage.getItem(k)); if (x.aba === aba || !vivas.has(x.aba)) { localStorage.setItem(k, JSON.stringify({ ...x, aba })); F.reservasMinhas.add(k); L.push(x.op); } } } catch (e) { falhou(e); } return L; };
    F.vivas = () => abas(pagina).filter(x => x.id !== aba);
    F.marcarPendente = v => { if (F.pend !== !!v) { F.pend = !!v; sinal(); } };
    F.outraComPendencia = () => F.vivas().some(x => x.pend);
    F.espelhar = lista => serie(async () => { try { const L = (lista || []).filter(Boolean), registros = L.map(reg); const ks = new Set(registros.map(r => r.k));
      await tx('ops', 'readwrite', s => { for (const r of registros) s.put(r); for (const k of F.meus) if (!ks.has(k)) s.delete(k); }); F.meus = ks;
      for (const r of registros) { const k = chaveReserva(r.qid); try { const x = JSON.parse(localStorage.getItem(k) || 'null'); if (x && x.aba === aba && JSON.stringify(x.op) === JSON.stringify(r.op)) localStorage.removeItem(k); } catch (e) { } }
      F.erro = ''; return true; } catch (e) { falhou(e); return false; } });
    F.minhas = () => serie(async () => { try {
      const todos = await tx('ops', 'readonly', s => req(s.getAll(faixa(pagina)))); const vivas = new Set(abas(pagina).map(x => x.id));
      const orfas = todos.filter(r => r.aba !== aba && !vivas.has(r.aba));
      if (orfas.length) { await tx('ops', 'readwrite', s => { for (const r of orfas) s.put({ ...r, aba }); }); await dorme(400); }
      const agora = await tx('ops', 'readonly', s => req(s.getAll(faixa(pagina)))); const meus = agora.filter(r => r.aba === aba).sort((a, b) => a.seq - b.seq);
      F.meus = new Set(meus.map(r => r.k)); F.erro = ''; return meus.map(r => Object.assign(r.op, { qid: r.qid, _seq: r.seq }));
    } catch (e) { falhou(e); return null; } });
    F.outras = () => serie(async () => { try { const todos = await tx('ops', 'readonly', s => req(s.getAll(faixa(pagina)))); return todos.filter(r => r.aba !== aba).length; } catch (e) { return 0; } });
    F.confirmar = ops => serie(async () => { try { const c = Date.now(); await tx('conf', 'readwrite', s => { for (const o of ops || []) s.put({ k: pagina + '|' + q(o), pagina, qid: o.qid, _c: c, op: JSON.parse(JSON.stringify(o)) }); }); return true; } catch (e) { return false; } });
    F.confirmadas = (idade = 864e5) => serie(async () => { try { const lim = Date.now() - idade; let L = await tx('conf', 'readonly', s => req(s.getAll(faixa(pagina))));
      const velhas = L.filter(r => r._c < lim).concat(L.filter(r => r._c >= lim).sort((a, b) => b._c - a._c).slice(2000));
      if (velhas.length) { await tx('conf', 'readwrite', s => { for (const r of velhas) s.delete(r.k); }); const v = new Set(velhas.map(r => r.k)); L = L.filter(r => !v.has(r.k)); }
      return L.map(r => Object.assign(r.op, { qid: r.qid, _c: r._c })); } catch (e) { return []; } });
    F.esquecer = qids => serie(async () => { try { await tx('conf', 'readwrite', s => { for (const id of qids || []) s.delete(pagina + '|' + id); }); } catch (e) { } });
    /* importa uma fila antiga (localStorage ou outro lugar) uma única vez: as operações entram como desta aba; a fonte antiga fica
       renomeada (não é apagada) para recuperação manual. ler/renomear são funções da página. */
    F.importar = (ops, renomear) => serie(async () => { const L = (ops || []).filter(Boolean); if (!L.length) { renomear && renomear(); return true; }
      try { await tx('ops', 'readwrite', s => { for (const o of L) s.put(reg(o)); }); for (const o of L) F.meus.add(pagina + '|' + o.qid); renomear && renomear(); return true; } catch (e) { falhou(e); return false; } });
    return F;
  }
  const fn = pagina => filas[pagina] || (filas[pagina] = cria(pagina));
  /* C5 · só leitura, para o Portal › Versões: alterações ainda não gravadas na pasta, por página, neste navegador. Não cria aba nem sinal de vida.
     Volta { pagina: n } ou null se o IndexedDB falhar. */
  fn.contar = async () => { try { const L = await tx('ops', 'readonly', s => req(s.getAll())); const R = {}; for (const r of L) R[r.pagina] = (R[r.pagina] || 0) + 1; return R; } catch (e) { return null; } };
  /* NV-05: leitura dos estados locais, inclusive cópias inteiras. Não cria bases nem stores alheios. */
  fn.saude = async () => {
    const lerCopia = nome => new Promise(resolve => { let inexistente=false; try { const r = indexedDB.open(nome); r.onupgradeneeded = () => {inexistente=true;r.transaction.abort()}; r.onerror = () => resolve(inexistente ? false : null); r.onblocked = () => resolve(null); r.onsuccess = () => { const db = r.result; if (!db.objectStoreNames.contains('kv')) { db.close(); return resolve(null); } const t = db.transaction('kv'), q = t.objectStore('kv').get('pending'); q.onsuccess = () => resolve(!!(q.result && q.result.p)); q.onerror = () => resolve(null); t.oncomplete = () => db.close(); }; } catch (e) { resolve(null); } });
    let reservas = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('vac.reserva.')) { const x = JSON.parse(localStorage.getItem(k)); reservas[x.pagina] = (reservas[x.pagina] || 0) + 1; } else if (/^(inic|equip|paradas)\.fila\.reserva$/.test(k)) { const L = JSON.parse(localStorage.getItem(k)); if (L && L.length) reservas[k.split('.')[0]] = (reservas[k.split('.')[0]] || 0) + L.length; } } } catch (e) { reservas = null; }
    const [portal, perdas] = await Promise.all([lerCopia('vac-portal'), lerCopia('perdas-ordem')]);
    return { reservas, copias: { portal, perdas } };
  };
  return fn;
})();
/* AT-03 · formato da própria base: schema da página (base antiga sem schema é aceita como versão 1) e schemaVersion até a conhecida.
   Volta '' (pode ler e gravar) ou o motivo (só leitura: a página não grava por cima de formato que não conhece). */
function vacFormatoBase(base, schema, versaoMax = 1) {
  if (!base || typeof base !== 'object' || Array.isArray(base)) return 'o arquivo não é uma base desta página';
  if (base.schema != null && base.schema !== schema) return `o arquivo é de outro tipo (schema "${String(base.schema).slice(0, 40)}"; esperado "${schema}")`;
  const v = base.schemaVersion; if (v != null && !(Number.isInteger(+v) && +v >= 1)) return 'versão do formato inválida (' + String(v).slice(0, 20) + ')';
  if (v != null && +v > versaoMax) return `a base foi gravada por uma versão mais nova da página (formato ${v}; esta página conhece até ${versaoMax}): atualize esta página antes de gravar`;
  return '';
}
/* AT-11 · link seguro para origem/evidência: só endereço que abre documento, nunca script.
   Aceita: http(s):, file:, caminho de rede (\\servidor\…), página da própria pasta (Nome.html, Nome.html#…, #…). Volta '' se recusar. */
function vacLinkSeguro(u) {
  const s = String(u ?? '').trim(); if (!s || /[\u0000-\u001f]/.test(s)) return '';
  if (/^(https?|file):/i.test(s)) return s;
  if (/^\\\\[^\\]/.test(s)) return s;
  if (/^#/.test(s)) return s;
  if (/^[\w\-. %À-ÿ]+\.html?(#.*)?$/i.test(s)) return s;   /* página irmã, sem esquema e sem barra */
  return '';
}
/* C1 · trava da 2ª aba nas páginas que guardam a BASE INTEIRA pendente (Portal, Waste): se outra aba da mesma página tem alteração
   ainda não gravada na pasta, esta aba não altera nada (as duas versões pendentes se sobrescreveriam). Nada é descartado: a pessoa
   grava ou fecha a outra aba. A recusa interrompe quem chamou (erro "VacAbaBloqueada", sem mensagem de "gravado" depois) e não
   aparece como erro no console. A página informa o próprio estado com vacFila(p).marcarPendente(bool). */
function vacGuardaAba(pagina, minhaPendente, copia) {
  if (typeof vacFila !== 'function') return;
  let F; try { F = vacFila(pagina); } catch (e) { return; } const donoVivo=copia&&copia.p&&copia.aba&&copia.aba!==F.aba&&F.vivas().some(x=>x.id===copia.aba); if (!donoVivo&&(minhaPendente||!F.outraComPendencia())) return;
  const m = 'Outra aba desta página tem alteração ainda não gravada na pasta. Para não perder nenhuma das duas, grave (ou feche) aquela aba antes de alterar aqui. Nada foi descartado.';
  try { if (typeof toast === 'function') toast(m, 9000, true); else alert(m); } catch (x) { }
  const e = new Error(m); e.name = 'VacAbaBloqueada'; throw e;
}
addEventListener('unhandledrejection', e => { if (e.reason && e.reason.name === 'VacAbaBloqueada') e.preventDefault(); });
addEventListener('error', e => { if (e.error && e.error.name === 'VacAbaBloqueada') e.preventDefault(); });
