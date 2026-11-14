// Bases fictícias geradas pelas factories/exports atuais. Não lê nem grava bases reais.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),generate=require('./generate-fixtures.cjs');
const files={portal:'portal-base.json',oee:'oee-vacutainer-base.json',perdas:'perdas-base.json',gel:'fifo-base.json',paradas:'paradas-base.json',equip:'equipamentos-base.json',inic:'iniciativas-base.json',linha:'linha360-base.json',cad:'vacutainer-cadastros.json'};
(async()=>{const fixture=await generate(),html=fs.readFileSync(path.resolve(__dirname,'../dist/Plataforma.html')),server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});let browser;
 try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
 async function open(bases){const context=await browser.newContext(),page=await context.newPage();page.on('dialog',d=>d.dismiss());await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.evaluate(async({bases,files})=>{const root=await(await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Ficticio',{create:true}),dir=await root.getDirectoryHandle('00. Bases',{create:true});for(const[id,file]of Object.entries(files)){if(!bases[id])continue;const w=await(await dir.getFileHandle(file,{create:true})).createWritable();await w.write(JSON.stringify(bases[id]));await w.close()}window.fixtureDir=dir;window.showDirectoryPicker=async()=>root;},{bases,files});await page.locator('.heading-actions').getByRole('button',{name:'Conectar pasta',exact:true}).click();await page.locator('.folder-info strong').filter({hasText:'Somente-Ficticio'}).waitFor();return{page,context}}
 const {page,context}=await open(fixture.bases);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{location.hash='#/oee'});const initialFrame=page.locator('iframe[title="Módulo Produção"]');await initialFrame.waitFor();const initial=await(await initialFrame.elementHandle()).contentFrame();await initial.waitForFunction(()=>window.vacPagina?.conectado());
 const denied=await initial.evaluate(async()=>{try{const dir=await window.showDirectoryPicker(),base=await dir.getDirectoryHandle('00. Bases'),f=await base.getFileHandle('oee-vacutainer-base.json');await f.createWritable();return 'PERMITIU'}catch(e){return e.name}});assert.equal(denied,'NotAllowedError');console.log('ok sem sessão: nenhuma gravação física');
 await page.evaluate(()=>{const prefix='vac.app.'+vacAppHost.scope+'.';localStorage.setItem(prefix+'vac.userId','9001');localStorage.setItem(prefix+'vac.sessao',JSON.stringify({id:'9001',ate:Date.now()+3600000}));});
 for(const entry of fixture.manifest.files.filter(f=>f.id!=='projetos')){
  const before=fixture.bases[entry.id];await page.locator('.sidebar').getByRole('button',{name:entry.id==='portal'?'Administração':({oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',paradas:'Paradas',equip:'Equipamentos',inic:'Iniciativas / Ações',linha:'Linha 360°'})[entry.id],exact:true}).click();
  const title=entry.id==='portal'?'Administração':({oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',paradas:'Paradas',equip:'Equipamentos',inic:'Iniciativas / Ações',linha:'Linha 360°'})[entry.id];const iframe=page.locator('iframe[title="Módulo '+title+'"]');await iframe.waitFor();const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>window.vacPagina?.conectado());
  await frame.evaluate(async id=>{
   if(id==='oee'){const day=db().productionDays.find(d=>!d.deleted);Actions.setDayField(day.id,'note','Round trip fictício atual');await Store.flush()}
   else if(id==='portal')await Store.commit('Round trip fictício',()=>{});
   else if(id==='perdas')await commit('Round trip fictício',()=>{});
   else if(id==='gel')await fsWriteBase(snapshotData());
   else{Store.data.exports.geradoEm='2000-01-01';await Store.save()}
  },entry.id);
  const saved=await page.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()),files[entry.id]);
  assert.equal(saved.appVersion,entry.version,entry.id+' appVersion');for(const key of Object.keys(before.exports))assert.ok(Object.hasOwn(saved.exports,key),entry.id+' perdeu exports.'+key);
  console.log('ok abrir/gravar/reler '+entry.id+' '+saved.appVersion+' · '+Object.keys(saved.exports).length+' chaves de exports');
 }
 assert.deepEqual(errors,[]);
 await page.evaluate(async()=>{window.disposed=[];for(const frame of document.querySelectorAll('iframe')){const api=frame.contentWindow.vacPagina,previous=api.descartar;api.descartar=()=>{parent.disposed.push(frame.title);previous()}}const other=await(await navigator.storage.getDirectory()).getDirectoryHandle('Outra-Ficticia',{create:true});await other.getDirectoryHandle('00. Bases',{create:true});window.showDirectoryPicker=async()=>other});
 await page.locator('.heading-actions').getByRole('button',{name:'Trocar pasta',exact:true}).click();await page.locator('.folder-info strong').filter({hasText:'Outra-Ficticia'}).waitFor();assert.equal(await page.evaluate(()=>disposed.length),8,'descarte dos oito motores antes de mudar escopo');console.log('ok oito motores descartam timers e observers ao mudar de pasta');
 await context.close();
 // Cada módulo recebe uma base futura. A tentativa de escrita é impedida no File System Access.
 for(const entry of fixture.manifest.files.filter(f=>f.id!=='projetos')){const bases=structuredClone(fixture.bases);bases[entry.id].appVersion='99.0.0';const {page:p,context:c}=await open(bases);await p.evaluate(()=>{const prefix='vac.app.'+vacAppHost.scope+'.';localStorage.setItem(prefix+'vac.userId','9001');localStorage.setItem(prefix+'vac.sessao',JSON.stringify({id:'9001',ate:Date.now()+60000}));});await p.evaluate(id=>{location.hash='#/'+id},entry.id);const el=p.locator('iframe').first();await el.waitFor();const f=await(await el.elementHandle()).contentFrame();await f.waitForFunction(()=>window.vacPagina?.pronto());await p.getByText(/mais nova que o motor/).first().waitFor();
  const result=await f.evaluate(async file=>{try{const dir=await window.showDirectoryPicker();const h=await(await dir.getDirectoryHandle('00. Bases')).getFileHandle(file);await h.createWritable();return 'PERMITIU'}catch(e){return e.name}},files[entry.id]);assert.equal(result,'NotAllowedError');assert.equal(await p.evaluate(async file=>JSON.parse(await(await(await fixtureDir.getFileHandle(file)).getFile()).text()).appVersion,files[entry.id]),'99.0.0');console.log('ok versão futura sem gravação '+entry.id);await c.close();
 }
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
