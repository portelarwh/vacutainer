const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const S='file://'+require('path').resolve(__dirname,'..')+'/paginas/';(async()=>{const b=await chromium.launch();const w=await b.newPage({viewport:{width:1440,height:900}});const errs=[];w.on('pageerror',e=>errs.push(e.message));w.on('dialog',d=>d.accept());
await w.goto(S+'Perdas-Ordem.html');await w.waitForTimeout(800);await w.evaluate(()=>{localStorage.setItem('vac.user','Pedro');enterTest();showTab('importar')});await w.waitForTimeout(600);
const L=(m1,m2,col=true)=>`05.11.2026  Análise
Ordem      900000123  360060
Material   360060 TUBO TESTE
Quantidade planejada 1.000.000 UN
|Origem   |Material (Texto)  |CstsTeórTo|Tot.CstsRe|${col?'Moeda|':''}
|1034567  |TAMPA HEMOGARD    |  1.000,00|  1.200,00|${col?m1+'  |':''}
|1034568  |ROLHA             |    500,00|    450,00|${col?m2+'  |':''}
|* Materials|                |  1.500,00|  1.650,00|${col?'     |':''}`;
for(const [nome,t] of [['tudo BRL',L('BRL','BRL')],['misto',L('BRL','USD')],['sem coluna',L('','',false)]]){
 await w.fill('#impPer','2026-10');await w.fill('#impTxt',t);await w.click('#btnInterp');await w.waitForTimeout(500);
 console.log('prev:',await w.$eval('#impPrev',e=>e.innerText.slice(0,300)),'| toast:',await w.$$eval('.toast,#toast',a=>a.map(x=>x.innerText).join('/')));const st=await w.evaluate(()=>{const n=[...document.querySelectorAll('#impPrev .note')].find(x=>/Moeda|moeda/.test(x.textContent));const bt=document.querySelector('#btnDoImp');return[n?n.innerText.replace(/\n/g,' ').slice(0,260):'(sem nota)',bt?bt.disabled:'?']});
 console.log(nome,'→',st[0],'| botão desabilitado:',st[1]);
 if(nome==='misto'){await w.screenshot({path:require('path').resolve(__dirname,'..')+'/testes/saida/q1.png',fullPage:true});await w.check('#moedaOk');console.log('  após marcar:',await w.evaluate(()=>document.querySelector('#btnDoImp').disabled))}
 if(nome==='tudo BRL'){await w.click('#btnDoImp');await w.waitForTimeout(800);showTab:0;console.log('  importado; histórico moeda:',await w.evaluate(()=>JSON.stringify(B.imports[B.imports.length-1].moedas)))}
}
console.log(errs.join('\n')||'sem erros');await b.close()})();
