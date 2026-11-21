// Somente demonstração e OPFS fictício; nenhuma pasta da linha é acessada.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../../Plataforma.html'));
const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});
(async()=>{let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
 await page.goto('http://127.0.0.1:'+server.address().port+'/?demo=1');
 for(const name of ['Produção','Waste','Gestão de Gel','Paradas','Equipamentos','Iniciativas / Ações','Linha 360°','Projetos','Administração']){
  await page.locator('.sidebar').getByRole('button',{name,exact:true}).click();
  const frame=await(await page.locator(`iframe[title="Módulo ${name}"]`).elementHandle()).contentFrame();
  await frame.waitForFunction(()=>window.vacPagina?.pronto(),{timeout:30000});
  assert.deepEqual(await frame.evaluate(()=>['pendente','conectado','conectar','ir','abas','abrirOrdem'].filter(k=>typeof vacPagina[k]!=='function')),[]);
  const tabs=await frame.evaluate(()=>vacPagina.abas()),MOVIDAS=['geral','fila','reuniao','rel','imp'],ficam=name==='Administração'?tabs.filter(t=>!MOVIDAS.includes(t.id)):tabs,n=ficam.length>1?ficam.length:0;
  await page.waitForFunction(n=>document.querySelectorAll('.module-tabs button').length===n,n);const shell=await page.evaluate(()=>[...document.querySelectorAll('.module-tabs button')].map(b=>{const c=b.cloneNode(true);c.querySelectorAll('.tab-selo').forEach(x=>x.remove());return c.textContent}));assert.deepEqual(shell,n?ficam.map(t=>t.label):[],name+' abas completas');
  /* LANC-04 · o selo de estado (em construção / atualizando) aparece só onde a página diz */
  const selos=await page.evaluate(()=>[...document.querySelectorAll('.module-tabs button')].map(b=>b.querySelector('.tab-selo')?.textContent||''));assert.deepEqual(selos,n?ficam.map(t=>({'construção':'em construção','atualização':'atualizando'})[t.estado]||''):[],name+' selos de estado');
  if(name==='Administração'){assert.deepEqual(tabs.filter(t=>MOVIDAS.includes(t.id)).map(t=>t.id).sort(),[...MOVIDAS].sort(),'Portal ainda tem as abas transferidas');
   const vistas=[];for(const pg of ['inicio','relatorios','importacoes']){await page.evaluate(pg=>location.hash='#/'+pg,pg);await page.waitForTimeout(400);vistas.push(...await page.locator('.page-tabs button').allTextContents())}
   for(const l of ['Situação da linha','Pendências e ações','Reunião diária','Todos os relatórios','Importação por página'])assert.ok(vistas.includes(l),'aba transferida na casca: '+l);console.log('ok Administração só com cadastros; Visão geral, Pendências, Reunião, Relatórios e Importação nas páginas da casca')}
  console.log('ok contrato e abas '+name+' ('+tabs.length+')');
 }
 assert.deepEqual(errors,[]);
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
