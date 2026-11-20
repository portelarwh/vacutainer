/* LANC-04 · grade de até 3 colunas (vacGrade, comum/interface): em todas as páginas que usam a grade, cada cartão com a barra aceita
   1/1, 1/2 e 1/3 (inclusive os nascidos com largura inteira), três cartões em 1/3 ficam na mesma linha, ← → muda a ordem e a ordem
   sobrevive ao redesenho, e o gráfico é redesenhado na largura nova. Tela de 1600 px (acima de 1100 px, onde 1/3 vira 1/2). */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../../Plataforma.html'));const srv=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(html)});
const MODULOS=['Produção','Waste','Gestão de Gel','Paradas','Equipamentos','Iniciativas / Ações','Linha 360°','Projetos','Administração'];
/* roda dentro da página: mede cada cartão em 1/3, 1/2 e 1/1, testa três em 1/3 e as setas; devolve as falhas */
function medir(){
  const raf=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),espera=ms=>new Promise(r=>setTimeout(r,ms));
  const clica=(c,a)=>c.querySelector(':scope > .vg-barra [data-vg="'+a+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  const vis=x=>x.offsetParent&&x.getBoundingClientRect().width>0;
  return (async()=>{
    const falhas=[],cartoes=[],grades=[...document.querySelectorAll('main .vg-grade')].filter(vis);
    for(const g of grades){
      const L=[...g.children].filter(c=>c.querySelector(':scope > .vg-barra')&&vis(c));if(!L.length)continue;
      const cs=getComputedStyle(g),gw=g.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),gap=parseFloat(getComputedStyle(g).columnGap)||0,col=(gw-5*gap)/6;
      const alvo={l6:gw,l3:col*3+gap*2,l2:col*2+gap};
      for(const c of L){const nome=c.dataset.vgKey;cartoes.push(nome);
        for(const l of ['l2','l3','l6']){clica(c,l);await raf();const w=c.getBoundingClientRect().width;if(Math.abs(w-alvo[l])>4)falhas.push(nome+' '+l+': '+Math.round(w)+' px, esperado '+Math.round(alvo[l]));}
      }
      /* três em 1/3 na mesma linha */
      if(L.length>=3){const T=L.slice(0,3);T.forEach(c=>clica(c,'l2'));await raf();const tops=new Set(T.map(c=>Math.round(c.getBoundingClientRect().top)));
        const ord=[...g.children].filter(c=>c.dataset.vgKey).sort((a,b)=>(+a.style.order||0)-(+b.style.order||0));const juntos=T.every(c=>Math.abs(ord.indexOf(c)-ord.indexOf(T[0]))<3);
        if(juntos&&tops.size!==1)falhas.push('três em 1/3 não ficaram na mesma linha: '+T.map(c=>c.dataset.vgKey).join(', '));}
      /* gráfico redesenhado na largura nova (Produção: .chart[data-cid] redesenhado por Charts.fit; demais: o SVG cabe no cartão) */
      for(const c of L){const sv=c.querySelector('.chart[data-cid] svg[viewBox]')||c.querySelector('svg[viewBox]');if(!sv||sv.closest('.vg-barra,button'))continue;
        clica(c,'l2');await raf();await espera(420);const cw=c.getBoundingClientRect().width,sw=sv.getBoundingClientRect().width;
        if(sw>cw+2)falhas.push(c.dataset.vgKey+': gráfico ('+Math.round(sw)+' px) maior que o cartão ('+Math.round(cw)+' px) em 1/3');
        const ch=sv.closest('.chart[data-cid]');if(ch&&ch.clientWidth>0){const vb=sv.viewBox.baseVal.width;if(Math.abs(vb-ch.clientWidth)>Math.max(12,ch.clientWidth*.08))falhas.push(c.dataset.vgKey+': gráfico não redesenhado em 1/3 (desenho de '+Math.round(vb)+' px num cartão de '+Math.round(ch.clientWidth)+' px)');}}
      /* ← →: o segundo vai para antes e a ordem sobrevive a novo vacGrade.aplicar() */
      if(L.length>=2){const ord=()=>[...g.children].filter(c=>c.dataset.vgKey).sort((a,b)=>(+a.style.order||0)-(+b.style.order||0)).map(c=>c.dataset.vgKey);
        const o0=ord(),seg=[...g.children].find(c=>c.dataset.vgKey===o0[1]);if(seg&&seg.querySelector(':scope > .vg-barra')){clica(seg,'antes');await raf();const o1=ord();
          if(o1[0]!==o0[1]||o1[1]!==o0[0])falhas.push('← não trocou a ordem: '+o0.slice(0,2)+' → '+o1.slice(0,2));
          vacGrade.aplicar();await raf();const o2=ord();if(JSON.stringify(o2)!==JSON.stringify(o1))falhas.push('a ordem não sobreviveu ao redesenho');}}
      /* tabelas em 1/3 rolam dentro do cartão, sem quebrar a grade */
      if(g.scrollWidth>g.clientWidth+2)falhas.push('a grade passou da largura com cartões em 1/3 ('+g.scrollWidth+' > '+g.clientWidth+')');
      L.forEach(c=>clica(c,'rest'));await raf();
    }
    return {falhas,cartoes};
  })();
}
(async()=>{let b;try{await new Promise(r=>srv.listen(0,'127.0.0.1',r));b=await chromium.launch(require('./chromium.cjs')());const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+srv.address().port+'/?demo=1');
 const todas=[],porPagina=[];let n=0;
 for(const name of MODULOS){await p.locator('.sidebar').getByRole('button',{name,exact:false}).click();const t='Módulo '+name;await p.waitForFunction(title=>[...document.querySelectorAll('iframe')].find(f=>f.title===title)?.contentWindow?.__vacBridge?.ready(),t);
  const fr=()=>p.frames().find(f=>f.parentFrame()===p.mainFrame()&&f.page()&&f.url()!=='about:blank'&&f.name()!=='');
  const handle=await p.locator('iframe[title="'+t+'"]').elementHandle(),frame=await handle.contentFrame();
  const abas=await frame.evaluate(()=>vacPagina.abas().map(a=>a.id));
  for(const aba of abas.length?abas:['']){if(aba){await frame.evaluate(a=>vacPagina.ir(a),aba);}await p.waitForTimeout(700);
   const r=await frame.evaluate(medir.toString().replace(/^function medir\(\)\{/,'(()=>{').replace(/\}$/,'})()'));
   const anota=(onde,r)=>{if(r.cartoes.length){porPagina.push(onde+': '+r.cartoes.length);n+=r.cartoes.length;}r.falhas.forEach(f=>todas.push(onde+' · '+f));};
   anota(name+' › '+(aba||'—'),r);
   /* Produção › Visão geral: também Meu painel, as visões compartilhadas e os modelos (blocos PN_B, inclusive os só de tabela) */
   if(name==='Produção'&&aba==='overview'){const vs=await frame.evaluate(()=>VisaoGeral.opcoes().map(o=>o[0]).filter(k=>k!==VisaoGeral.PADRAO));
    for(const v of vs){await frame.evaluate(v=>{Panel.st().view=v;render();},v);await p.waitForTimeout(700);anota('Produção › Visão geral › '+v,await frame.evaluate(medir.toString().replace(/^function medir\(\)\{/,'(()=>{').replace(/\}$/,'})()')));}
    /* Meu painel só com os blocos de largura inteira citados no pedido, quase todos tabela ou lista (sem gráfico na grade) */
    const B=['hourly','stopsTable','planMonth','planTable','notes','shiftsTable'];
    const tem=await frame.evaluate(B=>{const ok=B.filter(k=>PN_B[k]);const L=U.clone(App.prefs.panelLayout||PN_MINE());window.__pnAntes=App.prefs.panelLayout;App.prefs.panelLayout={...L,blocks:ok.map(id=>({id,w:'f'}))};Panel.st().view='mine';render();return ok;},B);
    assert.deepEqual(tem,B,'blocos do pedido existem');await p.waitForTimeout(700);
    const rt=await frame.evaluate(medir.toString().replace(/^function medir\(\)\{/,'(()=>{').replace(/\}$/,'})()'));anota('Produção › Meu painel (tabelas)',rt);
    const sem=await frame.evaluate(()=>[...document.querySelectorAll('main .pn-grid > .pn-blk')].filter(c=>c.offsetParent&&!c.querySelector(':scope > .vg-barra')).map(c=>c.dataset.pnb));assert.deepEqual(sem,[],'blocos sem a barra');
    assert.ok(rt.cartoes.length>=5,'blocos de tabela com a barra: '+rt.cartoes.length);
    await frame.evaluate(()=>{App.prefs.panelLayout=window.__pnAntes;Panel.st().view=VisaoGeral.PADRAO;render();});}
  }
 }
 /* celular: abaixo de 760 px tudo volta a 1/1, mesmo com 1/3 escolhido (a largura escolhida não vence a regra do celular) */
 await p.locator('.sidebar').getByRole('button',{name:'Produção',exact:false}).click();const fo=await (await p.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame();
 await fo.evaluate(()=>vacPagina.ir('overview'));await p.waitForTimeout(700);
 await fo.evaluate(()=>{const c=document.querySelector('main .vg-grade > .vg-it');c.querySelector(':scope > .vg-barra [data-vg="l2"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));window.__vgC=c;});
 await p.setViewportSize({width:700,height:1000});await p.waitForTimeout(600);
 const cel=await fo.evaluate(()=>{const c=window.__vgC,g=c.parentElement,cs=getComputedStyle(g);return [c.dataset.vgL,Math.round(c.getBoundingClientRect().width),Math.round(g.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))]});
 assert.equal(cel[0],'2');assert.ok(Math.abs(cel[1]-cel[2])<=4,'celular: 1/3 vira 1/1 ('+cel[1]+' de '+cel[2]+' px)');
 await fo.evaluate(()=>window.__vgC.querySelector(':scope > .vg-barra [data-vg="rest"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));await p.setViewportSize({width:1600,height:1000});
 console.log(porPagina.join('\n'));
 if(todas.length){console.error(todas.join('\n'));}
 assert.deepEqual(todas,[],'falhas na grade');assert.ok(n>=40,'poucos cartões com a barra: '+n);assert.deepEqual(errors,[]);
 console.log('ok grade de 3 colunas: '+n+' cartões em '+porPagina.length+' páginas aceitam 1/1, 1/2 e 1/3, mudam de lugar e o gráfico acompanha a largura');
}finally{if(b)await b.close();srv.close()}})().catch(e=>{console.error(e);process.exitCode=1});
