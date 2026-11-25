// Migrador pontual (D02): a permissão de gravar fica presa à pasta conectada. A casca guarda um escopo por pasta
// (modulo/core/scopes: IndexedDB "vac-nova-plataforma" › app › "scopes" = [{handle, scope}], comparado por isSameEntry) e o
// vacLogin de cada módulo grava a sessão em vac.app.<escopo>.vac.sessao. Só a sessão do escopo da pasta escolhida vale,
// na tela e no núcleo (aplicar e restaurar). Dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarMigracao, armazenamento, chavesSessao, idbPlataforma, registrarPasta, SESSAO_TESTE, ESCOPO_TESTE} from './migracao-fixtures.mjs';
import {ESC, arqsTeste} from './migracao-aplicar-comum.mjs';
import {pastaMemoria, carregarRaiz, travasTeste} from './pasta-memoria.mjs';

const J = x => x == null ? x : JSON.parse(JSON.stringify(x));
const ADMIN = SESSAO_TESTE, ANA = {id: '1001', nome: 'Ana Líder (TESTE)', em: '2026-11-25T14:00:00', ate: Date.now() + 36e5};
async function pasta(M, escopo = ESCOPO_TESTE) {
  const fs = pastaMemoria(), vacRaiz = carregarRaiz(), arqs = arqsTeste();
  if (escopo) registrarPasta(fs.raiz, escopo);
  for (const [f, c] of Object.entries(arqs)) await fs.gravar('00. Bases/' + f, JSON.stringify(c));
  return {fs, pasta: vacRaiz(fs.raiz), plano: J(await M.planejar(arqs, ESC))};
}
const op = (M, extra) => ({escolhas: ESC, sessao: ADMIN, confirmacao: M.CONFIRMACAO, janela: true, travas: travasTeste(), ...extra});
const opR = (M, extra) => ({sessao: ADMIN, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste(), ...extra});

test('sessão de administrador de outra pasta (outro escopo) não autoriza aplicar nem restaurar', async () => {
  const ls = armazenamento();
  const M = carregarMigracao({localStorage: ls});
  const a = await pasta(M);
  const feito = J(await M.aplicar(a.pasta, a.plano, op(M)));
  assert.equal(feito.ok, true, feito.motivo);
  /* a pessoa sai desta pasta; fica a sessão de administrador da pasta B, com o mesmo código */
  for (const k of Object.keys(chavesSessao())) ls.removeItem(k);
  for (const [k, v] of Object.entries(chavesSessao(ADMIN, 'escopo-da-pasta-b'))) ls.setItem(k, v);
  const n = a.fs.log.length;
  const rs = J(await M.restaurar(a.pasta, feito.registro, null, opR(M)));
  assert.equal(rs.ok, false); assert.match(rs.motivo, /sessão/i); assert.equal(rs.registro, null);
  assert.equal(a.fs.log.length, n, 'restaurar não gravou nada');
  const b = await pasta(M);
  const r = J(await M.aplicar(b.pasta, b.plano, op(M)));
  assert.equal(r.ok, false); assert.match(r.motivo, /sessão/i); assert.deepEqual(b.fs.log, []);
});

test('sessão sem escopo (vac.sessao solta no navegador) não autoriza', async () => {
  const M = carregarMigracao({localStorage: armazenamento(chavesSessao(ADMIN, null), {semSessao: true})});
  const {fs, pasta: p, plano} = await pasta(M);
  const r = J(await M.aplicar(p, plano, op(M)));
  assert.equal(r.ok, false); assert.match(r.motivo, /sessão/i); assert.deepEqual(fs.log, []);
});

test('pasta que a plataforma nunca conectou neste navegador: sem escopo, sem sessão, só a prévia', async () => {
  const M = carregarMigracao();
  const {fs, pasta: p, plano} = await pasta(M, null);
  const r = J(await M.aplicar(p, plano, op(M)));
  assert.equal(r.ok, false); assert.match(r.motivo, /não foi aberta na plataforma/i); assert.deepEqual(fs.log, []);
  const s = J(await M.sessaoDaPasta(p));
  assert.equal(s.sessao, null); assert.equal(s.escopo, ''); assert.match(s.motivo, /só a prévia/);
});

test('a sessão desta pasta é de quem não administra: a sessão passada de outra pessoa não a substitui', async () => {
  const M = carregarMigracao({localStorage: armazenamento(chavesSessao(ANA))});
  const {fs, pasta: p, plano} = await pasta(M);
  const r = J(await M.aplicar(p, plano, op(M)));
  assert.equal(r.ok, false); assert.match(r.motivo, /sessão/i); assert.deepEqual(fs.log, []);
});

test('sem IndexedDB (escopos ilegíveis): recusa, nada gravado', async () => {
  const M = carregarMigracao({indexedDB: undefined});
  const {fs, pasta: p, plano} = await pasta(M);
  const r = J(await M.aplicar(p, plano, op(M)));
  assert.equal(r.ok, false); assert.deepEqual(fs.log, []);
});

test('sessaoDaPasta: cada pasta com a sessão do seu escopo; registro antigo (folder + scope) também vale, como no rememberFolder', async () => {
  const ls = armazenamento({...chavesSessao(ADMIN, 'esc-a'), ...chavesSessao({...ANA, id: '1003', nome: 'Carla Souza (TESTE)'}, 'esc-b')}, {semSessao: true});
  const M = carregarMigracao({localStorage: ls});
  const a = await pasta(M, 'esc-a'), b = await pasta(M, 'esc-b');
  const sa = J(await M.sessaoDaPasta(a.pasta)), sb = J(await M.sessaoDaPasta(b.pasta));
  assert.equal(sa.escopo, 'esc-a'); assert.equal(sa.sessao.id, '9001'); assert.equal(sa.sessao.escopo, 'esc-a');
  assert.equal(sb.escopo, 'esc-b'); assert.equal(sb.sessao.id, '1003');
  const fs = pastaMemoria(), raiz = carregarRaiz()(fs.raiz);
  const M2 = carregarMigracao({localStorage: ls, indexedDB: idbPlataforma(() => ({scopes: [], folder: fs.raiz, scope: 'esc-a'}))});
  assert.equal(J(await M2.sessaoDaPasta(raiz)).sessao.id, '9001');
  /* sessão vencida no escopo da pasta: sem sessão */
  ls.setItem('vac.app.esc-a.vac.sessao', JSON.stringify({...ADMIN, ate: Date.now() - 1000}));
  assert.equal(J(await M.sessaoDaPasta(a.pasta)).sessao, null);
});
