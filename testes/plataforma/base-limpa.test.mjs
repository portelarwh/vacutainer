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
  'motor/oee': [/vacMoverBases/, /vacAvisoBases/, /\.importar\(/, /db\.schemaVersion = SCHEMA_VERSION/,
    /_migrated/, /migração da base/, /bases antigas ou importadas/, /base antiga sem ele continua válida/, /versões antigas guardavam/,
    /ServerData\.semCaixaRepetida\(db\.server\)/, /databaseVersion == null\) db\.databaseVersion = 0/, /Object\.assign\(U\.clone\(DEFAULT_SETTINGS\), db\.settings/,
    /schemaVersion inválido/, /if \(db\.schemaVersion > SCHEMA_VERSION\)/, /Demo\.present/, /removeDemo/, /Restos da demonstração antiga/,
    /local antigo/, /legacy/, /Fonte sem exports compatível/, /vacExportsOk\([^,()]*\)/, /vacExportsOk\([^)]*,\s*1\s*\)/, /Trazer configurações/],
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

test('comum/bases: constante do cadastro e texto exato do bloqueio da base', () => {
  const texto = html.text('comum/bases');
  assert.match(texto, /const VAC_CAD_VERSAO = 2;/);
  assert.ok(texto.includes("'Base de versão anterior. Comece uma base nova nesta pasta.'"), 'texto exato do bloqueio');
});
