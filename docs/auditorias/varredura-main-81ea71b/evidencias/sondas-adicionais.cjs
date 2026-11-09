const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=process.env.VAC_AUDIT_ROOT||'/workspace/verificacao-main-81ea71b',OUT=__dirname,R=[];let browser;
async function open(ctx,name,hash=''){const p=await ctx.newPage();p.on('dialog',d=>d.accept());await p.goto('file://'+ROOT+'/paginas/'+encodeURI(name)+hash);await p.waitForTimeout(750);return p;}
async function run(id,fn){try{R.push({id,...await fn()})}catch(e){R.push({id,erro:e.stack})}fs.writeFileSync(path.join(OUT,'sondas.json'),JSON.stringify({commit:'81ea71bb82cc62f08360684c7ce1a5df54697202',resultados:R},null,2));console.log(JSON.stringify(R[R.length-1]));}
(async()=>{
browser=await chromium.launch();
// S01: operações confirmadas são deste módulo, mas também precisam pertencer à base/pasta.
for(const [name,key,file,list]of [['Iniciativas.html','inic','iniciativas-base.json','acoes'],['Equipamentos.html','equip','equipamentos-base.json','os'],['Paradas.html','paradas','paradas-base.json','acoes']]){
 await run('S01-confirmadas-outra-pasta-'+key,async()=>{
  const ctx=await browser.newContext(),p=await open(ctx,name);
  const d=await p.evaluate(async({key,file,list})=>{
   const root=await navigator.storage.getDirectory();for await(const[n]of root.entries())await root.removeEntry(n,{recursive:true});
   const base=JSON.parse(JSON.stringify(Store.data));base.rev=3;base.revId='r3';base.appVersion=APP_VERSION;base.auditoria=[];
   const create=async nome=>{const dir=await root.getDirectoryHandle(nome,{create:true}),b=await dir.getDirectoryHandle('00. Bases',{create:true}),w=await(await b.getFileHandle(file,{create:true})).createWritable();await w.write(JSON.stringify(base));await w.close();return dir};
   const a=await create('Pasta-A'),b=await create('Pasta-B');const oldSet=IDB.set;IDB.set=async(k,v)=>k==='pasta'?undefined:oldSet.call(IDB,k,v);
   await Store.usar(a);
   const it={id:'AUD-SO-NA-A',titulo:'Registro criado na pasta A',status:key==='inic'?'a fazer':'aberta',equipamento:'EQ01',tipo:'corretiva',criadaEm:new Date().toISOString(),origem:{tipo:'manual'},vinculos:[],apontamentos:[]};
   Store.commit(key==='inic'?{k:'nova',a:it}:key==='equip'?{k:'os',it}:{k:'list',c:'acoes',items:[it]});clearTimeout(Store.t);await Store.save();await Store.fila._p;
   const read=async d=>JSON.parse(await(await(await(await d.getDirectoryHandle('00. Bases')).getFileHandle(file)).getFile()).text());
   const savedA=(await read(a))[list].map(x=>x.id),beforeB=(await read(b))[list].map(x=>x.id),confirmed=(await Store.fila.confirmadas()).length;
   await Store.usar(b);await new Promise(r=>setTimeout(r,250));await Store.save();await Store.fila._p;const afterB=(await read(b))[list].map(x=>x.id);
   return{salvosEmA:savedA,antesB:beforeB,confirmadasAntesDeTrocar:confirmed,depoisB:afterB,erro:Store.lastErr||Store.err||'',fila:Store.queue.length};
  },{key,file,list});await ctx.close();return{reproduzido:!d.antesB.includes('AUD-SO-NA-A')&&d.depoisB.includes('AUD-SO-NA-A'),esperado:'Trocar a pasta não interpreta os registros de outra base como operações sobrescritas.',...d};
 });
}
// S02: as duas abas passam pela guarda antes da primeira leitura assíncrona terminar.
for(const [name,key]of [['Portal.html','portal'],['Perdas-Ordem.html','perdas']]){
 await run('S02-guardas-simultaneas-'+key,async()=>{
  const ctx=await browser.newContext(),a=await open(ctx,name),b=await open(ctx,name);
  const prepare=(p,mark)=>p.evaluate(({key,mark})=>{
   vacFila(key).marcarPendente(false);
   const failRead=()=>new Promise((ok,no)=>{window.__liberarLeitura=()=>no(Object.assign(new Error('falha de leitura sintética'),{name:'NotReadableError'}));});
   let task;
   if(key==='portal'){Store.mode='pasta';Store.dir={};Store.pending=false;App.afterChange=()=>{};Store.readRemote=failRead;task=Store.commit('Auditoria concorrente',B=>{B.config[mark]=true})}
   else{ST.mode='pasta';ST.dir={};ST.pending=false;window.renderAll=()=>{};window.readRemote=failRead;task=commit('Auditoria concorrente',B=>{B.config[mark]=true})}
   window.__resultado='aguardando';task.then(()=>window.__resultado='concluida',e=>window.__resultado=e.name+':'+e.message);
  },{key,mark});
  await prepare(a,'AUD_A');await prepare(b,'AUD_B');await a.waitForFunction(()=>typeof window.__liberarLeitura==='function');await b.waitForFunction(()=>typeof window.__liberarLeitura==='function');
  await a.evaluate(()=>window.__liberarLeitura());await a.waitForFunction(()=>window.__resultado!=='aguardando');
  await b.evaluate(()=>window.__liberarLeitura());await b.waitForFunction(()=>window.__resultado!=='aguardando');
  const d=await b.evaluate(async key=>{const cache=key==='portal'?await Store.idb.get('base'):await IDB.get('base');return{resultadoB:window.__resultado,marcasPersistidas:{A:!!cache.config.AUD_A,B:!!cache.config.AUD_B},pendente:key==='portal'?Store.pending:ST.pending,contagemFilaDuravel:await vacFila.contar()};},key);
  d.resultadoA=await a.evaluate(()=>window.__resultado);await ctx.close();return{reproduzido:d.resultadoA==='concluida'&&d.resultadoB==='concluida'&&!d.marcasPersistidas.A&&d.marcasPersistidas.B,esperado:'A segunda edição deve bloquear antes de gravar uma cópia pendente incompatível; as duas alterações não podem ser dadas como recuperáveis num único snapshot sobrescrito.',...d};
 });
}
// S03: cache persistido distingue apenas o nome final da pasta.
await run('S03-ficha-pastas-homonimas',async()=>{
 const ctx=await browser.newContext(),p=await open(ctx,'Iniciativas.html');
 const first=await p.evaluate(async()=>{
  const root=await navigator.storage.getDirectory();for await(const[n]of root.entries())await root.removeEntry(n,{recursive:true});
  for(const [nome,txt]of [['RaizA',JSON.stringify({exports:{exportsVersion:1,porOrdem:[{ordem:'AUD-1',mes:'2026-11',produzido:111}]}})],['RaizB','{json quebrado']]){
   const d=await(await root.getDirectoryHandle(nome,{create:true})).getDirectoryHandle('Linha',{create:true}),bs=await d.getDirectoryHandle('00. Bases',{create:true}),w=await(await bs.getFileHandle('oee-vacutainer-base.json',{create:true})).createWritable();await w.write(txt);await w.close();
  }
  const a=await(await root.getDirectoryHandle('RaizA')).getDirectoryHandle('Linha');window.vacPastaAtual=()=>a;await vacFicha.carregar(true);return{estado:vacFicha._S.dados.oee.estado,pasta:vacFicha._S.dados.oee.pasta};
 });await p.close();const q=await open(ctx,'Iniciativas.html');
 const second=await q.evaluate(async()=>{const root=await navigator.storage.getDirectory(),b=await(await root.getDirectoryHandle('RaizB')).getDirectoryHandle('Linha');window.vacPastaAtual=()=>b;await vacFicha.carregar();const d=vacFicha._S.dados.oee;return{estado:d.estado,pasta:d.pasta,motivo:d.motivo,produzido:d.d?.porOrdem?.[0]?.produzido};});await ctx.close();
 return{reproduzido:second.estado==='cache'&&second.produzido===111,esperado:'Cache persistido da RaizA/Linha não deve ser usado como cópia da RaizB/Linha.',primeira:first,segunda:second};
});
// S04: a reserva sem IndexedDB é um snapshot único, inclusive com múltiplas abas.
await run('S04-duas-abas-sem-idb',async()=>{
 const ctx=await browser.newContext();await ctx.addInitScript(()=>{const old=indexedDB.open.bind(indexedDB);indexedDB.open=(n,v)=>{if(n==='vac-fila')throw Error('falha de IndexedDB sintética');return old(n,v)}});
 const a=await open(ctx,'Iniciativas.html'),b=await open(ctx,'Iniciativas.html');
 for(const [p,id]of [[a,'RESERVA-A'],[b,'RESERVA-B']]){await p.evaluate(id=>Store.commit({k:'nova',a:{id,titulo:id,status:'a fazer',criadaEm:new Date().toISOString(),origem:{tipo:'manual'}}}),id);await p.waitForTimeout(150)}
 const before=await b.evaluate(()=>({reserva:JSON.parse(localStorage.getItem('inic.fila.reserva')||'[]').map(x=>x.a.id),aviso:!!Store.fila.erro}));await a.close();await b.close();const q=await open(ctx,'Iniciativas.html');
 const after=await q.evaluate(()=>({fila:Store.queue.map(x=>x.a?.id),acoes:Store.data.acoes.map(x=>x.id),aviso:!!Store.fila.erro}));await ctx.close();
 return{reproduzido:!after.acoes.includes('RESERVA-A')&&after.acoes.includes('RESERVA-B'),limite:'A aplicação mostra alterações não protegidas; a fila normal com IndexedDB funcional não é este cenário.',antes:before,depois:after};
});
await browser.close();console.log('SONDAS CONCLUÍDAS');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
