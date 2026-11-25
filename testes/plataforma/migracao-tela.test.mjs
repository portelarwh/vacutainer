// Migrador pontual (D02): o que a tela precisa do núcleo: abas vivas (chaves com e sem escopo da pasta, ignorar as próprias, falhar fechado),
// registro sem pendência real não volta como não concluído, listagem de registros e a cópia do vacRaiz na ferramenta. Dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarMigracao, armazenamento, registrarPasta} from './migracao-fixtures.mjs';
import {CAD, EQUIP, SESSAO, ESC, arqsTeste, lerBase} from './migracao-aplicar-comum.mjs';
import {pastaMemoria, carregarRaiz, travasTeste} from './pasta-memoria.mjs';
import helpers from '../../scripts/html.cjs';
import {execFileSync} from 'node:child_process';
import {MAIN} from './migracao-gel-main.mjs';

const viva = (extra = {}) => JSON.stringify({t: Date.now(), pend: false, ...extra});
async function montarCom(M, arqs = arqsTeste()) {
  const fs = pastaMemoria(), vacRaiz = carregarRaiz();
  registrarPasta(fs.raiz);
  for (const [f, c] of Object.entries(arqs)) await fs.gravar('00. Bases/' + f, JSON.stringify(c));
  const plano = JSON.parse(JSON.stringify(await M.planejar(arqs, ESC)));
  return {fs, pasta: vacRaiz(fs.raiz), plano};
}
const op = (M, extra) => ({escolhas: ESC, sessao: SESSAO, confirmacao: M.CONFIRMACAO, janela: true, travas: travasTeste(), ...extra});
const RESTAURAR = M => ({sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()});
const J = x => JSON.parse(JSON.stringify(x));
const SEM_ABAS = /não foi possível conferir as abas abertas/i;

test('abas: heartbeat da plataforma com escopo da pasta (vac.app.<escopo>.vac.aba.<página>.<id>) recusa e diz a página', async () => {
  const M = carregarMigracao({localStorage: armazenamento({'vac.app.7c1e-escopo.vac.aba.inic.aXY1': viva()})});
  const {fs, pasta, plano} = await montarCom(M);
  const r = J(await M.aplicar(pasta, plano, op(M)));
  assert.equal(r.ok, false); assert.match(r.motivo, /Iniciativas/);
  assert.match(r.motivo, /neste navegador, de qualquer pasta/, 'heartbeats de outras pastas também bloqueiam, e o texto diz isso');
  assert.deepEqual(fs.log, [], 'nada gravado');
});

test('abas: heartbeat vencido (20 s), de outra página ou ilegível não bloqueia; restaurar também confere as abas', async () => {
  const ls = armazenamento({'vac.aba.linha.a1': viva({t: Date.now() - 30000}), 'vac.app.x.vac.aba.portal-cad.a2': viva({t: Date.now() - 25000}),
    'vac.app.x.vac.aba.outra.a3': viva(), 'vac.aba.inic.lixo': 'não é json'});
  const M = carregarMigracao({localStorage: ls});
  const {pasta, plano} = await montarCom(M);
  const r = J(await M.aplicar(pasta, plano, op(M)));
  assert.equal(r.ok, true, r.motivo);
  ls.setItem('vac.aba.equip.a9', viva());
  const rs = J(await M.restaurar(pasta, r.registro, null, RESTAURAR(M)));
  assert.equal(rs.ok, false); assert.match(rs.motivo, /Equipamentos/);
});

test('abas: ids em ignorarAbas (a própria janela da ferramenta) não contam; as outras abas contam', async () => {
  const ls = armazenamento({'vac.app.e1.vac.aba.inic.minha': viva(), 'vac.aba.inic.minha': viva()});
  const M = carregarMigracao({localStorage: ls});
  const a = await montarCom(M);
  const ok = J(await M.aplicar(a.pasta, a.plano, op(M, {ignorarAbas: ['minha']})));
  assert.equal(ok.ok, true, ok.motivo);
  ls.setItem('vac.app.e1.vac.aba.equip.outra', viva());
  const b = await montarCom(M);
  const r = J(await M.aplicar(b.pasta, b.plano, op(M, {ignorarAbas: ['minha']})));
  assert.equal(r.ok, false); assert.match(r.motivo, /Equipamentos/);
});

test('abas: falha fechado quando o localStorage não pode ser listado, ou não existe', async () => {
  /* ilegível só na listagem: a sessão da pasta (getItem) é lida, e a conferência das abas é que falha */
  const ls = armazenamento(); ls.quebrar = 'lista';
  for (const [rotulo, extra, motivo] of [['ilegível', {localStorage: ls}, SEM_ABAS], ['ausente', {localStorage: undefined}, /sessão/i]]) {
    const M = carregarMigracao(extra);
    const {fs, pasta, plano} = await montarCom(M);
    const r = J(await M.aplicar(pasta, plano, op(M)));
    assert.equal(r.ok, false, rotulo); assert.match(r.motivo, motivo, rotulo);
    assert.deepEqual(fs.log, [], rotulo + ': nada gravado');
    const rs = J(await M.restaurar(pasta, {id: 'x', arquivos: {[CAD]: {}}}, null, RESTAURAR(M)));
    assert.equal(rs.ok, false, rotulo); assert.match(rs.motivo, motivo, rotulo);
  }
});

test('abas: o injetor op.abas que lança também recusa (falha fechado)', async () => {
  const M = carregarMigracao();
  const {fs, pasta, plano} = await montarCom(M);
  const r = J(await M.aplicar(pasta, plano, op(M, {abas: () => { throw new Error('boom'); }})));
  assert.equal(r.ok, false); assert.match(r.motivo, SEM_ABAS);
  assert.deepEqual(fs.log, []);
});

test('M1 · registro cujos únicos arquivos sem fechar são não tocados vira concluido-parcial e não volta em retomar', async () => {
  const M = carregarMigracao();
  const {fs, pasta, plano} = await montarCom(M);
  const mexer = async (f, t) => { const d = await lerBase(fs, f); d.mexido = t; await fs.gravar('00. Bases/' + f, JSON.stringify(d)); };
  const r = J(await M.aplicar(pasta, plano, op(M, {aoGravar: async f => { if (f === CAD) await mexer(EQUIP, 'outra pessoa'); }})));
  assert.equal(r.registro.estado, 'incompleto');
  const ret = J(await M.retomar(pasta));
  assert.deepEqual(ret.naoTocados, [EQUIP]);
  const de2 = J(await M.aplicar(pasta, ret.registro.plano, op(M, {escolhas: ret.registro.escolhas, registro: ret.registro})));
  assert.equal(de2.resultado[EQUIP], 'nao-tocado');
  assert.equal(de2.registro.estado, 'concluido-parcial');
  assert.equal(de2.ok, false, 'um arquivo não foi migrado: não é sucesso');
  assert.deepEqual(J(await M.retomar(pasta)), {registro: null, pendentes: [], concluidos: [], naoTocados: [], mudaram: [], erros: [], ilegiveis: []});
  const rs = J(await M.restaurar(pasta, de2.registro, null, RESTAURAR(M)));
  assert.equal(rs.ok, true, rs.motivo);
  assert.equal(rs.registro.estado, 'restaurado');
});

test('M1 · registro antigo incompleto com todos os arquivos resolvidos também não volta; pendente de verdade volta', async () => {
  const M = carregarMigracao();
  const {fs, pasta, plano} = await montarCom(M);
  const r = J(await M.aplicar(pasta, plano, op(M)));
  const caminho = '00. Backups/Migracao/registro-' + r.registro.id + '.json';
  const reg = JSON.parse(await fs.ler(caminho));
  reg.estado = 'incompleto'; reg.arquivos[EQUIP].estado = 'nao-tocado';
  await fs.gravar(caminho, JSON.stringify(reg));
  assert.equal(J(await M.retomar(pasta)).registro, null);
  reg.arquivos[EQUIP].estado = 'pendente'; reg.arquivos[EQUIP].hashAntes = 'x'; reg.arquivos[EQUIP].hashDepois = 'y';
  await fs.gravar(caminho, JSON.stringify(reg));
  assert.equal(J(await M.retomar(pasta)).registro.id, r.registro.id);
});

test('listar: registros da pasta, com os ilegíveis à parte', async () => {
  const M = carregarMigracao();
  const {fs, pasta, plano} = await montarCom(M);
  assert.deepEqual(J(await M.listar(pasta)), {registros: [], ilegiveis: []});
  const r = J(await M.aplicar(pasta, plano, op(M)));
  await fs.gravar('00. Backups/Migracao/registro-quebrado.json', '{não');
  const l = J(await M.listar(pasta));
  assert.deepEqual(l.registros.map(x => x.id), [r.registro.id]);
  assert.deepEqual(l.ilegiveis, ['registro-quebrado.json']);
});

test('lerPasta: presentes, ausentes, ilegíveis e erro de leitura (erro não é arquivo ausente)', async () => {
  const M = carregarMigracao();
  const arqs = arqsTeste(); delete arqs['paradas-base.json'];
  const {fs, pasta} = await montarCom(M, arqs);
  await fs.gravar('00. Bases/linha360-base.json', '{quebrado');
  const l = J(await M.lerPasta(pasta));
  assert.ok(l.arqs[CAD] && l.arqs['portal-base.json']);
  assert.deepEqual(l.ausentes, ['paradas-base.json']);
  assert.deepEqual(l.ilegiveis, ['linha360-base.json']);
  assert.equal(l.arqs['linha360-base.json'], undefined);
  fs.ganchos.aoLer = c => { if (c.endsWith(EQUIP)) throw new Error('disco'); };
  assert.deepEqual(J(await M.lerPasta(pasta)).erros.map(e => e.arquivo), [EQUIP]);
});

test('a cópia do vacRaiz na ferramenta é a mesma de comum/bases', () => {
  const t = helpers.current().text('comum/bases'), f = helpers.current().text('ferramenta/migracao');
  for (const re of [/const VAC_BASES_DIR = [^\n]*/, /const VAC_BASES = \[[^\n]*/, /function vacEhBase\([^\n]*/, /const vacNaoAchou = [^\n]*/, /function vacRaiz\(raiz\) \{[\s\S]*?\n\}\n/]) {
    const m = t.match(re); assert.ok(m, 'comum/bases mudou: ' + re);
    assert.ok(f.includes(m[0]), 'a ferramenta precisa da mesma linha: ' + re);
  }
});

test('a fórmula do gel da main usada no teste da tela é cópia literal do vacGel da main (91744b5)', t => {
  let main;
  try { main = execFileSync('git', ['show', '91744b5:Plataforma.html'], {encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore']}); }
  catch (e) { t.skip('commit 91744b5 indisponível neste clone'); return; }
  const a = main.indexOf('const vacGel = (() => {'), gel = main.slice(a, main.indexOf('return { COMPS', a)).replace(/&amp;/g, '&');
  for (const l of MAIN) assert.ok(gel.includes(l), 'linha que não está no vacGel da main: ' + l.trim().slice(0, 80));
});
