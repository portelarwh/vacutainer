// Transporte de testes dos motores incorporados; não homologa file:// ou SMB.
const {chromium}=require('playwright');
const {ROOT}=require('../scripts/html.cjs');
const {server}=require('../scripts/servidor-testes.cjs');
const launch=chromium.launch.bind(chromium);
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
 browser.newContext=async opts=>{const ctx=await newContext(opts),newPage=ctx.newPage.bind(ctx);ctx.newPage=async()=>wrap(await newPage());return ctx;};
 browser.newPage=async opts=>(await browser.newContext(opts)).newPage();
 browser.close=async()=>{try{await close();}finally{srv.close();}};
 return browser;
};
