import {readFileSync,renameSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';
export function checkResources(text,label){
 // Ignore strings de relatórios dentro de scripts; confira os elementos reais do documento.
 const markup=text.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi,(block,attrs)=>{if(/\bsrc\s*=/i.test(attrs))throw new Error(label+': script externo');return ''});
 if(/<link\b[^>]*(?:stylesheet|preconnect|modulepreload)|@import\s+(?:url\()?['"]?https?:/i.test(markup))throw new Error(label+': recurso externo no motor');
}
export function checkEngines(packed,manifest){
 if(manifest.files.length!==Object.keys(packed).length)throw new Error('Manifesto incompleto');
 for(const file of manifest.files){const bytes=gunzipSync(Buffer.from(packed[file.id],'base64'));if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error('sha256 divergente: '+file.id);if(bytes.length!==file.bytes)throw new Error('Tamanho divergente: '+file.id);checkResources(bytes.toString('utf8'),file.id)}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const input=existsSync('dist/index.html')?'dist/index.html':'dist/Plataforma.html',text=readFileSync(input,'utf8');checkResources(text,'casca');
 const packed=JSON.parse(readFileSync('src/generated/engines.json','utf8')),manifest=JSON.parse(readFileSync('src/generated/manifest.json','utf8'));checkEngines(packed,manifest);
 if(input!=='dist/Plataforma.html')renameSync(input,'dist/Plataforma.html');console.log('Plataforma.html · '+manifest.files.length+' motores com hash e dependências conferidos');
}
