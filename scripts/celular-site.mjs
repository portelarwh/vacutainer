// APP-CEL fase 4 (28/11/2026; liberado pelo responsável, a TI aceita página pública só com o código): monta a página do app da linha
// (Linha no celular com Operação e Manutenção) para publicar no GitHub Pages. Vai SÓ o código: nenhum cadastro é embutido (CFG_EMB fica
// null) e a configuração padrão dos dois apps (CFG0, que traz nomes de máquinas e catálogos de exemplo) é trocada por uma neutra; o
// cadastro entra no celular pelo QR ou arquivo da plataforma (Linha › Atualizar cadastro ou dia). A página é instalável (manifesto) e
// funciona sem internet depois da primeira abertura (service worker); ao abrir com internet, busca a versão nova.
//   node scripts/celular-site.mjs [pasta-de-saída]   (padrão: _site)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const H = require('./html.cjs');

const saida = path.resolve(process.argv[2] || '_site');
const app = H.load(), texto = id => app.text(id);
const versao = (texto('modulo/App').match(/const VERSION = "([^"]+)"/) || texto('dados/manifesto').match(/"version":\s*"([^"]+)"/) || [])[1] || 'dev';

const troca = (t, de, para, nome) => { if (t.split(de).length !== 2) throw new Error('marcador não encontrado (uma vez) em ' + nome + ': ' + de.slice(0, 50)); return t.replace(de, () => para); };
const neutro = (t, nome) => { const i = t.indexOf('const CFG0='), j = i >= 0 ? t.indexOf('};', i) : -1; if (j < 0) throw new Error('CFG0 não encontrado em ' + nome); return t.slice(0, i) + 'const CFG0=' + CFG0[nome] + ';' + t.slice(j + 2); };
const CFG0 = {
  'meu-turno': "{linha:'Linha',unidade:'mil',junta:45,turnos:[{c:'T1',n:'Turno 1',i:'06:00',f:'14:00'},{c:'T2',n:'Turno 2',i:'14:00',f:'22:00'},{c:'T3',n:'Turno 3',i:'22:00',f:'06:00'}],cats:[{c:'0001',n:'Produto de exemplo',meta:50,gel:0}],maqs:['Máquina 1','Máquina 2'],motivos:['Setup','Falha','Qualidade','Falta de material','Outro'],scrapGel:['Purga','Sobra no barril','Outros']}",
  'manutencao': "{linha:'Linha',maqs:[{c:'M1',n:'Máquina 1'},{c:'M2',n:'Máquina 2'}],modos:[{c:'F1',n:'Desgaste'},{c:'F2',n:'Ruptura'}],pessoas:[],rev:0}"
};
const seg = x => JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const op = neutro(texto('celular/meu-turno'), 'meu-turno'), man = neutro(texto('celular/manutencao'), 'manutencao');
if (!/const CFG_EMB=\/\*CFG\*\/null\/\*CFG\*\//.test(op) || !/const CFG_EMB=\/\*CFG\*\/null\/\*CFG\*\//.test(man)) throw new Error('os apps devem sair sem cadastro embutido');
let h = texto('celular/linha');
h = troca(h, '/*MODS*/null/*MODS*/', '/*MODS*/' + seg({ op, man, meta: { linha: 'Linha no celular', site: true, versao } }) + '/*MODS*/', 'linha');
h = troca(h, '/*JSQR*/null/*JSQR*/', '/*JSQR*/' + seg(texto('biblioteca/jsqr')) + '/*JSQR*/', 'linha');
h = troca(h, '<meta name="apple-mobile-web-app-capable" content="yes">', '<meta name="apple-mobile-web-app-capable" content="yes">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icone.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="icone.svg">', 'linha');
h = troca(h, '</body>', `<script>/* página publicada: instala e funciona sem internet (sw.js); versão ${versao} */
if('serviceWorker' in navigator&&(location.protocol==='https:'||/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)))navigator.serviceWorker.register('sw.js').catch(()=>{});
</script>
</body>`, 'linha');

const icone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#0f1418"/><rect x="36" y="44" width="120" height="104" rx="16" fill="#4c8bf5"/><path d="M60 84h72M60 108h48" stroke="#fff" stroke-width="12" stroke-linecap="round"/></svg>`;
const manifesto = { name: 'Linha no celular', short_name: 'Linha', start_url: './', scope: './', display: 'standalone', background_color: '#0f1418', theme_color: '#0f1418', lang: 'pt-BR',
  icons: [{ src: 'icone.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] };
// rede primeiro (busca a versão nova quando há internet) e, sem rede, o que ficou guardado.
// A22 (auditoria 28/11/2026): no GitHub Pages a origem é a mesma para todos os sites do usuário, então a ativação só apaga os caches deste app
// (linha-*); só resposta 200 da própria origem vai para o cache (um 503 não substitui a cópia boa); a página (index.html) só responde por
// navegação, nunca no lugar de ícone, manifesto ou outro arquivo
const sw = `const C='linha-${versao}',A=['./','index.html','manifest.webmanifest','icone.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>/^linha-/.test(x)&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const guardada=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('index.html'):Response.error()));
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}else if(!r.ok)return guardada().then(g=>g.type==='error'?r:g);return r}).catch(guardada))});
`;
fs.mkdirSync(saida, { recursive: true });
fs.writeFileSync(path.join(saida, 'index.html'), h);
fs.writeFileSync(path.join(saida, 'manifest.webmanifest'), JSON.stringify(manifesto, null, 1));
fs.writeFileSync(path.join(saida, 'sw.js'), sw);
fs.writeFileSync(path.join(saida, 'icone.svg'), icone);
fs.writeFileSync(path.join(saida, 'versao.json'), JSON.stringify({ versao, geradoEm: new Date().toISOString() }));
fs.writeFileSync(path.join(saida, '.nojekyll'), '');
console.log(`Página do app da linha em ${saida} (plataforma ${versao}; ${Math.round(h.length / 1024)} KB; sem cadastro embutido)`);
