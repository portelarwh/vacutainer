import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import helpers from '../../scripts/html.cjs';

const html = helpers.current();
function definicao() {
  const m = html.text('comum/bases').match(/function vacCad\(\)[\s\S]*?\n(?=\nconst vacPessoa)/);
  assert.ok(m, 'vacCad ausente de comum/bases');
  return m[0];
}
const FORMATO = {de: '2025-10-01', ate: null, embalagemG: 75, folhaPurgaG: 5, sobraBarrilKg: 1.6,
  tubos: {'100': {tuboG: 4.779, gelG: 0.936, aditivoG: 0.02, tampaRolhaG: 2.3}, '75': {tuboG: 3.56, gelG: 0.834, aditivoG: 0.015, tampaRolhaG: 2.3}},
  motivo: '', por: 'U1', em: '2025-10-01T10:00:00'};
function cad(extra = {}) {
  return {
    equipamentos: [{codigo: 'EQ03', nome: 'Gel', ativo: true}, {codigo: 'EQ-INATIVO', nome: 'Velho', ativo: false}],
    gel: {formatos: [FORMATO], locais: [
      {id: 'L-0002', equipamento: 'EQ03', local: 'B', comp: 'tubogel', categoria: 'T', motivos: [], embalagemG: null, ordem: 2, ativo: true},
      {id: 'L-0001', equipamento: 'EQ03', local: 'A', comp: 'gel', categoria: 'P', motivos: [], embalagemG: null, ordem: 1, ativo: true},
      {id: 'L-0003', equipamento: 'EQ03', local: 'C', comp: 'barril', categoria: 'B', motivos: [], embalagemG: null, ordem: 3, ativo: false},
      {id: 'L-0004', equipamento: 'EQ-INATIVO', local: 'D', comp: 'spray', categoria: 'T', motivos: [], embalagemG: null, ordem: 4, ativo: true}]},
    ...extra};
}
const pl = x => JSON.parse(JSON.stringify(x));
function api(c) {
  const ctx = {Cad: {D: c}, vacHoje: () => '2026-11-23'};
  vm.runInNewContext(definicao(), ctx);
  return vm.runInNewContext('vacCad', ctx);
}

test('composicao com o formato de 01/10/2025', () => {
  const g = api(cad()).gel, d = '2026-11-23';
  assert.equal(g.composicao('100', 'completo', d).gPorTubo, 8.035);
  assert.equal(g.composicao('100', 'tubogel', d).gPorTubo, 5.715);
  assert.equal(g.composicao('100', 'spray', d).gPorTubo, 5.735);
  assert.equal(g.composicao('75', 'completo', d).gPorTubo, 6.709);
  assert.equal(g.composicao('75', 'tubogel', d).gPorTubo, 4.394);
  assert.equal(g.composicao('75', 'spray', d).gPorTubo, 4.409);
  assert.equal(g.composicao('100', 'gel', d).gPorTubo, 0.936);
  assert.equal(g.composicao('100', 'completo', d).etiqueta, true);
  assert.equal(g.composicao('100', 'tubogel', d).etiqueta, false);
  assert.deepEqual(pl(g.composicao('100', 'spray', d).partes), ['tubo', 'gel', 'aditivo']);
  const b = g.composicao('100', 'barril', d);
  assert.equal(b.gPorTubo, null);
  assert.equal(g.composicao('100', 'inexistente', d), null);
  assert.equal(g.composicao('50', 'completo', d), null);
});
test('antes da primeira vigencia nao ha formato nem composicao (sem padrao de fabrica)', () => {
  const g = api(cad()).gel;
  assert.equal(g.formato('2025-09-30'), null);
  assert.equal(g.composicao('100', 'completo', '2025-09-30'), null);
  assert.equal(api(null).gel.formato('2026-11-23'), null);
  assert.equal(api({}).gel.composicao('100', 'completo', '2026-11-23'), null);
});
test('vigencia futura nao vale antes da data', () => {
  const c = cad(); c.gel.formatos.push({...FORMATO, de: '2026-12-01', tubos: {'100': {tuboG: 4.779, gelG: 1.0, aditivoG: 0.02, tampaRolhaG: 2.3}}});
  c.gel.formatos[0].ate = '2026-11-30';
  const g = api(c).gel;
  assert.equal(g.formato('2026-11-23').tubos['100'].gelG, 0.936);
  assert.equal(g.formato('2026-12-01').tubos['100'].gelG, 1.0);
});
test('peso ausente nunca vira zero', () => {
  const c = cad(); delete c.gel.formatos[0].tubos['75'].aditivoG;
  const g = api(c).gel;
  assert.equal(g.composicao('75', 'spray', '2026-11-23'), null);
  assert.equal(g.composicao('75', 'tubogel', '2026-11-23').gPorTubo, 4.394);
});
test('locais ordenados por ordem, sem equipamento inativo', () => {
  const g = api(cad()).gel;
  assert.deepEqual(pl(g.locais().map(l => l.id)), ['L-0001', 'L-0002']);
  assert.deepEqual(pl(g.locais({equipamento: 'EQ-INATIVO'})), []);
  assert.deepEqual(pl(g.locais({equipamento: 'EQ03'}).map(l => l.id)), ['L-0001', 'L-0002']);
  assert.deepEqual(pl(g.locais({ativos: false}).map(l => l.id)), ['L-0001', 'L-0002', 'L-0003', 'L-0004']);
  assert.deepEqual(pl(api(null).gel.locais()), []);
});
test('cadVazio nasce na versao 2 com gel vazio e a validacao recusa versao maior', () => {
  const t = html.text('motor/portal');
  assert.match(t, /schemaVersion:2,rev:0/);
  assert.match(t, /gel:\{formatos:\[\],locais:\[\]\}/);
  assert.match(t, /\+d\.schemaVersion>VAC_CAD_VERSAO/);
  assert.match(t, /novo\.schemaVersion=VAC_CAD_VERSAO;/, 'a gravação escreve sempre a versão atual');
});
