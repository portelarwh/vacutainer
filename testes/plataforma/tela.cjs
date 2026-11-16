// Somente demonstração fictícia; nenhum arquivo da linha é aberto.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const H=require('../../scripts/html.cjs');
(async()=>{
 const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(fs.readFileSync(process.env.PLATAFORMA_HTML||H.FILE))});let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
  for(const width of [390,768,1440])for(const theme of ['light','dark']){
   const c=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));await c.addInitScript(t=>localStorage.setItem('vac.platform.demo.theme',t),theme);
   await p.goto('http://127.0.0.1:'+server.address().port+'/?demo=1#/oee');
   const el=p.locator('iframe[title="Módulo Produção"]');await el.waitFor();const f=await(await el.elementHandle()).contentFrame();await f.waitForFunction(()=>vacPagina?.pronto());
   const search=p.locator('.search-trigger');await search.focus();await p.keyboard.press('Control+k');await p.locator('.search-field input').waitFor();
   assert.equal(await p.locator('.search-field input').evaluate(e=>e===document.activeElement),true,'Ctrl K foca campo');
   await p.keyboard.type('100234567');assert.equal(await p.locator('.search-field input').inputValue(),'100234567');await p.keyboard.press('Escape');
   assert.equal(await search.evaluate(e=>e===document.activeElement),true,'foco restaurado');
   for(const selector of ['.sidebar-foot button','.demo-strip button'])for(const box of await p.locator(selector).evaluateAll(es=>es.map(e=>({h:e.getBoundingClientRect().height,font:parseFloat(getComputedStyle(e).fontSize)})))){
    assert.ok(box.h>=40,selector+' alvo de 40 px');assert.ok(box.font>=12,selector+' texto de 12 px');
   }
   for(const selector of ['.nav-count','.folder-info strong','kbd','.avatar','.text-button'])assert.ok(await p.locator(selector).evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)>=12)),selector+' legível');
   const info=await f.evaluate(()=>{localStorage.setItem('vac.sistemas',JSON.stringify(systems().map(s=>({...s,...(s.id===PAGE.id?{estado:'atualizacao',estadoNota:'Validação visual fictícia'}:{})}))));vacEstadoRender();return vacPagina.info()});
   assert.ok(info.estado.length&&info.estado.every(i=>i.texto&&i.tom));
   const back=p.locator('.engine-commands').getByRole('button',{name:'Voltar',exact:true});await back.waitFor();assert.match(await back.getAttribute('title'),/tela anterior/);
   const status=p.locator('.heading-actions').getByRole('button',{name:'Status',exact:true});assert.equal(await status.evaluate(e=>!!e.closest('.module-tabs,.page-tabs')),false);
   await status.click();const dialog=p.getByRole('dialog',{name:'Status da página'});await dialog.waitFor();
   await dialog.getByText('oee-vacutainer-base.json',{exact:true}).waitFor();await dialog.getByText('Validação visual fictícia',{exact:true}).waitFor();
   for(const label of ['Versão do módulo','Revisão publicada da base','Cadastro geral','Conexão','Alterações pendentes','Fila durável neste navegador','Pasta de backup','Último backup registrado com sucesso'])await dialog.getByText(label,{exact:true}).waitFor();
   const fragments=await dialog.locator('.status-fragments li').allTextContents();for(const item of info.estado)assert.ok(fragments.includes(item.texto),'status preservado: '+item.texto);
   assert.equal(await p.locator('.engine-pills,.module-page-state').count(),0);await p.keyboard.press('Escape');assert.equal(await status.evaluate(e=>e===document.activeElement),true);
   const tabs=p.locator('.module-tabs button');for(const index of [await tabs.count()-1,0]){await tabs.nth(index).click();await p.waitForFunction(()=>{const a=document.querySelector('.module-tabs .active'),n=document.querySelector('.module-tabs');if(!a||!n)return false;const x=a.getBoundingClientRect(),r=n.getBoundingClientRect();return x.left>=r.left-1&&x.right<=r.right+1});}
   assert.ok(await f.locator('#vacEstFaixa').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).display==='none')));
   await p.evaluate(()=>location.hash='#/gel');const gel=p.locator('iframe[title="Módulo Gestão de Gel"]');await gel.waitFor();const g=await(await gel.elementHandle()).contentFrame();await g.waitForFunction(()=>vacPagina.pronto());
   const tv=p.locator('.engine-commands button[aria-haspopup="menu"]').filter({hasText:/TV/});await tv.waitFor();assert.equal((await tv.innerText()).trim(),'TV ▾','só um indicador de menu');
   assert.equal(await p.getByRole('menuitem').count(),0);await tv.click();const menu=p.getByRole('menu',{name:/TV/});await menu.waitFor();assert.equal(await menu.getByRole('menuitem').count(),3);
   const bounds=await menu.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1,'menu não cortado');assert.equal(await tv.getAttribute('aria-expanded'),'true');
   assert.equal(await menu.locator('button').first().evaluate(e=>e===document.activeElement),true);await p.keyboard.press('End');assert.equal(await menu.locator('button').last().evaluate(e=>e===document.activeElement),true);
   await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');assert.equal(await menu.locator('button').nth(1).evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Escape');assert.equal(await tv.getAttribute('aria-expanded'),'false');assert.equal(await tv.evaluate(e=>e===document.activeElement),true);
   await tv.click();await p.locator('.page-heading h1').click();assert.equal(await p.getByRole('menuitem').count(),0);
   const expected=await g.evaluate(()=>{const tv=vacPagina.comandos().find(c=>/TV/.test(c.label));window.__cmds=[];const original=vacPagina.comando;vacPagina.comando=id=>{window.__cmds.push(id);if(!tv.itens.some(i=>i.id===id))original(id)};return tv.itens[0].id});
   await tv.click();await p.getByRole('menuitem').first().click();assert.deepEqual(await g.evaluate(()=>window.__cmds),[expected]);assert.equal(await p.getByRole('menuitem').count(),0);
   const more=p.locator('.engine-commands button[aria-haspopup="menu"]').filter({hasText:/Mais/});await more.click();assert.equal(await p.getByRole('menuitem').count(),4);await p.keyboard.press('Escape');
   if(width===1440&&theme==='light'){
    await p.evaluate(()=>location.hash='#/portal');const admin=p.locator('iframe[title="Módulo Administração"]');await admin.waitFor();const a=await(await admin.elementHandle()).contentFrame();await a.waitForFunction(()=>vacPagina.pronto());
    const naming=await a.evaluate(()=>{const d=new DOMParser().parseFromString(selRaw('paginaInicial',INICIAIS,'Portal',true),'text/html'),select=d.querySelector('select'),stored=localStorage.getItem('vac.sistemas');try{localStorage.setItem('vac.sistemas',JSON.stringify([{id:'portal',nome:'Portal',html:'Portal.html'}]));return{value:select.value,label:select.selectedOptions[0].textContent,route:VAC_INICIAL_ALVO.Portal,name:systems().find(s=>s.id==='portal').nome,unchanged:JSON.parse(localStorage.getItem('vac.sistemas'))[0].nome}}finally{if(stored===null)localStorage.removeItem('vac.sistemas');else localStorage.setItem('vac.sistemas',stored)}});
    assert.equal(naming.value,'Portal');assert.equal(naming.label,'Visão da linha');assert.deepEqual(naming.route,['portal','']);assert.equal(naming.name,'Administração');assert.equal(naming.unchanged,'Portal');
   }
   const out=path.resolve(__dirname,'../saida/plataforma');fs.mkdirSync(out,{recursive:true});await p.screenshot({path:path.join(out,'acessibilidade-'+width+'-'+theme+'.png')});
   assert.deepEqual(errors,[]);console.log('ok '+width+' '+theme+': foco, fontes, alvos, Status, abas e menus TV/Mais');await c.close();
  }
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
