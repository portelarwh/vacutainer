import { test } from "node:test";
import assert from "node:assert/strict";
import { mayWrite } from "../../.test-cache/modulo/core/auth.mjs";
const writes = ["lancar", "fechar", "importar", "excluir", "configurar"];
const storage = { getItem: (key) => key === "vac.userId" ? "0001" : key === "vac.sessao" ? JSON.stringify({ id: "0001", ate: Date.now() + 6e4 }) : null };
test("N2: permiss\xF5es ausentes seguem o kit; apenas false bloqueia a a\xE7\xE3o", () => {
  for (const module of ["portal", "oee", "perdas", "gel", "paradas", "equip", "inic", "linha", "projetos"]) {
    const target = module === "linha" ? "equip" : module;
    for (const perms of [void 0, {}, { [target]: { lancar: false } }, { [target]: Object.fromEntries(writes.map((a) => [a, false])) }, { [target]: { ...Object.fromEntries(writes.map((a) => [a, false])), lancar: true } }]) {
      const cad = { usuarios: [{ codigo: "0001", perfil: "P" }], perfis: [{ codigo: "P", permissoes: perms }] };
      const expected = !perms || !perms[target] || writes.some((a) => perms[target][a] !== false);
      assert.equal(mayWrite(storage, cad, module), expected, module + " " + JSON.stringify(perms));
    }
  }
});
