import fs from 'node:fs';
const html = fs.readFileSync('/home/user/vacutainer/Plataforma.html', 'utf8');
const re = /<textarea data-vac-source="([^"]+)"[^>]*>([\s\S]*?)<\/textarea>/g;
let m, out = [];
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
while ((m = re.exec(html))) { const id = m[1], txt = dec(m[2]); const f = id.replace(/[\/]/g, '__'); fs.writeFileSync('/tmp/claude-0/auditoria/blocos/' + f + '.txt', txt); out.push([id, txt.length, txt.split('\n').length]); }
out.sort((a, b) => b[1] - a[1]);
console.log('blocos', out.length, 'total KB', Math.round(out.reduce((a, x) => a + x[1], 0) / 1024), 'arquivo KB', Math.round(html.length / 1024));
for (const [id, n, l] of out.slice(0, 22)) console.log(String(Math.round(n / 1024)).padStart(6) + ' KB', String(l).padStart(6) + ' linhas', id);
