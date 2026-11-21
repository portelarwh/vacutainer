// Verificação da configuração de marca/documentação, sem navegador nem escrita em bases.
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';import helpers from './html.cjs';
import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function validateBrand(reference,css){
 const colors=[...reference.matchAll(/\|\s*`(bd-[\w-]+)`\s*\|\s*`(#[a-f\d]{6})`/gi)];
 if(colors.length!==10)throw new Error('A referência precisa declarar as dez cores BD esperadas.');
 for(const[,token,hex]of colors){const matches=[...css.matchAll(new RegExp('--'+token+'\\s*:\\s*(#[a-f\\d]{6})\\s*;','gi'))];if(matches.length!==1||matches[0][1].toUpperCase()!==hex.toUpperCase())throw new Error('Token divergente da referência BD: '+token)}
 if(/@import|@font-face|https?:\/\//i.test(css))throw new Error('A marca precisa funcionar sem fonte ou folha remota.');
 return colors.length;
}
export function contrast(a,b){
 const luminance=hex=>{if(!/^#[a-f\d]{6}$/i.test(hex))throw new Error('Cor precisa ser hexadecimal RGB.');const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
 const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function checkSetup(base=app){
 const mandatory=['AGENTS.md','README.md','docs/COMECE-AQUI.md','docs/DESIGN_SYSTEM.md','docs/BD_Dashboard_Brand_Guidelines.md','docs/ARQUITETURA.md','docs/ARQUITETURA-REQUISITOS.md','docs/REGRAS_DE_NEGOCIO.md','docs/CONTRATO-MOTORES.md','docs/PLANO-DE-MELHORIAS.md','docs/CORTE.md'];
 for(const file of mandatory)if(!existsSync(path.join(base,file)))throw new Error('Referência obrigatória ausente: '+file);
 const css=helpers.load(path.join(base,'Plataforma.html')).text('css/brand'),reference=readFileSync(path.join(base,'docs/BD_Dashboard_Brand_Guidelines.md'),'utf8'),colors=validateBrand(reference,css);
 for(const folder of ['paginas','fontes','nova-plataforma'])if(existsSync(path.join(base,folder)))throw new Error('Árvore antiga ainda presente: '+folder);
 const md=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?md(path.join(dir,e.name)):/\.md$/i.test(e.name)?[path.join(dir,e.name)]:[]);
 const documents=[path.join(base,'AGENTS.md'),path.join(base,'README.md'),...md(path.join(base,'docs'))];
 for(const file of documents){const text=readFileSync(file,'utf8');for(const m of text.matchAll(/(?<!!)\[[^\]]+\]\(([^\s)]+)\)/g)){const target=m[1].split('#')[0];if(!target||/^[a-z]+:|^\//i.test(target))continue;if(!existsSync(path.resolve(path.dirname(file),target)))throw new Error(path.relative(base,file)+': referência local ausente: '+target)}}
 return{colors,documents:documents.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const r=checkSetup();console.log('Configuração visual: '+r.colors+' cores BD, '+r.documents+' documentos com referências válidas; marca única para casca e motores.')}catch(e){console.error(e.message);process.exitCode=1}
}
