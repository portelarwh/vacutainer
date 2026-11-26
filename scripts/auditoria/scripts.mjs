import fs from 'node:fs';
const dir = '/tmp/claude-0/auditoria/blocos/', out = '/tmp/claude-0/auditoria/js/';
const alvo = fs.readdirSync(dir).filter(f => /^(motor__|comum__interface|comum__bases|modulo__App|ferramenta__)/.test(f));
for (const f of alvo) {
  const t = fs.readFileSync(dir + f, 'utf8'); let js = '', n = 0;
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(t))) { js += m[1] + '\n'; n++; }
  if (!n && !/^\s*</.test(t)) js = t;   // bloco já é JS puro
  if (js.trim()) fs.writeFileSync(out + f.replace('.txt', '.js'), js);
  console.log(f.padEnd(28), n, 'script(s)', Math.round(js.length / 1024) + ' KB');
}
