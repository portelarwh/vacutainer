// Base limpa (24/11/2026): a plataforma recomeça com a base vazia e não escreve compatibilidade com base, cadastro ou
// export de versão anterior. Este teste lê cada bloco do arquivo único e confere que nenhum padrão proibido voltou.
// As Tasks seguintes do bloco 2 acrescentam padrões na lista PROIBIDO (por bloco).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import helpers from '../../scripts/html.cjs';

const COMUM = [
  /PROC_DEF/,
  /\.legado\b/,
  /aceita o cadastro antigo/,
  /base antiga sem schema/,
  /raiz-antiga/,
  /importa uma fila antiga/,
  /Registro antigo só com nome/,
  /schemaVersion\s*>=\s*2/,
];

export const PROIBIDO = {
  'comum/bases': COMUM.concat([/vacMoverBases/, /vacAvisoBases/, /\.migrando/, /registro-backup\.log/, /avisoImportacao/, /bomPct/, /cg\.gTubo/]),
  'comum/interface': COMUM.concat([/acoesLegado/, /#mwTrazer/]),
  'motor/portal': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/oee': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/gel': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/, /procAt\(null\)/],
  'motor/perdas': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/paradas': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/equip': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/inic': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
  'motor/linha': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/],
};

const html = helpers.current();
for (const [bloco, padroes] of Object.entries(PROIBIDO)) {
  test(`${bloco}: sem compatibilidade com versão anterior`, () => {
    const texto = html.text(bloco), achados = padroes.filter(p => p.test(texto)).map(String);
    assert.deepEqual(achados, [], `${bloco} ainda tem: ${achados.join(', ')}`);
  });
}

test('comum/bases: constante do cadastro e texto exato do bloqueio da base', () => {
  const texto = html.text('comum/bases');
  assert.match(texto, /const VAC_CAD_VERSAO = 2;/);
  assert.ok(texto.includes("'Base de versão anterior. Comece uma base nova nesta pasta.'"), 'texto exato do bloqueio');
});
