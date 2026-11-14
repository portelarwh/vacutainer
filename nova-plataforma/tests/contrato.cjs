// Somente demonstração e OPFS fictício; nenhuma pasta da linha é acessada.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../dist/Plataforma.html'));
const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});
(async()=>{let browser;try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
 await page.goto('http://127.0.0.1:'+server.address().port+'/?demo=1');
 for(const name of ['Produção','Waste','Gestão de Gel','Paradas','Equipamentos','Iniciativas / Ações','Linha 360°','Projetos','Administração']){
  await page.locator('.sidebar').getByRole('button',{name,exact:true}).click();
  const frame=await(await page.locator(`iframe[title="Módulo ${name}"]`).elementHandle()).contentFrame();
  await frame.waitForFunction(()=>window.vacPagina?.pronto(),{timeout:30000});
  assert.deepEqual(await frame.evaluate(()=>['pendente','conectado','conectar','ir','abas','abrirOrdem'].filter(k=>typeof vacPagina[k]!=='function')),[]);
  const tabs=await frame.evaluate(()=>vacPagina.abas());await page.waitForFunction(()=>document.querySelectorAll('.module-tabs button').length>0||location.hash.includes('projetos'));const shell=await page.locator('.module-tabs button').allTextContents();assert.deepEqual(shell,tabs.map(t=>t.label),name+' abas completas');console.log('ok contrato e abas '+name+' ('+tabs.length+')');
 }
 assert.deepEqual(errors,[]);
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
