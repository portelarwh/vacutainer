// Baseline fixa: não incorpora arquivos modificados de outra tarefa.
import {execFileSync} from 'node:child_process';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {gzipSync,gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'nova-plataforma/src/generated');mkdirSync(out,{recursive:true});
const revision='0769376e794506a33d1d847ede67b73ea013b59e';
const files={portal:'Portal.html',oee:'OEE-Vacutainer.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',projetos:'Projetos.html'};
const git=p=>execFileSync('git',['show',revision+':'+p],{cwd:root,maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']});
// Uma cópia só desta pasta também compila: usa o snapshot verificado quando o histórico Git não está disponível.
let available=true;try{git('fontes/kit/demo_cenario.json')}catch{available=false}
if(!available){
 const manifest=JSON.parse(readFileSync(path.join(out,'manifest.json'),'utf8')),packed=JSON.parse(readFileSync(path.join(out,'engines.json'),'utf8'));
 if(manifest.revision!==revision)throw new Error('Snapshot de outra baseline.');
 for(const f of manifest.files){const bytes=gunzipSync(Buffer.from(packed[f.id],'base64'));if(createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw new Error('Snapshot inválido: '+f.id)}
 for(const f of ['libraries.json','scenario.json'])JSON.parse(readFileSync(path.join(out,f),'utf8'));
 console.log('Snapshot local verificado · '+revision.slice(0,7));process.exit(0);
}
const data={},manifest={revision,files:[],limitations:['Projetos e conteúdo técnico OSM/MES/AM/TPM mantêm os limites de escopo documentados nas páginas de origem.']};
for(const [id,file] of Object.entries(files)){
 let html=git('paginas/'+file).toString('utf8');
 html=html.replace(/@import\s+url\([^)]*\)[^;]*;/gi,'');
 html=html.replace(/<link\b[^>]*href=["']https?:[^>]*>/gi,'');
 html=html.replace('function ir(h){if(host)', 'function ir(h){if(parent!==window&&parent.vacAppHost)return parent.vacAppHost.ir(h);if(host)');
 html=html.replace('function entrar(){if(host)', 'function entrar(){if(parent!==window&&parent.vacAppHost)return parent.vacAppHost.demonstrar();if(host)');
 const bytes=Buffer.from(html);data[id]=gzipSync(bytes,{mtime:0}).toString('base64');manifest.files.push({id,path:'paginas/'+file,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
}
const shared={};for(const [name,bytes] of Object.entries({xlsx:readFileSync(path.join(root,'nova-plataforma/vendor/xlsx-0.20.3.full.min.js')),jspdf:git('paginas/lib/jspdf.umd.min.js'),autotable:git('paginas/lib/jspdf.plugin.autotable.min.js')}))shared[name]=gzipSync(bytes,{mtime:0}).toString('base64');writeFileSync(path.join(out,'libraries.json'),JSON.stringify(shared));
writeFileSync(path.join(out,'engines.json'),JSON.stringify(data));writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));writeFileSync(path.join(out,'scenario.json'),git('fontes/kit/demo_cenario.json'));console.log('8 módulos incorporados, baseline '+revision.slice(0,7));
