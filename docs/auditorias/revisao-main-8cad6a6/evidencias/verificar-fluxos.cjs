const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT='/workspace/verificacao-main-8cad6a6',OUT=__dirname,results=[];
let browser;
async function open(c,name,h=''){const p=await c.newPage();p.on('dialog',d=>d.accept());await p.goto('file://'+ROOT+'/paginas/'+encodeURI(name)+h);await p.waitForTimeout(650);return p;}
async function run(id,fn){try{results.push({id,...await fn()})}catch(e){results.push({id,erro:e.stack})}console.log(JSON.stringify(results[results.length-1]));fs.writeFileSync(path.join(OUT,'fluxos.json'),JSON.stringify({commit:'8cad6a66816b174c17df39823c31b799ea9b5ce8',resultados:results},null,2));}
(async()=>{
browser=await chromium.launch();
await run('A10-fila-troca-usuario',async()=>{
 const c=await browser.newContext(),p=await open(c,'Portal.html');await p.evaluate(()=>enterTest());await p.waitForTimeout(250);
 const data=await p.evaluate(()=>{
  const users=[{codigo:'AUD1',nome:'Ana Auditoria',area:'Produção',perfil:'CONSULTA',ativo:true},{codigo:'AUD2',nome:'Bia Auditoria',area:'Manutenção',perfil:'CONSULTA',ativo:true}];
  Cad.D.usuarios=users;localStorage.setItem('vac.cadastros',JSON.stringify(Cad.D));setUser(users[0].nome);localStorage.setItem('vac.userId',users[0].codigo);
  MOD.data.inic={sys:sysOf('inic'),pend:[],ex:{exportsVersion:1,acoes:users.map((u,i)=>({id:'AC-AUD'+i,titulo:'Ação de '+u.nome,status:'a fazer',responsavel:u.nome,apoios:[],origem:{tipo:'manual'}}))}};
  Fila.seg='minhas';App.show('fila');const items=()=>[...document.querySelectorAll('.fl-t > div:first-child')].map(x=>x.textContent);
  const antes=items();Entrar.abrir();Entrar.entrar(users[1],false);document.querySelector('#enFica').click();
  const depois=items(),nome=user();App.render();return{antes,depois,usuarioAtual:nome,depoisDeRedesenhar:items()};
 });await c.close();return{defeito_reproduzido:data.usuarioAtual==='Bia Auditoria'&&data.depois.includes('Ação de Ana Auditoria')&&!data.depois.includes('Ação de Bia Auditoria'),esperado:'Trocar a pessoa no Portal atualiza imediatamente Minha fila e seus contadores.',...data};
});
await run('A11-protocolo-link-origem',async()=>{
 const c=await browser.newContext(),p=await open(c,'Iniciativas.html');
 const data=await p.evaluate(()=>{
  Store.test=true;Store.data=vazio();formAcao(null,{titulo:'Auditoria de link',origem:{tipo:'paradas',ref:'AUD-LINK',resumo:'Evidência sintética',link:'javascript:window.__AUD_LINK_EXECUTADO=1'}});
  document.querySelector('.mod-bg [data-ok]').click();const a=document.querySelector('#det a[href^="javascript:"]');return{acaoCriada:Store.data.acoes.length,href:a&&a.getAttribute('href')};
 });
 if(data.href){await p.click('#det a[href^="javascript:"]');await p.waitForTimeout(80)}data.executou=await p.evaluate(()=>window.__AUD_LINK_EXECUTADO===1);await c.close();
 return{defeito_reproduzido:data.executou,esperado:'Origem aceita apenas protocolos/caminhos autorizados; javascript: nunca vira link executável.',...data};
});
await run('A12-ordem-zeros-no-planner',async()=>{
 const c=await browser.newContext(),p=await open(c,'Iniciativas.html');
 const data=await p.evaluate(()=>{Store.test=true;Store.data=vazio();Store.data.acoes=[{id:'AUD-ORDEM',titulo:'Inspecionar equipamento',status:'a fazer',vinculos:[{tipo:'ordem',cod:'100234567'}],origem:{tipo:'manual'}}];
  location.hash='#ordem=000100234567';rota();const comZeros=filtradas().map(x=>x.id);location.hash='#ordem=100234567';rota();return{ordemGravada:'100234567',consultaComZeros:'000100234567',comZeros,semZeros:filtradas().map(x=>x.id)};});await c.close();
 return{defeito_reproduzido:data.comZeros.length===0&&data.semZeros.length===1,esperado:'Rota por ordem compara a chave normalizada como a ficha comum, preservando o texto armazenado.',...data};
});
await run('R01-limite-recuperacao-concorrencia',async()=>{
 const c=await browser.newContext(),p=await open(c,'Iniciativas.html');
 const data=await p.evaluate(()=>{const lost={k:'nova',a:{id:'AUD-PERDIDA',titulo:'Ação confirmada'},id:'OP-AUD-PERDIDA',em:new Date(Date.now()-31*60000).toISOString(),_c:Date.now()-31*60000};Store.conf=[lost];Store.queue=[];const missing=vazio();const recuperadas=Store.perdidas(missing);return{minutosDesdeConfirmacao:31,recuperadas,fila:Store.queue.length,confirmadasRetidas:Store.conf.length};});await c.close();
 return{risco_confirmado:true,limite:'Cenário de retenção da função, não reprodução física de duas estações. A corrida imediata é coberta por tplanner.',...data};
});
for(const [name,call]of [['Portal.html','portal'],['Perdas-Ordem.html','waste'],['Paradas.html','paradas'],['OEE-Vacutainer.html','oee']]){
 await run('D01-offline-'+call,async()=>{
  const c=await browser.newContext();await c.route('**/*',route=>{const u=route.request().url();return /^http:\/\/127\.0\.0\.1:/.test(u)?route.continue():route.abort()});
  const p=await open(c,name);const data=await p.evaluate(async call=>{try{const x=call==='portal'||call==='waste'?await Libs.xlsx():call==='paradas'?await loadXLSX():await Libs.loadXLSX();return{carregou:true,versao:x&&x.version}}catch(e){return{carregou:false,mensagem:e.message}}},call);await c.close();return{dependencia_pendente:true,...data};
 });
}
await browser.close();console.log('FLUXOS CONCLUÍDOS');
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
