// Pasta em memória que imita a API do File System Access usada pelo vacRaiz (comum/bases):
// getDirectoryHandle/getFileHandle/createWritable/getFile/removeEntry/entries. Só para testes em Node.
import vm from 'node:vm';
import helpers from '../../scripts/html.cjs';

const naoAchou = nome => new DOMException(nome + ' não existe', 'NotFoundError');

/* pastaMemoria() → {raiz, ler(caminho), gravar(caminho, texto), existe(caminho), log, ganchos}.
   log: lista de {op:'gravou', caminho} na ordem em que cada arquivo foi fechado (createWritable → close).
   ganchos.aoFechar(caminho, texto) → texto: deixa o teste trocar o conteúdo gravado (backup ilegível etc.). */
export function pastaMemoria() {
  const log = [], ganchos = {aoFechar: null};
  function arquivo(nome, caminho) {
    let conteudo = '', mod = 0;
    return {
      kind: 'file', name: nome,
      async getFile() { const t = conteudo; return {name: nome, lastModified: mod, size: t.length, text: async () => t}; },
      async createWritable() {
        let buf = '';
        return {
          async write(d) { buf += typeof d === 'string' ? d : String(d); },
          async close() { conteudo = ganchos.aoFechar ? ganchos.aoFechar(caminho, buf) : buf; mod = Date.now() + log.length; log.push({op: 'gravou', caminho, texto: conteudo}); },
          async abort() { buf = ''; },
        };
      },
      _texto: () => conteudo,
      _gravar: t => { conteudo = t; mod = Date.now(); },
      _idade: ms => { mod = ms; },
    };
  }
  function pasta(nome, caminho) {
    const filhos = new Map();
    const sub = n => (caminho ? caminho + '/' : '') + n;
    const self = {
      kind: 'directory', name: nome,
      async getDirectoryHandle(n, o) {
        const x = filhos.get(n);
        if (x) { if (x.kind !== 'directory') throw new DOMException(n, 'TypeMismatchError'); return x; }
        if (!(o && o.create)) throw naoAchou(n);
        const d = pasta(n, sub(n)); filhos.set(n, d); return d;
      },
      async getFileHandle(n, o) {
        const x = filhos.get(n);
        if (x) { if (x.kind !== 'file') throw new DOMException(n, 'TypeMismatchError'); return x; }
        if (!(o && o.create)) throw naoAchou(n);
        const f = arquivo(n, sub(n)); filhos.set(n, f); return f;
      },
      async removeEntry(n) { if (!filhos.delete(n)) throw naoAchou(n); },
      async *entries() { for (const e of [...filhos.entries()]) yield e; },
      async *values() { for (const v of [...filhos.values()]) yield v; },
      async *keys() { for (const k of [...filhos.keys()]) yield k; },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async isSameEntry(h) { return h === self; },
      async resolve() { return null; },
    };
    return self;
  }
  const raiz = pasta('Pasta fictícia', '');
  const partes = c => c.split('/');
  async function no(caminho, criar) {
    const p = partes(caminho), nome = p.pop();
    let d = raiz;
    for (const x of p) d = await d.getDirectoryHandle(x, {create: criar});
    return d.getFileHandle(nome, {create: criar});
  }
  return {
    raiz, log, ganchos,
    async ler(caminho) { return (await no(caminho, false))._texto(); },
    async existe(caminho) { try { await no(caminho, false); return true; } catch (e) { return false; } },
    /* grava sem passar pelo log (preparação do teste ou "outra pessoa gravou") */
    async gravar(caminho, texto) { (await no(caminho, true))._gravar(texto); },
    /* muda a data de modificação (lastModified) de um arquivo, para simular arquivo antigo */
    async datar(caminho, ms) { (await no(caminho, false))._idade(ms); },
    async pasta(dir) { let d = raiz; for (const x of partes(dir)) d = await d.getDirectoryHandle(x); return d; },
    async listar(dir) { let d = raiz; for (const x of partes(dir)) d = await d.getDirectoryHandle(x); const L = []; for await (const [n] of d.entries()) L.push(n); return L.sort(); },
  };
}

/* vacRaiz real do comum/bases (com VAC_BASES, vacEhBase e vacNaoAchou), avaliado sem DOM. */
export function carregarRaiz() {
  const t = helpers.current().text('comum/bases');
  const pedaco = re => { const m = t.match(re); if (!m) throw new Error('comum/bases mudou: ' + re); return m[0]; };
  const codigo = [
    pedaco(/const VAC_BASES_DIR = [^\n]*/),
    pedaco(/const VAC_BASES = \[[^\n]*/),
    pedaco(/function vacEhBase\([^\n]*/),
    pedaco(/const vacNaoAchou = [^\n]*/),
    pedaco(/function vacRaiz\(raiz\) \{[\s\S]*?\n\}\n/),
    'globalThis.vacRaiz = vacRaiz;',
  ].join('\n');
  const ctx = vm.createContext({DOMException});
  vm.runInContext(codigo, ctx, {filename: 'comum/bases (vacRaiz)'});
  return ctx.vacRaiz;
}

/* vacBackupRegistro real do comum/bases (retenção limpar), com o prazo de backup do cadastro dado. */
export function carregarBackupRegistro(backupDias) {
  const t = helpers.current().text('comum/bases');
  const m = t.match(/const vacBackupRegistro = \(\(\) => \{[\s\S]*?\n\}\)\(\);/);
  if (!m) throw new Error('comum/bases mudou: vacBackupRegistro');
  const mem = new Map();
  const localStorage = {getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v))};
  const ctx = vm.createContext({localStorage, crypto: globalThis.crypto, vacCad: () => ({parametros: {backupDias}})});
  vm.runInContext(m[0] + '\nglobalThis.vacBackupRegistro = vacBackupRegistro;', ctx, {filename: 'comum/bases (vacBackupRegistro)'});
  return ctx.vacBackupRegistro;
}

/* Web Locks de teste: guarda os nomes pedidos; nomes em ocupados[] respondem como trava de outra aba. */
export function travasTeste(ocupados = []) {
  const pedidos = [];
  return {
    pedidos,
    async request(nome, op, fn) {
      if (typeof op === 'function') { fn = op; op = {}; }
      pedidos.push(nome);
      if (ocupados.includes(nome)) { if (op && op.ifAvailable) return fn(null); throw new Error('trava ocupada'); }
      return fn({name: nome, mode: 'exclusive'});
    },
  };
}
