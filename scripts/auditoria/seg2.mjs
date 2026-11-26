import fs from 'node:fs';
import * as acorn from '/home/user/vacutainer/node_modules/acorn/dist/acorn.mjs';
const dir = '/tmp/claude-0/auditoria/js/';
const TEXTO = /^(nome|name|note|notes|descricao|description|desc|motivo|reason|obs|observacao|comentario|comment|titulo|title|responsavel|resp|texto|text|label|msg|message|apelido|sigla|codigo|code|cod|lote|ordem|material|equipamento|fabricante|modelo|email|area|local|setor|unidade|problema|resumo|causa|acao|tema)$/;
const ESC = new Set(['esc', 'escape', 'h', 'safe', 'escH', 'escAttr', 'ea', 'x']);
let total = 0; const achados = [];
for (const f of fs.readdirSync(dir)) {
  const src = fs.readFileSync(dir + f, 'utf8'); let ast; try { ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, allowReturnOutsideFunction: true }); } catch { continue; }
  const sinks = [];
  const walk = (n) => { if (!n || typeof n.type !== 'string') return;
    if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && !n.left.computed && /^(innerHTML|outerHTML)$/.test(n.left.property.name)) sinks.push(n.right);
    if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'insertAdjacentHTML') sinks.push(...n.arguments.slice(1));
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); } };
  walk(ast);
  const inspeciona = (n) => { if (!n || typeof n.type !== 'string') return;
    if (n.type === 'TemplateLiteral') for (const e of n.expressions) { let ex = e; if (ex.type === 'ChainExpression') ex = ex.expression;
      if (ex.type === 'MemberExpression' && !ex.computed && TEXTO.test(ex.property.name)) { achados.push({ f, linha: ex.loc.start.line, expr: src.slice(ex.start, ex.end), ctx: src.slice(Math.max(0, n.start - 40), Math.min(src.length, n.start + 80)).replace(/\s+/g, ' ') }); total++; } }
    if (n.type === 'BinaryExpression' && n.operator === '+') { for (const side of [n.left, n.right]) { let ex = side.type === 'ChainExpression' ? side.expression : side; if (ex.type === 'MemberExpression' && !ex.computed && TEXTO.test(ex.property.name)) { achados.push({ f, linha: ex.loc.start.line, expr: src.slice(ex.start, ex.end), ctx: '(concat) ' + src.slice(Math.max(0, n.start - 30), Math.min(src.length, n.end + 20)).replace(/\s+/g, ' ').slice(0, 120) }); total++; } } }
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(inspeciona); else if (v && typeof v.type === 'string') inspeciona(v); } };
  sinks.forEach(inspeciona);
}
console.log('interpolações de campo de texto SEM escape dentro de innerHTML/insertAdjacentHTML:', total);
const pb = {}; for (const a of achados) pb[a.f] = (pb[a.f] || 0) + 1; console.log(JSON.stringify(pb));
const pp = {}; for (const a of achados) { const p = a.expr.split('.').pop(); pp[p] = (pp[p] || 0) + 1; } console.log(JSON.stringify(pp));
fs.writeFileSync('/tmp/claude-0/auditoria/seg-ast.json', JSON.stringify(achados, null, 1));
for (const a of achados.slice(0, 25)) console.log(a.f.replace('.js', '') + ':' + a.linha, a.expr, '|', a.ctx.slice(0, 110));
