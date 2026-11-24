// Bases em "00. Bases" (kit vac-bases; base limpa, 24/11/2026): as bases são lidas e gravadas só em 00. Bases da pasta principal.
// A mudança de layout (base solta na raiz movida para 00. Bases, trava .migrando, backup "raiz-antiga") saiu do código: pasta nova
// nasce com 00. Bases e base fora dela não é lida nem movida. Usa o sistema de arquivos do próprio navegador (OPFS), com as mesmas
// operações da pasta da rede. Páginas servidas por HTTP local.
// node testes/tbases.js → "sem erros"; código 1 se falhar
const {chromium}=require('playwright');
const srv=require('../scripts/servidor-testes.cjs').server();
(async()=>{await new Promise(r=>srv.listen(0,r));const U=`http://127.0.0.1:${srv.address().port}/__modulos__/`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const errs=[];
const ok=(c,m)=>{console.log((c?'ok   ':'FALHA ')+m);if(!c)errs.push(m)};
const nova=async(arq,tag)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());await p.goto(U+encodeURI(arq));await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));return p};
// helpers na página: prepara o estado da pasta (OPFS) e lê o conteúdo final da raiz e de 00. Bases
const H=`(()=>{const ROOT=()=>navigator.storage.getDirectory();
 const w=async(d,n,t)=>{const fh=await d.getFileHandle(n,{create:true});const s=await fh.createWritable();await s.write(t);await s.close()};
 const prep=async E=>{const r=await ROOT();for await(const[n]of r.entries())await r.removeEntry(n,{recursive:true});for(const[n,t]of Object.entries(E.raiz||{}))await w(r,n,t);
   if(E.bases){const d=await r.getDirectoryHandle('00. Bases',{create:true});for(const[n,t]of Object.entries(E.bases))await w(d,n,t)}return r};
 const txt=async(d,n)=>{try{return await (await (await d.getFileHandle(n)).getFile()).text()}catch(e){return undefined}};
 const estado=async()=>{const r=await ROOT();let B={};try{const d=await r.getDirectoryHandle('00. Bases');for await(const[n,h]of d.entries())B[n]=h.kind==='file'?await (await h.getFile()).text():'(pasta)'}catch(e){}
   const raiz=[];for await(const[n]of r.entries())raiz.push(n);return{raiz:raiz.sort(),bases:B}};
 return{w,prep,txt,estado,ROOT}})()`;
const PB='perdas-base.json';
const w=await nova('Perdas-Ordem.html','W');await w.evaluate(H=>{window.__H=eval(H)},H);

// 1. base solta na raiz (layout anterior a 00. Bases) não é lida, com ou sem a pasta 00. Bases; arquivo fora da lista de bases fica na raiz
let r=await w.evaluate(async PB=>{const X=__H;const leu=async()=>{try{const fh=await vacRaiz(await X.ROOT()).getFileHandle(PB);return 'leu '+await (await fh.getFile()).text()}catch(e){return e.name}};
  await X.prep({raiz:{[PB]:'{"v":"raiz"}','Logo.png':'x'}});const semPasta=await leu();
  await (await X.ROOT()).getDirectoryHandle('00. Bases',{create:true});const comPasta=await leu();
  const logo=await (await (await vacRaiz(await X.ROOT()).getFileHandle('Logo.png')).getFile()).text();
  return{semPasta,comPasta,logo,...await X.estado()}},PB);
ok(r.semPasta==='NotFoundError'&&r.comPasta==='NotFoundError',`base só na raiz não é lida (sem 00. Bases: ${r.semPasta}; com 00. Bases: ${r.comPasta})`);
ok(r.logo==='x'&&r.raiz.includes(PB)&&!r.bases[PB],'nada é movido: a raiz fica como estava e Logo.png continua lido da raiz');
ok(await w.evaluate(()=>typeof vacMoverBases==='undefined'&&typeof vacAvisoBases==='undefined'),'vacMoverBases e vacAvisoBases saíram do kit');

// 2. base em 00. Bases é a que vale; gravação vai para 00. Bases e não cria nada na raiz
r=await w.evaluate(async PB=>{const X=__H;await X.prep({bases:{[PB]:'{"v":"P1"}'}});const R=vacRaiz(await X.ROOT());
  const lida=await (await (await R.getFileHandle(PB)).getFile()).text();await X.w(R,PB,'{"v":"P2"}');return{lida,...await X.estado()}},PB);
ok(r.lida==='{"v":"P1"}'&&r.bases[PB]==='{"v":"P2"}'&&!r.raiz.includes(PB),`lê e grava em 00. Bases (lida ${r.lida}; raiz: ${r.raiz.join(', ')})`);

// 3. erro de leitura de 00. Bases não é ausência e não cai para a raiz
r=await w.evaluate(async PB=>{const X=__H;const raiz=await X.prep({raiz:{[PB]:'{"v":"raiz"}'},bases:{[PB]:'{"v":"D"}'}});
  const erro=()=>Object.assign(new Error('rede indisponível'),{name:'NotReadableError'});
  const raizSemBases=new Proxy(raiz,{get(t,k){if(k==='getDirectoryHandle')return async(n,o)=>{if(n==='00. Bases')throw erro();return t.getDirectoryHandle(n,o)};const v=t[k];return typeof v==='function'?v.bind(t):v}});
  try{const fh=await vacRaiz(raizSemBases).getFileHandle(PB);return 'leu '+await (await fh.getFile()).text()}catch(e){return 'erro '+e.name}},PB);
ok(/^erro NotReadableError/.test(r),`vacRaiz não troca 00. Bases pela raiz quando a pasta dá erro (${r})`);

// 4. página: base ilegível na conexão não é tratada como ausente (não pergunta "Criar a base", arquivo intacto)
r=await w.evaluate(async()=>{const X=__H;await X.prep({bases:{'perdas-base.json':'{corrompida'}});let pergunta=false;const c0=window.confirm;window.confirm=()=>{pergunta=true;return true};
  const ok=await connectDir(await X.ROOT());window.confirm=c0;return{ok,pergunta,...await X.estado()}});
ok(r.ok===false&&!r.pergunta&&r.bases['perdas-base.json']==='{corrompida',`página: base ilegível não é tratada como ausente (não pergunta "Criar a base", arquivo intacto)`);

// 5. página: pasta nova (vazia) cria a base em 00. Bases, já com schemaVersion
r=await w.evaluate(async()=>{const X=__H;await X.prep({});const ok=await connectDir(await X.ROOT());const e=await X.estado();const t=e.bases['perdas-base.json'];
  return{ok,raiz:e.raiz,sv:t?JSON.parse(t).schemaVersion:null}});
ok(r.ok!==false&&r.sv===1&&!r.raiz.includes('perdas-base.json')&&r.raiz.includes('00. Bases'),`pasta nova: a base nasce em 00. Bases com schemaVersion 1 (raiz: ${r.raiz.join(', ')}; schemaVersion ${r.sv})`);

console.log(errs.join('\n')||'sem erros');await b.close();srv.close();if(errs.length)process.exitCode=1})();
