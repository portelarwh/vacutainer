#!/usr/bin/env node
// Uso local: extrai do Git as nove páginas antigas (a2214fd^) e o Gel de 13/11/2026 (2161e02).
// node scripts/inventario-paginas-antigas.mjs <pasta>
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const pasta = process.argv[2];
if (!pasta) { console.error('Uso: node scripts/inventario-paginas-antigas.mjs <pasta>'); process.exit(2); }
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });
const bin = (...a) => execFileSync('git', a, { maxBuffer: 1 << 28 });

if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
  console.error('Repositório raso: rode `git fetch --unshallow` para ter o histórico completo.');
  process.exit(1);
}
const ARQ = ['OEE-Vacutainer.html', 'Gestão-Gel-Vacutainer.html', 'Perdas-Ordem.html', 'Paradas.html', 'Equipamentos.html',
  'Iniciativas.html', 'Linha-360.html', 'Projetos.html', 'Portal.html'];
const itens = ARQ.map(a => [a, 'a2214fd^', a]).concat([['Gestão-Gel-Vacutainer.html', '2161e02', 'Gel-2026-11-13.html']]);
mkdirSync(pasta, { recursive: true });
for (const [arq, rev, saida] of itens) {
  let b;
  try { b = bin('show', `${rev}:paginas/${arq}`); }
  catch (e) { console.error(`Falhou ${rev}:paginas/${arq}: ${e.message.split('\n')[0]}`); process.exit(1); }
  const dest = join(pasta, saida);
  writeFileSync(dest, b);
  console.log(`${saida}\t${(statSync(dest).size / 1024).toFixed(0)} kB`);
}
