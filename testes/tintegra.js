// Portal 1.8.3 · os números do Portal são os do exports de cada página (auditoria A01–A04, A06)
// node testes/tintegra.js  → imprime as conferências e "sem erros"
const SP=require('path').resolve(__dirname,'..')+'/';const S='file://'+SP+'paginas/';
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const errs=[];
const ok=(c,msg)=>{console.log((c?'ok   ':'FALHA ')+msg);if(!c)errs.push('falhou: '+msg)};
const nova=async(arq,tag)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());await p.goto(S+encodeURI(arq));await p.waitForTimeout(1500);return p};

// ---- Gel: exemplo com um barril de 40 kg e 15 kg de retirada parcial
const g=await nova('Gestão-Gel-Vacutainer.html','G');
const gel=await g.evaluate(()=>{enterDemo();const l=[...S.lps.values()].find(x=>!x.closedAt&&x.state==='ativo');l.qtyKg=40;l.partialOut=15;
  const ex=gelExports();return{lp:l.lp,ex,lps:[...S.lps.values()].map(x=>({...x}))}});
const tot=gel.ex.estoque.porLocal.reduce((s,x)=>s+x.kg,0);
ok(Math.abs(tot-gel.ex.estoque.kg)<0.05,`Gel exports.estoque.porLocal soma ${tot.toFixed(2)} kg = estoque.kg ${gel.ex.estoque.kg}`);
const gl=gel.lps.find(x=>x.lp===gel.lp);ok(gl.qtyKg===40&&gl.partialOut===15,'barril de teste 40 kg com 15 kg retirados');

// ---- OEE: exemplo da Produção
const o=await nova('OEE-Vacutainer.html','O');
await o.evaluate(()=>{document.querySelectorAll('.overlay').forEach(x=>x.remove());Demo.enterExample()});await o.waitForTimeout(1200);
// o exemplo marca os dias como demo (o exports os ignora): cópia sem a marca para gerar o resumo
const oee=await o.evaluate(()=>{const db=JSON.parse(JSON.stringify(Store.S.db));const tira=a=>(a||[]).forEach(x=>{delete x.demo});tira(db.productionDays);tira(db.monthPlans);tira(db.calendar);return{exports:Exports.build(db),productionDays:db.productionDays,monthPlans:db.monthPlans,calendar:db.calendar,catalogs:db.catalogs}});

// ---- Waste: dados de teste da página; uma ação com prazo amanhã (não vencida ainda) e uma vencida ontem
const w=await nova('Perdas-Ordem.html','W');
const waste=await w.evaluate(()=>{enterTest();const d=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
  B.actions.push({id:'tA',desc:'teste amanhã',prazo:d(1),status:'aberta'},{id:'tB',desc:'teste ontem',prazo:d(-1),status:'aberta'});
  const ex=buildExports();return{base:{actions:B.actions,imports:B.imports,exports:ex},venc:B.actions.filter(acVencida).length,
   semCausa:ex.porOrdem.filter(o=>(o.nivel==='alta'||o.nivel==='crítica')&&!o.causa).length,futura:ex.pendencias.some(p=>p.txt.includes('teste amanhã'))}});

// ---- Portal
const p=await nova('Portal.html#geral','P');
const r=await p.evaluate(({gel,oee,waste})=>{
  const G=adaptGel({lps:gel.lps,exports:gel.ex}),GB=adaptGel({lps:gel.lps});
  const O=adaptOEE(oee),OB=adaptOEE({...oee,exports:null});
  const PA=adaptParadas({exports:{exportsVersion:1,kpis:[['Paradas','3','','']],pendencias:[{sev:1,txt:'urgente'},{sev:2,txt:'atenção'}],serie:{rotulo:'Minutos de parada por mês',pontos:[{x:'2026-09',y:120},{x:'2026-10',y:80}]}}});
  const V2=adaptGeneric({exports:{exportsVersion:2,kpis:[['x','1','','']],pendencias:[{sev:1,txt:'a'}]}});
  const W=adaptPerdas({exports:{exportsVersion:1,porMes:[{per:curM(),liquido:10,perda:12,ganho:2,ordens:3,criticas:1,fechado:false}],porOrdem:[]},actions:[],imports:[]});
  const WE=adaptPerdas(waste.base),WB=adaptPerdas({...waste.base,exports:{...waste.base.exports,pendencias:undefined}});
  const wTxt=x=>x.pend.map(p=>p.sev+'|'+p.txt).sort().join('\n');
  const wr={kE:JSON.stringify(WE.kpis),kB:JSON.stringify(WB.kpis),pE:wTxt(WE),pB:wTxt(WB),brutoE:!!WE.bruto,brutoB:!!WB.bruto,amanha:WE.pend.some(p=>p.txt.includes('teste amanhã')),ontem:WE.pend.some(p=>p.txt.includes('teste ontem')),venc:+WE.kpis[3][1],sem:+WE.kpis[2][1]};
  const gelPendUrg=gel.ex.pendencias.filter(x=>x.sev===1).length,gelPendAt=gel.ex.pendencias.filter(x=>x.sev===2).length;
  return{gKpis:JSON.stringify(G.kpis)===JSON.stringify(gel.ex.kpis),gSerie:G.serie.reduce((s,x)=>s+x.value,0),gBruto:!!G.bruto,gbBruto:!!GB.bruto,
   gUrg:G.pend.filter(x=>x.sev>=2).length,gAt:G.pend.filter(x=>x.sev<2).length,gelPendUrg,gelPendAt,
   oKpis:JSON.stringify(O.kpis)===JSON.stringify(oee.exports.kpis),oPend:O.pend.length,oexPend:oee.exports.pendencias.length,
   oUrg:O.pend.filter(x=>x.sev>=2).length,oexUrg:oee.exports.pendencias.filter(x=>x.sev===1).length,oBruto:!!O.bruto,obBruto:!!OB.bruto,
   oSerie:O.serie.length,
   pa:{serie:PA.serie.map(x=>x.label+'='+x.value).join(','),sev:PA.pend.map(x=>x.sev).join(',')},v2:{bruto:V2.bruto,pend:V2.pend.length},
   w:W.kpis[0][2],wr}},{gel,oee,waste});
ok(r.gKpis,'Portal mostra os mesmos 4 cartões do Gel');
ok(Math.abs(r.gSerie-gel.ex.estoque.kg)<0.05,`gráfico do Gel no Portal soma ${r.gSerie.toFixed(2)} kg (saldo, não o kg do relatório)`);
ok(!r.gBruto&&r.gbBruto,'Gel: com exports não é "dados brutos"; sem exports é');
ok(r.gUrg===r.gelPendUrg&&r.gAt===r.gelPendAt,`Gel: urgentes ${r.gUrg}/${r.gelPendUrg}, atenção ${r.gAt}/${r.gelPendAt} (sev 1 do Gel = urgente no Portal)`);
ok(r.oKpis,'Portal mostra os mesmos cartões do OEE');
ok(r.oPend===r.oexPend&&r.oUrg===r.oexUrg,`OEE: ${r.oPend} pendências (${r.oUrg} urgentes) = exports ${r.oexPend} (${r.oexUrg})`);
ok(!r.oBruto&&r.obBruto,'OEE: com exports não é "dados brutos"; sem exports é');
ok(r.oSerie>0,`OEE: série por dia do exports (${r.oSerie} dias)`);
ok(r.pa.serie==='set/26=120,out/26=80',`Paradas: série no Portal ${r.pa.serie}`);
ok(r.pa.sev==='2,1','Paradas: sev 1 → urgente, sev 2 → atenção');
ok(r.v2.bruto&&r.v2.pend===0,'exportsVersion desconhecida: não usa o exports e marca "dados brutos"');
ok(waste.futura,'Waste publica a ação que vence amanhã (com aPartirDe)');
ok(!r.wr.amanha&&r.wr.ontem,'Portal: ação que vence amanhã ainda não aparece; a de ontem aparece');
ok(r.wr.venc===waste.venc&&r.wr.sem===waste.semCausa,`Waste: ${r.wr.venc} ações vencidas (Waste ${waste.venc}), ${r.wr.sem} críticas/altas sem causa (Waste ${waste.semCausa})`);
ok(r.wr.kE===r.wr.kB,'Waste: cartões pelo exports = cartões pela leitura antiga da base');
ok(r.wr.pE===r.wr.pB,'Waste: pendências pelo exports = pela leitura antiga (mesmo texto e urgência)');
ok(!r.wr.brutoE&&r.wr.brutoB,'Waste: com pendências no exports não é "dados brutos"; sem, é');
ok(/provisório/.test(r.w),`Waste mês aberto: "${r.w}"`);

// ---- A06: alteração pendente não grava por cima de outra pessoa (pasta simulada em memória)
const c=await p.evaluate(async()=>{
  const files={};const mkFile=(name)=>({kind:'file',async getFile(){const f=files[name];if(!f)throw new Error('NotFound');return{lastModified:f.mod,size:f.txt.length,text:async()=>f.txt}},
    async createWritable(){let buf='';return{write:async t=>{buf+=t},close:async()=>{files[name]={txt:buf,mod:Date.now()+Math.random()}}}}});
  const dir={async getFileHandle(n,o){if(!files[n]&&!(o&&o.create))throw new Error('NotFound');return mkFile(n)},async getDirectoryHandle(){return dir},async *entries(){}};
  const baixados=[];const _dl=window.downloadBlob;window.downloadBlob=(bl,n)=>baixados.push(n);
  const base=JSON.parse(JSON.stringify(Store.B));base.rev=10;base.config.marca='original';files[PAGE.baseFile]={txt:JSON.stringify(base),mod:1};
  Store.dir=dir;Store.mode='pasta';Store.B=Store.fix(JSON.parse(files[PAGE.baseFile].txt));Store.mod=1;Store.pending=false;
  // 1) gravação falha: fica pendente (rev 11 local)
  const w0=Store.writeRemote;Store.writeRemote=async()=>{throw new Error('pasta ocupada')};
  await Store.commit('teste A',b=>{b.config.marca='minha'});Store.writeRemote=w0;
  const pend1=Store.pending,from=Store.pendFrom;
  // 2) outra pessoa grava rev 11 na pasta
  const outra=JSON.parse(files[PAGE.baseFile].txt);outra.rev=11;outra.config.marca='outra pessoa';files[PAGE.baseFile]={txt:JSON.stringify(outra),mod:2};
  // 3) sincronizar: não pode gravar por cima
  await Store.sync(true);const disco1=JSON.parse(files[PAGE.baseFile].txt).config.marca,pend2=Store.pending,dl1=baixados.slice();
  // 4) caso sem conflito: falha, pasta não muda, sincroniza → grava
  Store.writeRemote=async()=>{throw new Error('pasta ocupada')};await Store.commit('teste B',b=>{b.config.marca='minha 2'});Store.writeRemote=w0;
  await Store.sync(true);const disco2=JSON.parse(files[PAGE.baseFile].txt).config.marca,pend3=Store.pending;
  // 5) pendente + nova alteração com a pasta respondendo: as duas vão juntas
  Store.writeRemote=async()=>{throw new Error('pasta ocupada')};await Store.commit('teste C',b=>{b.config.c1='um'});Store.writeRemote=w0;
  await Store.commit('teste D',b=>{b.config.c2='dois'});const d3=JSON.parse(files[PAGE.baseFile].txt).config;
  window.downloadBlob=_dl;Store.mode='teste';Store.dir=null;
  return{pend1,from,disco1,pend2,dl1,disco2,pend3,c1:d3.c1,c2:d3.c2,pend4:Store.pending}});
ok(c.pend1&&c.from===10,'gravação que falha fica pendente (a partir da rev 10)');
ok(c.disco1==='outra pessoa'&&!c.pend2&&c.dl1.some(n=>/_NAO-GRAVADO_/.test(n)),`conflito: a pasta fica com "${c.disco1}" e a cópia local é baixada (${c.dl1.join(', ')})`);
ok(c.disco2==='minha 2'&&!c.pend3,'sem conflito: a alteração pendente é gravada na sincronização');
ok(c.c1==='um'&&c.c2==='dois'&&!c.pend4,'pendente + nova alteração: as duas chegam na pasta (antes a pendente era descartada)');
await p.screenshot({path:SP+'testes/saida/tintegra.png'});
console.log(errs.join('\n')||'sem erros');await b.close()})();
