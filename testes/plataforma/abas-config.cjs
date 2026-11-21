/* LANC-04 · Config. › Abas da Produção refletida nas abas da plataforma: destaque colorido, selo de estado, atualização sem recarregar e
   aba inicial. Salva pelo próprio formulário de Config. › Abas, na Demonstração, e lê as abas que a casca desenha. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../../Plataforma.html'));const srv=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});
(async()=>{let b;try{await new Promise(r=>srv.listen(0,'127.0.0.1',r));b=await chromium.launch(require('./chromium.cjs')());
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:'+srv.address().port+'/?demo=1');
 const abrir=async()=>{await p.locator('.sidebar').getByRole('button',{name:'Produção',exact:false}).click();await p.waitForFunction(()=>[...document.querySelectorAll('iframe')].find(f=>f.title==='Módulo Produção')?.contentWindow?.__vacBridge?.ready());};
 await abrir();const fr=p.frameLocator('iframe[title="Módulo Produção"]'),frame=()=>p.frames().find(f=>f.url()&&f!==p.mainFrame()&&f.name()!==''||false);
 const ev=(fn,arg)=>p.evaluate(([src,arg])=>{const w=[...document.querySelectorAll('iframe')].find(f=>f.title==='Módulo Produção').contentWindow;return w.eval('('+src+')')(arg)},[fn.toString(),arg]);
 await p.waitForSelector('.module-tabs button[data-tab-id="stops"]');
 /* sem destaque: nenhuma pílula; o selo só nas abas que já têm estado (a Demonstração traz Equipamentos em construção); a casca abre a primeira aba */
 assert.equal(await p.locator('.module-tabs .tab-pill').count(),0,'sem destaque antes de configurar');
 const comEstado=await ev(()=>visibleRoutes().map(r=>r[0]).filter(k=>['construção','atualização'].includes(tabState(k).state)));
 assert.deepEqual(await p.evaluate(()=>[...document.querySelectorAll('.module-tabs button')].filter(b=>b.querySelector('.tab-selo')).map(b=>b.dataset.tabId)),comEstado,'selo só onde há estado');
 const primeira=await p.locator('.module-tabs button').first().getAttribute('data-tab-id');await p.waitForFunction(id=>document.querySelector('.module-tabs button.active')?.dataset.tabId===id,primeira,{timeout:6000});   /* sem aba inicial salva: a primeira aba */
 await p.evaluate(()=>{window.__semRecarregar=1});
 /* abre Config. › Abas pelo próprio motor e salva pelo formulário */
 await p.locator('.module-tabs button[data-tab-id="config"]').click();
 await ev(()=>{App.cfgSec='abas';render();});
 await fr.locator('#tabSave').waitFor();
 await fr.locator('[data-tabhl="stops"]').check();await fr.locator('[data-tabc="stops"]').fill('#ffcc00');
 await fr.locator('[data-tabhl="plan"]').check();await fr.locator('[data-tabc="plan"]').fill('#1d4b73');
 await fr.locator('[data-tabs="pend"]').selectOption('construção');await fr.locator('[data-tabs="reports"]').selectOption('atualização');
 await fr.locator('[name=tabStart][value="stops"]').check();
 await fr.locator('#tabSave').click();
 /* atualização sem recarregar: a casca relê as abas na hora */
 await p.waitForFunction(()=>document.querySelector('.module-tabs button[data-tab-id="stops"] .tab-pill'),null,{timeout:5000});
 const pil=await p.evaluate(()=>{const s=document.querySelector('.module-tabs button[data-tab-id="stops"] .tab-pill'),q=document.querySelector('.module-tabs button[data-tab-id="plan"] .tab-pill'),c=x=>getComputedStyle(x);return{a:[c(s).backgroundColor,c(s).color,s.textContent],b:[c(q).backgroundColor,c(q).color],vis:s.getBoundingClientRect().width>10}});
 assert.deepEqual(pil.a.slice(0,2),['rgb(255, 204, 0)','rgb(17, 17, 17)'],'cor clara com texto escuro');assert.equal(pil.a[2],'Paradas');
 assert.deepEqual(pil.b,['rgb(29, 75, 115)','rgb(255, 255, 255)'],'cor escura com texto claro');assert.ok(pil.vis,'pílula visível');
 assert.equal(await p.locator('.module-tabs button[data-tab-id="pend"] .tab-selo').textContent(),'em construção');
 assert.equal(await p.locator('.module-tabs button[data-tab-id="reports"] .tab-selo').textContent(),'atualizando');
 assert.equal(await p.locator('.module-tabs button[data-tab-id="reports"] .tab-selo-atualizando').count(),1);
 assert.equal(await p.evaluate(()=>window.__semRecarregar),1,'a plataforma não recarregou');
 /* o sublinhado da aba ativa continua com o destaque */
 await p.locator('.module-tabs button[data-tab-id="plan"]').click();await p.waitForFunction(()=>document.querySelector('.module-tabs button.active')?.dataset.tabId==='plan');
 assert.notEqual(await p.evaluate(()=>getComputedStyle(document.querySelector('.module-tabs button.active')).borderBottomColor),'rgba(0, 0, 0, 0)','aba ativa sublinhada');
 /* aba inicial: sai da Produção e volta sem aba na rota */
 await p.evaluate(()=>location.hash='#/inicio');await p.waitForTimeout(400);await abrir();
 await p.waitForFunction(()=>document.querySelector('.module-tabs button.active')?.dataset.tabId==='stops',null,{timeout:8000});
 await p.waitForFunction(()=>[...document.querySelectorAll('iframe')].find(f=>f.title==='Módulo Produção').contentWindow.eval("App.route")==="stops",null,{timeout:8000});
 /* voltar ao estado normal tira o selo; desmarcar o destaque tira a pílula */
 await p.locator('.module-tabs button[data-tab-id="config"]').click();await ev(()=>{App.cfgSec='abas';render();});await fr.locator('#tabSave').waitFor();
 await fr.locator('[data-tabhl="stops"]').uncheck();await fr.locator('[data-tabs="pend"]').selectOption('normal');await fr.locator('#tabSave').click();
 await p.waitForFunction(()=>!document.querySelector('.module-tabs button[data-tab-id="stops"] .tab-pill')&&!document.querySelector('.module-tabs button[data-tab-id="pend"] .tab-selo'),null,{timeout:5000});
 assert.deepEqual(errors,[]);console.log('ok Config. › Abas na plataforma: destaque (contraste automático), selo em construção/atualizando, sem recarregar e aba inicial');
}finally{if(b)await b.close();srv.close()}})().catch(e=>{console.error(e);process.exitCode=1});
