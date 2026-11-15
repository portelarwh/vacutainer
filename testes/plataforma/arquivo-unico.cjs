// Copia SOMENTE o produto para um diretório vazio. Sem fontes, paginas, dist ou node_modules ao lado.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),H=require('../../scripts/html.cjs');
(async()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'vac-html-sozinho-'));
 const target=path.join(temporary,'Plataforma.html');fs.copyFileSync(H.FILE,target);
 const requests=[],errors=[];
 const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://teste').pathname;
  if(pathname!=='/Plataforma.html'){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(target));
 });
 let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(new URL(r.url()).pathname);});
  await page.goto('http://127.0.0.1:'+server.address().port+'/Plataforma.html?demo=1');
  await page.getByRole('heading',{name:'Visão da linha.'}).waitFor();
  const labels={portal:'Administração',oee:'Produção',perdas:'Waste',gel:'Gestão de Gel',paradas:'Paradas',equip:'Equipamentos',inic:'Iniciativas / Ações',linha:'Linha 360°',projetos:'Projetos'};
  for(const id of Object.values(H.names)){
   await page.evaluate(id=>location.hash='#/'+id,id);
   const iframe=page.locator('iframe[title="Módulo '+labels[id]+'"]');await iframe.waitFor();
   const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>vacPagina.pronto());
  }
  await page.evaluate(()=>location.hash='#/saude');await page.getByRole('heading',{name:'Saúde dos dados.'}).waitFor();
  for(const name of ['Verificar pasta','Comparar importação']){
   const popup=page.waitForEvent('popup');await page.getByRole('button',{name,exact:true}).click();const tool=await popup;
   await tool.waitForLoadState('domcontentloaded');assert.ok((await tool.locator('body').innerText()).length>100);await tool.close();
  }
  // Também cobre o caminho real: uma atribuição location.href de um botão antigo
  // deve virar rota da casca, sem navegação para um arquivo irmão inexistente.
  const real=await browser.newContext();const q=await real.newPage();q.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(new URL(r.url()).pathname);});q.on('pageerror',e=>errors.push(e.message));
  await q.goto('http://127.0.0.1:'+server.address().port+'/Plataforma.html#/oee');
  const iframe=q.locator('iframe[title="Módulo Produção"]');await iframe.waitFor();const frame=await(await iframe.elementHandle()).contentFrame();await frame.waitForFunction(()=>vacPagina.pronto());
  await frame.evaluate(()=>{location.href='Portal.html#cadastros/turnos';});
  await q.waitForFunction(()=>location.hash.startsWith('#/portal'));
  // Ctrl+clique também deve abrir o HTML único, preservando o contexto da rota.
  const portal=await(await q.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame();
  await portal.waitForFunction(()=>vacPagina.pronto());
  await portal.evaluate(()=>{const a=document.createElement('a');a.id='linkConsolidado';a.href='Gestao-Gel-Vacutainer.html#aba=relatorios';a.textContent='Link de verificação';document.body.appendChild(a);});
  const newTab=q.waitForEvent('popup');await portal.locator('#linkConsolidado').click({modifiers:['Control']});const linked=await newTab;
  await linked.waitForLoadState('domcontentloaded');assert.equal(new URL(linked.url()).pathname,'/Plataforma.html');assert.ok(linked.url().includes('#/gel'));
  await linked.close();
  assert.deepEqual(requests.filter(p=>p.endsWith('.html')&&p!=='/Plataforma.html'),[],'produto pediu uma página antiga');
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readdirSync(temporary),['Plataforma.html']);
  console.log('ok HTML copiado sozinho: nove módulos, ferramentas incorporadas e navegação real sem páginas antigas');
 }finally{await browser?.close();server.close();fs.rmSync(temporary,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
