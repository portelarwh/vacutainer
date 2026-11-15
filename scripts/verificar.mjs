import {writeFileSync,renameSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {Script} from 'node:vm';
import {execFileSync} from 'node:child_process';
import helpers from './html.cjs';
const {FILE,load,encode} = helpers;
const sha = text => createHash('sha256').update(text).digest('hex');
export function metadata(app) {
  const old = JSON.parse(app.text('dados/manifesto'));
  const files = [...app.sources.keys()].filter(id=>id.startsWith('motor/')).map(key => {
    const id = key.slice(6), html = app.assemble(key);
    const version = html.match(/const PAGE\s*=\s*\{[^}]*?versao\s*:\s*['"]([^'"]+)/s)?.[1] || html.match(/(?:const|let) APP_VER(?:SION)?\s*=\s*['"]([^'"]+)/)?.[1];
    if (!version) throw new Error('Versão ausente: ' + id);
    return {id,path:'Plataforma.html#motor/'+id,version,sha256:sha(html),bytes:Buffer.byteLength(html)};
  });
  const hash = createHash('sha256');
  for (const file of files) hash.update(file.id).update('\0').update(app.assemble('motor/'+file.id)).update('\0');
  for (const id of ['xlsx','jspdf','autotable']) hash.update(id).update('\0').update(app.text('biblioteca/'+id)).update('\0');
  return {...old,files,dirtySources:[],sourceMode:'single-html',enginesSha256:hash.digest('hex')};
}
export function checkResources(text,label) {
  const markup=text.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi,(_,attrs)=>{
    if (/\bsrc\s*=/i.test(attrs)) throw new Error(label+': script externo'); return '';
  });
  if (/<link\b[^>]*(?:stylesheet|preconnect|modulepreload)|@import\s+(?:url\()?['"]?https?:/i.test(markup)) throw new Error(label+': folha externa');
}
export function verify(app=load()) {
  checkResources(app.html.replace(/<textarea data-vac-source="[\w/.-]+" spellcheck="false">[\s\S]*?<\/textarea>/g,''),'Plataforma.html');
  const expected=metadata(app), actual=JSON.parse(app.text('dados/manifesto'));
  if (JSON.stringify(expected)!==JSON.stringify(actual)) throw new Error('Metadados desatualizados: execute npm run atualizar:metadados.');
  for (const file of expected.files) {
    const html=app.assemble('motor/'+file.id);checkResources(html,file.id);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/application\/json/i.test(match[1])) JSON.parse(match[2]);
      else new Script(match[2],{filename:file.id});
    }
  }
  for (const [id,code] of app.sources) {
    app.assemble(id);
    if (/^(modulo|recurso|vendor)\//.test(id)) {
      try {execFileSync(process.execPath,['--check','--input-type=module'],{input:code,stdio:['pipe','pipe','pipe']});}
      catch {throw new Error('JavaScript inválido: '+id);}
      for (const match of code.matchAll(/(?:\bfrom\s*|\bimport\s*)(['"])([^'"]+)\1/g)) {
        if (!match[2].startsWith('vac:') || !app.sources.has(match[2].slice(4))) throw new Error(id+': dependência externa/ausente: '+match[2]);
      }
    }
  }
  return {modules:expected.files.length,blocks:app.sources.size,sha256:sha(app.html),enginesSha256:expected.enginesSha256};
}
export function updateMetadata(app) {
  const value=JSON.stringify(metadata(app),null,2);
  const pattern=/(<textarea data-vac-source="dados\/manifesto" spellcheck="false">)[\s\S]*?(<\/textarea>)/;
  const html=app.html.replace(pattern,(_,start,end)=>start+encode(value)+end);
  verify(helpers.fromHtml(html));return html;
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.includes('--atualizar')) {
      const html=updateMetadata(load()),temporary=FILE+'.'+process.pid+'.tmp';
      try{writeFileSync(temporary,html);renameSync(temporary,FILE);}finally{rmSync(temporary,{force:true});}
    }
    const result=verify();console.log('HTML único verificado: '+result.modules+' módulos, '+result.blocks+' blocos. SHA-256 '+result.sha256);
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
