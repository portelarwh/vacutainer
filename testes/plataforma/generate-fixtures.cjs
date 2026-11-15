// Exclusivamente cenário fictício, carregado pelos adaptadores atuais de cada motor.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),manifest=require('../../scripts/html.cjs').manifest();
module.exports=async function generate(){const server=require('../../scripts/servidor-testes.cjs').server();let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());const context=await browser.newContext({timezoneId:'UTC'}),bases={};
 for(const file of manifest.files.filter(f=>f.id!=='projetos')){const p=await context.newPage();await p.clock.setFixedTime(new Date('2026-11-15T12:00:00Z'));await p.goto('http://127.0.0.1:'+server.address().port+'/__modulos__/'+Object.keys(require('../../scripts/html.cjs').names).find(n=>require('../../scripts/html.cjs').names[n]===file.id)+'?demo=fixture-atual');await p.waitForFunction(()=>window.vacPagina?.pronto());bases[file.id]=await p.evaluate(id=>{
  vacDemo.publicar(id);let b;
  if(id==='oee'){Store.mutate((d,audit)=>CadSync.aplicar(d,vacDemo.ler('cad'),audit));b=JSON.parse(Store.serialize(db()));b.exports=Exports.build(db());b.appVersion=APP_VERSION;b.applicationVersion=APP_VERSION}
  else if(id==='portal'){b=JSON.parse(JSON.stringify(Store.B));b.exports=PAGE.exports(b);b.appVersion=PAGE.versao}
  else if(id==='perdas'){b=B;b.exports=buildExports();b.appVersion=APP_VER}
  else if(id==='gel'){b=snapshotData();b.exports=gelExports();b.appVersion=APP_VERSION;b.rev=1}
  else{b=Store.data;b.exports=calcExports(b);b.appVersion=APP_VERSION;b.rev=1}
  return JSON.parse(JSON.stringify(b));
 },file.id);if(file.id==='portal')bases.cad=await p.evaluate(()=>JSON.parse(JSON.stringify(Cad.base)));assert.ok(bases[file.id]?.exports,file.id+' sem exports atual');console.log('fixture preenchida atual '+file.id+' '+file.version);await p.close()}
 const modules=manifest.files.map(f=>f.id),actions=['ver','lancar','fechar','importar','exportar','excluir','configurar'];
 bases.cad.usuarios.push({codigo:'9099',nome:'Pessoa Fictícia de Verificação',perfil:'ADMIN_TESTE',ativo:true});bases.cad.perfis.push({codigo:'ADMIN_TESTE',nome:'Administrador fictício',ativo:true,permissoes:Object.fromEntries(modules.map(m=>[m,Object.fromEntries(actions.map(a=>[a,true]))]))});return{bases,manifest};
 }finally{await browser?.close();server.close()}};
if(require.main===module)module.exports().then(result=>{fs.writeFileSync(path.join(__dirname,'../../.test-cache/fixtures.json'),JSON.stringify(result));}).catch(e=>{console.error(e);process.exitCode=1});
