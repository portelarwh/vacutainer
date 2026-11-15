import { test } from "node:test";
import assert from "node:assert/strict";
import { protectFolder, compareVersions } from "../../.test-cache/modulo/core/compatibility.mjs";
function fixture(version = "9.0.0") {
  let writes = 0;
  const file = { name: "x", getFile: async () => ({ text: async () => JSON.stringify({ appVersion: version, exports: { a: 1 } }) }), createWritable: async () => {
    writes++;
    return { write: async () => {
    }, close: async () => {
    } };
  } };
  const dir = { name: "ficticia", getDirectoryHandle: async () => dir, getFileHandle: async () => file };
  return { dir, writes: () => writes };
}
test("item 2: base mais nova permite leitura e impede qualquer grava\xE7\xE3o", async () => {
  const f = fixture();
  const p = await protectFolder(f.dir, "oee-vacutainer-base.json", "2.4.74");
  assert.equal(p.readOnly, true);
  const file = await p.folder.getFileHandle("oee-vacutainer-base.json");
  await assert.rejects(() => file.createWritable());
  assert.equal(f.writes(), 0);
});
test("item 2: vers\xE3o compara segmentos numericamente, inclusive gel 2.35", () => {
  assert.equal(compareVersions("2.35", "2.9"), 1);
  assert.equal(compareVersions("2.4.74", "2.4.74"), 0);
  assert.equal(compareVersions("1.2", "1.2.0"), 0);
});
test("item 2: permiss\xE3o \xE9 reavaliada na grava\xE7\xE3o e falha de leitura bloqueia conex\xE3o", async () => {
  const f = fixture("1.0.0");
  let allowed = true;
  const p = await protectFolder(f.dir, "oee-vacutainer-base.json", "2.4.74", () => allowed);
  allowed = false;
  await assert.rejects(async () => await (await p.folder.getFileHandle("a")).createWritable());
  assert.equal(f.writes(), 0);
  const broken = { ...f.dir, getDirectoryHandle: async () => {
    throw new Error("leitura falhou");
  } };
  await assert.rejects(() => protectFolder(broken, "base", "1.0.0"), /leitura falhou/);
});
test("item 2: arquivo auxiliar mais novo tamb\xE9m protege seu m\xF3dulo", async () => {
  const versions = { "portal-base.json": "1.9.37", "vacutainer-cadastros.json": "Portal 99.0.0" };
  const dir = { name: "ficticia", getDirectoryHandle: async () => dir, getFileHandle: async (name) => {
    if (!versions[name]) throw new DOMException("ausente", "NotFoundError");
    return { getFile: async () => ({ text: async () => JSON.stringify({ appVersion: versions[name] }) }) };
  } };
  const result = await protectFolder(dir, ["portal-base.json", "vacutainer-cadastros.json"], "1.9.37");
  assert.equal(result.readOnly, true);
});
