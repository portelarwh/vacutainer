// Produz bases exclusivamente fictícias usando factories e exports da árvore atual.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),manifest=require('../src/generated/manifest.json');
module.exports=async function generate(){const server=http.createServer((q,r)=>{try{const file=path.join(root,decodeURIComponent(new URL(q.url,'http://local').pathname));r.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':'text/html');r.end(fs.readFileSync(file))}catch{r.writeHead(404);r.end()}});let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());const context=await browser.newContext(),bases={};
 for(const file of manifest.files.filter(f=>f.id!=='projetos')){const p=await context.newPage();await p.goto('http://127.0.0.1:'+server.address().port+'/'+file.path);await p.waitForFunction(()=>window.vacPagina?.pronto());bases[file.id]=await p.evaluate(id=>{
  let b;
  if(id==='oee'){Demo.enterExample();b=JSON.parse(JSON.stringify(db()));b.exports=Exports.build(db());b.appVersion=APP_VERSION;b.applicationVersion=APP_VERSION}
  else if(id==='portal'){b=PAGE.vazio();b.exports=PAGE.exports(b);b.appVersion=PAGE.versao}
  else if(id==='perdas'){B=emptyBase();b=B;b.exports=buildExports()}
  else if(id==='gel'){b=snapshotData();b.exports=gelExports();b.appVersion=APP_VERSION;b.rev=1}
  else{b=completar(vazio());b.exports=calcExports(b);b.rev=1;b.revId='fixture-'+id}
  return b;
 },file.id);console.log('fixture atual '+file.id+' '+file.version);await p.close()}
 const modules=manifest.files.map(f=>f.id),actions=['ver','lancar','fechar','importar','exportar','excluir','configurar'];
 bases.cad={schema:'vac-cadastros',schemaVersion:1,rev:1,appVersion:'Portal '+manifest.files.find(f=>f.id==='portal').version,usuarios:[{codigo:'9001',nome:'Pessoa Fictícia',perfil:'ADMIN',ativo:true}],perfis:[{codigo:'ADMIN',nome:'Administrador fictício',ativo:true,permissoes:Object.fromEntries(modules.map(m=>[m,Object.fromEntries(actions.map(a=>[a,true]))]))}],parametros:{},auditoria:[]};return{bases,manifest};
 }finally{await browser?.close();server.close()}};
if(require.main===module)module.exports().then(result=>{fs.writeFileSync(path.join(__dirname,'../src/generated/fixtures.json'),JSON.stringify(result));}).catch(e=>{console.error(e);process.exitCode=1});
