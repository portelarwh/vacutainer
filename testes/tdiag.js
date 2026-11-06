// Resposta ao diagnóstico de 06/11/2026 (F01–F08): cada cenário reproduzido pelo relatório, agora com o resultado certo.
// node testes/tdiag.js  → imprime as conferências; sai com código 1 se alguma falhar
const SP=require('path').resolve(__dirname,'..')+'/';const S='file://'+SP+'paginas/';
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const errs=[];
const ok=(c,msg)=>{console.log((c?'ok   ':'FALHA ')+msg);if(!c)errs.push('falhou: '+msg)};
const nova=async(arq,tag,antes)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());if(antes)await antes(p);await p.goto(S+encodeURI(arq));await p.waitForTimeout(1500);return p};

// ---- F01 · Produção: duas gravações simultâneas com a mesma versão
const o=await nova('OEE-Vacutainer.html','O');
await o.evaluate(()=>{document.querySelectorAll('.overlay').forEach(x=>x.remove());Demo.enterExample()});await o.waitForTimeout(1200);
const f01=await o.evaluate(async()=>{const St=Store.S;
  const db=JSON.parse(Store.serialize(St.db));db.databaseVersion=10;let arq=JSON.stringify(db),colidir=true;
  St.backend={name:'mem',read:async()=>({text:arq}),write:async t=>{arq=t;
      if(colidir){colidir=false;const outra=JSON.parse(t);outra.saveId='outra-pessoa';outra.settings=outra.settings||{};delete outra.settings.marcaA;outra.settings.marcaB='B';arq=JSON.stringify(outra)}},
    backup:async()=>'ok',readSibling:async()=>null,backupRoot:async()=>null};
  St.mode='pasta';St.access='readwrite';St.conflict=null;St.db=JSON.parse(JSON.stringify(db));St.baseVersion=10;St.ops=[];St.opsOk=true;St.dirty=false;St.rev=St.rev||0;
  Store.mutate(d=>{d.settings=d.settings||{};d.settings.marcaA='A'});
  const estados=[];await Store.flush().catch(e=>estados.push('erro:'+e.message));estados.push(St.status+'/'+St.dirty);
  await new Promise(r=>setTimeout(r,3500));const fim=JSON.parse(arq);estados.push(St.status+'/'+St.dirty);
  return{estados,A:fim.settings.marcaA,B:fim.settings.marcaB,v:fim.databaseVersion}});
ok(f01.estados[0]==='pendente/true','F01: releitura com a gravação de outra pessoa (mesma versão) não é dada como salva ('+f01.estados[0]+')');
ok(f01.A==='A'&&f01.B==='B'&&f01.v===12,`F01: na tentativa seguinte as duas alterações ficam no arquivo (A=${f01.A}, B=${f01.B}, versão ${f01.v}); situação ${f01.estados[1]}`);

// ---- F04 · CadSync: desativações do Portal
const f04=await o.evaluate(()=>{const d={lines:[],families:[],machines:[],catalogs:[{id:'cat_1',code:'360060',validFrom:'2025-01-01',validTo:null,active:true},{id:'cat_2',code:'360060',validFrom:'2026-01-01',validTo:null,active:true}],
   shifts:[],downtimeCodes:[],targets:[{id:'tg1',validFrom:'2026-01-01',lineId:null,machineId:null,familyId:null,catalogId:null,oee:.7}],settings:{}};
  const C={rev:5,catalogos:[{codigo:'360060',nome:'Tubo',ativo:true,vigencias:[{de:'2025-01-01',ate:null,pphNominal:100}],vigenciasDesativadas:[{de:'2026-01-01',pphNominal:120}]}],
   metasOee:[{codigo:'OEE-LINHA',ativo:false,vigencias:[{de:'2026-01-01',oeeMetaPct:70}]}],
   turnos:[{codigo:'T1',nome:'1º',ativo:false,vigencias:[{de:'2025-01-01',ate:null,inicio:'06:00',fim:'14:20',dias:[1,2,3,4,5],ativo:true}]}],parametros:{}};
  CadSync.aplicar(d,C,()=>{});
  return{c2:d.catalogs.find(x=>x.id==='cat_2'),c1:d.catalogs.find(x=>x.id==='cat_1').active,meta:d.targets.find(x=>x.id==='tg1').deleted,turno:d.shifts[0].versions.map(v=>v.active)}});
ok(f04.c2&&f04.c2.active===false&&!f04.c2.deleted&&f04.c1===true,'F04: vigência desativada no Portal fica inativa na Produção (não apagada: o histórico acha pelo id)');
ok(f04.meta===true,'F04: Portal com todas as metas inativas tira a meta local');
ok(f04.turno.every(a=>a===false),'F04: turno inativo no Portal deixa as vigências inativas');

// ---- F05 · importador SAP: datas e números
const f05=await o.evaluate(()=>({d1:OrdensSAP.data('31.02.2026'),d2:OrdensSAP.data('29.02.2028'),n1:OrdensSAP.num('123abc'),n2:OrdensSAP.num('1.234,56'),n3:OrdensSAP.num('15-')}));
ok(f05.d1===null&&f05.d2==='2028-02-29','F05: data inexistente recusada (31.02.2026), 29.02.2028 aceita');
ok(f05.n1===null&&f05.n2===1234.56&&f05.n3===-15,'F05: "123abc" recusado; "1.234,56" e "15-" continuam certos');

// ---- F02 · Gel: colisão em todas as tentativas
const g=await nova('Gestão-Gel-Vacutainer.html','G');
const f02=await g.evaluate(async()=>{let txt='{"rev":5,"revBy":"outro","lps":[]}',mod=1;
  const arq={kind:'file',async getFile(){const t=txt,m=mod;return{lastModified:m,size:t.length,text:async()=>t,slice:(a,b2)=>({text:async()=>t.slice(a,b2)})}},
    async createWritable(){let buf='';return{write:async t=>{buf+=t},close:async()=>{const o=JSON.parse(buf);txt=buf;mod++;
      // outra pessoa grava logo depois, toda vez
      const x={rev:o.rev+1,revBy:'outro'};txt=JSON.stringify({...x,lps:[]});mod++}}}};
  const dir={async getFileHandle(){return arq},async getDirectoryHandle(){return dir},async *entries(){}};
  S.mode='file';FS.base=dir;FS.mod=0;FS.rev=5;FS.revBy='outro';FS.pending=[];FS.err='';ui.demo=false;
  const ch={lps:{del:[],set:[]},closed:{del:[],set:[]},events:[{id:'tE',type:'nota',at:nowDT(),text:'teste F02'}],imports:[]};
  FS.pending.push(ch);await fsFlush();const r={pend:FS.pending.length,err:FS.err};S.mode='local';FS.base=null;FS.pending=[];return r});
ok(f02.pend===1&&/simultânea/.test(f02.err),`F02: 3 colisões seguidas mantêm a alteração na fila (${f02.pend} pendente) com o aviso "${f02.err.slice(0,60)}…"`);

// ---- F07 · Paradas: evento do OEE só substitui a mesma parada
const pa=await nova('Paradas.html','P');
const f07=await pa.evaluate(()=>{const ev0=Store.data.eventos;const ex0=Ext.oee;
  Store.data.eventos=[{id:'F1',origem:'forms',dia:'2026-11-05',turno:'T1',equipamento:'EQ02',inicio:'08:00',minutos:20,codigo:'FME'},
   {id:'F2',origem:'forms',dia:'2026-11-05',turno:'T1',equipamento:'EQ01',inicio:'10:02',minutos:5,codigo:'FME'},{id:'T1',origem:'tally',dia:'2026-11-05',turno:'T1',minutos:3,codigo:'MIC'}];
  Ext.oee={paradasEventos:[{id:'o1',dia:'2026-11-05',turno:'T1',equipamento:'EQ01',inicio:'10:00',minutos:5,codigo:'FME'}]};
  const L=eventosTodos().map(e=>e.id).sort().join(',');Store.data.eventos=ev0;Ext.oee=ex0;return L});
ok(f07==='F1,OEE:o1,T1',`F07: Forms do EQ02 continua; o do EQ01 é a mesma parada do OEE e sai; microparadas ficam (${f07})`);

// ---- F03, F08 e 5.2 · Portal
const p=await nova('Portal.html#geral','PO',async p=>{await p.clock.install({time:new Date('2026-11-06T10:00:00')})});
const r=await p.evaluate(async()=>{
  const files={'perdas-base.json':{txt:JSON.stringify({rev:3,exports:{exportsVersion:1,porMes:[],porOrdem:[],pendencias:[{sev:1,tipo:'acaoVencida',aPartirDe:'2026-11-07',quando:'2026-11-06',txt:'Ação vencida em 06/11/2026: teste'}]}}),mod:1}};
  const fh=n=>({kind:'file',async getFile(){const f=files[n];if(!f)throw new Error('NotFound');return{lastModified:f.mod,size:f.txt.length,text:async()=>f.txt}}});
  const dir={async getFileHandle(n){if(!files[n])throw Object.assign(new Error('NotFound'),{name:'NotFoundError'});return fh(n)},async getDirectoryHandle(){throw new Error('NotFound')},async *entries(){for(const n in files)yield[n,fh(n)]}};
  Store.dir=dir;Store.mode='pasta';MOD.teste=false;MOD.files={};MOD.data={};
  await readModules(false);const antes=(MOD.data.perdas.pend||[]).length;return{antes}});
await p.clock.setSystemTime(new Date('2026-11-07T08:00:00'));
const r2=await p.evaluate(async()=>{await readModules(false);const depois=(MOD.data.perdas.pend||[]).length;
  const W2=adaptPerdas({exports:{exportsVersion:2,porMes:[{per:curM(),liquido:999999,perda:1,ganho:0,ordens:1,criticas:0,fechado:false}],pendencias:[]},actions:[],imports:[]});
  const O2=adaptOEE({exports:{exportsVersion:2,porMes:[{mes:curM(),oee:.99,oeeMeta:.5}],kpis:[]},productionDays:[],monthPlans:[],calendar:[]});
  const vb=Vers.baseInfo(JSON.stringify({databaseVersion:42,lastModifiedAt:'2026-11-06T09:00:00Z',lastModifiedBy:'Ana',applicationVersion:'2.4.3'}));
  Store.mode='teste';Store.dir=null;
  return{depois,w2:W2.kpis[0][1],w2b:!!W2.bruto,o2:JSON.stringify(O2.kpis).includes('99'),o2b:!!O2.bruto,vb}});
ok(r.antes===0&&r2.depois===1,`F03: ação que vence em 06/11 aparece em 07/11 sem nova gravação do Waste (antes ${r.antes}, depois ${r2.depois})`);
ok(r2.w2==='–'&&r2.w2b,'F08: Waste com exportsVersion 2 não usa o valor financeiro do export ("–", dados brutos)');
ok(!r2.o2&&r2.o2b,'F08: OEE com exportsVersion 2 não usa o OEE do export (dados brutos)');
ok(r2.vb.rev===42&&r2.vb.por==='Ana'&&!!r2.vb.em&&r2.vb.app==='2.4.3','5.2: Versões lê databaseVersion, lastModifiedAt/By e applicationVersion da Produção');

// ---- F06 · Waste: consumo e scrap do Gel separados
const w=await nova('Perdas-Ordem.html','W');
const f06=await w.evaluate(()=>{const g0=GEL.src;
  GEL.src={exports:{exportsVersion:1,ordens:[{ordem:'110831563',lote:'B1',consumoKg:100,scrapKg:5,lps:['L1']}]}};const a=gelFind('110831563');
  GEL.src={full:{ordens:[{ordem:'110831563',consumoKg:100,scrapKg:5}]}};const b=gelFind('110831563');GEL.src=g0;
  return{a:[a&&a.consumo,a&&a.scrap],b:[b&&b.consumo,b&&b.scrap]}});
ok(f06.a[0]===100&&f06.a[1]===5,`F06: consumo ${f06.a[0]} kg e scrap ${f06.a[1]} kg pelo contrato do Gel (antes 105)`);
ok(f06.b[0]===100&&f06.b[1]===5,`F06: base sem exports também não soma o scrap no consumo (${f06.b[0]} / ${f06.b[1]})`);


// ================= diagnóstico pós-merge (c2ca6af): M01–M04 e ressalva do Gel =================
// pasta simulada: files[nome]={txt,mod}; falhas controladas por flags
const PASTA=`(()=>{const files={},F={lerFalha:false,cabFalha:false,escritas:0};
  const fh=n=>({kind:'file',async getFile(){if(F.lerFalha)throw new Error('pasta ocupada');const f=files[n];if(!f)throw Object.assign(new Error('NotFound'),{name:'NotFoundError'});
     return{lastModified:f.mod,size:f.txt.length,text:async()=>f.txt,slice:(a,b2)=>({text:async()=>{if(F.cabFalha&&F.escritas>0)throw new Error('ilegível');return f.txt.slice(a,b2)}})}},
    async createWritable(){let buf='';return{write:async x=>{buf+=x},close:async()=>{files[n]={txt:buf,mod:(files[n]?files[n].mod:0)+1};F.escritas++}}}});
  const dir={async getFileHandle(n,o){if(!files[n]&&!(o&&o.create))throw Object.assign(new Error('NotFound'),{name:'NotFoundError'});return fh(n)},async getDirectoryHandle(){return dir},async *entries(){for(const n in files)yield[n,fh(n)]}};
  return{files,F,dir}})()`;

// ---- M01 · Portal: alteração pendente + leitura prévia falha → não grava por cima de B
const p1=await nova('Portal.html#geral','PM');
const m1p=await p1.evaluate(async PASTA=>{const X=eval(PASTA);const baixados=[];window.downloadBlob=(bl,n)=>baixados.push(n);
  const base=JSON.parse(JSON.stringify(Store.B));base.rev=10;base.config.m01={};X.files[PAGE.baseFile]={txt:JSON.stringify(base),mod:1};
  Store.dir=X.dir;Store.mode='pasta';Store.B=Store.fix(JSON.parse(X.files[PAGE.baseFile].txt));Store.mod=1;Store.pending=false;
  const w0=Store.writeRemote;Store.writeRemote=async()=>{throw new Error('pasta ocupada')};await Store.commit('A1',b=>{b.config.m01.A1=1});Store.writeRemote=w0;
  const outra=JSON.parse(X.files[PAGE.baseFile].txt);outra.rev=11;outra.config.m01={B:1};X.files[PAGE.baseFile]={txt:JSON.stringify(outra),mod:2};
  const r0=Store.readRemote;Store.readRemote=async()=>{throw new Error('leitura falhou')};await Store.commit('A2',b=>{b.config.m01.A2=1});Store.readRemote=r0;
  const disco=JSON.parse(X.files[PAGE.baseFile].txt).config.m01,pend=Store.pending,local=JSON.stringify(Store.B.config.m01);
  await Store.sync(true);const disco2=JSON.parse(X.files[PAGE.baseFile].txt).config.m01;Store.mode='teste';Store.dir=null;
  return{disco,pend,local,disco2,baixados}},PASTA);
ok(m1p.disco.B===1&&!m1p.disco.A2&&m1p.pend,`M01 Portal: leitura prévia falhou → não grava; B continua na pasta e A1/A2 ficam pendentes (local ${m1p.local})`);
ok(m1p.disco2.B===1&&m1p.baixados.some(n=>/_NAO-GRAVADO_/.test(n)),'M01 Portal: na sincronização, B é preservado e A1/A2 vão para o _NAO-GRAVADO');

// ---- M01 · Waste: a mesma sequência
const w1=await nova('Perdas-Ordem.html','WM');
const m1w=await w1.evaluate(async PASTA=>{const X=eval(PASTA);const baixados=[];window.downloadJSON=(o,n)=>baixados.push(n);
  const base=JSON.parse(JSON.stringify(B));base.rev=10;base.config.m01={};X.files[BASE_FN]={txt:JSON.stringify(base),mod:1};
  ST.dir=X.dir;ST.mode='pasta';B=fixBase(JSON.parse(X.files[BASE_FN].txt));ST.mod=1;ST.pending=false;
  const w0=window.writeRemote;window.writeRemote=async()=>{throw new Error('pasta ocupada')};await commit('A1',b=>{b.config.m01.A1=1});window.writeRemote=w0;
  const outra=JSON.parse(X.files[BASE_FN].txt);outra.rev=11;outra.config.m01={B:1};X.files[BASE_FN]={txt:JSON.stringify(outra),mod:2};
  const r0=window.readRemote;window.readRemote=async()=>{throw new Error('leitura falhou')};await commit('A2',b=>{b.config.m01.A2=1});window.readRemote=r0;
  const disco=JSON.parse(X.files[BASE_FN].txt).config.m01,pend=ST.pending;
  await syncNow(true);const disco2=JSON.parse(X.files[BASE_FN].txt).config.m01;ST.mode='teste';ST.dir=null;
  return{disco,pend,disco2,baixados}},PASTA);
ok(m1w.disco.B===1&&!m1w.disco.A2&&m1w.pend,'M01 Waste: leitura prévia falhou → não grava; B continua na pasta e a alteração fica pendente');
ok(m1w.disco2.B===1&&m1w.baixados.some(n=>/_NAO-GRAVADO_/.test(n)),'M01 Waste: na sincronização, B é preservado e a cópia local vai para o _NAO-GRAVADO');

// ---- M02 · CadSync: vigência antiga não vira a nova
const m2=await o.evaluate(()=>{const d={lines:[],families:[],machines:[],catalogs:[],shifts:[],downtimeCodes:[],targets:[],settings:{}};
  CadSync.aplicar(d,{rev:1,catalogos:[{codigo:'360060',nome:'Tubo',vigencias:[{de:'2025-01-01',pphNominal:100}]}],parametros:{}},()=>{});
  const id1=d.catalogs[0].id;
  CadSync.aplicar(d,{rev:2,catalogos:[{codigo:'360060',nome:'Tubo',vigencias:[{de:'2026-01-01',pphNominal:200}],vigenciasDesativadas:[{de:'2025-01-01',pphNominal:100}]}],parametros:{}},()=>{});
  const velho=d.catalogs.find(x=>x.id===id1),novo=d.catalogs.find(x=>x.id!==id1);
  const L={lines:[],families:[],machines:[],catalogs:[{id:'cat_leg',code:'360061',validFrom:'2024-01-01',pph:90,active:true,createdBy:'Ana'}],shifts:[],downtimeCodes:[],targets:[],settings:{}};
  CadSync.aplicar(L,{rev:1,catalogos:[{codigo:'360061',nome:'Tubo 2',vigencias:[{de:'2025-01-01',pphNominal:95}]}],parametros:{}},()=>{});
  return{n:d.catalogs.length,velho:velho&&[velho.validFrom,velho.pph,velho.active],novo:novo&&[novo.validFrom,novo.pph,novo.active],leg:[L.catalogs.length,L.catalogs[0].id,L.catalogs[0].validFrom]}});
ok(m2.n===2&&JSON.stringify(m2.velho)==='["2025-01-01",100,false]'&&JSON.stringify(m2.novo)==='["2026-01-01",200,true]',`M02: registro antigo mantém data e PPH (${m2.velho}); a nova vigência ganha outro registro (${m2.novo})`);
ok(m2.leg[0]===1&&m2.leg[1]==='cat_leg'&&m2.leg[2]==='2025-01-01','M02: catálogo local nunca sincronizado continua sendo aproveitado no mapeamento inicial');

// ---- M03 · Portal: volta para a página no dia seguinte redesenha a tela
const p3=await nova('Portal.html#geral','PV',async p=>{await p.clock.install({time:new Date('2026-11-06T10:00:00')})});
await p3.evaluate(async PASTA=>{const X=eval(PASTA);window.__X=X;
  X.files['perdas-base.json']={txt:JSON.stringify({rev:3,exports:{exportsVersion:1,porMes:[],porOrdem:[],pendencias:[{sev:1,tipo:'acaoVencida',aPartirDe:'2026-11-07',quando:'2026-11-06',txt:'Ação vencida em 06/11/2026: teste M03'}]}}),mod:1};
  Store.dir=X.dir;Store.mode='pasta';MOD.teste=false;MOD.files={};MOD.data={};await readModules(false);App.show('geral')},PASTA);
const antesM3=await p3.evaluate(()=>document.body.innerText.includes('teste M03'));
await p3.clock.setSystemTime(new Date('2026-11-07T08:00:00'));
await p3.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await p3.waitForTimeout(800);
const depoisM3=await p3.evaluate(()=>document.body.innerText.includes('teste M03'));
await p3.evaluate(()=>{Store.mode='teste';Store.dir=null});
ok(!antesM3&&depoisM3,`M03: ação vencida aparece na tela ao voltar para a página no dia seguinte (antes ${antesM3}, depois ${depoisM3})`);

// ---- Base que some e volta · a tela troca os números antigos pelo aviso e depois volta aos números
const p5=await nova('Portal.html#geral','PS');
await p5.evaluate(async PASTA=>{const X=eval(PASTA);window.__X=X;
  X.files['perdas-base.json']={txt:JSON.stringify({rev:3,exports:{exportsVersion:1,porMes:[],porOrdem:[],pendencias:[{sev:1,tipo:'semCausa',txt:'Ordem 999 crítica sem causa · teste SOME'}]}}),mod:1};
  Store.dir=X.dir;Store.mode='pasta';MOD.teste=false;MOD.files={};MOD.data={};await readModules(false);App.show('geral')},PASTA);
const txt=()=>p5.evaluate(()=>document.body.innerText);
const s0=await txt();
await p5.evaluate(()=>{delete window.__X.files['perdas-base.json'];document.dispatchEvent(new Event('visibilitychange'))});await p5.waitForTimeout(800);
const s1=await txt();
await p5.evaluate(()=>{window.__X.files['perdas-base.json']={txt:JSON.stringify({rev:4,exports:{exportsVersion:1,porMes:[],porOrdem:[],pendencias:[{sev:1,tipo:'semCausa',txt:'Ordem 999 crítica sem causa · teste SOME'}]}}),mod:1};document.dispatchEvent(new Event('visibilitychange'))});await p5.waitForTimeout(800);
const s2=await txt();await p5.evaluate(()=>{Store.mode='teste';Store.dir=null});
ok(s0.includes('teste SOME')&&!s0.includes('Não encontrei perdas-base.json'),'Base some: antes, a tela mostra os dados do Waste');
ok(!s1.includes('teste SOME')&&s1.includes('Não encontrei perdas-base.json'),'Base some: ao voltar para a página, a tela troca os dados antigos pelo aviso');
ok(s2.includes('teste SOME')&&!s2.includes('Não encontrei perdas-base.json'),'Base some: quando a base volta (mesma data de arquivo), os dados reaparecem');

// ---- M04 · Gel: gravação sem releitura válida não esvazia a fila
const g4=await nova('Gestão-Gel-Vacutainer.html','GM');
const m4=await g4.evaluate(async PASTA=>{const X=eval(PASTA);X.files[BASE_FILE]={txt:'{"rev":5,"revBy":"outro","lps":[]}',mod:1};X.F.cabFalha=true;
  S.mode='file';FS.base=X.dir;FS.mod=0;FS.rev=5;FS.revBy='outro';FS.pending=[];FS.err='';ui.demo=false;
  FS.pending.push({lps:{del:[],set:[]},closed:{del:[],set:[]},events:[{id:'tM4',type:'nota',at:nowDT(),text:'teste M04'}],imports:[]});
  await fsFlush();const r={pend:FS.pending.length,err:FS.err};S.mode='local';FS.base=null;FS.pending=[];return r},PASTA);
ok(m4.pend===1&&/conferir a gravação/.test(m4.err),`M04: releitura de confirmação falhou → a fila fica (${m4.pend}) com aviso`);

// ---- Ressalva · Waste não lê exports do Gel em versão desconhecida
const r6=await w1.evaluate(()=>{const g0=GEL.src;GEL.src={exports:{exportsVersion:2,ordens:[{ordem:'110831563',consumoKg:100,scrapKg:5}]}};const a=gelFind('110831563');GEL.src=g0;return{inc:a.incompat,c:a.consumo,h:a.hits.length}});
ok(r6.inc===2&&r6.c===null&&r6.h===0,'Ressalva: exports do Gel com versão desconhecida não é lido (nem pela busca genérica)');

console.log(errs.join('\n')||'sem erros');await b.close();if(errs.length)process.exitCode=1})();
