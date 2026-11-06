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

console.log(errs.join('\n')||'sem erros');await b.close();srv.close();if(errs.length)process.exitCode=1})();
