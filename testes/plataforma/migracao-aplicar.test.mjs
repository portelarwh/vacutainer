// Migrador pontual (D02): aplicação com pré-voo, diário, retomada e reversão, numa pasta em memória e com dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import helpers from '../../scripts/html.cjs';
import {carregarMigracao, pastaMain} from './migracao-fixtures.mjs';
import {pastaMemoria, carregarRaiz, travasTeste} from './pasta-memoria.mjs';

const M = carregarMigracao(), vacRaiz = carregarRaiz();
const CAD = 'vacutainer-cadastros.json', PORTAL = 'portal-base.json', INIC = 'iniciativas-base.json', EQUIP = 'equipamentos-base.json',
  LINHA = 'linha360-base.json', PAR = 'paradas-base.json', PERD = 'perdas-base.json', FIFO = 'fifo-base.json', OEE = 'oee-vacutainer-base.json';
const ORDEM = [CAD, INIC, EQUIP, LINHA, PAR, PERD, FIFO, OEE, PORTAL];
const BK = {[CAD]: 'Cadastros', [PORTAL]: 'Portal', [INIC]: 'Iniciativas', [EQUIP]: 'Equipamentos', [LINHA]: 'Linha360', [PAR]: 'Paradas',
  [PERD]: 'Perdas', [FIFO]: 'Gel', [OEE]: 'OEE'};
const META = {em: '2026-11-25T14:30:00', por: 'Pessoa de demonstração', porId: '9001'};
const REG = '00. Backups/Migracao/registro-2026-11-25T14-30-00.json';
const backup = f => '00. Backups/' + BK[f] + '/antes-da-migracao-2026-11-25.json';
const ESC = {__meta: META, ['M2-nenhum|' + PERD + '|actions[0].resp']: 'sem', ['M2-ambiguo|' + PERD + '|actions[1].resp']: {id: '1003'},
  ['M2-ambiguo|' + PERD + '|actions[1].user']: {id: '1003'}, ['M3-data|' + CAD + '|catalogos[0].gel']: {from: '2025-01-01'}};
const ASSUNTOS = ['planta', 'produto', 'gel', 'equipamentos', 'turnos', 'paradas', 'pessoas', 'sistema'];
const assuntos = (f = () => 'editar') => Object.fromEntries(ASSUNTOS.map(a => [a, f(a)]));
const SESSAO = {id: '9001', nome: 'Pessoa de demonstração', em: '2026-11-25T14:00:00', ate: Date.now() + 36e5};

function arqsTeste() {
  const a = pastaMain();
  a[CAD].perfis = [{codigo: 'ADMIN', nome: 'Administrador (TESTE)', assuntos: assuntos()},
    {codigo: 'LIDER', nome: 'Líder (TESTE)', assuntos: assuntos(x => x === 'pessoas' ? 'ver' : 'editar')},
    {codigo: 'OPER', nome: 'Operador (TESTE)', assuntos: assuntos(() => 'ver')}];
  return JSON.parse(JSON.stringify(a));
}
async function montar(arqs = arqsTeste()) {
  const fs = pastaMemoria();
  for (const [f, c] of Object.entries(arqs)) await fs.gravar('00. Bases/' + f, JSON.stringify(c));
  const plano = JSON.parse(JSON.stringify(await M.planejar(arqs, ESC)));
  return {fs, pasta: vacRaiz(fs.raiz), plano, arqs};
}
const opcoes = extra => ({escolhas: ESC, sessao: SESSAO, confirmacao: M.CONFIRMACAO, janela: true, travas: travasTeste(), ...extra});
const lerBase = async (fs, f) => JSON.parse(await fs.ler('00. Bases/' + f));
const bases = fs => fs.log.filter(x => x.caminho.startsWith('00. Bases/'));
const hashTexto = t => M.hash(JSON.parse(t));
/* resultados do núcleo (outro realm do vm) em objetos deste realm, para o deepEqual */
const J = x => x == null ? x : JSON.parse(JSON.stringify(x));
const aplicar = async (...a) => J(await M.aplicar(...a));
const retomar = async (...a) => J(await M.retomar(...a));
const restaurar = async (...a) => J(await M.restaurar(...a));

test('o plano da pasta fictícia altera os nove arquivos, um de cada dono', async () => {
  const {plano} = await montar();
  assert.deepEqual(Object.keys(plano.alteracoes).sort(), [...ORDEM].sort());
  assert.equal(typeof M.CONFIRMACAO, 'string');
  assert.ok(M.CONFIRMACAO.length >= 6);
});

test('(f) sem sessão de quem edita a Administração, ou sem confirmação digitada, recusa e não grava nada', async () => {
  const casos = [
    ['sem sessão', {sessao: null}],
    ['sessão vencida', {sessao: {...SESSAO, ate: Date.now() - 1000}}],
    ['pessoa fora do cadastro', {sessao: {...SESSAO, id: '7777'}}],
    ['perfil que só consulta', {sessao: {...SESSAO, id: '1002', nome: 'Bruno Operador (TESTE)'}}],
    ['perfil que não edita todos os assuntos', {sessao: {...SESSAO, id: '1001', nome: 'Ana Líder (TESTE)'}}],
    ['confirmação errada', {confirmacao: 'migrar'}],
    ['sem confirmação', {confirmacao: ''}],
    ['sem confirmar a janela', {janela: false}],
    ['sem hora da migração', {escolhas: {...ESC, __meta: {por: 'x'}}}],
    ['sem Web Locks', {travas: null}],
  ];
  for (const [nome, extra] of casos) {
    const {fs, pasta, plano} = await montar();
    const r = await aplicar(pasta, plano, opcoes(extra));
    assert.equal(r.ok, false, nome);
    assert.ok(r.motivo, nome);
    assert.equal(r.registro, null, nome);
    assert.deepEqual(fs.log, [], nome + ': nada gravado');
  }
  // perfis da pessoa: Ana (1001) é LIDER e Bruno (1002) é OPER; a sessão válida é a 9001 (ADMIN)
});

test('(f) outra aba com a trava de edição de uma página: recusa sem gravar', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes({travas: travasTeste(['vac-editar-inic'])}));
  assert.equal(r.ok, false);
  assert.match(r.motivo, /inic|Iniciativas/);
  assert.deepEqual(fs.log, []);
});

test('(a) pré-voo: arquivo mudado depois da prévia faz nada ser gravado e diz qual', async () => {
  const {fs, pasta, plano} = await montar();
  const eq = await lerBase(fs, EQUIP); eq.os[0].titulo = 'Mudou depois da prévia';
  await fs.gravar('00. Bases/' + EQUIP, JSON.stringify(eq));
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, false);
  assert.equal(r.resultado[EQUIP], 'pulado-mudou');
  assert.deepEqual(r.mudaram, [EQUIP]);
  assert.match(r.motivo, /equipamentos-base\.json/);
  for (const f of ORDEM.filter(f => f !== EQUIP)) assert.equal(r.resultado[f], 'nao-gravado', f);
  assert.deepEqual(fs.log, [], 'nem backup nem diário');
});

test('(a) pré-voo: arquivo do plano ausente da pasta faz nada ser gravado', async () => {
  const {fs, pasta, plano} = await montar();
  await pasta.raiz.getDirectoryHandle('00. Bases').then(d => d.removeEntry(LINHA));
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, false);
  assert.equal(r.resultado[LINHA], 'pulado-mudou');
  assert.deepEqual(fs.log, []);
});

test('(a) pré-voo: backups de todos os arquivos antes do 1º write, relidos e conferidos', async () => {
  const {fs, pasta, plano, arqs} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const primeiro = fs.log.findIndex(x => x.caminho.startsWith('00. Bases/'));
  for (const f of ORDEM) {
    const i = fs.log.findIndex(x => x.caminho === backup(f));
    assert.ok(i >= 0 && i < primeiro, f + ': backup antes da 1ª gravação');
    assert.equal(await hashTexto(await fs.ler(backup(f))), plano.alteracoes[f].hashAntes, f);
    assert.deepEqual(JSON.parse(await fs.ler(backup(f))), arqs[f], f + ': conteúdo original');
  }
});

test('(a) pré-voo: backup ilegível faz nada ser gravado e diz qual', async () => {
  const {fs, pasta, plano} = await montar();
  fs.ganchos.aoFechar = (c, t) => c === backup(FIFO) ? t.slice(0, 20) : t;
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, false);
  assert.deepEqual(r.backupsFalhos, [FIFO]);
  assert.match(r.motivo, /Gel|fifo-base\.json/);
  assert.deepEqual(bases(fs), [], 'nenhuma base gravada');
  assert.equal(await fs.existe(REG), false, 'sem diário');
});

test('(a) backup não sobrescreve um backup anterior com outro conteúdo', async () => {
  const {fs, pasta, plano} = await montar();
  await fs.gravar(backup(CAD), '{"outro":"backup"}');
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  assert.equal(await fs.ler(backup(CAD)), '{"outro":"backup"}');
  const nome = r.registro.arquivos[CAD].backup;
  assert.equal(nome, '00. Backups/Cadastros/antes-da-migracao-2026-11-25-2.json');
  assert.equal(await hashTexto(await fs.ler(nome)), plano.alteracoes[CAD].hashAntes);
});

test('(b) diário antes do 1º arquivo, com plano, escolhas e hashes; pendente → gravado → verificado', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const iReg = fs.log.findIndex(x => x.caminho === REG), iBase = fs.log.findIndex(x => x.caminho.startsWith('00. Bases/'));
  assert.ok(iReg >= 0 && iReg < iBase, 'diário antes do 1º arquivo');
  const primeiro = JSON.parse(fs.log[iReg].texto);
  assert.equal(primeiro.id, '2026-11-25T14-30-00');
  assert.deepEqual(primeiro.escolhas, ESC);
  assert.deepEqual(primeiro.plano.alteracoes[CAD].hashAntes, plano.alteracoes[CAD].hashAntes);
  assert.equal(primeiro.janela.confirmada, true);
  assert.match(primeiro.janela.aviso, /não impede|não consegue impedir/);
  assert.deepEqual(primeiro.sessao, {id: '9001', nome: 'Pessoa de demonstração'});
  for (const f of ORDEM) {
    assert.equal(primeiro.arquivos[f].estado, 'pendente', f);
    assert.equal(primeiro.arquivos[f].hashAntes, plano.alteracoes[f].hashAntes, f);
    assert.match(primeiro.arquivos[f].hashDepois, /^[0-9a-f]{64}$/, f);
  }
  // estados do cadastro em cada versão do diário
  const estados = fs.log.filter(x => x.caminho === REG).map(x => JSON.parse(x.texto).arquivos[CAD].estado);
  assert.deepEqual([...new Set(estados)], ['pendente', 'gravado', 'verificado']);
  const fim = JSON.parse(await fs.ler(REG));
  assert.equal(fim.estado, 'concluido');
  for (const f of ORDEM) {
    assert.equal(fim.arquivos[f].estado, 'verificado', f);
    assert.equal(await hashTexto(await fs.ler('00. Bases/' + f)), fim.arquivos[f].hashDepois, f);
    assert.equal(r.resultado[f], 'gravado', f);
  }
  assert.deepEqual(r.registro, fim);
});

test('(e) ordem de gravação: cadastro → Iniciativas → Equipamentos → Linha → Paradas → Waste → Gel → Produção → Administração', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  assert.deepEqual(bases(fs).map(x => x.caminho.slice('00. Bases/'.length)), ORDEM);
  assert.deepEqual([...M.ORDEM], ORDEM);
});

test('(g) cada base alterada recebe uma entrada na própria auditoria (e rev quando usa rev)', async () => {
  const {fs, pasta, plano, arqs} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const d = {};
  for (const f of ORDEM) d[f] = await lerBase(fs, f);
  const novo = (f, k) => { assert.equal(d[f][k].length, arqs[f][k].length + 1, f + ' ' + k); return d[f][k].at(-1); };
  let a = novo(CAD, 'auditoria');
  assert.equal(a.em, META.em); assert.equal(a.por, 'Pessoa de demonstração'); assert.equal(a.porId, '9001'); assert.equal(a.acao, 'migração');
  assert.equal(a.tipo, '*'); assert.match(a.depois, /M3/); assert.match(a.motivo, /2026-11-25T14-30-00/);
  assert.equal(d[CAD].rev, arqs[CAD].rev + 1); assert.equal(d[CAD].revBy, 'Pessoa de demonstração'); assert.equal(d[CAD].revAt, META.em);
  for (const f of [PORTAL, PERD]) {
    a = novo(f, 'audit');
    assert.deepEqual(Object.keys(a).sort(), ['a', 'd', 't', 'u']);
    assert.equal(a.t, META.em); assert.equal(a.u, 'Pessoa de demonstração'); assert.match(a.d, /M[12]/);
    assert.equal(d[f].rev, arqs[f].rev + 1); assert.equal(d[f].updatedAt, META.em); assert.equal(d[f].updatedBy, 'Pessoa de demonstração');
  }
  for (const f of [INIC, EQUIP, LINHA]) {
    a = novo(f, 'auditoria');
    assert.equal(a.em, META.em); assert.equal(a.por, 'Pessoa de demonstração'); assert.equal(a.porId, '9001'); assert.equal(a.k, 'migração');
    assert.equal(d[f].rev, arqs[f].rev + 1); assert.equal(d[f].revBy, 'Pessoa de demonstração'); assert.equal(d[f].revAt, META.em);
  }
  a = novo(PAR, 'auditoria');
  assert.equal(a.acao, 'migração'); assert.match(a.txt, /M2/); assert.equal(d[PAR].rev, arqs[PAR].rev + 1);
  assert.equal(d[OEE].auditLog.length, 1);
  a = d[OEE].auditLog[0];
  assert.equal(a.action, 'migração'); assert.equal(a.user, 'Pessoa de demonstração'); assert.equal(a.userId, '9001'); assert.equal(a.ts, META.em);
  assert.equal(a.dbVersion, arqs[OEE].databaseVersion + 1); assert.equal(d[OEE].databaseVersion, arqs[OEE].databaseVersion + 1);
  assert.equal(d[OEE].lastModifiedBy, 'Pessoa de demonstração');
  // Gel (fifo-base.json) não tem auditoria: rev e revBy no início do arquivo; a alteração fica só no diário
  assert.equal(d[FIFO].rev, 1);
  assert.match(await fs.ler('00. Bases/' + FIFO), /^\{"rev":1,"revBy":"Pessoa de demonstração"/);
  assert.equal(d[FIFO].auditoria, undefined); assert.equal(d[FIFO].audit, undefined);
  assert.equal(r.registro.arquivos[FIFO].auditoria, 'só no registro');
  assert.equal(r.registro.arquivos[CAD].auditoria, 'auditoria');
  assert.equal(r.registro.arquivos[OEE].auditoria, 'auditLog');
  // o que o plano mudou continua no arquivo gravado
  assert.equal(d[PORTAL].schemaVersion, 1);
  assert.equal(d[INIC].acoes.filter(x => /^AC-W-/.test(x.id)).length, 2);
});

/* Execução completa numa pasta, para comparar com a retomada. */
async function completa() {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const out = {};
  for (const f of ORDEM) out[f] = await lerBase(fs, f);
  return out;
}
const interrompe = alvo => ({aoGravar: f => { if (f === alvo) throw new Error('queda simulada em ' + f); }});

for (const alvo of [CAD, INIC]) test('(c) interrupção depois de gravar ' + alvo + ': retomar conclui sem duplicar', async () => {
  const esperado = await completa();
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(alvo))), /queda simulada/);
  const gravados = bases(fs).map(x => x.caminho.slice('00. Bases/'.length));
  assert.deepEqual(gravados, ORDEM.slice(0, ORDEM.indexOf(alvo) + 1));
  const ret = await retomar(pasta);
  assert.ok(ret.registro, 'achou o diário');
  assert.equal(ret.registro.id, '2026-11-25T14-30-00');
  assert.deepEqual(ret.concluidos, gravados);
  assert.deepEqual(ret.pendentes, ORDEM.filter(f => !gravados.includes(f)));
  assert.deepEqual(ret.mudaram, []);
  const antes = fs.log.length;
  const r = await aplicar(pasta, ret.registro.plano, opcoes({escolhas: ret.registro.escolhas, registro: ret.registro}));
  assert.equal(r.ok, true, r.motivo);
  for (const f of gravados) assert.equal(r.resultado[f], 'ja-concluido', f);
  for (const f of ret.pendentes) assert.equal(r.resultado[f], 'gravado', f);
  assert.deepEqual(bases({log: fs.log.slice(antes)}).map(x => x.caminho.slice('00. Bases/'.length)), ret.pendentes, 'só os pendentes, na ordem');
  for (const f of ORDEM) assert.equal(M.canonico(await lerBase(fs, f)), M.canonico(esperado[f]), f + ': igual à execução sem queda');
  const inic = await lerBase(fs, INIC), cad = await lerBase(fs, CAD);
  const ids = inic.acoes.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length, 'sem ação duplicada');
  assert.equal(ids.filter(x => /^AC-W-/.test(x)).length, 2);
  assert.equal(inic.eventos.filter(e => /^MIGW-EV-/.test(e.id)).length, 2);
  assert.equal(inic.importacoes.length, 1);
  for (const c of cad.catalogos) if (c.gel && c.gel.vig) assert.equal(new Set(c.gel.vig.map(v => v.from)).size, c.gel.vig.length, c.codigo + ': sem vigência duplicada');
  assert.equal(cad.auditoria.length, 1, 'uma entrada de auditoria no cadastro');
  const fim = JSON.parse(await fs.ler(REG));
  assert.equal(fim.estado, 'concluido');
  for (const f of gravados) assert.equal(fim.arquivos[f].estado, 'ja-concluido', f);
  // depois de concluído, nada mais a retomar; aplicar de novo o mesmo plano não grava nada
  const de2 = await retomar(pasta);
  assert.equal(de2.registro, null);
  const n = fs.log.length;
  const r2 = await aplicar(pasta, plano, opcoes());
  assert.equal(r2.ok, false);
  assert.equal(bases({log: fs.log.slice(n)}).length, 0);
});

test('(c) retomar confere os pendentes contra hashAntes: pendente mudado não é gravado', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(CAD))), /queda simulada/);
  const eq = await lerBase(fs, EQUIP); eq.os[0].titulo = 'Outra pessoa gravou';
  await fs.gravar('00. Bases/' + EQUIP, JSON.stringify(eq));
  const ret = await retomar(pasta);
  assert.deepEqual(ret.mudaram, [EQUIP]);
  const n = fs.log.length;
  const r = await aplicar(pasta, ret.registro.plano, opcoes({escolhas: ret.registro.escolhas, registro: ret.registro}));
  assert.equal(r.ok, false);
  assert.equal(r.resultado[EQUIP], 'pulado-mudou');
  assert.equal(bases({log: fs.log.slice(n)}).length, 0);
});

test('retomar sem diário pendente devolve registro nulo', async () => {
  const {pasta} = await montar();
  assert.deepEqual(await retomar(pasta), {registro: null, pendentes: [], concluidos: [], mudaram: [], ilegiveis: []});
});

test('(d) restaurar devolve os arquivos afetados ao conteúdo do backup', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(INIC))), /queda simulada/);
  const {registro} = await retomar(pasta);
  const r = await restaurar(pasta, registro, null, {sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()});
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.resultado[CAD], 'restaurado');
  assert.equal(r.resultado[INIC], 'restaurado');
  for (const f of ORDEM.slice(2)) assert.equal(r.resultado[f], 'ja-restaurado', f);
  for (const f of ORDEM) assert.equal(await M.hash(await lerBase(fs, f)), plano.alteracoes[f].hashAntes, f);
  const fim = JSON.parse(await fs.ler(REG));
  assert.equal(fim.estado, 'restaurado');
  assert.equal(fim.arquivos[CAD].estado, 'restaurado');
  assert.equal((await retomar(pasta)).registro, null, 'restaurado não é retomado');
});

test('(d) restaurar só os arquivos pedidos; arquivo mudado depois do corte não é sobrescrito', async () => {
  const {fs, pasta, plano} = await montar();
  const ap = await aplicar(pasta, plano, opcoes());
  assert.equal(ap.ok, true);
  const eq = await lerBase(fs, EQUIP); eq.os[0].titulo = 'Gravado depois do corte';
  await fs.gravar('00. Bases/' + EQUIP, JSON.stringify(eq));
  const op = {sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()};
  const r = await restaurar(pasta, ap.registro, [CAD, EQUIP], op);
  assert.equal(r.resultado[CAD], 'restaurado');
  assert.equal(r.resultado[EQUIP], 'pulado-mudou');
  assert.equal(r.resultado[INIC], undefined);
  assert.equal(await M.hash(await lerBase(fs, CAD)), plano.alteracoes[CAD].hashAntes);
  assert.equal((await lerBase(fs, EQUIP)).os[0].titulo, 'Gravado depois do corte');
  assert.equal(await M.hash(await lerBase(fs, INIC)), ap.registro.arquivos[INIC].hashDepois);
});

test('(d) restaurar sem sessão ou com confirmação errada recusa sem gravar', async () => {
  const {fs, pasta, plano} = await montar();
  const ap = await aplicar(pasta, plano, opcoes());
  const n = fs.log.length;
  for (const op of [{sessao: null, confirmacao: M.CONFIRMACAO_RESTAURAR}, {sessao: SESSAO, confirmacao: 'x'}]) {
    const r = await restaurar(pasta, ap.registro, null, {...op, janela: true, travas: travasTeste()});
    assert.equal(r.ok, false);
  }
  assert.equal(fs.log.length, n);
});

test('a lista de assuntos da Administração do migrador é a mesma do motor/portal', () => {
  const t = helpers.current().text('motor/portal');
  const ids = [...t.match(/const ADM_ASSUNTOS=\[([\s\S]*?)\];/)[1].matchAll(/\{id:'([a-z]+)'/g)].map(m => m[1]);
  assert.deepEqual(ids, ASSUNTOS);
  assert.deepEqual([...M.ASSUNTOS_ADM], ASSUNTOS);
});
