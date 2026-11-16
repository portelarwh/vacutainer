import { test } from "node:test";
import assert from "node:assert/strict";
import { replaceOnce } from "../../.test-cache/modulo/core/text.mjs";
test("item 1: substitui\xE7\xE3o estrutural recusa trecho ausente ou duplicado", () => {
  assert.throws(() => replaceOnce("sem ancora", /ALVO/, () => ""), /encontrado 0/);
  assert.throws(() => replaceOnce("ALVO ALVO", /ALVO/, () => ""), /encontrado 2/);
  assert.equal(replaceOnce("a ALVO b", /ALVO/, () => "<script>"), "a <script> b");
});

// Rótulos novos não podem renomear uma pasta de backup nem um valor que já existe nas bases.
test('nomenclatura preserva caminhos de backup e nomes canônicos das preferências', async () => {
  const {default:H}=await import('../../scripts/html.cjs');const {runInNewContext}=await import('node:vm');
  const portal=H.current().text('motor/portal'),bases=H.current().text('comum/bases');
  const backups=runInNewContext('('+portal.match(/const BKP_MOD=(\{[^;]+\});/)[1]+')');
  assert.equal(backups.portal,'Portal');assert.equal(backups.oee,'OEE');assert.equal(backups.perdas,'Perdas');
  const starts=runInNewContext('('+bases.match(/const VAC_INICIAL_ALVO = (\{[\s\S]*?\n\});/)[1]+')');
  assert.equal(starts.Portal[0],'portal');assert.equal(starts.Portal[1],'');assert.equal(starts.Administração,undefined);
});
