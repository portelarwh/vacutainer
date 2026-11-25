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
  'motor/portal': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/, /ImportarV1/, /importação v1/, /cadV1/, /admNivelTransicao/, /TrazCfg/, /cadTrazerCfg/,
    /Carga\.abrir/, /Carga\.completar/, /Criar cadastro a partir das páginas/, /GEL_PROC_DEF/, /schemaVersion\s*<\s*2/, /formato antigo/,
    /vacExportsOk\([^)]*,\s*1\s*\)/, /DEFAULT_PERFIS\.find\(x\s*=>\s*x\.codigo\s*===\s*u\.perfil\)\|\|null\}/],
  'motor/oee': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/, /db\.schemaVersion = SCHEMA_VERSION/],
  'motor/gel': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/, /procAt\(null\)/, /nf2\.format\(pa\.g\)\} g por tubo e as perdas vigentes(?![^`]*`:esc\(semPa\))/],
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

// Migrador pontual (D02): único bloco que lê o formato da main, fora do caminho normal. Sai depois do corte.
export const ISENTO = 'ferramenta/migracao';
const LEITURA_ANTIGA = COMUM.concat([/bomPct/, /cg\.gTubo/, /vacMoverBases/, /vacAvisoBases/]);

test('leitura do formato antigo isenta só no migrador pontual', () => {
  assert.ok(!(ISENTO in PROIBIDO), 'o migrador não entra na lista de proibições');
  for (const id of html.sources.keys()) {
    if (!id.startsWith('ferramenta/') || id === ISENTO) continue;
    const achados = LEITURA_ANTIGA.filter(p => p.test(html.text(id))).map(String);
    assert.deepEqual(achados, [], `${id} ainda tem: ${achados.join(', ')}`);
  }
});

test('nenhum motor, módulo ou código comum chama o migrador pontual', () => {
  for (const [id, texto] of html.sources) {
    if (!/^(motor|modulo|comum|recurso)\//.test(id)) continue;
    assert.ok(!/vacMigracao/.test(texto), `${id} não deveria chamar vacMigracao`);
  }
});

test('comum/bases: constante do cadastro e texto exato do bloqueio da base', () => {
  const texto = html.text('comum/bases');
  assert.match(texto, /const VAC_CAD_VERSAO = 2;/);
  assert.ok(texto.includes("'Base de versão anterior. Comece uma base nova nesta pasta.'"), 'texto exato do bloqueio');
});
