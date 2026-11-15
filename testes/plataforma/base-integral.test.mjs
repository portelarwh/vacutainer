import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { integral, filled } = createRequire(import.meta.url)("./base-integral.cjs");
test("N4: conte\xFAdo integral detecta perdas dentro de hist\xF3ricos e exports", () => {
  const b = { rev: 1, historico: [{ id: "01", rev: 3, updatedAt: "ontem", appVersion: "1" }], exports: { geradoEm: "ontem", importacoes: [{ codigo: "0001" }] } };
  integral(b, { ...b, rev: 2, exports: { ...b.exports, geradoEm: "hoje" } }, "controle");
  for (const mutation of [() => ({ ...b, historico: [] }), () => ({ ...b, historico: [{ ...b.historico[0], rev: 4 }] }), () => ({ ...b, exports: { geradoEm: "hoje" } })]) assert.throws(() => integral(b, mutation(), "corrup\xE7\xE3o"));
});
test("N4: bases vazias deixam de ser um cen\xE1rio aceit\xE1vel", () => assert.throws(() => filled({ oee: { productionDays: [] } }), /preenchido/));
