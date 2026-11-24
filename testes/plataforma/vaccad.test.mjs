import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import helpers from '../../scripts/html.cjs';

const html = helpers.current();
const MOTORES = ['motor/portal','motor/oee','motor/perdas','motor/gel','motor/paradas','motor/equip','motor/inic','motor/linha','motor/projetos'];

function definicao() {
  const m = html.text('comum/bases').match(/function vacCad\(\)[\s\S]*?\n(?=\nconst vacPessoa)/);
  assert.ok(m, 'vacCad ausente de comum/bases');
  return m[0];
}
function storage(values = {}) {
  const d = new Map(Object.entries(values));
  return {getItem: k => d.get(k) ?? null, setItem: (k, v) => d.set(k, String(v))};
}
function rodar(contexto) { return vm.runInNewContext(definicao() + ';vacCad()', contexto); }
const CAD = {
  turnos: [{codigo: 'A', ativo: true}, {codigo: 'B', ativo: false}, {codigo: 'C', vigencias: [{de: '2026-10-01', ate: '2026-10-31'}]}],
  catalogos: [{codigo: '1001', nome: 'x'}],
  parametros: {backupDias: 30, zero: 0, producao: {semaforoVerdePct: 95, meta: {vigencias: [{de: '2026-01-01', v: 1}, {de: '2026-11-01', v: 2}]}}}
};
function api(cad = CAD) {
  const ctx = {Cad: {D: cad}, vacHoje: () => '2026-11-23'};
  vm.runInNewContext(definicao(), ctx);
  return vm.runInNewContext('vacCad', ctx);
}

test('vacCad existe uma vez só, em comum/bases', () => {
  assert.match(html.text('comum/bases'), /function vacCad\(\)/);
  const fora = MOTORES.filter(b => /vacCad\(\)\s*\{/.test(html.text(b)));
  assert.deepEqual(fora, []);
});

test('vacCad lê Cad.D, senão vac.cadastros, senão null', () => {
  assert.equal(rodar({Cad: {D: {rev: 7}}, localStorage: storage({'vac.cadastros': '{"rev":1}'})}).rev, 7);
  assert.equal(rodar({localStorage: storage({'vac.cadastros': '{"rev":3}'})}).rev, 3);
  assert.equal(rodar({Cad: {D: null}, localStorage: storage({'vac.cadastros': '{"rev":4}'})}).rev, 4);
  assert.equal(rodar({localStorage: storage()}), null);
  assert.equal(rodar({localStorage: storage({'vac.cadastros': '{quebrado'})}), null);
  assert.equal(rodar({}), null);
});

test('vacCad.vigente escolhe a vigência pela data', () => {
  const c = api();
  assert.deepEqual(c.vigente([{de: '2026-10-01', v: 1}, {de: '2026-12-01', v: 2}], '2026-11-23'), {de: '2026-10-01', v: 1});
  assert.equal(c.vigente([{de: '2026-10-01', v: 1}], '2026-09-30'), null);
  assert.equal(c.vigente([{de: '2026-10-01', ate: '2026-10-31', v: 1}], '2026-11-01'), null);
  assert.equal(c.vigente([{de: '2026-10-01', v: 1}, {de: '2026-11-01', v: 2}]).v, 2, 'data padrão = vacHoje()');
  assert.equal(c.vigente([{de: '2026-10-01', v: 1}], '2026-11-23T10:00:00').v, 1);
  assert.equal(c.vigente(null), null);
});
test('vacCad.item compara o código como texto', () => {
  const c = api();
  assert.equal(c.item('catalogos', 1001).nome, 'x');
  assert.equal(c.item('catalogos', 9), null);
  assert.equal(c.item('inexistente', 1), null);
});
test('vacCad.lista filtra ativos e data', () => {
  const c = api();
  assert.deepEqual(c.lista('turnos').map(t => t.codigo), ['A', 'C']);
  assert.deepEqual(c.lista('turnos', {ativos: false}).map(t => t.codigo), ['A', 'B', 'C']);
  assert.deepEqual(c.lista('turnos', {data: '2026-11-23'}).map(t => t.codigo), ['A']);
  assert.deepEqual(c.lista('turnos', {data: '2026-10-15'}).map(t => t.codigo), ['A', 'C']);
  assert.equal(c.lista('nada').length, 0);
  assert.equal(api(null).lista('turnos').length, 0);
});
test('vacCad.param lê caminho e nunca vira zero', () => {
  const c = api();
  assert.equal(c.param('backupDias'), 30);
  assert.equal(c.param('zero'), 0);
  assert.equal(c.param('producao.semaforoVerdePct'), 95);
  assert.equal(c.param('producao.inexistente'), null);
  assert.equal(c.param('x.y.z'), null);
  assert.equal(c.param('producao.meta').v, 2);
  assert.equal(c.param('producao.meta', '2026-06-01').v, 1);
  assert.equal(api(null).param('backupDias'), null);
});
