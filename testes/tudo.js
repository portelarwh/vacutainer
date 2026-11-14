// C4 (08/11/2026): roda a suíte inteira, uma por vez, e diz o que passou, o que falhou e o que não foi verificado.
// node testes/tudo.js              → todas
// node testes/tudo.js tfila tequip → só essas
// node testes/tudo.js --parte=1/4   → só a 1ª de 4 partes (o CI roda as 4 ao mesmo tempo)
// Código de saída 1 se alguma falhar. "Não verificado" (falta biblioteca ou pacote) não conta como aprovado nem como falha.
const { spawnSync } = require('child_process'); const path = require('path'), fs = require('fs');
const AQUI = __dirname;
const SUITE = ['tds', 'tlote_origem', 'tpermissoes', 'tprefs', 'tcalendario', 'trelcompilado', 't181', 'temail', 'tgrade', 'tfechar', 'tmes_dia', 'tlogin', 'thh24', 'thh_todos', 'tcomparar', 'twaste_grade', 'twaste_target', 'tsqdcp_layout', 'tvisaogeral', 'twaste_vg', 'tparadas_vg', 'tparadas_ux', 'tgel_vg', 'tportal_vg', 'tportalfonte', 'tturnos', 'timportacao', 'tgel', 'tperiodo', 'tiniciativas', 'tfase7', 'toeereal', 'tparada_tempo', 'tsqdcp', 'tdemo', 'tnv', 'tpendencias', 'tcorrecoes', 'tfila', 'tequip', 'tplanner', 'tficha', 'tordens', 'tvigencias', 'tnumeros', 'tcontratos', 'tbases', 'tdiag', 'tintegra',
  'tpg', 'tseguranca', 'trelatorios', 'tconstrucao', 'tvisual', 't18', 't18c', 't18d', 't18e', 'tc', 'tdin', 'tg', 'tk', 'tq', 'tr', 'ts1', 'tz', 'tmeta'];
// instáveis conhecidas (CLAUDE.md › Pendências): rodam de novo uma vez antes de contar como falha
const INSTAVEL = new Set([]);   /* 13/11/2026: o tz deixou de ser instável (esperava o redesenho do formulário) */
// precisam de algo que pode faltar no ambiente: sem isso, "não verificado"
const PRECISA = { tmeta: () => { try { require.resolve('xlsx'); return ''; } catch (e) { return 'falta o pacote npm xlsx'; } } };
/* CI em partes (13/11/2026): node testes/tudo.js --parte=2/4 roda só a 2ª de 4 partes da suíte. As partes são montadas pelo tempo
   aproximado de cada teste no CI (o mais demorado primeiro, sempre na parte mais leve), para terminarem juntas; teste sem tempo conhecido vale 10 s.
   Toda suíte cai em exatamente uma parte. Tempos tirados do CI de 13/11/2026; não precisam ser exatos. */
const TEMPO = { tvisual: 170, tpendencias: 102, trelatorios: 63, tds: 44, tparadas_ux: 41, tseguranca: 39, tnv: 32, tficha: 31, tpermissoes: 30, tgrade: 30, tsqdcp_layout: 29, tlogin: 28, timportacao: 27, tdiag: 25,
  tcorrecoes: 23, tz: 21, tvisaogeral: 20, tprefs: 20, tfase7: 20, tconstrucao: 19, tgel: 19, tportal_vg: 18, tbases: 18, twaste_vg: 17, tgel_vg: 17, tdemo: 17, tplanner: 16, tvigencias: 16, temail: 15, tequip: 15, tk: 15,
  tparadas_vg: 14, tperiodo: 13, tportalfonte: 12, tfechar: 11, tcontratos: 11, tfila: 10, tnumeros: 10 };
function parte(lista, i, n) { const P = Array.from({ length: n }, () => ({ s: 0, l: [] })); const ord = lista.slice().sort((a, b) => (TEMPO[b] || 10) - (TEMPO[a] || 10) || lista.indexOf(a) - lista.indexOf(b));
  for (const t of ord) { const m = P.reduce((x, y) => y.s < x.s ? y : x); m.s += TEMPO[t] || 10; m.l.push(t); } const minha = new Set(P[i - 1].l); return lista.filter(t => minha.has(t)); }
const argParte = process.argv.slice(2).find(x => /^--parte=\d+\/\d+$/.test(x));
const pedidas = process.argv.slice(2).filter(x => !/^--(parte=|listar$)/.test(x)).map(x => x.replace(/\.js$/, ''));
let lista = pedidas.length ? pedidas : SUITE;
if (argParte) { const [i, n] = argParte.slice(8).split('/').map(Number); if (!(n >= 1 && i >= 1 && i <= n)) { console.log('parte inválida: ' + argParte); process.exit(1); } lista = parte(lista, i, n); console.log(`parte ${i} de ${n}: ${lista.length} suíte(s) · ${lista.join(', ')}\n`); }
if (process.argv.includes('--listar')) process.exit(0);   /* só mostra o que a parte rodaria */
const R = [];
const roda = t => { const ini = Date.now(); const r = spawnSync(process.execPath, [path.join(AQUI, t + '.js')], { cwd: path.join(AQUI, '..'), encoding: 'utf8', timeout: 15 * 60e3, maxBuffer: 64 << 20 });
  const out = (r.stdout || '') + (r.stderr || ''); const falhas = out.split('\n').filter(l => /^FALHA/.test(l)); const nv = out.split('\n').filter(l => /^NÃO VERIFICADO/.test(l));
  const okSaida = r.status === 0 && !falhas.length && !r.error; return { ok: okSaida, falhas, nv, s: ((Date.now() - ini) / 1000).toFixed(0), out, status: r.status, erro: r.error && r.error.message }; };
for (const t of lista) {
  if (!fs.existsSync(path.join(AQUI, t + '.js'))) { R.push({ t, st: 'falhou', det: 'arquivo não existe' }); console.log(`FALHOU   ${t}: arquivo não existe`); continue; }
  const falta = PRECISA[t] && PRECISA[t](); if (falta) { R.push({ t, st: 'não verificado', det: falta }); console.log(`NÃO VERIF ${t}: ${falta}`); continue; }
  let x = roda(t), nota = '';
  if (!x.ok && INSTAVEL.has(t)) { const y = roda(t); nota = y.ok ? ' (passou na 2ª vez; instável conhecido)' : ''; x = y.ok ? Object.assign(y, { nota }) : y; }
  const st = !x.ok ? 'falhou' : x.nv.length ? 'passou, com não verificado' : 'passou';
  const det = !x.ok ? (x.falhas.slice(0, 3).join(' | ') || x.erro || ('código ' + x.status + ': ' + x.out.trim().split('\n').slice(-3).join(' | '))) : x.nv.map(l => l.replace(/^NÃO VERIFICADO /, '')).join(' | ');
  R.push({ t, st, det, s: x.s }); console.log(`${st === 'falhou' ? 'FALHOU  ' : st === 'passou' ? 'passou  ' : 'passou* '} ${t} (${x.s} s)${nota}${det ? ' · ' + det : ''}`);
  if (st === 'falhou') { const f = path.join(AQUI, 'saida', 'tudo-' + t + '.txt'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, x.out); }
}
const n = s => R.filter(r => r.st === s).length;
console.log(`\n${R.length} suíte(s): ${n('passou')} passou · ${n('passou, com não verificado')} passou com item não verificado · ${n('não verificado')} não verificada(s) · ${n('falhou')} falhou`);
for (const r of R.filter(r => r.st !== 'passou')) console.log(` - ${r.t}: ${r.st}${r.det ? ' (' + r.det + ')' : ''}`);
if (n('falhou')) console.log('saída completa das que falharam em testes/saida/tudo-<nome>.txt');
process.exit(n('falhou') ? 1 : 0);
