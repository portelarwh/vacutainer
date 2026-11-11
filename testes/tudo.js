// C4 (08/11/2026): roda a suíte inteira, uma por vez, e diz o que passou, o que falhou e o que não foi verificado.
// node testes/tudo.js              → todas
// node testes/tudo.js tfila tequip → só essas
// Código de saída 1 se alguma falhar. "Não verificado" (falta biblioteca ou pacote) não conta como aprovado nem como falha.
const { spawnSync } = require('child_process'); const path = require('path'), fs = require('fs');
const AQUI = __dirname;
const SUITE = ['tlogin', 'tvisaogeral', 'twaste_vg', 'tparadas_vg', 'tportalfonte', 'tturnos', 'timportacao', 'tgel', 'tperiodo', 'tiniciativas', 'tfase7', 'toeereal', 'tparada_tempo', 'tsqdcp', 'tdemo', 'tnv', 'tpendencias', 'tcorrecoes', 'tfila', 'tequip', 'tplanner', 'tficha', 'tordens', 'tvigencias', 'tnumeros', 'tcontratos', 'tbases', 'tdiag', 'tintegra',
  'tpg', 'tseguranca', 'trelatorios', 'tconstrucao', 'tvisual', 't18', 't18c', 't18d', 't18e', 'tc', 'tdin', 'tg', 'tk', 'tq', 'tr', 'ts1', 'tz', 'tmeta'];
// instáveis conhecidas (CLAUDE.md › Pendências): rodam de novo uma vez antes de contar como falha
const INSTAVEL = new Set(['tz']);
// precisam de algo que pode faltar no ambiente: sem isso, "não verificado"
const PRECISA = { tmeta: () => { try { require.resolve('xlsx'); return ''; } catch (e) { return 'falta o pacote npm xlsx'; } } };
const pedidas = process.argv.slice(2).map(x => x.replace(/\.js$/, ''));
const lista = pedidas.length ? pedidas : SUITE;
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
