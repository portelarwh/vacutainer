const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const SP=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+SP+'paginas/OEE-Vacutainer.html');await p.waitForTimeout(2000);await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>o.remove());Demo.enterExample()});await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));
const C={schema:'vac-cadastros',rev:12,revId:'rX',revAt:'2026-11-05T17:00',
 linhas:[{codigo:'VAC',nome:'Linha Vacutainer',unidade:'BD Curitiba',setor:'Vacutainer'}],familias:[{codigo:'EDTA',nome:'EDTA',cor:'#7a3fbf'},{codigo:'SST',nome:'SST',cor:'#c08a00'}],
 equipamentos:[{codigo:'LINHA',nome:'Linha Vacutainer',linha:'VAC',papel:'oee',tipo:'linha'},{codigo:'EQ01',nome:'Tullip A',linha:'VAC',papel:'equipamento'}],
 catalogos:[{codigo:'360051',tipoItem:'tubo',nome:'Tubo 360051',familia:'EDTA',linha:'VAC',ativo:true,vigencias:[{de:'2025-01-01',ate:'2026-09-30',pphNominal:90000},{de:'2026-10-01',ate:null,pphNominal:95000}]},{codigo:'17132AAB',tipoItem:'preparacao',nome:'Solução',vigencias:[{de:'2025-01-01'}]}],
 paradas:[{codigo:'REF',nome:'Refeição',planejada:true,descontaPlanejado:true,relatorio:true,pareto:false,ativo:true},{codigo:'NOVO',nome:'Código novo do Portal',afetaD:true,ativo:true}],
 turnos:[{codigo:'T1',nome:'1º Turno',linha:'VAC',cor:'#2f6db5',vigencias:[{de:'2025-01-01',ate:null,inicio:'06:00',fim:'14:20',dias:[1,2,3,4,5,6],ativo:true,regraPedacoFinal:30,pausas:[{codigo:'REF',nome:'Almoço de sábado',inicio:'11:00',fim:'12:00',dias:[6],desconta:true}],intervalos:[]}]}],
 metasOee:[{codigo:'OEE-EDTA',nome:'Meta EDTA',linha:'VAC',familia:'EDTA',ativo:true,vigencias:[{de:'2000-01-01',ate:null,oeeMetaPct:72,pph:90000}]}],
 parametros:{paradaLongaMin:25,semaforoVerdePct:100,semaforoAmareloPct:92,motivosAbono:['Almoço','Revezamento']}};
const R=await p.evaluate(C=>{let R;Store.mutate((d,a)=>{R=CadSync.aplicar(d,C,a)});Engine.bumpConfig();const d=db();
 return{R,cat:d.catalogs.filter(x=>x.code==='360051').map(x=>x.id+':'+x.pph+':'+x.validFrom+'-'+x.validTo),prep:d.catalogs.some(x=>x.code==='17132AAB'),t1:JSON.stringify(d.shifts.find(s=>s.code==='T1').versions.filter(v=>!v.deleted).map(v=>({f:v.validFrom,s:v.start,e:v.end,br:v.breaks,tm:v.tailMergeMax}))),dcNovo:!!d.downtimeCodes.find(x=>x.code==='NOVO'),REF:JSON.stringify(d.downtimeCodes.find(x=>x.code==='REF')),tg:d.targets.filter(t=>!t.deleted).map(t=>[t.familyId,t.oee,t.pph,t.portalCode].join('|')),st:[d.settings.longStopMin,JSON.stringify(d.settings.semaphore),JSON.stringify(d.settings.abMotivos)],sync:d.settings.cadSync.stamp}},C);
console.log(JSON.stringify(R,null,1));
// idempotência
console.log('2ª vez:',JSON.stringify(await p.evaluate(C=>{let R;Store.mutate((d,a)=>{R=CadSync.aplicar(d,C,a)});return R},C)));
// telas: config com banner e travado
await p.evaluate(C=>{Store.S.cadDoc=C},C);
for(const sec of ['turnos','metas','paradas','catalogos','estrutura','parametros','usuario']){await p.evaluate(s=>{App.cfgSec=s;go('config')},sec);await p.waitForTimeout(300);
 console.log(sec,'| banner:',await p.evaluate(()=>{const b=document.querySelector('.cfg .banner.info');return b?b.innerText.slice(0,70):'-'}),'| botões ativos:',await p.evaluate(()=>[...document.querySelectorAll('.cfg > div:last-child button:not([disabled])')].map(x=>x.innerText.trim().slice(0,18)).slice(0,6).join(',')))}
await p.evaluate(()=>{App.cfgSec='turnos';go('config')});await p.waitForTimeout(300);await p.screenshot({path:SP+'testes/saida/p24a.png'});
// cálculo ainda roda: overview e launch
for(const r of ['overview','launch','plan','stops','hourly']){await p.evaluate(r=>go(r),r);await p.waitForTimeout(500)}
console.log(errs.join('\n')||'sem erros');await b.close()})();
