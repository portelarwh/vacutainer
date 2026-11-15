// Sem transformação textual: o contrato de integração pertence às fontes do kit.
import {sourceProvenance} from './git-provenance.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gzipSync} from 'fflate';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'nova-plataforma/src/generated');
mkdirSync(out,{recursive:true});
const files={portal:'Portal.html',oee:'OEE-Vacutainer.html',perdas:'Perdas-Ordem.html',gel:'Gestão-Gel-Vacutainer.html',paradas:'Paradas.html',equip:'Equipamentos.html',inic:'Iniciativas.html',linha:'Linha-360.html',projetos:'Projetos.html'};
const data={},manifest={...sourceProvenance(root),files:[],limitations:['Projetos e conteúdo técnico OSM/MES/AM/TPM mantêm os limites documentados nas fontes.']};
for(const [id,file] of Object.entries(files)){
 const bytes=readFileSync(path.join(root,'paginas',file)),html=bytes.toString('utf8');
 const version=html.match(/const PAGE\s*=\s*\{[^}]*?versao\s*:\s*['"]([^'"]+)/s)?.[1] || html.match(/(?:const|let) APP_VER(?:SION)?\s*=\s*['"]([^'"]+)/)?.[1];
 if(!version)throw new Error('Versão PAGE ausente: '+file);
 data[id]=Buffer.from(gzipSync(bytes,{mtime:0,level:6})).toString('base64');
 manifest.files.push({id,path:'paginas/'+file,version,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
}
const shared={};
for(const [name,file] of Object.entries({xlsx:'paginas/lib/xlsx.full.min.js',jspdf:'paginas/lib/jspdf.umd.min.js',autotable:'paginas/lib/jspdf.plugin.autotable.min.js'}))shared[name]=Buffer.from(gzipSync(readFileSync(path.join(root,file)),{mtime:0,level:6})).toString('base64');
const enginesJson=JSON.stringify(data)+'\n',librariesJson=JSON.stringify(shared)+'\n';
// NUL separa os dois documentos e evita concatenações ambíguas.
manifest.enginesSha256=createHash('sha256').update(enginesJson).update('\0').update(librariesJson).digest('hex');
writeFileSync(path.join(out,'engines.json'),enginesJson);writeFileSync(path.join(out,'libraries.json'),librariesJson);
writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(path.join(out,'scenario.json'),readFileSync(path.join(root,'fontes/kit/demo_cenario.json')));
console.log('9 motores da árvore atual · '+manifest.sourceRevision.slice(0,7));
