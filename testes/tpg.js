const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const SP=require('path').resolve(__dirname,'..')+'/';(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const errs=[];
const C={schema:'vac-cadastros',rev:12,materiais:[{codigo:'10000001',nome:'Gel',tipo:'gel',ativo:true},{codigo:'1034567',nome:'Tampa',tipo:'rolha',ativo:true}],precos:[{material:'10000001',vigencias:[{de:'2026-01-01',ate:null,preco:12,moeda:'USD',porUnidade:'kg'}]}],cambio:[{codigo:'USD',ativo:true,vigencias:[{de:'2026-01-01',ate:null,cotacao:5.5}]}],
 metasArea:[{codigo:'WASTE-MES',nome:'Perda',unidade:'R$',ativo:true,vigencias:[{de:'2026-01-01',ate:null,valor:40000}]}],
 equipamentos:[{codigo:'EQ01',nome:'Tullip A',ativo:true,apelidos:'Tulip velha; Rotuladora 1'}],
 turnos:[{codigo:'T1',nome:'1º',ativo:true,vigencias:[{de:'2025-01-01',ate:null,inicio:'06:00',fim:'14:20',dias:[1,2,3,4,5,6],ativo:true,pausas:[{nome:'Almoço',duracaoMin:60,dias:[6],desconta:true},{nome:'Ginástica',inicio:'09:00',fim:'09:10',dias:[],desconta:true}]}]},{codigo:'T2',nome:'2º',ativo:true,vigencias:[{de:'2025-01-01',inicio:'14:20',fim:'22:40',dias:[1,2,3,4,5],ativo:true,pausas:[]}]}],
 parametros:{paradaLongaMin:25,limiteMicroMin:5}};
// Gel
const g=await ctx.newPage();g.on('pageerror',e=>errs.push('G '+e.message));g.on('dialog',d=>d.accept());await g.goto('file://'+SP+'paginas/'+encodeURI('Gestão-Gel-Vacutainer.html'));await g.waitForTimeout(1500);
await g.evaluate(C=>localStorage.setItem('vac.cadastros',JSON.stringify(C)),C);
console.log('GEL',JSON.stringify(await g.evaluate(()=>({shift:shiftAtRaw('2026-11-07'),abSab:abDefOf('2026-11-07'),abSeg:abDefOf('2026-11-09'),preco:priceAt('2026-11-05')}))));
await g.evaluate(()=>openConfig('turnos'));await g.waitForTimeout(400);console.log('gel cfg turnos:',await g.$eval('.cfgbody',e=>e.innerText.slice(0,160).replace(/\n/g,' ')));
await g.evaluate(()=>openConfig('preco'));await g.waitForTimeout(400);console.log('gel cfg preço:',await g.$eval('.cfgbody',e=>e.innerText.slice(0,200).replace(/\n/g,' ')));
await g.screenshot({path:SP+'testes/saida/gel95.png'});
// Waste
const w=await ctx.newPage();w.on('pageerror',e=>errs.push('W '+e.message));w.on('dialog',d=>d.accept());await w.goto('file://'+SP+'paginas/Perdas-Ordem.html');await w.waitForTimeout(800);await w.evaluate(()=>{localStorage.setItem('vac.user','Pedro');enterTest()});await w.waitForTimeout(800);
console.log('WASTE meta:',await w.evaluate(()=>CFG().meta),'| tipo 1034567:',await w.evaluate(()=>itemType({comp:'1034567'})),'| config local meta:',await w.evaluate(()=>B.config.meta));
await w.evaluate(()=>showTab('config'));await w.waitForTimeout(400);console.log('cfgMeta:',await w.evaluate(()=>[$('#cfgMeta').disabled,$('#cfgMetaPortal').innerText]));
for(const t of ['painel','comp','hist','acoes','relatorios']){await w.evaluate(t=>showTab(t),t).catch(()=>{});await w.waitForTimeout(300)}
// Paradas
const pa=await ctx.newPage();pa.on('pageerror',e=>errs.push('P '+e.message));pa.on('dialog',d=>d.accept());await pa.goto('file://'+SP+'paginas/Paradas.html');await pa.waitForTimeout(1200);
console.log('PARADAS',JSON.stringify(await pa.evaluate(C=>{Ext.cad=C;Cad.build();return{longa:Cad.paradaLonga,portal:Cad.longaPortal,ap:parseMaquina('Tulip velha',{}),prog:programado([{dia:'2026-11-07'},{dia:'2026-11-09'}],null,null)}},C)));
console.log(errs.join('\n')||'sem erros');await b.close()})();
