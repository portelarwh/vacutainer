// Bases em "00. Bases" (kit vac-bases, 06/11/2026): cada página move a própria base da raiz para 00. Bases, com cópia em 00. Backups;
// as outras páginas leem de 00. Bases (ou da raiz, enquanto a base não foi movida); cópia mais nova na raiz não é apagada.
// Usa o sistema de arquivos do próprio navegador (OPFS), com as mesmas operações da pasta da rede. Páginas servidas por HTTP local.
// node testes/tbases.js → "sem erros"; código 1 se falhar
const path=require('path'),fs=require('fs'),http=require('http');const RAIZ=path.resolve(__dirname,'..');
const {chromium}=require('playwright');
const srv=http.createServer((q,r)=>{const f=path.join(RAIZ,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(RAIZ)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':'application/octet-stream'});fs.createReadStream(f).pipe(r)});
(async()=>{await new Promise(r=>srv.listen(0,r));const U=`http://127.0.0.1:${srv.address().port}/paginas/`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const errs=[];
const ok=(c,m)=>{console.log((c?'ok   ':'FALHA ')+m);if(!c)errs.push(m)};
const nova=async(arq,tag)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());await p.goto(U+encodeURI(arq));await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));return p};
const ler=f=>fs.readFileSync(path.join(RAIZ,'testes/bases',f),'utf8');
// funções de pasta (rodam na página): listar raiz/00. Bases/backups e ler arquivo
const LISTA=async()=>{const r=await navigator.storage.getDirectory();const nomes=async d=>{const L=[];for await(const[n,h]of d.entries())L.push(h.kind==='directory'?n+'/':n);return L.sort()};
  let bases=[],bk=[];try{bases=await nomes(await r.getDirectoryHandle('00. Bases'))}catch(e){}
  try{const B=await r.getDirectoryHandle('00. Backups');for await(const[n,h]of B.entries())if(h.kind==='directory')for await(const[m]of h.entries())bk.push(n+'/'+m)}catch(e){}
  return{raiz:await nomes(r),bases,bk}};

// ---- 1. pasta como era: as 7 bases soltas na raiz
const p0=await nova('Portal.html','P0');
await p0.evaluate(async A=>{const r=await navigator.storage.getDirectory();for await(const[n]of r.entries())await r.removeEntry(n,{recursive:true});
  const w=async(n,t)=>{const fh=await r.getFileHandle(n,{create:true});const s=await fh.createWritable();await s.write(t);await s.close()};
  for(const [n,t] of Object.entries(A))await w(n,t);await w('Logo.png','x')},{
  'portal-base.json':JSON.stringify({rev:7,config:{marca:'portal'},audit:[]}),'vacutainer-cadastros.json':JSON.stringify({schema:'vac-cadastros',rev:3,catalogos:[],turnos:[],metasOee:[]}),
  'oee-vacutainer-base.json':ler('oee-vacutainer-base.json'),'ordens-base.json':JSON.stringify({rev:2,revId:'x',competencias:{}}),
  'perdas-base.json':ler('perdas-base.json'),'fifo-base.json':(()=>{const g=JSON.parse(ler('fifo-base.json'));g.config=g.config||{};g.config.marcaTeste='gel-movido';return JSON.stringify(g)})(),'paradas-base.json':ler('paradas-base.json')});
const L0=await p0.evaluate(LISTA);ok(L0.raiz.filter(n=>n.endsWith('.json')).length===7&&!L0.bases.length,'início: 7 bases na raiz, sem 00. Bases');

// ---- 2. Waste abre primeiro: move só a dele; lê o OEE e o Gel que ainda estão na raiz
const w=await nova('Perdas-Ordem.html','W');
const rw=await w.evaluate(async()=>{const d=await navigator.storage.getDirectory();await connectDir(d);await loadOEE(true);await loadGel(true);return{oee:!!OEE.src,gel:!!GEL.src,rev:B.rev}});
let L=await w.evaluate(LISTA);
ok(L.bases.join()==='perdas-base.json'&&!L.raiz.includes('perdas-base.json'),`Waste: perdas-base.json foi para 00. Bases (00. Bases: ${L.bases.join(', ')})`);
ok(L.bk.some(n=>/^Perdas\/perdas-base_antes-de-mover-para-00-Bases_/.test(n)),'Waste: cópia de segurança em 00. Backups/Perdas');
ok(rw.oee&&rw.gel,'Waste: lê OEE e Gel ainda na raiz (bases não movidas)');

// ---- 3. Portal: move portal-base e cadastros; enxerga os módulos (uns em 00. Bases, outros na raiz)
const p=await nova('Portal.html','P');
const rp=await p.evaluate(async()=>{const d=await navigator.storage.getDirectory();await Store.connect(d,{ask:false});await readModules(true);
  return{rev:Store.B.rev,marca:Store.B.config.marca,mods:Object.fromEntries(Object.entries(MOD.data).map(([k,x])=>[k,x.erro?'erro':'ok']))}});
L=await p.evaluate(LISTA);
ok(L.bases.includes('portal-base.json')&&L.bases.includes('vacutainer-cadastros.json')&&!L.raiz.includes('portal-base.json')&&!L.raiz.includes('vacutainer-cadastros.json'),'Portal: portal-base e vacutainer-cadastros foram para 00. Bases');
ok(rp.marca==='portal'&&rp.rev>=7,`Portal: a base movida é a mesma (rev ${rp.rev}, config preservada)`);
ok(['oee','perdas','gel','paradas'].every(k=>rp.mods[k]==='ok'),`Portal: lê os módulos de 00. Bases ou da raiz (${JSON.stringify(rp.mods)})`);

// ---- 4. Produção, Gel e Paradas: cada um move a sua
const o=await nova('OEE-Vacutainer.html','O');
const ro=await o.evaluate(async()=>{const d=await navigator.storage.getDirectory();
  // a base de teste do OEE só tem o exports: troca por uma base vazia válida com o mesmo exports (ainda na raiz, antes de conectar)
  const ex=JSON.parse(await (await (await d.getFileHandle('oee-vacutainer-base.json')).getFile()).text()).exports;const db=Model.emptyBase('teste');db.exports=ex;db.databaseVersion=5;
  const fh=await d.getFileHandle('oee-vacutainer-base.json');const s=await fh.createWritable();await s.write(JSON.stringify(db));await s.close();
  await Store.connect(FolderBackend(d),{ask:false});return{v:Store.S.baseVersion,acc:Store.S.access}});
ok(ro.acc==='readwrite'&&ro.v===5,`Produção: base movida e lida (versão ${ro.v})`);
const g=await nova('Gestão-Gel-Vacutainer.html','G');
const rg=await g.evaluate(async()=>{const d=await navigator.storage.getDirectory();await fsUse(d);return{marca:S.config.marcaTeste,mode:S.mode}});
const a=await nova('Paradas.html','A');
const ra=await a.evaluate(async()=>{const d=await navigator.storage.getDirectory();Store.dir=vacRaiz(d);Store.perm=true;await Store.reload();return{oee:Ext.oeeOk,cad:Ext.cadFonte,found:Store.baseFound}});
L=await a.evaluate(LISTA);
ok(L.raiz.filter(n=>n.endsWith('.json')).length===0,`raiz sem nenhuma base .json (raiz: ${L.raiz.join(', ')})`);
ok(L.bases.length===7,`00. Bases com as 7 bases (${L.bases.join(', ')})`);
ok(L.raiz.includes('Logo.png')&&L.raiz.includes('00. Backups/'),'Logo.png e 00. Backups continuam na raiz');
ok(['OEE','Ordens','Gel','Paradas','Portal','Cadastros','Perdas'].every(m=>L.bk.some(n=>n.startsWith(m+'/')&&/antes-de-mover/.test(n))),'cópia de segurança de cada base na pasta de backup do módulo');
ok(rg.mode==='file'&&rg.marca==='gel-movido',`Gel: base movida e carregada (marca ${rg.marca})`);
ok(ra.found&&ra.oee&&ra.cad==='pasta',`Paradas: base movida; lê OEE e cadastro de 00. Bases (oee ${ra.oee}, cadastro ${ra.cad})`);

// ---- 5. gravação depois de mover: vai para 00. Bases, não recria na raiz
const rgw=await w.evaluate(async()=>{await commit('teste bases',b=>{b.config.testeBases=1});const d=await navigator.storage.getDirectory();let naRaiz=false;try{await d.getFileHandle('perdas-base.json');naRaiz=true}catch(e){}
  const t=await (await (await (await d.getDirectoryHandle('00. Bases')).getFileHandle('perdas-base.json')).getFile()).text();return{naRaiz,gravou:JSON.parse(t).config.testeBases===1}});
ok(!rgw.naRaiz&&rgw.gravou,'Waste grava em 00. Bases e não recria a base na raiz');

// ---- 6. página antiga aberta grava na raiz depois da mudança: cópia mais nova não é apagada; Portal avisa
await w.waitForTimeout(1100);
await w.evaluate(async()=>{const d=await navigator.storage.getDirectory();const fh=await d.getFileHandle('perdas-base.json',{create:true});const s=await fh.createWritable();await s.write(JSON.stringify({rev:999,config:{velha:1}}));await s.close()});
const w2=await nova('Perdas-Ordem.html','W2');
const r6=await w2.evaluate(async()=>{const d=await navigator.storage.getDirectory();const msgs=[];const t0=window.toast;window.toast=m=>msgs.push(m);await connectDir(d);window.toast=t0;let naRaiz=false;try{await d.getFileHandle('perdas-base.json');naRaiz=true}catch(e){}return{naRaiz,rev:B.rev,aviso:msgs.join(' | ')}});
ok(r6.naRaiz&&r6.rev!==999&&/MAIS NOVA/.test(r6.aviso),`cópia mais nova na raiz: mantida, a página usa 00. Bases e avisa ("${r6.aviso.slice(0,70)}…")`);
const r6p=await p.evaluate(async()=>{await Vers.scan();const r=Vers.dados.L.find(x=>x.id==='perdas');return Vers.avisos(r).map(a=>a[0]+': '+a[1]).join(' | ')});
ok(/2 cópias da base/.test(r6p),`Portal › Versões mostra as duas cópias (${r6p.slice(0,90)}…)`);

// ---- 7. cópia antiga na raiz (mais velha que a de 00. Bases): guardada em backup e tirada da raiz
await w2.evaluate(async()=>{const d=await navigator.storage.getDirectory();await d.removeEntry('perdas-base.json');const fh=await d.getFileHandle('perdas-base.json',{create:true});const s=await fh.createWritable();await s.write('{"rev":1}');await s.close()});
await w2.waitForTimeout(1100);await w2.evaluate(async()=>{await commit('mais nova em 00. Bases',b=>{b.config.depois=1})});
const r7=await w2.evaluate(async()=>{const d=await navigator.storage.getDirectory();await connectDir(d);let naRaiz=false;try{await d.getFileHandle('perdas-base.json');naRaiz=true}catch(e){}return{naRaiz}});
L=await w2.evaluate(LISTA);
ok(!r7.naRaiz&&L.bk.some(n=>/perdas-base_raiz-antiga_/.test(n)),'cópia velha na raiz: vai para 00. Backups/Perdas (raiz-antiga) e sai da raiz');


// ================= revisão c341f8e: falhas no meio da mudança, concorrência e volta de versão =================
// helpers na página: prepara o estado da pasta (OPFS) e lê o conteúdo final da raiz, de 00. Bases e dos backups
const H=`(()=>{const ROOT=()=>navigator.storage.getDirectory();
 const w=async(d,n,t)=>{const fh=await d.getFileHandle(n,{create:true});const s=await fh.createWritable();await s.write(t);await s.close()};
 const prep=async E=>{const r=await ROOT();for await(const[n]of r.entries())await r.removeEntry(n,{recursive:true});for(const[n,t]of Object.entries(E.raiz||{}))await w(r,n,t);
   if(E.bases){const d=await r.getDirectoryHandle('00. Bases',{create:true});for(const[n,t]of Object.entries(E.bases)){if(t===null){await d.getFileHandle(n,{create:true})}else await w(d,n,t)}}return r};
 const txt=async(d,n)=>{try{return await (await (await d.getFileHandle(n)).getFile()).text()}catch(e){return undefined}};
 const estado=async()=>{const r=await ROOT();let B={},K=[];try{const d=await r.getDirectoryHandle('00. Bases');for await(const[n,h]of d.entries())B[n]=h.kind==='file'?await (await h.getFile()).text():'/'}catch(e){}
   try{const bk=await (await r.getDirectoryHandle('00. Backups')).getDirectoryHandle('Perdas');for await(const[n,h]of bk.entries())K.push([n,await (await h.getFile()).text()])}catch(e){}
   return{raiz:await txt(r,'perdas-base.json'),bases:B,bk:K}};
 const dorme=ms=>new Promise(r=>setTimeout(r,ms));
 return{w,prep,txt,estado,ROOT,dorme}})()`;
const PB='perdas-base.json',BK='00. Backups/Perdas';
const rv=await nova('Perdas-Ordem.html','RV');await rv.evaluate(H=>{window.__H=eval(H)},H);
const cenario=(fn,arg)=>rv.evaluate(fn,arg);

// B01 · gravação recente na raiz depois da cópia: não pode ser apagada
let r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'}});
  const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20,ganchos:{antesDeTirar:async()=>{const r=await X.ROOT();await X.dorme(15);await X.w(r,PB,'{"v":"P1-gravacao-recente"}')}}});
  return{res,...await X.estado()}},[PB,BK]);
ok(r.res[0].conflito&&r.raiz==='{"v":"P1-gravacao-recente"}'&&r.bases[PB]==='{"v":"P1"}',`B01: gravação recente na raiz preservada (raiz=${r.raiz}, conflito=${!!r.res[0].conflito})`);

// B02 · migração atrasada não sobrescreve gravação já confirmada no destino (antes e depois da cópia temporária)
for(const momento of ['depoisDeLerRaiz','depoisDoTemporario']){
 r=await cenario(async([PB,BK,momento])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'}});await X.dorme(20);
   const g={};g[momento]=async()=>{const d=await (await X.ROOT()).getDirectoryHandle('00. Bases');await X.dorme(15);await X.w(d,PB,'{"v":"A-confirmada"}')};
   const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20,ganchos:g});return{res,...await X.estado()}},[PB,BK,momento]);
 ok(r.bases[PB]==='{"v":"A-confirmada"}'&&r.raiz===undefined&&r.bk.some(([n,t])=>/raiz-antiga/.test(n)&&t==='{"v":"P1"}'),`B02 (${momento}): gravação confirmada em 00. Bases mantida; raiz velha guardada em backup (destino=${r.bases[PB]})`);
}

// B03 · conferência divergente: não apaga o arquivo gravado por outra sessão nem a raiz
r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'}});
  const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20,ganchos:{depoisDeColocar:async()=>{const d=await (await X.ROOT()).getDirectoryHandle('00. Bases');await X.w(d,PB,'{"v":"outra-sessao"}')}}});
  return{res,...await X.estado()}},[PB,BK]);
ok(r.res[0].conflito&&r.bases[PB]==='{"v":"outra-sessao"}'&&r.raiz==='{"v":"P1"}',`B03: destino da outra sessão e raiz mantidos (destino=${r.bases[PB]}, raiz=${r.raiz})`);

// B04 · erro de leitura não é ausência: nada muda (migração) e a leitura não cai para a raiz
r=await cenario(async([PB,BK])=>{const X=__H;const raiz=await X.prep({raiz:{[PB]:'{"v":"P1"}'},bases:{[PB]:'{"v":"D-existente-mais-nova"}'}});
  const erro=()=>Object.assign(new Error('rede indisponível'),{name:'NotReadableError'});
  const destReal=await raiz.getDirectoryHandle('00. Bases');
  const destFalho=new Proxy(destReal,{get(t,k){if(k==='getFileHandle')return async(n,o)=>{if(n===PB&&!(o&&o.create))throw erro();return t.getFileHandle(n,o)};const v=t[k];return typeof v==='function'?v.bind(t):v}});
  const raizFalha=new Proxy(raiz,{get(t,k){if(k==='getDirectoryHandle')return async(n,o)=>n==='00. Bases'?destFalho:t.getDirectoryHandle(n,o);const v=t[k];return typeof v==='function'?v.bind(t):v}});
  const res=await vacMoverBases(raizFalha,[[PB,BK]],{esperaTrava:20});
  const raizSemBases=new Proxy(raiz,{get(t,k){if(k==='getDirectoryHandle')return async(n,o)=>{if(n==='00. Bases')throw erro();return t.getDirectoryHandle(n,o)};const v=t[k];return typeof v==='function'?v.bind(t):v}});
  let leitura;try{const fh=await vacRaiz(raizSemBases).getFileHandle(PB);leitura='leu '+await (await fh.getFile()).text()}catch(e){leitura='erro '+e.name}
  return{res,leitura,...await X.estado()}},[PB,BK]);
ok(!!r.res[0].erro&&r.bases[PB]==='{"v":"D-existente-mais-nova"}'&&r.raiz==='{"v":"P1"}',`B04: erro de leitura = estado desconhecido, nada mudou (${r.res[0].erro})`);
ok(/^erro NotReadableError/.test(r.leitura),`B04: vacRaiz não troca 00. Bases pela raiz quando a pasta dá erro (${r.leitura})`);

// B05 · cópia interrompida: nunca deixa base vazia como preferida
r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'}});
  let res;try{res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20,ganchos:{depoisDoTemporario:async()=>{throw new Error('aba fechada no meio')}}})}catch(e){res=[{erro:e.message}]}
  const lida=await (await (await vacRaiz(await X.ROOT()).getFileHandle(PB)).getFile()).text();return{res,lida,...await X.estado()}},[PB,BK]);
ok(r.bases[PB]===undefined&&r.raiz==='{"v":"P1"}'&&r.lida==='{"v":"P1"}',`B05: interrompida no meio, 00. Bases sem base vazia e a leitura usa a raiz (lida=${r.lida})`);
r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'},bases:{[PB]:null}});   // sobra vazia de uma versão anterior
  const lidaAntes=await (await (await vacRaiz(await X.ROOT()).getFileHandle(PB)).getFile()).text();
  const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20});return{res,lidaAntes,...await X.estado()}},[PB,BK]);
ok(r.lidaAntes==='{"v":"P1"}'&&r.bases[PB]==='{"v":"P1"}'&&r.raiz===undefined,`B05: arquivo vazio em 00. Bases não é preferido; a mudança completa por cima dele (destino=${r.bases[PB]})`);

// B07 · retomada depois de interrupção (já copiada, sem backup): o backup é feito antes de tirar da raiz
r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'},bases:{[PB]:'{"v":"P1"}'}});
  const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20});return{res,...await X.estado()}},[PB,BK]);
ok(r.raiz===undefined&&r.bk.some(([n,t])=>/antes-de-mover/.test(n)&&t==='{"v":"P1"}'),`B07: retomada cria o backup (${r.bk.map(x=>x[0]).join(', ')})`);

// concorrência · duas sessões (duas páginas, pasta compartilhada) movendo a mesma base ao mesmo tempo
{const rv2=await nova('Perdas-Ordem.html','RV2');await rv2.evaluate(H=>{window.__H=eval(H)},H);
 await rv.evaluate(async PB=>{await __H.prep({raiz:{[PB]:'{"v":"P1"}'}})},PB);
 const [a1,a2]=await Promise.all([rv.evaluate(async([PB,BK])=>vacMoverBases(await __H.ROOT(),[[PB,BK]],{esperaTrava:120}),[PB,BK]),rv2.evaluate(async([PB,BK])=>vacMoverBases(await __H.ROOT(),[[PB,BK]],{esperaTrava:120}),[PB,BK])]);
 const e=await rv.evaluate(()=>__H.estado());const nomes=Object.keys(e.bases);
 ok(e.bases[PB]==='{"v":"P1"}'&&e.raiz===undefined&&!a1.concat(a2).some(x=>x.erro||x.conflito)&&nomes.length===1,`concorrência: uma sessão move, a outra espera; resultado único (${a1[0].aguardando?'1ª esperou':'1ª moveu'} / ${a2[0].aguardando?'2ª esperou':'2ª moveu'}; 00. Bases: ${nomes.join(', ')})`);
 ok(e.bk.filter(([n,t])=>t==='{"v":"P1"}').length>=1,'concorrência: conteúdo original guardado em backup');}

// trava esquecida (sessão que caiu) expira e não bloqueia para sempre
r=await cenario(async([PB,BK])=>{const X=__H;await X.prep({raiz:{[PB]:'{"v":"P1"}'},bases:{['.'+PB+'.migrando']:JSON.stringify({id:'caiu',em:Date.now()-180000})}});
  const res=await vacMoverBases(await X.ROOT(),[[PB,BK]],{esperaTrava:20});return{res,...await X.estado()}},[PB,BK]);
ok(r.bases[PB]==='{"v":"P1"}'&&r.raiz===undefined&&!r.bases['.'+PB+'.migrando'],'trava de sessão que caiu (> 2 min) expira e a mudança completa');

// erro de leitura da base na conexão da página: não oferece criar base nova por cima
r=await cenario(async()=>{const X=__H;await X.prep({bases:{'perdas-base.json':'{corrompida'}});let pergunta=false;const c0=window.confirm;window.confirm=()=>{pergunta=true;return true};
  const ok=await connectDir(await X.ROOT());window.confirm=c0;return{ok,pergunta,...await X.estado()}});
ok(r.ok===false&&!r.pergunta&&r.bases['perdas-base.json']==='{corrompida',`página: base ilegível não é tratada como ausente (não pergunta "Criar a base", arquivo intacto)`);

// B06 · volta para a versão anterior (sem 00. Bases): a Produção antiga recria base na raiz; com o procedimento do guia, não
{const fsx=require('fs'),cp=require('child_process');let antigo=null;try{antigo=cp.execSync('git show 38542d0:paginas/OEE-Vacutainer.html',{cwd:RAIZ,maxBuffer:64e6}).toString()}catch(e){}
 if(!antigo)console.log('obs  B06: git sem o commit 38542d0; cenário de volta de versão não executado');
 else{const dir=path.join(RAIZ,'testes/saida/antigas');fsx.mkdirSync(dir,{recursive:true});fsx.writeFileSync(path.join(dir,'OEE-Vacutainer.html'),antigo);
  const UA=U.replace('/paginas/','/testes/saida/antigas/');
  const pn=await nova('OEE-Vacutainer.html','PN');   // versão nova: põe a base em 00. Bases
  const v0=await pn.evaluate(async()=>{const d=await navigator.storage.getDirectory();for await(const[n]of d.entries())await d.removeEntry(n,{recursive:true});const db=Model.emptyBase('teste');db.databaseVersion=9;db.settings=db.settings||{};db.settings.marcaTeste='base-real';const fh=await d.getFileHandle('oee-vacutainer-base.json',{create:true});const s=await fh.createWritable();await s.write(JSON.stringify(db));await s.close();await Store.connect(FolderBackend(d),{ask:false});return Store.S.baseVersion});
  const pa=await ctx.newPage();pa.on('dialog',d=>d.accept());await pa.goto(UA+'OEE-Vacutainer.html');await pa.waitForTimeout(1300);
  // sem o procedimento: a Produção antiga reconecta e cria base nova (vazia) na raiz
  const semProc=await pa.evaluate(async()=>{const d=await navigator.storage.getDirectory();document.querySelectorAll('.overlay').forEach(o=>o.remove());await Store.connect(FolderBackend(d),{ask:false});let raiz=null;try{raiz=JSON.parse(await (await (await d.getFileHandle('oee-vacutainer-base.json')).getFile()).text()).databaseVersion}catch(e){}return{raiz,ver:Store.S.baseVersion}});
  ok(semProc.raiz!=null&&semProc.raiz<9,`B06 reproduzido: sem devolver as bases, a Produção antiga cria outra base na raiz (versão ${semProc.raiz}, a real é ${v0})`);
  // com o procedimento do guia: apagar a base que a página antiga criou e mover 00. Bases de volta para a raiz
  const comProc=await pa.evaluate(async()=>{const d=await navigator.storage.getDirectory();await d.removeEntry('oee-vacutainer-base.json');const B=await d.getDirectoryHandle('00. Bases');
    for await(const[n,h]of B.entries())if(h.kind==='file'&&n.endsWith('.json')&&!n.startsWith('.')){const t=await (await h.getFile()).text();const fh=await d.getFileHandle(n,{create:true});const s=await fh.createWritable();await s.write(t);await s.close();await B.removeEntry(n)}
    await Store.connect(FolderBackend(d),{ask:false});return{ver:Store.S.baseVersion,marca:(Store.S.db.settings||{}).marcaTeste}});
  ok(comProc.marca==='base-real'&&comProc.ver>=9,`B06 com o procedimento do guia: a Produção antiga abre a base real (marca ${comProc.marca}, versão ${comProc.ver})`);
  const volta=await pn.evaluate(async()=>{location.reload()});await pn.waitForTimeout(1500);
  const re=await pn.evaluate(async()=>{const d=await navigator.storage.getDirectory();document.querySelectorAll('.overlay').forEach(o=>o.remove());await Store.connect(FolderBackend(d),{ask:false});let naRaiz=true;try{await d.getFileHandle('oee-vacutainer-base.json')}catch(e){naRaiz=false}return{ver:Store.S.baseVersion,naRaiz,marca:(Store.S.db.settings||{}).marcaTeste}});
  ok(re.marca==='base-real'&&!re.naRaiz,`B06 nova atualização depois da volta: a base real vai de novo para 00. Bases (marca ${re.marca}, versão ${re.ver})`);}}
console.log(errs.join('\n')||'sem erros');await b.close();srv.close();if(errs.length)process.exitCode=1})();
