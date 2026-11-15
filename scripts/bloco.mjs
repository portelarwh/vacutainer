// Editor genérico de um bloco do arquivo único; não cria outra fonte de produto.
import {readFileSync,writeFileSync,renameSync,rmSync} from 'node:fs';
import helpers from './html.cjs';
import {updateMetadata} from './verificar.mjs';
const [id,input]=process.argv.slice(2);
try{
 if(!id)throw new Error('Uso: node scripts/bloco.mjs ID [arquivo-com-o-novo-conteudo]');
 const app=helpers.load();app.text(id);
 if(!input)process.stdout.write(app.text(id));
 else{
  const value=readFileSync(input,'utf8').replace(/\r\n?/g,'\n');
  if(value.startsWith('\n'))throw new Error('O bloco não deve começar com uma linha vazia: o textarea do HTML ignora a primeira quebra.');
  const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('(<textarea data-vac-source="'+escaped+'" spellcheck="false">)[\\s\\S]*?(<\\/textarea>)');
  const candidate=app.html.replace(pattern,(_,start,end)=>start+helpers.encode(value)+end);
  const output=updateMetadata(helpers.fromHtml(candidate)),temporary=helpers.FILE+'.'+process.pid+'.tmp';
  try{writeFileSync(temporary,output);renameSync(temporary,helpers.FILE);}finally{rmSync(temporary,{force:true});}
  console.log('Bloco atualizado e arquivo validado: '+id);
 }
}catch(error){console.error(error.message);process.exitCode=1;}
