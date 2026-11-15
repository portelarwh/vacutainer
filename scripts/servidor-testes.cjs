// Transporte de teste para o código incorporado. Não gera páginas nem é servidor do produto.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {ROOT,FILE,current,names}=require('./html.cjs');
function virtual(url) {
  const pathname=decodeURIComponent(new URL(url,'http://teste.invalid').pathname);
  const name=pathname.split('/').pop();
  if (names[name]) return {type:'text/html; charset=utf-8',body:current().assemble('motor/'+names[name])};
  const library={'xlsx.full.min.js':'xlsx','jspdf.umd.min.js':'jspdf','jspdf.plugin.autotable.min.js':'autotable'}[name];
  if (library) return {type:'text/javascript',body:current().text('biblioteca/'+library)};
  const tool={'Comparar-importacao.html':'comparar','Verificar-pasta.html':'verificar'}[name];
  if (tool) return {type:'text/html; charset=utf-8',body:current().text('ferramenta/'+tool)};
  return null;
}
function handler(req,res) {
  try {
    if(req.url.split('?')[0]==='/favicon.ico'){res.writeHead(204);return res.end();}
    const value=virtual(req.url);
    if(value){res.setHeader('Content-Type',value.type);return res.end(value.body);}
    const local=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://teste.invalid').pathname));
    if(!local.startsWith(ROOT+path.sep))throw Error('Fora do repositório');
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(local)]||'application/octet-stream');
    res.end(fs.readFileSync(local));
  }catch{res.writeHead(404);res.end();}
}
module.exports={virtual,handler,server:()=>http.createServer(handler)};
