import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
import { test } from "node:test";
import assert from "node:assert/strict";
test("N4: v\xEDnculos de equipamentos da Linha 360\xB0 existem no cadastro fict\xEDcio", () => {
  const b = JSON.parse(require2("../../scripts/html.cjs").current().text("dados/cenario")).bases, codes = new Set(b.cad.equipamentos.map((e) => e.codigo));
  for (const ponto of b.linha.pontos) for (const code of ponto.equipamentos || []) assert.ok(codes.has(code), "equipamento fict\xEDcio n\xE3o cadastrado: " + code);
});
