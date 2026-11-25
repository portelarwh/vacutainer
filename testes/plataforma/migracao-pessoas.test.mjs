// Migrador pontual (D02): M2/M2b (pessoas) e M4 (locais antigos do Gel), com dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarMigracao, pastaMain} from './migracao-fixtures.mjs';

const M = carregarMigracao();
const CAD = 'vacutainer-cadastros.json', INIC = 'iniciativas-base.json', EQUIP = 'equipamentos-base.json', LINHA = 'linha360-base.json',
  PAR = 'paradas-base.json', PERD = 'perdas-base.json', FIFO = 'fifo-base.json', OEE = 'oee-vacutainer-base.json';
const json = x => JSON.parse(JSON.stringify(x));
const plano = (arqs, escolhas) => M.planejar(arqs, escolhas).then(json);
const aplicado = (arqs, p) => ({...arqs, ...Object.fromEntries(Object.entries(p.alteracoes).map(([a, x]) => [a, x.depois]))});
const exc = (p, tipo) => p.excecoes.filter(e => e.tipo === tipo);
const ANA = 'Ana Líder (TESTE)', BRUNO = 'Bruno Operador (TESTE)', CARLA = 'Carla Souza (TESTE)';

test('pessoa: ID exato, nome normalizado único, ambíguo e ausente (inativos contam)', () => {
  const us = pastaMain()[CAD].usuarios;
  assert.deepEqual(json(M.pessoa('1002', us)), {id: '1002'});
  assert.deepEqual(json(M.pessoa('  bruno   OPERADOR (teste) ', us)), {id: '1002'});
  assert.deepEqual(json(M.pessoa('ANA LIDER (TESTE)', us)), {id: '1001'});
  assert.deepEqual(json(M.pessoa('Carla Souza (TESTE)', us)).ambiguo.map(u => u.codigo), ['1003', '1004']);
  assert.deepEqual(json(M.pessoa('Ninguém', us)), {nenhum: true});
  assert.deepEqual(json(M.pessoa('', us)), {nenhum: true});
});

test('M2: nome único preenche o ID vazio em cada caminho da tabela', async () => {
  const p = await plano(pastaMain());
  const d = a => p.alteracoes[a].depois;
  assert.equal(d(INIC).acoes[0].responsavelId, '1001');
  assert.equal(d(INIC).acoes[0].criadaPorId, '1001');
  assert.deepEqual(d(INIC).acoes[0].apoiosIds, ['1002']);
  assert.equal(d(INIC).eventos[1].deId, '1001');
  assert.equal(d(INIC).eventos[1].paraId, '1002');
  assert.equal(d(INIC).eventos[0].paraId, undefined, 'só eventos do tipo responsável');
  assert.equal(d(EQUIP).os[0].responsavelId, '1002');
  assert.equal(d(LINHA).postos[0].pessoasIds.T1, '1001');
  assert.equal(d(LINHA).postos[0].pessoasIds.T3, '1002', 'ID gravado de outro turno fica');
  assert.equal(d(LINHA).feitos[0].porId, '1002');
  const fm = d(LINHA).formularios[0];
  assert.deepEqual([fm.respId, fm.confId, fm.desvio.respId, fm.exec.porId, fm.concluidoPorId, fm.confirmadoPorId, fm.devolucoes[0].porId],
    ['1001', '1002', '1001', undefined, '1001', '1002', '1002']);
  assert.equal(d(LINHA).fotos[0].tiradaPorId, '1001');
  assert.equal(d(PAR).tecnico['EV-1'].tecnicoId, '1001');
  const c = d(PERD).comments[0];
  assert.deepEqual([c.userId, c.alteradoPorId, c.excluidoPorId, c.hist[0].userId, d(PERD).exclusoes[0].porId], ['1001', '1002', '1001', '1002', '1002']);
  assert.ok(p.itens.M2.length > 15);
});

test('M2: ID já gravado não muda, mesmo com nome de outra pessoa', async () => {
  const pasta = pastaMain();
  pasta[INIC].acoes[2].responsavel = 'Ana Líder (TESTE)';
  const p = await plano(pasta);
  assert.equal(p.alteracoes[INIC].depois.acoes[2].responsavelId, '1002');
  assert.ok(!p.alteracoes[INIC].itens.some(i => i.caminho.startsWith('acoes[2].responsavelId')));
});

test('M2: nome repetido gera M2-ambiguo com os 2 candidatos; nome ausente gera M2-nenhum; nada é gravado', async () => {
  const pasta = pastaMain(), p = await plano(pasta);
  const amb = p.excecoes.find(e => e.id === 'M2-ambiguo|' + INIC + '|acoes[1].responsavel');
  assert.ok(amb);
  assert.equal(amb.item, 'M2');
  assert.deepEqual(amb.candidatos.map(c => c.codigo), ['1003', '1004']);
  assert.equal(amb.valor, CARLA);
  assert.ok(amb.opcoes.some(o => o.valor === 'sem'));
  assert.ok(exc(p, 'M2-nenhum').some(e => e.arquivo === INIC && e.caminho === 'acoes[1].apoios[0]'));
  assert.ok(exc(p, 'M2-nenhum').some(e => e.arquivo === EQUIP && e.caminho === 'os[0].apontamentos[0].por'));
  assert.equal(p.alteracoes[INIC].depois.acoes[1].responsavelId, undefined);
});

test('M2: Sem responsável deixa o ID vazio e registra a decisão; escolher um candidato grava o ID', async () => {
  const pasta = pastaMain();
  const id = 'M2-ambiguo|' + INIC + '|acoes[1].responsavel';
  let p = await plano(pasta, {[id]: 'sem'});
  assert.equal(p.alteracoes[INIC].depois.acoes[1].responsavelId, undefined);
  assert.equal(p.excecoes.find(e => e.id === id).escolha, 'sem');
  p = await plano(pasta, {[id]: {id: '1003'}});
  assert.equal(p.alteracoes[INIC].depois.acoes[1].responsavelId, '1003');
  assert.deepEqual(p.excecoes.find(e => e.id === id).escolha, {id: '1003'});
  p = await plano(pasta, {[id]: {id: '7777'}});
  assert.equal(p.alteracoes[INIC].depois.acoes[1].responsavelId, undefined, 'ID fora do cadastro não vale');
  assert.equal(p.excecoes.find(e => e.id === id).escolha, undefined);
});

test('M2b: tecnicoForms sem tecnico{} cria a entrada com tecnicoId', async () => {
  const p = await plano(pastaMain());
  assert.deepEqual(p.alteracoes[PAR].depois.tecnico['EV-2'], {tecnico: BRUNO, tecnicoId: '1002', por: 'migração', porId: ''});
  assert.equal(p.itens.M2b.length, 1);
  assert.equal(p.alteracoes[PAR].depois.tecnico['EV-1'].tecnico, ANA, 'entrada existente não é recriada');
});

test('M2b: técnico ambíguo ou ausente vira exceção e não cria entrada', async () => {
  for (const [nome, tipo] of [[CARLA, 'M2-ambiguo'], ['Pessoa Ausente', 'M2-nenhum']]) {
    const pasta = pastaMain();
    pasta[PAR].eventos[1].tecnicoForms = nome;
    const p = await plano(pasta);
    assert.ok(exc(p, tipo).some(e => e.arquivo === PAR && e.caminho === 'eventos[1].tecnicoForms'), nome);
    assert.equal(p.alteracoes[PAR].depois.tecnico['EV-2'], undefined);
  }
});

test('M4: os três passos de busca reescrevem {e,d} no Gel e na Produção', async () => {
  const p = await plano(pastaMain());
  const eqG = p.alteracoes[FIFO].depois.prodlog['2026-11-19'].turns.T1.eq;
  assert.deepEqual([eqG[0].e, eqG[0].d], ['eq-EQ03', 'L-0001'], 'passo 2');
  assert.deepEqual([eqG[1].e, eqG[1].d], ['eq-EQ08', 'L-0002'], 'passo 1 (já no formato atual)');
  assert.equal(eqG[0].kg, 1.2, 'o resto do registro fica');
  const eqP = p.alteracoes[OEE].depois.productionDays[0].shifts[0].gelScrap.eq;
  assert.deepEqual([eqP[0].e, eqP[0].d], ['eq-EQ08', 'L-0002'], 'passo 2');
  assert.deepEqual([eqP[1].e, eqP[1].d], ['eq-EQ08', 'L-0002'], 'passo 3');
  assert.equal(p.itens.M4.length, 3);
});

test('M4: sem local gera M4-sem-local e o registro fica intacto', async () => {
  const pasta = pastaMain(), p = await plano(pasta);
  const e = exc(p, 'M4-sem-local');
  assert.equal(e.length, 1);
  assert.equal(e[0].arquivo, FIFO);
  assert.equal(e[0].caminho, 'prodlog[2026-11-19].turns[T1].eq[2]');
  assert.deepEqual(e[0].valor, {e: 'eq-EQ03', d: 'd-sumiu'});
  const eq = p.alteracoes[FIFO].depois.prodlog['2026-11-19'].turns.T1.eq[2];
  assert.deepEqual(eq, pasta[FIFO].prodlog['2026-11-19'].turns.T1.eq[2]);
  const q = await plano(pasta, {[e[0].id]: 'manter'});
  assert.equal(q.excecoes.find(x => x.id === e[0].id).escolha, 'manter');
});

test('contagem de registros igual antes e depois; planejar não altera a entrada', async () => {
  const pasta = pastaMain(), antes = json(pasta), p = await plano(pasta);
  assert.deepEqual(json(pasta), antes);
  const depois = aplicado(pasta, p);
  assert.equal(depois[INIC].acoes.length, pasta[INIC].acoes.length);
  assert.equal(depois[INIC].eventos.length, pasta[INIC].eventos.length);
  assert.equal(depois[PERD].actions.length, pasta[PERD].actions.length, 'ações do Waste intactas');
  assert.equal(depois[PERD].comments.length, pasta[PERD].comments.length);
  assert.equal(depois[PAR].eventos.length, pasta[PAR].eventos.length);
  assert.equal(depois[LINHA].formularios.length, pasta[LINHA].formularios.length);
  assert.equal(depois[FIFO].prodlog['2026-11-19'].turns.T1.eq.length, 3);
  assert.equal(depois[OEE].productionDays[0].shifts[0].gelScrap.eq.length, 2);
});

test('idempotência: planejar a pasta já aplicada não altera mais nada em M2, M2b e M4', async () => {
  const pasta = pastaMain(), p = await plano(pasta);
  const depois = aplicado(pasta, p), de_novo = await plano(depois);
  for (const k of ['M2', 'M2b', 'M4']) assert.deepEqual(de_novo.itens[k], [], k);
  for (const a of [INIC, EQUIP, LINHA, PAR, PERD, FIFO, OEE]) assert.equal(de_novo.alteracoes[a], undefined, a);
  const meus = x => x.excecoes.filter(e => e.item === 'M2' || e.item === 'M4').map(e => e.id).sort();
  assert.deepEqual(meus(de_novo), meus(p));
});

test('M2 e M4 sem cadastro de usuários ou de locais viram exceção de estrutura', async () => {
  const pasta = pastaMain();
  delete pasta[CAD].usuarios;
  delete pasta[CAD].gel;
  const p = await plano(pasta);
  assert.equal(exc(p, 'M2-estrutura').length, 1);
  assert.equal(exc(p, 'M4-estrutura').length, 1);
  assert.equal(p.alteracoes[INIC], undefined);
  assert.deepEqual((p.alteracoes[FIFO] || {itens: []}).itens.map(i => i.item), ['M1b'], 'só o carimbo de versão (M1b) chega ao Gel; M4 não muda nada');
});

test('M2b: entrada de tecnico{} sem técnico (só codigoValidado) recebe tecnico e tecnicoId e mantém o resto', async () => {
  const pasta = pastaMain();
  pasta[PAR].eventos[1].tecnicoForms = 'Ana Líder (TESTE)';
  pasta[PAR].tecnico['EV-2'] = {codigoValidado: 'FME'};
  const p = await plano(pasta);
  assert.deepEqual(p.alteracoes[PAR].depois.tecnico['EV-2'], {codigoValidado: 'FME', tecnico: ANA, tecnicoId: '1001'});
  const q = await plano(aplicado(pasta, p));
  assert.deepEqual(q.itens.M2b, []);
});
