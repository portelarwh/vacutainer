import { test } from "node:test";
import assert from "node:assert/strict";
import { scopeFor, queuePending, queueDetail } from "../../.test-cache/modulo/core/scopes.mjs";
test("item 6: A \u2192 B \u2192 A recupera o mesmo escopo, mesmo cache e mesma fila", async () => {
  const make = (name) => ({ name, isSameEntry: async (h) => h.name === name });
  const records = [];
  const a = await scopeFor(make("A"), records);
  const b = await scopeFor(make("B"), records);
  const again = await scopeFor(make("A"), records);
  assert.equal(again, a);
  assert.notEqual(a, b);
  assert.equal(records.length, 2);
});
test("item 6: fila dur\xE1vel bloqueia troca sem nenhum quadro aberto; erro tamb\xE9m bloqueia", async () => {
  assert.equal(await queuePending("A", { getItem: () => null, length: 0, key: () => null }, async () => [{ db: {}, p: false }]), true);
  assert.equal(await queuePending("A", { getItem: () => null, length: 0, key: () => null }, async () => {
    throw new Error("IDB inacess\xEDvel");
  }), true);
  assert.equal(await queuePending("A", { getItem: () => null, length: 0, key: () => null }, async () => []), false);
});
test("troca de pasta: o diagn\xF3stico diz o que est\xE1 guardado e onde; erro na consulta aparece e n\xE3o libera", async () => {
  const store = (o) => ({ get length() {
    return Object.keys(o).length;
  }, key: (i) => Object.keys(o)[i] ?? null, getItem: (k) => o[k] ?? null });
  const d = await queueDetail("A", store({ "vac.app.A.vac.reserva.paradas.1": "x", "vac.app.A.iniciativas.fila.reserva": "[1,2]", "vac.app.B.vac.reserva.x": "y" }), async () => [{ origem: "vac-fila", quantidade: 3 }]);
  assert.deepEqual(d.itens, [{ origem: "reservas de grava\xE7\xE3o", quantidade: 1 }, { origem: "opera\xE7\xF5es reservadas", quantidade: 2 }, { origem: "vac-fila", quantidade: 3 }]);
  assert.equal(d.erro, void 0);
  const e = await queueDetail("A", store({}), async () => {
    throw new Error("IDB inacess\xEDvel");
  });
  assert.equal(e.erro, "IDB inacess\xEDvel");
  assert.equal(await queuePending("A", store({}), async () => {
    throw new Error("IDB inacess\xEDvel");
  }), true);
});
