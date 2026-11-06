const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const S='file://'+require('path').resolve(__dirname,'..')+'/paginas/';(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
for(const f of ['Gestão-Gel-Vacutainer.html','Paradas.html']){await p.goto(S+encodeURI(f));await p.waitForTimeout(1500);
 const tabs=await p.$$eval('#nav [data-t],#nav [data-tab],[role=tab][data-tab]',a=>a.slice(0,3).map(x=>x.getAttribute('data-t')||x.getAttribute('data-tab')));
 console.log(f,'voltar:',await p.evaluate(()=>!!document.getElementById('vacVoltar')),'abas:',tabs.join(','));
 if(tabs.length>1){const sel=t=>`#nav [data-t="${t}"],[role=tab][data-tab="${t}"]`;await p.click(sel(tabs[1])).catch(e=>console.log('click',e.message.slice(0,80)));await p.waitForTimeout(400);await p.click(sel(tabs[2])).catch(()=>{});await p.waitForTimeout(400);
  const on=()=>p.evaluate(()=>{const e=document.querySelector('#nav .on,[role=tab][aria-selected=true]');return e&&(e.getAttribute('data-t')||e.getAttribute('data-tab'))});console.log(' depois:',await on());await p.click('#vacVoltar');await p.waitForTimeout(500);console.log(' voltar ->',await on())}}
await p.screenshot({path:require('path').resolve(__dirname,'..')+'/testes/saida/g1.png',clip:{x:0,y:0,width:1440,height:200}});
console.log(errs.join('\n')||'sem erros');await b.close()})();
