const RAIZ=require('path').resolve(__dirname,'..')+'/';
const {chromium}=require('playwright');const fs=require('fs');const SS=require('path').resolve(__dirname,'..')+'/';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']});const errs=[];
const p=await ctx.newPage();p.on('pageerror',e=>errs.push('OEE '+e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+RAIZ+'paginas/OEE-Vacutainer.html');await p.waitForTimeout(2200);await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>o.remove());Demo.enterExample()});await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));
// Voltar entre abas
console.log('voltar visivel no inicio:',await p.evaluate(()=>{const b=document.getElementById('vacVoltar');return b?!b.hidden:'sem botão'}));
await p.evaluate(()=>go('plan'));await p.waitForTimeout(300);
await p.hover('.ngrp:nth-child(3)');await p.click('.nitem[data-osub2="conc"]');await p.waitForTimeout(500);
await p.hover('.ngrp:nth-child(5)');await p.click('.ngrp:nth-child(5) .nitem >> nth=0');await p.waitForTimeout(500);
console.log('rota agora:',await p.evaluate(()=>App.route),'voltar visível:',await p.evaluate(()=>!document.getElementById('vacVoltar').hidden));
await p.click('#vacVoltar');await p.waitForTimeout(600);console.log('após voltar:',await p.evaluate(()=>[App.route,Ord.sub]));
await p.click('#vacVoltar');await p.waitForTimeout(600);console.log('após voltar 2:',await p.evaluate(()=>[App.route,Ord.sub]));
await p.screenshot({path:SS+'testes/saida/z1.png',clip:{x:0,y:0,width:1440,height:200}});
// MB51 + material com zero à esquerda + botão sem KKBC
const mb=fs.readFileSync(RAIZ+'testes/amostras/mb51.txt','utf8').replace(/800041210/g,'017132AAB');
await p.evaluate(()=>{go('ordens');Ord.sub='mb51';render()});await p.waitForTimeout(400);await p.fill('#oPlanta','5012');await p.dispatchEvent('#oPlanta','change');
await p.fill('#oTxt',mb);await p.click('#oLer');await p.waitForTimeout(1500);console.log('dbg',await p.$$eval('.toast, #toast, [class*=toast]',a=>a.map(x=>x.innerText).join(' / ')),await p.evaluate(()=>[App.route,Ord.sub,!!Ord.prevMB,Ord.comp]),await p.$$eval('.ord-acts button',a=>a.map(x=>x.id+':'+x.innerText)));if(await p.$('#oGravaTodas'))await p.click('#oGravaTodas');else await p.click('#oGrava');await p.waitForTimeout(800);
await p.evaluate(()=>{localStorage.setItem('vac.cadastros',JSON.stringify({catalogos:[],usuarios:[],perfis:[]}));Ord.waste={lanc:new Map([['x',1]]),excl:new Map()};});
const o=await p.evaluate(()=>{const R=Object.values(Ord.B.competencias)[0].resultado;return R.ordens.find(o=>o.materiais.includes('017132AAB')).ordem});
await p.evaluate(o=>ordFicha(o),o);await p.waitForTimeout(400);console.log('link cs12:',await p.$$eval('.ord-fh a',a=>a.map(x=>x.getAttribute('href')).join(' ')));
await p.evaluate(()=>document.querySelector('[data-close]').click());
await p.evaluate(()=>{Ord.sub='lista';render()});await p.waitForTimeout(400);
console.log('botões sem KKBC:',await p.$$eval('[data-okkbc]',a=>a.length));
await Promise.all([p.waitForURL(/Perdas-Ordem/,{timeout:5000}).catch(()=>{}),p.click('[data-okkbc] >> nth=0')]);await p.waitForTimeout(1500);
console.log('URL:',p.url(),'| clipboard:',await p.evaluate(()=>navigator.clipboard.readText()).catch(e=>'?'));
// Waste: faixa de ordens + filtros novos
await p.waitForTimeout(800);
console.log('faixa waste:',await p.$eval('#kkbcPed',e=>e.innerText.replace(/\n/g,' ').slice(0,200)).catch(e=>'SEM FAIXA'),'| aba:',await p.evaluate(()=>localStorage.getItem('perdas.tab')));
await p.screenshot({path:SS+'testes/saida/z2.png'});
console.log('voltar na Waste visível:',await p.evaluate(()=>!document.getElementById('vacVoltar').hidden));
await p.click('#vacVoltar');await p.waitForTimeout(2500);console.log('voltou para:',p.url().split('/').pop());
await b.close();
// Waste sozinha: importar fica na tela
const b2=await chromium.launch();const q=await b2.newPage({viewport:{width:1440,height:900}});q.on('pageerror',e=>errs.push('W '+e.message));q.on('dialog',d=>d.accept());
await q.goto('file://'+RAIZ+'paginas/Perdas-Ordem.html#aba=importar&kkbc=900000001,900000002');await q.waitForTimeout(800);await q.evaluate(()=>{localStorage.setItem('vac.user','Pedro');enterTest()});await q.waitForTimeout(600);
await q.evaluate(()=>{showTab('importar');kkbcPedLer()});await q.waitForTimeout(300);console.log('faixa:',await q.$eval('#kkbcPed',e=>e.innerText.replace(/\n/g,' ').slice(0,200)));
await q.evaluate(async()=>{const r0=B.rows[0];const per=r0.per;IMP={R:{recs:[{...r0,ordem:'900000001',id:undefined}],rej:[],dupI:0,subt:0,gran:'ordem × componente',extra:null},meta:{arquivo:'teste.txt',raw:null},headers:[],map:{},list:true};await doImport()});await q.waitForTimeout(800);
console.log('após importar: aba',await q.evaluate(()=>localStorage.getItem('perdas.tab')),'|',await q.$eval('#impOk',e=>e.innerText.replace(/\n/g,' ').slice(0,160)).catch(e=>'sem card'),'| faixa:',await q.$eval('#kkbcPed',e=>e.innerText.replace(/\n/g,' ').slice(0,120)));
await q.screenshot({path:SS+'testes/saida/z3.png'});
await q.click('#impProx');await q.waitForTimeout(200);console.log('próxima: foco',await q.evaluate(()=>document.activeElement.id));
// filtros tipo de item / tipo de ordem
await q.evaluate(()=>{localStorage.setItem('vac.cadastros',JSON.stringify({catalogos:[{codigo:B.rows[0].cat,tipoItem:'preparacao'}]}));ORDX.idx=new Map([[String(B.rows[0].ordem).replace(/^0+/,''),{tipo:'ZPRW',ums:['L'],mat:[]}]]);showTab('painel')});await q.waitForTimeout(400);
const n0=await q.evaluate(()=>filtered().ords.length);await q.selectOption('#fTipoItem','preparacao');await q.waitForTimeout(300);const n1=await q.evaluate(()=>filtered().ords.length);
await q.selectOption('#fTipoItem','');await q.selectOption('#fTipoOrd','ZPRW');await q.waitForTimeout(300);const n2=await q.evaluate(()=>filtered().ords.length);
console.log('ordens total/prep/ZPRW:',n0,n1,n2,'| opções tipo ordem:',await q.$eval('#fTipoOrd',e=>[...e.options].map(o=>o.text).join('|')),'| chips:',await q.$eval('#chips',e=>e.innerText));
await q.screenshot({path:SS+'testes/saida/z4.png',clip:{x:0,y:0,width:1440,height:420}});
console.log(errs.join('\n')||'sem erros');await b2.close()})();
