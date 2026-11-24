import assert from 'node:assert/strict';
import test from 'node:test';
import html from '../../scripts/html.cjs';

const PROIBIDO_FORA_DA_ADM = [/S\.config\.fmts/, /S\.config\.equips/, /FMT_DEF/, /GEL_FMT_DEF/, /vacCad\(\)\s*\{/];
const PROIBIDO_NA_ADM = [/GEL_FMT_DEF/, /vacCad\(\)\s*\{/];

test('motores usam o cadastro do Gel pela interface comum', () => {
  const fonte = html.current();
  for (const { id } of html.registry()) {
    const bloco = 'motor/' + id;
    const proibidos = id === 'portal' ? PROIBIDO_NA_ADM : PROIBIDO_FORA_DA_ADM;
    for (const padrao of proibidos) assert.equal(padrao.test(fonte.text(bloco)), false, bloco + ' contém ' + padrao);
  }
});
