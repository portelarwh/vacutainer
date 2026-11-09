// NV-01–NV-05: regressões de origem, concorrência e recuperação. Dados fictícios; node testes/tnv.js.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'saida'),R=[];fs.mkdirSync(OUT,{recursive:true});let browser;
async function open(ctx,name,hash=''){const p=await ctx.newPage();p.on('dialog',d=>d.accept());await p.goto('file://'+ROOT+'/paginas/'+encodeURI(name)+hash);await p.waitForTimeout(750);return p;}
async function run(id,fn){if(process.env.VAC_NV_FILTRO&&!id.includes(process.env.VAC_NV_FILTRO))return;try{R.push({id,...await fn()})}catch(e){R.push({id,erro:e.stack})}fs.writeFileSync(path.join(OUT,'tnv.json'),JSON.stringify({resultados:R},null,2));console.log((R[R.length-1].aprovado?'ok   ':'FALHA ')+id+' '+JSON.stringify(R[R.length-1]));}
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
  },{key,file,list});await ctx.close();return{aprovado:d.salvosEmA.includes('AUD-SO-NA-A')&&!d.depoisB.includes('AUD-SO-NA-A'),esperado:'Trocar a pasta não interpreta os registros de outra base como operações sobrescritas.',...d};
 });
}
// NV-02: duas abas entram durante a leitura lenta; a segunda deve aguardar e então recusar.
for(const [name,key]of [['Portal.html','portal'],['Perdas-Ordem.html','perdas']]){
 await run('NV02-'+key,async()=>{
  const ctx=await browser.newContext(),a=await open(ctx,name),b=await open(ctx,name);
  const prepare=(p,mark)=>p.evaluate(({key,mark})=>{
   const failRead=()=>new Promise((ok,no)=>{window.__liberarLeitura=()=>no(Object.assign(new Error('falha sintética'),{name:'NotReadableError'}));});
   if(key==='portal'){Store.mode='pasta';Store.dir={};Store.pending=false;App.afterChange=()=>{};Store.readRemote=failRead;}
   else{ST.mode='pasta';ST.dir={};ST.pending=false;window.renderAll=()=>{};window.readRemote=failRead;}
   window.__editar=()=>key==='portal'?Store.commit('concorrência',x=>x.config[mark]=true):commit('concorrência',x=>x.config[mark]=true);
   window.__resultado='aguardando';window.__editar().then(()=>window.__resultado='concluida',e=>window.__resultado=e.name);
  },{key,mark});
  await prepare(a,'AUD_A');await a.waitForFunction(()=>typeof window.__liberarLeitura==='function');await prepare(b,'AUD_B');await b.waitForTimeout(150);
  const segundaLeuAntes=await b.evaluate(()=>typeof window.__liberarLeitura==='function');
  await a.evaluate(()=>window.__liberarLeitura());await a.waitForFunction(()=>window.__resultado!=='aguardando');
  if(segundaLeuAntes)await b.evaluate(()=>window.__liberarLeitura());await b.waitForFunction(()=>window.__resultado!=='aguardando',null,{timeout:3000}).catch(async e=>{throw new Error(e.message+' '+JSON.stringify(await b.evaluate(()=>({resultado:window.__resultado,pendente:ST.pending,ler:typeof window.__liberarLeitura,abas:Object.entries(localStorage).filter(([k])=>k.startsWith('vac.aba.'))}))))});
  const antes=await b.evaluate(async key=>{const d=key==='portal'?await Store.idb.get('base'):await IDB.get('base');return{resultado:window.__resultado,A:!!d.config.AUD_A,B:!!d.config.AUD_B}},key);
  await a.close();
  const depois=await b.evaluate(async key=>{if(key==='portal')Store.readRemote=()=>Promise.reject(Error('offline'));else window.readRemote=()=>Promise.reject(Error('offline'));try{await window.__editar()}catch(e){return{erro:e.message}}const d=key==='portal'?await Store.idb.get('base'):await IDB.get('base');return{A:!!d.config.AUD_A,B:!!d.config.AUD_B}},key);
  const s=await b.evaluate(()=>vacFila.saude());await ctx.close();
  return{aprovado:!segundaLeuAntes&&antes.resultado==='VacAbaBloqueada'&&antes.A&&!antes.B&&depois.A&&depois.B&&s.copias[key]===true,segundaLeuAntes,antes,depois,saude:s};
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
 return{aprovado:second.estado==='erro'&&second.produzido===undefined,esperado:'Cache persistido da RaizA/Linha não deve ser usado como cópia da RaizB/Linha.',primeira:first,segunda:second};
});
// NV-04: reserva por operação nas três páginas, inclusive recuperação do IDB sem recarregar.
for(const[name,key,list]of[['Iniciativas.html','inic','acoes'],['Equipamentos.html','equip','os'],['Paradas.html','paradas','acoes']]){
 await run('NV04-reserva-'+key,async()=>{
 const ctx=await browser.newContext();await ctx.addInitScript(()=>{const old=indexedDB.open.bind(indexedDB);window.__falhaIDB=true;indexedDB.open=(n,v)=>{if(n==='vac-fila'&&window.__falhaIDB)throw Error('falha sintética de IndexedDB');return old(n,v)}});
 const a=await open(ctx,name),b=await open(ctx,name);
 for(const[p,id]of[[a,'RESERVA-A'],[b,'RESERVA-B']]){await p.evaluate(({key,id})=>{const it={id,titulo:id,status:key==='inic'?'a fazer':'aberta',equipamento:'EQ01',tipo:'corretiva',origem:{tipo:'manual'},criadaEm:new Date().toISOString(),vinculos:[],apontamentos:[]};Store.commit(key==='inic'?{k:'nova',a:it}:key==='equip'?{k:'os',it}:{k:'list',c:'acoes',items:[it]});clearTimeout(Store.t)},{key,id});await p.waitForTimeout(150)}
 const saude=await b.evaluate(()=>vacFila.saude());await a.close();await b.close();const q=await open(ctx,name);
 const d=await q.evaluate(async list=>{const antes=Store.data[list].map(x=>x.id);window.__falhaIDB=false;await Store.init();await Store.fila._p;return{antes,depois:Store.data[list].map(x=>x.id),queue:Store.queue.length,erro:Store.fila.erro}},list);await ctx.close();return{aprovado:d.antes.includes('RESERVA-A')&&d.antes.includes('RESERVA-B')&&d.depois.includes('RESERVA-A')&&d.depois.includes('RESERVA-B')&&d.queue===2&&!d.erro&&saude.reservas[key]===2,...d,saude};
 });
}
await run('NV01-pendente-nao-migra-e-legado-nao-reaplica',async()=>{
 const ctx=await browser.newContext(),p=await open(ctx,'Iniciativas.html');const d=await p.evaluate(async()=>{
  const raiz=await navigator.storage.getDirectory(),a=await raiz.getDirectoryHandle('A',{create:true}),b=await raiz.getDirectoryHandle('B',{create:true});const base=JSON.parse(JSON.stringify(Store.data));
  for(const dir of[a,b]){const bs=await dir.getDirectoryHandle('00. Bases',{create:true}),w=await(await bs.getFileHandle(PAGE.baseFile,{create:true})).createWritable();await w.write(JSON.stringify(base));await w.close()}
  IDB.set=async()=>{};await Store.usar(a);const op={k:'nova',a:{id:'PEND-A',titulo:'Pendente A',status:'a fazer'}};Store.commit(op);clearTimeout(Store.t);await Store.fila._p;let erro='';try{await Store.usar(b)}catch(e){erro=e.message}
  const naoMudou=await Store.dir.isSameEntry(a),q=Store.queue.map(o=>o.a.id);
  await Store.save();await Store.fila._p;await Store.fila.confirmar([{qid:'LEGADO',id:'LEGADO',k:'nova',a:{id:'LEGADO',titulo:'Sem origem',status:'a fazer'}}]);await Store.usar(b);
  const j=JSON.parse(await(await(await(await b.getDirectoryHandle('00. Bases')).getFileHandle(PAGE.baseFile)).getFile()).text());const antigas=await Store.fila.confirmadas();
  return{erro,naoMudou,q,idsB:j.acoes.map(x=>x.id),legadoPreservado:antigas.some(x=>x.qid==='LEGADO')};
 });await ctx.close();return{aprovado:/outra pasta/.test(d.erro)&&d.naoMudou&&d.q.includes('PEND-A')&&d.idsB.length===0&&d.legadoPreservado,...d};
});
await run('NV03-mesma-pasta-offline',async()=>{
 const ctx=await browser.newContext(),p=await open(ctx,'Iniciativas.html');await p.evaluate(async()=>{const dir=await navigator.storage.getDirectory(),bs=await dir.getDirectoryHandle('00. Bases',{create:true}),w=await(await bs.getFileHandle('oee-vacutainer-base.json',{create:true})).createWritable();await w.write(JSON.stringify({exports:{exportsVersion:1,porOrdem:[{ordem:'123',produzido:111}]}}));await w.close();window.vacPastaAtual=()=>dir;await vacFicha.carregar(true);const wr=await(await bs.getFileHandle('oee-vacutainer-base.json')).createWritable();await wr.write('{');await wr.close()});await p.close();const q=await open(ctx,'Iniciativas.html');const d=await q.evaluate(async()=>{const dir=await navigator.storage.getDirectory();window.vacPastaAtual=()=>dir;await vacFicha.carregar();return{estado:vacFicha._S.dados.oee.estado,produzido:vacFicha._S.dados.oee.d?.porOrdem?.[0]?.produzido}});await ctx.close();return{aprovado:d.estado==='cache'&&d.produzido===111,...d};
});
await run('NV05-saude-snapshot',async()=>{const ctx=await browser.newContext(),p=await open(ctx,'Portal.html');const d=await p.evaluate(async()=>{await Store.commit('saúde',b=>b.config.nvSaude=true);Vers.dados={fila:await vacFila.contar(),saude:await vacFila.saude(),L:[],libs:[]};return{pendente:Store.pending,indicador:Vers.pendentes('portal')}});await ctx.close();return{aprovado:d.pendente&&d.indicador==='cópia pendente',...d};});
await run('NV02-sem-WebLocks-nao-muta',async()=>{const ctx=await browser.newContext(),p=await open(ctx,'Portal.html');const d=await p.evaluate(async()=>{Object.defineProperty(navigator,'locks',{value:undefined});let erro='';try{await Store.commit('sem trava',b=>b.config.naoPode=true)}catch(e){erro=e.message}return{erro,alterou:!!Store.B.config.naoPode}});await ctx.close();return{aprovado:!d.alterou&&/proteção entre abas/.test(d.erro),...d};});
await run('NV01-filas-orfas-de-duas-origens',async()=>{
 const ctx=await browser.newContext(),a=await open(ctx,'Iniciativas.html');await a.evaluate(async()=>{const r=await navigator.storage.getDirectory();for(const n of['A','B']){const d=await r.getDirectoryHandle(n,{create:true}),b=await d.getDirectoryHandle('00. Bases',{create:true}),w=await(await b.getFileHandle(PAGE.baseFile,{create:true})).createWritable();await w.write(JSON.stringify(Store.data));await w.close()}});const b=await open(ctx,'Iniciativas.html');
 for(const[p,n]of[[a,'A'],[b,'B']])await p.evaluate(async n=>{IDB.set=async()=>{};const dir=await(await navigator.storage.getDirectory()).getDirectoryHandle(n);await Store.usar(dir);Store.commit({k:'nova',a:{id:'PEND-'+n,titulo:n,status:'a fazer'}});clearTimeout(Store.t);await Store.fila._p},n);
 await a.close();await b.close();const q=await open(ctx,'Iniciativas.html');const d=await q.evaluate(async()=>{IDB.set=async()=>{};const r=await navigator.storage.getDirectory(),res={};for(const n of['A','B']){const d=await r.getDirectoryHandle(n);await Store.usar(d);const j=JSON.parse(await(await(await(await d.getDirectoryHandle('00. Bases')).getFileHandle(PAGE.baseFile)).getFile()).text());res[n]=j.acoes.map(x=>x.id)}return res});await ctx.close();return{aprovado:d.A.join(',')==='PEND-A'&&d.B.join(',')==='PEND-B',...d};
});
await run('NV04-copia-recuperacao-e-mista',async()=>{
 const ctx=await browser.newContext();await ctx.addInitScript(()=>{const old=indexedDB.open.bind(indexedDB);window.__falha=true;indexedDB.open=(n,v)=>{if(n==='vac-fila'&&window.__falha)throw Error('simulada');return old(n,v)}});const a=await open(ctx,'Iniciativas.html'),b=await open(ctx,'Iniciativas.html');
 await a.evaluate(async()=>{Store.commit({k:'nova',a:{id:'A',titulo:'A',status:'a fazer'}});clearTimeout(Store.t);await Store.fila._p});
 await b.evaluate(async()=>{window.__falha=false;Store.commit({k:'nova',a:{id:'B',titulo:'B',status:'a fazer'}});clearTimeout(Store.t);await Store.fila._p});
 const preservou=await b.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('vac.reserva.inic|')).map(k=>JSON.parse(localStorage.getItem(k)).op.a.id));await a.close();await b.close();const q=await open(ctx,'Iniciativas.html');await q.evaluate(async()=>{window.__falha=false;await Store.init();render()});const download=q.waitForEvent('download');await q.click('[data-vac-recuperacao]');const arq=await download;const copia=JSON.parse(fs.readFileSync(await arq.path(),'utf8'));const ids=copia.pendentes.map(o=>o.a.id).sort();const qt=await q.evaluate(()=>Store.queue.length);await ctx.close();return{aprovado:preservou.includes('A')&&ids.join(',')==='A,B'&&qt===2,preservou,ids,qt};
});
await run('NV05-verificacao-parcial-e-cadastro',async()=>{const ctx=await browser.newContext(),p=await open(ctx,'Portal.html');const d=await p.evaluate(async()=>{await Store.commit('saúde',b=>b.config.t=true);await vacFila('portal-cad').espelhar([{qid:'q-cad'}]);Vers.dados={fila:await vacFila.contar(),saude:await vacFila.saude()};const completa=Vers.pendentes('portal');Vers.dados.saude.copias.portal=null;Vers.dados.fila={};const desconhecida=Vers.pendentes('portal');return{completa,desconhecida}});await ctx.close();return{aprovado:/cópia pendente/.test(d.completa)&&/1 na fila/.test(d.completa)&&d.desconhecida===null,...d};});
await run('NV01-identidade-por-handle-persistido',async()=>{
 const ctx=await browser.newContext(),p=await open(ctx,'Iniciativas.html');const antes=await p.evaluate(async()=>{const raiz=await navigator.storage.getDirectory(),a=await raiz.getDirectoryHandle('A',{create:true}),b=await raiz.getDirectoryHandle('B',{create:true});const original=navigator.storage.getDirectory.bind(navigator.storage);navigator.storage.getDirectory=async()=>{throw Error('usar identificação por handle')};try{return{a:await vacOrigemPasta(a),a2:await vacOrigemPasta(a),b:await vacOrigemPasta(b)}}finally{navigator.storage.getDirectory=original}});await p.close();const q=await open(ctx,'Iniciativas.html');const depois=await q.evaluate(async()=>{const raiz=await navigator.storage.getDirectory(),a=await raiz.getDirectoryHandle('A');navigator.storage.getDirectory=async()=>{throw Error('usar identificação por handle')};return vacOrigemPasta(a)});await ctx.close();return{aprovado:antes.a===antes.a2&&antes.a!==antes.b&&depois===antes.a,antes,depois};
});
await run('NV04-reserva-mais-nova-nao-e-apagada',async()=>{const ctx=await browser.newContext(),p=await open(ctx,'Iniciativas.html');const d=await p.evaluate(async()=>{const f=vacFila('nv-reserva-teste'),op={qid:'r1',valor:'antigo'};f.reservar([op]);const gravando=f.espelhar([op]);await Promise.resolve();op.valor='novo';f.reservar([op]);await gravando;const reserva=JSON.parse(localStorage.getItem('vac.reserva.nv-reserva-teste|r1')||'null'),duravel=await f.minhas();return{reserva:reserva?.op?.valor,duravel:duravel[0]?.valor}});await ctx.close();return{aprovado:d.reserva==='novo'&&d.duravel==='antigo',...d};});
await browser.close();const n=R.filter(x=>!x.aprovado).length;console.log(n?n+' falha(s)':'sem erros');process.exitCode=n?1:0;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
