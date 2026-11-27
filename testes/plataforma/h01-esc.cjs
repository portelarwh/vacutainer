// H01 etapa 1 (plano docs/PLANO-H01-CODIGO-REPETIDO.md, decisão do responsável de 26/11/2026): o escape de HTML dos nove motores é um só,
// vacEsc em comum/bases. Prova: (1) as três formas que existiam nos motores dão o mesmo resultado que vacEsc num conjunto de entradas;
// (2) nenhum motor guarda cópia própria; (3) na página de cada motor, esc é o vacEsc do kit. Demonstração, dados fictícios.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const helpers = require('../../scripts/html.cjs'), html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html')), S = helpers.parse(html.toString());
const ANTIGAS = [
  "s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]))",
  "v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]))",
  "s => String(s == null ? '' : s).replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]))"];
const m = S.get('comum/bases').match(/const vacEsc = (.*);\n/); assert.ok(m, 'vacEsc em comum/bases');
const vacEsc = vm.runInNewContext(m[1]);
const ENTRADAS = [null, undefined, '', 0, -1.5, NaN, false, true, '<b>"a" & \'b\'</b>', '&amp;', 'ação ÇÃO 漢字 🙂', '<<>>""\'\'&&', [1, '<'], { toString: () => '<x>' }, 12345678901234567890n];
for (const f of ANTIGAS) { const g = vm.runInNewContext(f); for (const e of ENTRADAS) assert.equal(vacEsc(e), g(e), 'mesma saída para ' + String(e)); }
console.log('ok as três formas antigas e vacEsc dão a mesma saída em ' + ENTRADAS.length + ' entradas');
const MOTORES = ['portal', 'oee', 'perdas', 'gel', 'paradas', 'equip', 'inic', 'linha', 'projetos'];
for (const id of MOTORES) { const t = S.get('motor/' + id); assert.doesNotMatch(t, /const esc ?= ?[sv] ?=>/, 'motor/' + id + ' sem cópia própria do escape'); assert.match(t, /const esc ?= ?vacEsc;/, 'motor/' + id + ' usa vacEsc'); }
console.log('ok nenhum dos nove motores guarda cópia própria do escape');
// etapa 1, 2ª entrega: nomes do sistema e pessoa/perfil atuais também só no kit
const KIT = ['VAC_NOMES_V2', 'VAC_OUTROS_V2', 'vacEhOutros', 'vacNomeSis', 'vacUsuario', 'vacPerfil', 'vacNomeUsuario', 'vacSemaforo'];
const def = n => new RegExp('^(?:const|let|function)\\s+' + n + '\\b|,' + n + '=', 'm');
for (const n of KIT) { assert.match(S.get('comum/bases'), def(n), n + ' no kit'); for (const id of MOTORES) assert.doesNotMatch(S.get('motor/' + id), def(n), 'motor/' + id + ' sem cópia de ' + n); }
console.log('ok ' + KIT.length + ' definições de sistema, pessoa e semáforo (vacUsuario, vacPerfil, vacNomeSis, vacSemaforo…) só no kit');
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); }); let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r)); browser = await chromium.launch(require('./chromium.cjs')());
    const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
    const titulos = { portal: 'Administração', oee: 'Produção', perdas: 'Waste', gel: 'Gestão de Gel', paradas: 'Paradas', equip: 'Equipamentos', inic: 'Iniciativas / Ações', linha: 'Linha 360°', projetos: 'Projetos' }, r = {};
    for (const id of MOTORES) {
      await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1#/' + id);
      const q = p.locator(`iframe[title="Módulo ${titulos[id]}"]`); await q.waitFor({ state: 'attached', timeout: 60000 });
      const f = await (await q.elementHandle()).contentFrame(); await f.waitForFunction(() => typeof vacEsc === 'function' && typeof esc === 'function', null, { timeout: 60000 });
      r[id] = await f.evaluate(() => [esc === vacEsc, typeof U === 'object' && U && U.esc ? U.esc === vacEsc : true, esc('<a title="x">&\'</a>'), vacNomeSis({ id: 'oee', nome: 'OEE' }), vacEhOutros({ id: 'manut' }), typeof vacUsuario + typeof vacPerfil + typeof vacNomeUsuario, [vacSemaforo(1, 1), vacSemaforo(0.95, 1), vacSemaforo(0.5, 1), vacSemaforo(null, 1), vacSemaforo(1, 1, { inverso: true }), vacSemaforo(2, 1, { inverso: true })].join()]);
    }
    for (const id of MOTORES) assert.deepEqual(r[id], [true, true, '&lt;a title=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;', 'Produção', true, 'functionfunctionfunction', 'ok,warn,crit,none,ok,crit'], id + ': ' + JSON.stringify(r[id]));
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
    console.log('ok nas páginas dos nove motores esc é o vacEsc do kit e as funções de sistema e pessoa vêm do kit');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exit(1); });
