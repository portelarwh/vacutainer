import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import helpers from '../../scripts/html.cjs';

const html = helpers.current();
const MOTORES = ['motor/portal','motor/oee','motor/perdas','motor/gel','motor/paradas','motor/equip','motor/inic','motor/linha','motor/projetos'];

function definicao() {
  const m = html.text('comum/bases').match(/function vacCad\(\)\s*\{[^\n]*\}\n/);
  assert.ok(m, 'vacCad ausente de comum/bases');
  return m[0];
}
function storage(values = {}) {
  const d = new Map(Object.entries(values));
  return {getItem: k => d.get(k) ?? null, setItem: (k, v) => d.set(k, String(v))};
}
function rodar(contexto) { return vm.runInNewContext(definicao() + ';vacCad()', contexto); }

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
