// Portal consulta versões e planejamento incorporados numa pasta OPFS sem HTMLs antigos.
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),H=require('../../scripts/html.cjs');
const fixture=require('../bases/consolidacao-referencia.json').bases;
const files={portal:'portal-base.json',oee:'oee-vacutainer-base.json',perdas:'perdas-base.json',gel:'fifo-base.json',paradas:'paradas-base.json',equip:'equipamentos-base.json',inic:'iniciativas-base.json',linha:'linha360-base.json',cad:'vacutainer-cadastros.json'};
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(H.FILE));});let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
  const page=await browser.newPage();page.on('dialog',d=>d.dismiss());
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.evaluate(async({fixture,files})=>{
   const root=await(await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Metadados-Ficticios',{create:true}),bases=await root.getDirectoryHandle('00. Bases',{create:true});
   for(const[id,name]of Object.entries(files)){const w=await(await bases.getFileHandle(name,{create:true})).createWritable();await w.write(JSON.stringify(fixture[id]));await w.close();}
   localStorage.setItem('vac.app.real-inicial.vac.userId','9099');localStorage.setItem('vac.app.real-inicial.vac.sessao',JSON.stringify({id:'9099',ate:Date.now()+3600000}));
   window.showDirectoryPicker=async()=>root;
  },{fixture,files});
  await page.locator('.heading-actions').locator('[data-act="connect"]').click();
  await page.locator('.folder-info strong').filter({hasText:'Somente-Metadados-Ficticios'}).waitFor();
  await page.evaluate(()=>location.hash='#/portal');const iframe=page.locator('iframe[title="Módulo Administração"]');await iframe.waitFor();
  const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>vacPagina.conectado());
  const result=await frame.evaluate(async()=>{
   const scan=await Vers.scan();await modConstrucao(systems().find(s=>s.id==='projetos'));
   return{ids:scan.L.map(r=>r.id),missing:scan.L.filter(r=>!r.html).map(r=>r.id),libraries:scan.libs,planned:MOD.data.projetos.planejado?.abas?.length||0,versions:Object.fromEntries(scan.L.map(r=>[r.id,r.html?.v]))};
  });
  assert.deepEqual(result.missing,[]);assert.ok(result.ids.length>=9);assert.ok(result.planned>=4);
  assert.ok(result.libraries.every(l=>!l.falta));for(const entry of H.manifest().files)assert.equal(result.versions[entry.id],entry.version);
  console.log('ok Portal: nove versões, bibliotecas e planejamento lidos do código incorporado, sem HTML/lib na pasta');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
