import { test } from "node:test";
import assert from "node:assert/strict";
import { sessionUser, mayWrite } from "../../.test-cache/modulo/core/auth.mjs";
test("item 3: sem sess\xE3o, expirada, ID divergente e Consulta n\xE3o autorizam escrita", () => {
  const cad = { usuarios: [{ codigo: "01", perfil: "CONSULTA" }, { codigo: "02", perfil: "LIDER" }], perfis: [{ codigo: "CONSULTA", permissoes: { oee: { ver: true, lancar: false, fechar: false, importar: false, excluir: false, configurar: false } } }, { codigo: "LIDER", permissoes: { oee: { ver: true, lancar: true } } }] };
  const values = {};
  const storage = { getItem: (k) => values[k] || null };
  assert.equal(mayWrite(storage, cad, "oee"), false);
  values["vac.userId"] = "01";
  values["vac.sessao"] = JSON.stringify({ id: "01", ate: Date.now() + 6e4 });
  assert.equal(mayWrite(storage, cad, "oee"), false);
  values["vac.userId"] = "02";
  assert.equal(sessionUser(storage, cad), null);
  values["vac.sessao"] = JSON.stringify({ id: "02", ate: Date.now() + 6e4 });
  assert.equal(mayWrite(storage, cad, "oee"), true);
  values["vac.sessao"] = JSON.stringify({ id: "02", ate: 1 });
  assert.equal(mayWrite(storage, cad, "oee"), false);
});
