const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const ROOT='/workspace/verificacao-main-8cad6a6',OUT=__dirname;
const results=[];
const tick=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
async function pageIn(ctx,name,hash=''){
 const p=await ctx.newPage();p.on('dialog',d=>d.accept());
 await p.goto('file://'+ROOT+'/paginas/'+encodeURI(name)+hash);
 await p.waitForTimeout(650);return p;
}
async function scenario(id,fn){
 try{const data=await fn();results.push({id,...data});console.log(JSON.stringify({id,...data}));}
 catch(e){results.push({id,erro:e.stack});console.log(JSON.stringify({id,erro:e.message}));}
 fs.writeFileSync(path.join(OUT,'verificacao-adicional.json'),JSON.stringify({commit:'8cad6a66816b174c17df39823c31b799ea9b5ce8',executadoEm:new Date().toISOString(),resultados:results},null,2));
}
const setupBase=async ({name,D})=>{
 const root=await navigator.storage.getDirectory();
 for await(const [n] of root.entries())await root.removeEntry(n,{recursive:true});
 const bases=await root.getDirectoryHandle('00. Bases',{create:true});
 const h=await bases.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(JSON.stringify(D));await w.close();
 Store.dir=vacRaiz(root);Store.dirName='PASTA FICTICIA';Store.perm=true;Store.test=false;Store._bases=true;Store.data=completar(D);Store.queue=[];Store.conf=[];
};
(async()=>{
 browser=await chromium.launch();
 // A01: dados ainda só no navegador, duas abas da mesma página.
 for(const [name,key,kind]of [['Iniciativas.html','inic','nova'],['Equipamentos.html','equip','os']]){
  await scenario('A01-'+key,async()=>{
   const c=await browser.newContext();const a=await pageIn(c,name),b=await pageIn(c,name);
   const add=async(p,id)=>p.evaluate(({id,kind})=>{
    const it={id,titulo:'Registro '+id,status:kind==='nova'?'a fazer':'aberta',responsavel:'Auditoria',equipamento:'EQ01',criadaEm:new Date().toISOString(),origem:{tipo:'manual'}};
    Store.commit(kind==='nova'?{k:kind,a:it}:{k:kind,it});return {fila:Store.queue.map(x=>(x.a||x.it).id),visivel:(Store.data.acoes||Store.data.os).map(x=>x.id)};
   },{id,kind});
   const primeira=await add(a,'AUD-A'),segunda=await add(b,'AUD-B');
   const persistido=await b.evaluate(key=>({fila:JSON.parse(localStorage.getItem(key+'.fila')).map(x=>(x.a||x.it).id),cache:JSON.parse(localStorage.getItem(key+'.cache'))}),key);
   await a.close();await b.close();const reopened=await pageIn(c,name);
   const reabertura=await reopened.evaluate(()=>({ids:(Store.data.acoes||Store.data.os).map(x=>x.id),fila:Store.queue.map(x=>(x.a||x.it).id)}));
   await c.close();return{defeito_reproduzido:!reabertura.ids.includes('AUD-A')&&reabertura.ids.includes('AUD-B'),esperado:'Ambos os registros pendentes sobrevivem ao fechamento das abas.',primeira,segunda,filaPersistida:persistido.fila,reabertura};
  });
 }
 // A02: uma base antes existente desaparece; clicar Gravar agora não deve apagar a cópia recuperável sem decisão.
 for(const [name,key,base]of [['Iniciativas.html','inic','iniciativas-base.json'],['Equipamentos.html','equip','equipamentos-base.json']]){
  await scenario('A02-'+key,async()=>{
   const c=await browser.newContext(),p=await pageIn(c,name);
   const D=await p.evaluate(key=>{const d=completar(vazio());d.rev=5;d.appVersion=APP_VERSION;
    if(key==='inic')d.acoes=[{id:'AUD-ANTIGA',titulo:'Ação existente',status:'a fazer',criadaEm:new Date().toISOString()}];
    else d.os=[{id:'AUD-ANTIGA',titulo:'OS existente',status:'aberta',equipamento:'EQ01',criadaEm:new Date().toISOString()}];
    d.exports=calcExports(d);return d;},key);
   await p.evaluate(setupBase,{name:base,D});await p.evaluate(()=>Store.reload());
   const data=await p.evaluate(async({key,base})=>{
    const root=await navigator.storage.getDirectory(),b=await root.getDirectoryHandle('00. Bases');await b.removeEntry(base);
    await Store.reload();const antes={baseEncontrada:Store.baseFound,registrosNaCopia:(Store.data.acoes||Store.data.os).length,erro:Store.readErr};
    await Store.save();const obj=JSON.parse(await(await(await b.getFileHandle(base)).getFile()).text());
    return{antes,depois:{registros:(obj.acoes||obj.os).length,rev:obj.rev,erro:Store.lastErr,pendentes:Store.queue.length}};
   },{key,base});await c.close();return{defeito_reproduzido:data.antes.registrosNaCopia===1&&data.depois.registros===0,esperado:'Ausência inesperada de base já lida preserva a cópia e exige recuperação/criação explícita.',...data};
  });
 }
 // A03: versão própria desconhecida é aceita para gravação.
 for(const [name,key,base]of [['Iniciativas.html','inic','iniciativas-base.json'],['Equipamentos.html','equip','equipamentos-base.json']]){
  await scenario('A03-'+key,async()=>{
   const c=await browser.newContext(),p=await pageIn(c,name);
   const D=await p.evaluate(()=>({...vazio(),schema:'vac-formato-futuro',schemaVersion:99,appVersion:'99.0',rev:100,exports:null}));
   await p.evaluate(setupBase,{name:base,D});
   const data=await p.evaluate(async base=>{const erros=validarBase(Store.data);await Store.save();const root=await navigator.storage.getDirectory(),b=await root.getDirectoryHandle('00. Bases');const novo=JSON.parse(await(await(await b.getFileHandle(base)).getFile()).text());return{errosValidacao:erros,revDepois:novo.rev,schema:novo.schema,schemaVersion:novo.schemaVersion,appVersionDepois:novo.appVersion,erroDeGravacao:Store.lastErr};},base);
   await c.close();return{defeito_reproduzido:data.revDepois===101&&data.errosValidacao.length===0,esperado:'Recusar schema/versão própria desconhecidos antes de qualquer escrita.',...data};
  });
 }
 // A04: virada de dia numa aba já aberta; voltar à aba só relê, não republica.
 for(const [name,key,base]of [['Iniciativas.html','inic','iniciativas-base.json'],['Equipamentos.html','equip','equipamentos-base.json']]){
  await scenario('A04-'+key,async()=>{
   const c=await browser.newContext({timezoneId:'America/Sao_Paulo'}),p=await pageIn(c,name);
   await p.clock.setFixedTime(new Date('2026-11-08T20:00:00-03:00'));
   const D=await p.evaluate(key=>{const d=vazio();d.rev=7;
    if(key==='inic')d.acoes=[{id:'AUD-PRAZO',titulo:'Prazo hoje',status:'a fazer',responsavel:'Auditoria',prazo:'2026-11-08',criadaEm:'2026-11-01T12:00:00Z'}];
    else d.tags=[{codigo:'AUD-TAG',equipamento:'EQ01',ativo:true,vigencias:[{id:'V1',de:'2026-11-01',tipo:'contador',nomeMes:'ANTIGO'},{id:'V2',de:'2026-11-09',tipo:'estado',nomeMes:'NOVO'}]}];
    d.exports=calcExports(d);return d;},key);
   await p.evaluate(setupBase,{name:base,D});
   await p.clock.setFixedTime(new Date('2026-11-09T08:00:00-03:00'));
   await p.evaluate(()=>vacAoVoltar());await p.waitForTimeout(250);
   const data=await p.evaluate(async({base,key})=>{const root=await navigator.storage.getDirectory(),b=await root.getDirectoryHandle('00. Bases'),j=JSON.parse(await(await(await b.getFileHandle(base)).getFile()).text());const esperado=calcExports(Store.data);
    const pick=ex=>key==='inic'?ex.pendencias.map(x=>({tipo:x.tipo,sev:x.sev})):ex.tags.map(x=>({nomeMes:x.nomeMes,tipo:x.tipo}));
    const publicado=pick(j.exports),corretoHoje=pick(esperado),diaPublicacao=diaLocal(j.exports.geradoEm);await Store.save();const corrigido=JSON.parse(await(await(await b.getFileHandle(base)).getFile()).text());
    return{diaHoje:hoje(),diaPublicacao,publicado,corretoHoje,depoisDeGravar:pick(corrigido.exports)};},{base,key});await c.close();
   return{defeito_reproduzido:JSON.stringify(data.publicado)!==JSON.stringify(data.corretoHoje)&&JSON.stringify(data.depoisDeGravar)===JSON.stringify(data.corretoHoje),esperado:'Reavaliar exports dependentes da data ao retornar à aba ou na virada local.',...data};
  });
 }
 // A05: rota composta das anomalias na primeira abertura.
 await scenario('A05-rota-anomalia',async()=>{
  const c=await browser.newContext();await c.addInitScript(()=>localStorage.setItem('vac.cadastros',JSON.stringify({schema:'vac-cadastros',equipamentos:[{codigo:'EQ01',nome:'Primeiro',apelidos:[]},{codigo:'EQ03',nome:'Alvo',apelidos:[]}]})));
  const p=await pageIn(c,'Equipamentos.html','#aba=equip&eq=EQ03');const initial=await p.evaluate(()=>({aba:App.tab,equipamento:App.eq,hash:location.hash}));
  const aposRota=await p.evaluate(()=>{rota();return{aba:App.tab,equipamento:App.eq}});await c.close();
  return{defeito_reproduzido:initial.equipamento!=='EQ03'&&aposRota.equipamento==='EQ03',esperado:'Link da pendência abre EQ03 desde a primeira navegação.',initial,aposRota};
 });
 // A06: fora da cobertura publicada não equivale a zero no relatório/reunião.
 await scenario('A06-reuniao-cobertura',async()=>{
  const c=await browser.newContext(),p=await pageIn(c,'Portal.html');
  const data=await p.evaluate(()=>{enterTest();MOD.data.paradas={sys:sysOf('paradas'),erro:null,pend:[],ex:{exportsVersion:1,eventos:[]}};
   Reu.dia=addDays(todayISO(),-120);Reu.rec='dia';App.show('reuniao');const d=reuDados(Reu.dia,'dia'),card=[...document.querySelectorAll('.reu-k .kpi')].find(x=>x.querySelector('.l').textContent.startsWith('Paradas'));
   let model;Report.open=x=>{model=x};document.querySelector('#rRel').click();return{dia:Reu.dia,fora:d.par.fora,valorCard:card.querySelector('.v').textContent,nota:card.querySelector('.s').textContent,kpiRelatorio:model.blocos[0].itens.find(x=>x[0].startsWith('Paradas'))};});await c.close();
  return{defeito_reproduzido:data.fora&&/^0 min$/.test(data.valorCard),esperado:'Fora da janela: valor indisponível, sem publicar 0 min.',...data};
 });
 // A07: grupo de paradas de duas ordens gera vínculo somente da primeira.
 await scenario('A07-reuniao-multiplas-ordens',async()=>{
  const c=await browser.newContext(),p=await pageIn(c,'Portal.html');
  const data=await p.evaluate(()=>{enterTest();const dia=addDays(todayISO(),-1);Reu.dia=dia;Reu.rec='dia';MOD.data.paradas={sys:sysOf('paradas'),erro:null,pend:[],ex:{exportsVersion:1,eventos:[{dia,turno:'T1',equipamento:'EQ03',codigo:'FAL',minutos:30,ordem:'100111111'},{dia,turno:'T1',equipamento:'EQ03',codigo:'FAL',minutos:45,ordem:'100222222'}]}};
   App.show('reuniao');const a=document.querySelector('.reu-par a[target]');const payload=JSON.parse(decodeURIComponent(a.getAttribute('href').split('#nova=')[1]));return{ordensDoGrupo:['100111111','100222222'],payload};});await c.close();
  return{defeito_reproduzido:data.payload.origem.foto.minutos===75&&data.payload.vinculos.filter(v=>v.tipo==='ordem').length===1,esperado:'Preservar todas as ordens relacionadas ou declarar vínculo por grupo, sem atribuir o conjunto só à primeira.',...data};
 });
 // A08: a ficha não invalida o cache ao trocar a pasta se tamanho/data coincidirem.
 await scenario('A08-ficha-troca-pasta',async()=>{
  const c=await browser.newContext(),p=await pageIn(c,'Iniciativas.html');
  const data=await p.evaluate(async()=>{const fake=q=>({__vacRaiz:true,name:'Pasta-'+q,async getFileHandle(n){if(n!=='oee-vacutainer-base.json')throw Object.assign(new Error('ausente'),{name:'NotFoundError'});const text=JSON.stringify({exports:{exportsVersion:1,geradoEm:'2026-11-08T12:00:00Z',porOrdem:[{ordem:'AUD-ORDEM',mes:'2026-11',qtd:q,produzido:q}]}});return{async getFile(){return{lastModified:12345,size:text.length,async text(){return text}}}}}});
   let pasta=fake(111);window.vacPastaAtual=()=>pasta;await vacFicha.carregar(true);const a=vacFicha._S.dados.oee.d.porOrdem[0].produzido;
   pasta=fake(222);await vacFicha.carregar();const b=vacFicha._S.dados.oee.d.porOrdem[0].produzido;await vacFicha.carregar(true);const depoisForcar=vacFicha._S.dados.oee.d.porOrdem[0].produzido;
   return{pastaA:a,esperadoPastaB:222,mostradoPastaB:b,depoisForcar,estado:vacFicha._S.dados.oee.estado};});await c.close();
  return{defeito_reproduzido:data.mostradoPastaB===111&&data.depoisForcar===222,esperado:'Troca de pasta invalida a assinatura de cada fonte, ainda que tamanho/data coincidam.',...data};
 });
 // A09: reconsulta do Planner deve restaurar filtros que motivaram a ação.
 await scenario('A09-reconsulta-filtros',async()=>{
  const c=await browser.newContext(),p=await pageIn(c,'Paradas.html','#teste');
  const data=await p.evaluate(()=>{F.de='2026-10-01';F.ate='2026-10-31';F.eq='EQ03';F.turno='T2';F.cls='quebra';const payload=acaoPlanner('pareto','codigo','FAL','Falha',[{dia:'2026-10-15',equipamento:'EQ03',codigo:'FAL',turno:'T2',minutos:40,ocorrencias:1}]);return{filtrosOriginais:{de:F.de,ate:F.ate,eq:F.eq,turno:F.turno,cls:F.cls,codigo:'FAL'},payload};});await c.close();
  return{defeito_reproduzido:!data.payload.origem.link.includes('2026-10-01')&&!data.payload.origem.link.includes('T2'),esperado:'Link de reconsulta restaura período, máquina, turno, classe e seleção, ou informa que abre apenas visão geral.',...data};
 });
 await browser.close();console.log('CENÁRIOS CONCLUÍDOS');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
