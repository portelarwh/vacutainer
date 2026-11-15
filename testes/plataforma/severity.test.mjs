import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import helpers from "../../scripts/html.cjs";
test("item 7: Portal conserva sev 1 urgente e sev 2 aten\xE7\xE3o em tela e relat\xF3rios", () => {
  const html = helpers.engine("portal");
  const code = html.match(/const sevDoModulo=.*?;/)[0];
  assert.deepEqual(vm.runInNewContext(code + '[sevDoModulo(1),sevDoModulo(2)].join(",")'), "1,2");
  assert.ok(!html.includes("p.sev>=2"));
  assert.match(html, /sort\(\(a,b\)=>a.sev-b.sev/);
});
