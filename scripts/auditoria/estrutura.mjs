import fs from 'node:fs';
import * as acorn from '/home/user/vacutainer/node_modules/acorn/dist/acorn.mjs';
const dir = '/tmp/claude-0/auditoria/js/';
const res = {}, dupNomes = new Map(), grandes = [], vazios = {};
for (const f of fs.readdirSync(dir)) {
  const src = fs.readFileSync(dir + f, 'utf8');
  let ast; try { ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, allowReturnOutsideFunction: true }); } catch (e) { res[f] = { erro: e.message.slice(0, 80) }; continue; }
  const tops = [];
  for (const n of ast.body) {
    if (n.type === 'FunctionDeclaration') tops.push(['fn', n.id.name, n]);
    else if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id.type === 'Identifier') tops.push([n.kind, d.id.name, d]);
    else if (n.type === 'ClassDeclaration') tops.push(['class', n.id.name, n]);
  }
  for (const [k, nome, n] of tops) { if (!dupNomes.has(nome)) dupNomes.set(nome, []); dupNomes.get(nome).push({ f, len: n.end - n.start }); }
  // funções grandes (qualquer nível)
  const visita = (n, nome) => { if (!n || typeof n.type !== 'string') return;
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(n.type)) { const l = n.loc.end.line - n.loc.start.line + 1, c = n.end - n.start; if (c > 4000) grandes.push({ f, nome: n.id?.name || nome || '(anon)', linhas: l, chars: c, linha: n.loc.start.line }); }
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => visita(x, n.type === 'VariableDeclarator' ? n.id?.name : nome)); else if (v && typeof v.type === 'string') visita(v, n.type === 'VariableDeclarator' && k === 'init' ? n.id?.name : n.type === 'Property' && k === 'value' ? n.key?.name : nome); } };
  visita(ast);
  vazios[f] = (src.match(/catch\s*(\([^)]*\))?\s*\{\s*\}/g) || []).length;
  res[f] = { topo: tops.length, globais: tops.filter(t => t[0] !== 'fn').length, funcs: tops.filter(t => t[0] === 'fn').length, kb: Math.round(src.length / 1024), catchVazio: vazios[f], eqeq: (src.match(/[^=!<>]==[^=]/g) || []).length };
}
console.log(JSON.stringify(res, null, 0));
const dup = [...dupNomes].filter(([n, a]) => a.length > 1 && a.map(x => x.f).filter((v, i, s) => s.indexOf(v) === i).length > 1);
const bytesDup = dup.reduce((s, [n, a]) => s + a.slice(1).reduce((x, y) => x + y.len, 0), 0);
console.log('\nnomes de topo definidos em mais de um bloco:', dup.length, '| bytes redundantes (a partir da 2ª cópia):', Math.round(bytesDup / 1024) + ' KB');
dup.sort((a, b) => b[1].reduce((s, x) => s + x.len, 0) - a[1].reduce((s, x) => s + x.len, 0));
for (const [n, a] of dup.slice(0, 25)) console.log(n.padEnd(26), a.length + ' cópias', Math.round(a[0].len / 1024 * 10) / 10 + ' KB cada', [...new Set(a.map(x => x.f.replace('.js', '')))].join(','));
grandes.sort((a, b) => b.chars - a.chars);
console.log('\nfunções maiores (chars):'); for (const g of grandes.slice(0, 18)) console.log(String(g.chars).padStart(7), String(g.linhas).padStart(5) + ' linhas', g.f.replace('.js', ''), g.nome, '@' + g.linha);
console.log('\nfunções > 4000 chars:', grandes.length);
