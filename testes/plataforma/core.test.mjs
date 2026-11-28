import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { sourceFrom, productionView, readSources, searchOrders, csvCell, addDays, periodRange, definirFuso } from "../../.test-cache/modulo/core/data.mjs";
test("exports desconhecidos e n\xFAmeros inv\xE1lidos n\xE3o viram zero", () => {
  assert.equal(sourceFrom("oee", { exports: { exportsVersion: 2, porDia: [], porMes: [] } }).state, "incompativel");
  assert.equal(sourceFrom("oee", { exports: { exportsVersion: 1, porDia: [{ dia: "2026-01-01", boa: "123abc" }], porMes: [] } }).state, "incompativel");
  assert.equal(sourceFrom("oee", { exports: { exportsVersion: 1, porDia: [{ dia: "2026-01-01", boa: 0 }], porMes: [] } }).state, "ok");
  assert.equal(productionView(void 0, "2026-01-01", "2026-01-02", "").good, null);
  assert.equal(productionView({ porDia: [{ dia: "2026-01-01", boa: null }] }, "2026-01-01", "2026-01-01", "").good, null);
});
test("listas malformadas n\xE3o chegam ao painel", () => {
  assert.equal(sourceFrom("inic", { exports: { exportsVersion: 1, acoes: [null] } }).state, "incompativel");
  assert.equal(sourceFrom("gel", { exports: { exportsVersion: 1, kpis: [null] } }).state, "incompativel");
  assert.equal(sourceFrom("gel", { exports: { exportsVersion: 1, pendencias: [{}] } }).state, "incompativel");
});
test("OEE n\xE3o usa m\xE9dia de taxas; apenas taxa publicada para o mesmo recorte", () => {
  const ex = { porDia: [{ dia: "2026-01-01", boa: 90, oee: 0.9 }, { dia: "2026-01-02", boa: 10, oee: 0.1 }] };
  assert.equal(productionView(ex, "2026-01-01", "2026-01-02", "").rate, null);
  assert.equal(productionView(ex, "2026-01-01", "2026-01-02", "").good, 100);
  assert.equal(productionView(ex, "2026-01-01", "2026-01-01", "").rate, 0.9);
});
test("filtro por turno n\xE3o retorna o total di\xE1rio", () => {
  const ex = { porDia: [{ dia: "2026-01-01", boa: 100 }], porDiaTurno: [{ dia: "2026-01-01", turno: "T1", boa: 30 }, { dia: "2026-01-01", turno: "T2", boa: 70 }] };
  assert.equal(productionView(ex, "2026-01-01", "2026-01-01", "T2").good, 70);
  assert.equal(productionView(ex, "2026-01-01", "2026-01-01", "T3").good, null);
});
test("ordem textual com zeros permanece identific\xE1vel em v\xE1rios m\xF3dulos", () => {
  const a = sourceFrom("oee", { exports: { exportsVersion: 1, porDia: [], porMes: [], porOrdem: [{ ordem: "000123", lote: "001" }] } }), b = sourceFrom("perdas", { exports: { exportsVersion: 1, porMes: [], porOrdem: [{ ordem: "000123", desvio: 12 }] } });
  const list = searchOrders([a, b], "000123");
  assert.equal(list.length, 1);
  assert.equal(list[0].code, "000123");
  assert.deepEqual(list[0].modules, ["oee", "perdas"]);
});
test("falha de leitura da pasta n\xE3o \xE9 aus\xEAncia de bases", async () => {
  const root = { name: "teste", getDirectoryHandle: async () => {
    throw new DOMException("Sem acesso", "NotAllowedError");
  } };
  await assert.rejects(readSources(root), { name: "NotAllowedError" });
});
test("pasta lida sem cria\xE7\xE3o; JSON inv\xE1lido fica explicitamente em erro", async () => {
  const calls = [];
  const root = { name: "teste", getDirectoryHandle: async (_name, options) => {
    assert.equal(options, void 0);
    return root;
  }, getFileHandle: async (name) => {
    calls.push(name);
    return { getFile: async () => new File([name === "oee-vacutainer-base.json" ? "{ quebrado" : JSON.stringify(name === "vacutainer-cadastros.json" ? { schema: "vac-cadastros", rev: 2 } : { exports: { exportsVersion: 1, porMes: [], porDia: [], acoes: [] } })], name) };
  } };
  const result = await readSources(root);
  assert.equal(result.sources.find((s) => s.id === "oee")?.state, "erro");
  assert.equal(result.cad?.rev, 2);
  assert.ok(calls.includes("fifo-base.json"));
});
test("CSV neutraliza f\xF3rmulas e escapa aspas; datas atravessam o m\xEAs", () => {
  assert.equal(csvCell("=1+1"), `"'=1+1"`);
  assert.equal(csvCell('Ordem "001"'), '"Ordem ""001"""');
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.deepEqual(periodRange("custom", "2026-10-01", "2026-10-10"), ["2026-10-01", "2026-10-10"]);
});
test("A15 (auditoria 28/11/2026): resumo sem vers\xE3o n\xE3o \xE9 usado e item nulo n\xE3o derruba a busca", () => {
  assert.equal(sourceFrom("perdas", { exports: { porMes: [], porOrdem: [{ ordem: "1" }] } }).state, "incompativel");
  const s = sourceFrom("perdas", { exports: { exportsVersion: 1, porMes: [], porOrdem: [null, { ordem: "000777" }] } });
  assert.equal(s.state, "ok");
  assert.deepEqual(s.exports.porOrdem, [{ ordem: "000777" }]);
  assert.equal(searchOrders([s, { id: "gel", state: "ok", exports: { ordens: [null, 5, { ordem: "000777" }] } }], "000777")[0].modules.length, 2);
});
test("A17 (auditoria 28/11/2026): hoje e ontem da casca no fuso da planta", () => {
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-28T01:00:00Z") });
  try {
    definirFuso("America/Sao_Paulo");
    assert.deepEqual(periodRange("hoje"), ["2026-11-27", "2026-11-27"], "01h UTC ainda \xE9 27/11 na planta");
    assert.deepEqual(periodRange("ontem"), ["2026-11-26", "2026-11-26"]);
    definirFuso("Fuso/Inexistente");
    assert.match(periodRange("hoje")[0], /^\d{4}-\d{2}-\d{2}$/, "fuso inv\xE1lido: o do navegador");
  } finally { definirFuso(""); mock.timers.reset(); }
});
