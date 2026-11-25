// Migrador pontual da base limpa (D02): núcleo puro vacMigracao.planejar, com dados fictícios no formato da main.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carregarMigracao, pastaMain} from './migracao-fixtures.mjs';

const M = carregarMigracao();
const PORTAL = 'portal-base.json', CAD = 'vacutainer-cadastros.json';
const json = x => JSON.parse(JSON.stringify(x));
const comCatalogos = catalogos => {
  const pasta = pastaMain();
  pasta[CAD].catalogos = catalogos;
  return pasta;
};
const plano = (arqs, escolhas) => M.planejar(arqs, escolhas).then(json);
const aplicado = (arqs, p) => ({...arqs, ...Object.fromEntries(Object.entries(p.alteracoes).map(([a, x]) => [a, x.depois]))});
const tipos = (p, item) => p.excecoes.filter(e => e.item === item).map(e => e.tipo);

test('hash: SHA-256 do JSON canônico, sem depender da ordem das chaves', async () => {
  const a = await M.hash({b: 1, a: {d: [1, {y: 2, x: 1}], c: null}});
  const b = await M.hash({a: {c: null, d: [1, {x: 1, y: 2}]}, b: 1});
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, b);
  assert.notEqual(a, await M.hash({a: {c: null, d: [{x: 1, y: 2}, 1]}, b: 1}));
});

test('planejar não altera os arquivos recebidos', async () => {
  const pasta = pastaMain(), antes = json(pasta);
  await M.planejar(pasta, {});
  assert.deepEqual(json(pasta), antes);
});

test('M1: portal-base válida ganha schemaVersion 1 e o resto fica igual', async () => {
  const pasta = pastaMain(), p = await plano(pasta);
  const alt = p.alteracoes[PORTAL];
  assert.ok(alt, 'portal-base deveria ter alteração');
  assert.equal(alt.hashAntes, await M.hash(pasta[PORTAL]));
  assert.equal(alt.depois.schemaVersion, 1);
  const {schemaVersion: _, ...resto} = alt.depois;
  assert.deepEqual(resto, json(pasta[PORTAL]));
  assert.deepEqual(alt.itens, [{item: 'M1', caminho: 'schemaVersion', de: null, para: 1}]);
  assert.equal(p.itens.M1.length, 1);
  assert.deepEqual(tipos(p, 'M1'), []);
});

test('M1: config ou reunioes em lista não ganha versão e vira exceção M1-estrutura', async () => {
  for (const campo of ['config', 'reunioes']) {
    const pasta = pastaMain();
    pasta[PORTAL][campo] = [];
    const p = await plano(pasta);
    assert.equal(p.alteracoes[PORTAL], undefined, campo);
    assert.deepEqual(tipos(p, 'M1'), ['M1-estrutura'], campo);
    const e = p.excecoes.find(x => x.item === 'M1');
    assert.equal(e.arquivo, PORTAL);
    assert.equal(e.caminho, campo);
    assert.ok(e.motivo && e.opcoes.length, 'motivo e opções');
  }
});

test('M1: schemaVersion 1 já gravado não tem nada a fazer; outra versão vira exceção', async () => {
  const pasta = pastaMain();
  pasta[PORTAL].schemaVersion = 1;
  let p = await plano(pasta);
  assert.equal(p.alteracoes[PORTAL], undefined);
  assert.deepEqual(p.itens.M1, []);
  assert.deepEqual(tipos(p, 'M1'), []);
  pasta[PORTAL].schemaVersion = 2;
  p = await plano(pasta);
  assert.equal(p.alteracoes[PORTAL], undefined);
  assert.deepEqual(tipos(p, 'M1'), ['M1-versao']);
});

test('M3: gel solto com vig vazio gera uma exceção M3-data e nenhuma alteração sem escolha', async () => {
  const pasta = comCatalogos([{codigo: 'cat-a', nome: 'Tubo A', gel: {gTubo: 0.85, bomG: 9, bomPct: 106, vig: []}}]);
  const p = await plano(pasta);
  assert.equal(p.alteracoes[CAD], undefined);
  assert.deepEqual(tipos(p, 'M3'), ['M3-data']);
  const e = p.excecoes.find(x => x.item === 'M3');
  assert.equal(e.arquivo, CAD);
  assert.equal(e.caminho, 'catalogos[0].gel');
  assert.equal(e.valor.from, '2000-01-01');
  assert.ok(e.opcoes.some(o => o.valor === 'manter'));
});

test('M3: com a data escolhida, o gel solto vira uma vigência e os campos soltos saem', async () => {
  const pasta = comCatalogos([{codigo: 'cat-a', nome: 'Tubo A', gel: {gTubo: 0.85, bomG: 9, bomPct: 106, fmt: '100'}}]);
  const [e] = (await plano(pasta)).excecoes.filter(x => x.item === 'M3');
  const p = await plano(pasta, {[e.id]: {from: '2025-01-01'}});
  const gel = p.alteracoes[CAD].depois.catalogos[0].gel;
  assert.deepEqual(gel, {fmt: '100', vig: [{from: '2025-01-01', gTubo: 0.85, bomKg: 9 * 106 / 100 * 10, bomBase: 10000, tol: 6}]});
  assert.equal(p.itens.M3.length, 1);
  assert.equal(p.excecoes.find(x => x.id === e.id).escolha.from, '2025-01-01');
  const {catalogos: _, ...resto} = p.alteracoes[CAD].depois, {catalogos: __, ...orig} = pasta[CAD];
  assert.deepEqual(resto, json(orig), 'o resto do cadastro fica igual');
});

test('M3: gel solto com bomKg usa bomKg, bomBase e tolerância gravados', async () => {
  const pasta = comCatalogos([{codigo: 'x', gel: {gTubo: 0.9, bomKg: 12, bomBase: '', tol: 4}}]);
  const [e] = (await plano(pasta)).excecoes;
  const p = await plano(pasta, {[e.id]: {from: '2024-06-01'}});
  assert.deepEqual(p.alteracoes[CAD].depois.catalogos[0].gel, {vig: [{from: '2024-06-01', gTubo: 0.9, bomKg: 12, bomBase: 10000, tol: 4}]});
});

test('M3: escolha "Deixar como está" ou data inválida não grava', async () => {
  const pasta = comCatalogos([{codigo: 'cat-a', gel: {gTubo: 0.85, bomG: 9, bomPct: 106}}]);
  const [e] = (await plano(pasta)).excecoes;
  for (const escolha of ['manter', {from: '2000-01-01'}, {from: '25/01/2025'}, {}]) {
    const p = await plano(pasta, {[e.id]: escolha});
    assert.equal(p.alteracoes[CAD], undefined, JSON.stringify(escolha));
    assert.deepEqual(tipos(p, 'M3'), ['M3-data']);
  }
});

test('M3: vigência com bomG sem bomKg é convertida pela mesma conta', async () => {
  const pasta = comCatalogos([{codigo: 'cat-b', gel: {vig: [{from: '2025-03-01', gTubo: 0.9, bomG: 10, bomPct: 105}, {from: '2025-09-01', gTubo: 0.9, bomKg: 11, bomBase: 10000, tol: 6}]}}]);
  const p = await plano(pasta);
  assert.deepEqual(p.excecoes, []);
  assert.deepEqual(p.alteracoes[CAD].depois.catalogos[0].gel.vig, [
    {from: '2025-03-01', gTubo: 0.9, bomKg: 10 * 105 / 100 * 10, bomBase: 10000, tol: 5},
    {from: '2025-09-01', gTubo: 0.9, bomKg: 11, bomBase: 10000, tol: 6},
  ]);
  assert.deepEqual(p.alteracoes[CAD].itens.map(i => i.caminho), ['catalogos[0].gel.vig[0]']);
});

test('M3: vigência a converter com data 2000-01-01 ou sem data vai para exceção', async () => {
  const pasta = comCatalogos([{codigo: 'cat-b', gel: {vig: [{from: '2000-01-01', bomG: 10, bomPct: 106}, {gTubo: 0.9, bomKg: 11}]}}]);
  const p = await plano(pasta);
  assert.equal(p.alteracoes[CAD], undefined);
  assert.deepEqual(p.excecoes.map(e => [e.tipo, e.caminho]), [['M3-data', 'catalogos[0].gel.vig[0]'], ['M3-data', 'catalogos[0].gel.vig[1]']]);
  const escolhas = Object.fromEntries(p.excecoes.map((e, i) => [e.id, {from: '2025-0' + (i + 1) + '-01'}]));
  const vig = (await plano(pasta, escolhas)).alteracoes[CAD].depois.catalogos[0].gel.vig;
  assert.deepEqual(vig, [{from: '2025-01-01', bomKg: 10 * 106 / 100 * 10, bomBase: 10000, tol: 6}, {from: '2025-02-01', gTubo: 0.9, bomKg: 11}]);
});

test('M3: vigência já convertida com data 2000-01-01 vai para exceção e só muda com a data escolhida', async () => {
  const v = {from: '2000-01-01', gTubo: 0.9, bomKg: 11, bomBase: 10000, tol: 6};
  const pasta = comCatalogos([{codigo: 'cat-c', gel: {vig: [v]}}]);
  const p = await plano(pasta);
  assert.equal(p.alteracoes[CAD], undefined);
  assert.deepEqual(p.excecoes.map(e => [e.tipo, e.caminho]), [['M3-data', 'catalogos[0].gel.vig[0]']]);
  const id = p.excecoes[0].id;
  assert.equal((await plano(pasta, {[id]: 'manter'})).alteracoes[CAD], undefined);
  const com = await plano(pasta, {[id]: {from: '2024-01-01'}});
  assert.deepEqual(com.alteracoes[CAD].depois.catalogos[0].gel.vig, [{...v, from: '2024-01-01'}]);
});

test('M3: sem bomKg nem bomG a tolerância e o BOM seguem a main (vigList/bomVals)', async () => {
  const casos = [[{gTubo: 0.9, tol: 8}, 8], [{gTubo: 0.9, bomPct: 110}, 6]];
  for (const [gel, tol] of casos) {
    const pasta = comCatalogos([{codigo: 'x', gel}]);
    const [e] = (await plano(pasta)).excecoes;
    const p = await plano(pasta, {[e.id]: {from: '2025-01-01'}});
    assert.deepEqual(p.alteracoes[CAD].depois.catalogos[0].gel, {vig: [{from: '2025-01-01', gTubo: 0.9, bomKg: null, bomBase: 10000, tol}]}, JSON.stringify(gel));
  }
});

test('planejar recebe só os arquivos e as escolhas', () => {
  assert.equal(M.planejar.length, 2);
});

test('M3: valor não numérico gera a exceção M3-valor e nenhuma alteração', async () => {
  for (const gel of [{gTubo: 'abc', bomG: 9}, {gTubo: 0.85, bomG: 9, bomPct: 'cento e seis'}, {vig: [{from: '2025-01-01', bomG: 9, bomPct: {}}]}]) {
    const pasta = comCatalogos([{codigo: 'cat-a', gel}]);
    const p = await plano(pasta);
    assert.equal(p.alteracoes[CAD], undefined, JSON.stringify(gel));
    assert.deepEqual(tipos(p, 'M3'), ['M3-valor'], JSON.stringify(gel));
  }
});

test('M3: catálogo atual, sem gel ou só com vigências convertidas não muda', async () => {
  const pasta = comCatalogos(pastaMain()[CAD].catalogos.slice(2));
  const p = await plano(pasta);
  assert.equal(p.alteracoes[CAD], undefined);
  assert.deepEqual(p.excecoes, []);
});

test('idempotência: planejar a pasta já aplicada não encontra alterações', async () => {
  const pasta = pastaMain();
  const primeiro = await plano(pasta);
  const escolhas = Object.fromEntries(primeiro.excecoes.filter(e => e.tipo === 'M3-data').map(e => [e.id, {from: '2025-01-01'}]));
  const p = await plano(pasta, escolhas);
  assert.deepEqual(Object.keys(p.alteracoes).sort(), [PORTAL, CAD].sort());
  assert.equal(p.alteracoes[CAD].depois.catalogos.length, pasta[CAD].catalogos.length, 'nenhum catálogo some ou duplica');
  const depois = aplicado(pasta, p);
  for (const esc of [escolhas, {}]) {
    const de_novo = await plano(depois, esc);
    assert.deepEqual(de_novo.alteracoes, {});
    assert.deepEqual(de_novo.itens.M1, []);
    assert.deepEqual(de_novo.itens.M3, []);
    assert.deepEqual(de_novo.excecoes.filter(e => ['M1', 'M3'].includes(e.item)), []);
  }
});
