// Migrador pontual (D02): aplicação com pré-voo, diário, retomada e reversão, numa pasta em memória e com dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pastaMemoria, travasTeste} from './pasta-memoria.mjs';
import {registrarPasta} from './migracao-fixtures.mjs';
import {CAD, EQUIP, ESC, FIFO, INIC, LINHA, M, META, OEE, ORDEM, PAR, PERD, PORTAL, REG, SESSAO, aplicar, arqsTeste, backup, bases, hashTexto, lerBase, montar, opcoes, vacRaiz} from './migracao-aplicar-comum.mjs';

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

test('o plano de teste tem todas as exceções decididas', async () => {
  const {plano} = await montar();
  assert.ok(plano.excecoes.length >= 10);
  assert.deepEqual(plano.excecoes.filter(e => e.escolha == null).map(e => e.id), []);
});

test('(f) exceção sem escolha no plano: recusa, diz quantas faltam e não grava nada', async () => {
  const arqs = arqsTeste(), fs = pastaMemoria();
  registrarPasta(fs.raiz);
  for (const [f, c] of Object.entries(arqs)) await fs.gravar('00. Bases/' + f, JSON.stringify(c));
  const esc = {...ESC};
  delete esc['M2-nenhum|' + LINHA + '|formularios[0].emissor'];
  delete esc['M4-sem-local|' + FIFO + '|prodlog[2026-11-19].turns[T1].eq[2]'];
  const plano = JSON.parse(JSON.stringify(await M.planejar(arqs, esc)));
  const r = await aplicar(vacRaiz(fs.raiz), plano, opcoes({escolhas: esc}));
  assert.equal(r.ok, false);
  assert.match(r.motivo, /\b2 exceç(ões|ão)/);
  assert.equal(r.registro, null);
  assert.deepEqual(fs.log, []);
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
  assert.equal(nome, '00. Backups/Migracao/Cadastros/antes-da-migracao-2026-11-25-2.json');
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
  assert.deepEqual([...new Set(estados)], ['pendente', 'gravando', 'gravado', 'verificado']);
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
