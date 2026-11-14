// Sem transformação textual: o contrato de integração pertence às fontes do kit.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'nova-plataforma/src/generated');
mkdirSync(out,{recursive:true});
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const files={portal:'Portal.html',oee:'OEE-Vacutainer.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',linha:'Linha-360.html',projetos:'Projetos.html'};
const data={},manifest={revision:git('rev-parse','HEAD'),sourceRevision:git('log','-1','--format=%H','--','fontes','paginas'),dirtySources:git('status','--porcelain','--','fontes','paginas').split('\n').filter(Boolean),files:[],limitations:['Projetos e conteúdo técnico OSM/MES/AM/TPM mantêm os limites documentados nas fontes.']};
for(const [id,file] of Object.entries(files)){
 const bytes=readFileSync(path.join(root,'paginas',file)),html=bytes.toString('utf8');
 const version=html.match(/const PAGE\s*=\s*\{[^}]*?versao\s*:\s*['"]([^'"]+)/s)?.[1] || html.match(/(?:const|let) APP_VER(?:SION)?\s*=\s*['"]([^'"]+)/)?.[1];
 if(!version)throw new Error('Versão PAGE ausente: '+file);
 data[id]=gzipSync(bytes,{mtime:0}).toString('base64');
 manifest.files.push({id,path:'paginas/'+file,version,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
}
const shared={};
for(const [name,file] of Object.entries({xlsx:'nova-plataforma/vendor/xlsx-0.20.3.full.min.js',jspdf:'paginas/lib/jspdf.umd.min.js',autotable:'paginas/lib/jspdf.plugin.autotable.min.js'}))shared[name]=gzipSync(readFileSync(path.join(root,file)),{mtime:0}).toString('base64');
for(const [file,value]of Object.entries({'libraries.json':shared,'engines.json':data,'manifest.json':manifest}))writeFileSync(path.join(out,file),JSON.stringify(value,null,file==='manifest.json'?2:0)+'\n');
writeFileSync(path.join(out,'scenario.json'),readFileSync(path.join(root,'fontes/kit/demo_cenario.json')));
console.log('9 motores da árvore atual · '+manifest.revision.slice(0,7));
