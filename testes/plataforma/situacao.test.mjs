// LANC-03 (item 0) · chip de situação do cabeçalho: mesmo estado do antigo botão Status, em três tons (e Demonstração à parte).
import { test } from "node:test";
import assert from "node:assert/strict";
import { situacaoChip } from "../../.test-cache/modulo/core/data.mjs";
test("chip de situação: online, atenção e sem conexão com a pasta", () => {
  assert.deepEqual([situacaoChip({ folder: true }).tom, situacaoChip({ folder: true }).txt], ["ok", "Sistema online"]);
  assert.deepEqual([situacaoChip({ folder: true, warning: true }).tom, situacaoChip({ folder: true, warning: true }).txt], ["warning", "Atenção"]);
  assert.deepEqual([situacaoChip({ folder: false, danger: true }).tom, situacaoChip({ folder: false, danger: true }).txt], ["danger", "Sem conexão com a pasta"]);
});
test("chip de situação: erro tem precedência sobre pendência e não esconde o erro com pasta conectada", () => {
  assert.equal(situacaoChip({ folder: true, danger: true, warning: true }).tom, "danger");
  assert.equal(situacaoChip({ folder: true, danger: true }).txt, "Erro a conferir");
});
test("chip de situação: Demonstração não fala em pasta", () => {
  const c = situacaoChip({ demo: true, danger: true });
  assert.equal(c.tom, "info"); assert.equal(c.txt, "Demonstração"); assert.doesNotMatch(c.dica, /pasta/);
});
