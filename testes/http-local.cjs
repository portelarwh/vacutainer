// Transporte de testes dos motores incorporados; não homologa file:// ou SMB.
const {chromium}=require('playwright');
const {ROOT,current}=require('../scripts/html.cjs');
const {server}=require('../scripts/servidor-testes.cjs');
const launch=chromium.launch.bind(chromium);
// Os motores têm a CDN como reserva das bibliotecas. No teste, a CDN é atendida pelos blocos
// biblioteca/* do próprio HTML; qualquer outro pedido à internet é recusado e reprovado.
const CDN={xlsx:/\/xlsx(?:\.full)?(?:\.min)?\.js$/i,autotable:/autotable[^/]*\.js$/i,jspdf:/\/jspdf[^/]*\.js$/i};
const externos=new Set();
async function semInternet(ctx){
 await ctx.route(/^https?:\/\/(?!127\.0\.0\.1[:/]|localhost[:/])/,route=>{
  const url=route.request().url(),nome=Object.keys(CDN).find(k=>CDN[k].test(new URL(url).pathname));
  if(nome)return route.fulfill({status:200,contentType:'text/javascript',body:current().text('biblioteca/'+nome)});
  if(!externos.has(url)){externos.add(url);console.log('FALHA pedido à internet durante o teste: '+url);}
  return route.abort('internetdisconnected');
 });
}
chromium.launch=async(options={})=>{
 const srv=server();await new Promise(r=>srv.listen(0,'127.0.0.1',r));srv.unref();
 const origin='http://127.0.0.1:'+srv.address().port;
 const browser=await launch(require('./plataforma/chromium.cjs')(options));
 const wrapped=new WeakSet(),wrap=page=>{
  if(wrapped.has(page))return page;wrapped.add(page);const goto=page.goto.bind(page);
  page.goto=(url,opts)=>{
   if(String(url).startsWith('file:')){const u=new URL(url),local=decodeURIComponent(u.pathname);if(local.startsWith(ROOT+'/'))url=origin+encodeURI(local.slice(ROOT.length))+u.search+u.hash;}
   return goto(url,opts);
  };return page;
 };
 const newContext=browser.newContext.bind(browser),close=browser.close.bind(browser);
 browser.newContext=async opts=>{const ctx=await newContext(opts),newPage=ctx.newPage.bind(ctx);ctx.newPage=async()=>wrap(await newPage());await semInternet(ctx);return ctx;};
 browser.newPage=async opts=>(await browser.newContext(opts)).newPage();
 browser.close=async()=>{try{await close();}finally{srv.close();}};
 return browser;
};
