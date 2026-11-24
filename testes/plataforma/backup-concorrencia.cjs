// Duas estações SIMULADAS: realms, storage e locks separados; diretório OPFS compartilhado.
// A barreira força as duas leituras antes das escritas. Não homologa SMB ou dois computadores.
const {chromium}=require('playwright'),http=require('node:http'),assert=require('node:assert/strict');
const {handler}=require('../../scripts/servidor-testes.cjs');
(async()=>{
 const root=`<!doctype html><html><body><script>
 let liberar;const leituras=new Promise(r=>liberar=r);let n=0;
 window.aguardarLeitura=()=>{if(++n===2)liberar();return leituras};
 </script><iframe id="a" src="/__modulos__/Paradas.html?estacao=a"></iframe><iframe id="b" src="/__modulos__/Paradas.html?estacao=b"></iframe></body></html>`;
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end(root);}return handler(req,res);});let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch(require('./chromium.cjs')());
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await context.addInitScript(()=>{
   const tag=new URL(location.href).searchParams.get('estacao');if(!tag)return;
   const raw=localStorage,prefix='ficticia-'+tag+'.';
   Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>raw.getItem(prefix+k),setItem:(k,v)=>raw.setItem(prefix+k,String(v)),removeItem:k=>raw.removeItem(prefix+k)}});
   localStorage.setItem('vac.backup.estacao','estacao-'+tag);localStorage.setItem('vac.userId','pessoa-'+tag);
   const original=navigator.locks;
   Object.defineProperty(navigator,'locks',{configurable:true,value:{request:(name,...args)=>original.request(prefix+name,...args)}});
   const get=FileSystemFileHandle.prototype.getFile;let primeira=true;
   FileSystemFileHandle.prototype.getFile=async function(){const snapshot=await get.call(this);if(primeira&&/^registro-backup[-.]/.test(this.name)){primeira=false;await parent.aguardarLeitura();}return snapshot;};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  const a=await(await page.locator('#a').elementHandle()).contentFrame(),b=await(await page.locator('#b').elementHandle()).contentFrame();
  await Promise.all([a.waitForFunction(()=>vacPagina.pronto()),b.waitForFunction(()=>vacPagina.pronto())]);
  await page.evaluate(async()=>{
   const root=await(await navigator.storage.getDirectory()).getDirectoryHandle('Somente-Logs-Ficticios',{create:true});
   window.shared=await(await root.getDirectoryHandle('00. Backups',{create:true})).getDirectoryHandle('Paradas',{create:true});
   window.legacy=JSON.stringify({em:'2026-11-15T12:00:00Z',pagina:'paradas',ok:false,erro:'falha legada'})+'\n';
   const w=await(await shared.getFileHandle('registro-backup.log',{create:true})).createWritable();await w.write(legacy);await w.close();
  });
  await Promise.all([a.evaluate(()=>vacBackupRegistro.registrar('paradas',{erro:'falha estação A',dir:structuredClone(parent.shared)})),b.evaluate(()=>vacBackupRegistro.registrar('paradas',{erro:'falha estação B',dir:structuredClone(parent.shared)}))]);
  const result=await a.evaluate(()=>vacBackupRegistro.ler('paradas',structuredClone(parent.shared)));
  assert.equal(result.registros.length,2);assert.deepEqual(result.registros.map(r=>r.erro).sort(),['falha estação A','falha estação B']);assert.equal(result.aberta,true);   // o registro-backup.log único não é lido (base limpa)
  assert.equal(await page.evaluate(async()=>await(await(await shared.getFileHandle('registro-backup.log')).getFile()).text()===legacy),true);
  assert.deepEqual(errors,[]);console.log('ok duas estações simuladas em OPFS: eventos preservados, leitura consolidada e o registro-backup.log único ignorado e intacto');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
