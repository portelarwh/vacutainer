// Limites: não certifica WCAG completa. SVG/canvas, imagens/gradientes, pseudoelementos decorativos e popups nativos precisam revisão específica.
// T1 (16/11/2026): contraste renderizado (texto × fundo efetivo) na casca e nos nove módulos, nos dois temas, na demonstração.
// Mínimo WCAG AA: 4,5:1 (3:1 para texto grande). Os módulos são abertos em sequência, como a pessoa faz: é assim que um
// módulo fica com tema diferente do da casca (achado A1 da revisão da PR #77). Reprova qualquer texto abaixo do mínimo.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(process.env.PLATAFORMA_HTML || path.resolve(__dirname, '../../Plataforma.html')); // Permite comprovar a reprovação da versão anterior.
const NOMES = { oee: 'Produção', perdas: 'Waste', gel: 'Gestão de Gel', paradas: 'Paradas', equip: 'Equipamentos', inic: 'Iniciativas / Ações', linha: 'Linha 360°', portal: 'Administração', projetos: 'Projetos' };

function sonda() {
  const cor=c=>{let m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[, /]+/).filter(Boolean).map(Number);return{r:p[0],g:p[1],b:p[2],a:p[3]??1}}m=c.match(/color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[ /]+/).filter(Boolean).map(Number);return{r:p[0]*255,g:p[1]*255,b:p[2]*255,a:p[3]??1}}return null};
  const lum=c=>{const f=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
  const sobre=(f,b)=>{const a=f.a+b.a*(1-f.a);return a?{r:(f.r*f.a+b.r*b.a*(1-f.a))/a,g:(f.g*f.a+b.g*b.a*(1-f.a))/a,b:(f.b*f.a+b.b*b.a*(1-f.a))/a,a}:{r:0,g:0,b:0,a:0}};
  const transparente=()=>({r:0,g:0,b:0,a:0}),branco={r:255,g:255,b:255,a:1};
  const pares=(el,fg)=>{let f=fg,b=transparente();for(let e=el;e;e=e.parentElement){const s=getComputedStyle(e);if(s.backgroundImage!=='none')return null;const bg=cor(s.backgroundColor);if(!bg)return null;f=sobre(f,bg);b=sobre(b,bg);f.a*=Number(s.opacity);b.a*=Number(s.opacity)}return[sobre(f,branco),sobre(b,branco)]};
  const ruins=new Map();let n=0,naoMedidos=0;const scope=document.querySelector('dialog[open]')||document.body,list=[];
  const w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode()){const txt=t.nodeValue.trim();if(txt)list.push({el:t.parentElement,txt})}
  for(const el of scope.querySelectorAll('input,textarea,select')){
    if(el.matches('input[type=hidden],input[type=checkbox],input[type=radio],input[type=range],input[type=color],input[type=file]'))continue;
    if(el.tagName==='SELECT'){const o=el.selectedOptions[0];if(o?.textContent.trim())list.push({el,txt:o.textContent.trim()})}
    else if(el.value)list.push({el,txt:el.type==='password'?'••••':el.value});else if(el.placeholder)list.push({el,txt:el.placeholder,pseudo:'::placeholder'});
  }
  for(const {el,txt,pseudo}of list){
    if(!el||!el.getClientRects().length||el.closest('svg,script,style,[hidden],[aria-hidden="true"],option,:disabled'))continue;
    let hidden=false;for(let e=el;e;e=e.parentElement){const s=getComputedStyle(e);if(s.visibility!=='visible'||Number(s.opacity)===0){hidden=true;break}}if(hidden)continue;
    const s=getComputedStyle(el,pseudo),f0=cor(s.color);if(pseudo&&f0)f0.a*=Number(s.opacity);
    const pair=f0&&pares(el,f0);if(!pair){naoMedidos++;continue}const[f,b]=pair,x=lum(f),y=lum(b),cr=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),px=parseFloat(s.fontSize),large=px>=24||(px>=18.66&&Number(s.fontWeight)>=700);n++;
    if(cr<(large?3:4.5)){const k=el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).join('.'):'')+(pseudo||'');const r=ruins.get(k)||{n:0,cr,ex:txt.slice(0,40)};r.n++;if(cr<r.cr)Object.assign(r,{cr,ex:txt.slice(0,40)});ruins.set(k,r)}
  }
  return{n,naoMedidos,ruins:[...ruins].map(([k,r])=>`${k} ×${r.n} ${r.cr.toFixed(2)}:1 "${r.ex}"`)};
}

(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(html); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(require('./chromium.cjs')()); const falhas = [];
  try {
    const proof=await b.newPage();await proof.setContent('<div style="background:white;color:#ddd">Falha deliberada</div><div style="background:white;color:black">Legível</div><div style="background:white"><span style="color:black;opacity:.1">Opacidade</span></div>');
    const proofResult=await proof.evaluate(sonda);assert.equal(proofResult.ruins.length,2,'scanner reconhece falha de texto e de opacidade; texto preto passa');await proof.close();
    for (const tema of ['light', 'dark']) {
      const c = await b.newContext({ viewport: { width: 1440, height: 1000 } }); await c.addInitScript(t => localStorage.setItem('vac.platform.demo.theme', t), tema);
      const p = await c.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1'); await p.waitForTimeout(1500);
      const casca = await p.evaluate(sonda); casca.ruins.forEach(x => falhas.push(`${tema} casca: ${x}`));
      let medidos = casca.n, telas=1,ignorados=casca.naoMedidos;
      for (const id of Object.keys(NOMES)) {
        await p.evaluate(id => location.hash = '#/' + id, id); const el = p.locator('iframe[title="Módulo ' + NOMES[id] + '"]'); await el.first().waitFor({ timeout: 30000 });
        const fr = await (await el.first().elementHandle()).contentFrame(); await fr.waitForFunction(() => window.vacPagina && vacPagina.pronto(), null, { timeout: 30000 }); await p.waitForTimeout(800);
        const tabs=await fr.evaluate(()=>vacPagina.abas());
        for(const tab of tabs){
          await fr.evaluate(tab=>vacPagina.ir(tab),tab.id);await p.waitForTimeout(180);
          const r=await fr.evaluate(sonda);medidos+=r.n;ignorados+=r.naoMedidos;telas++;r.ruins.forEach(x=>falhas.push(`${tema} ${id}/${tab.id}: ${x}`));
        }
        await p.locator('.heading-actions').getByRole('button',{name:'Status',exact:true}).click();
        await p.getByRole('dialog',{name:'Status da página'}).waitFor();await p.waitForTimeout(100);
        const status=await p.evaluate(sonda);medidos+=status.n;ignorados+=status.naoMedidos;telas++;status.ruins.forEach(x=>falhas.push(`${tema} Status/${id}: ${x}`));await p.keyboard.press('Escape');
      }
      await p.keyboard.press('Control+k');await p.locator('.search-field input').waitFor();
      const search=await p.evaluate(sonda);search.ruins.forEach(x=>falhas.push(`${tema} busca: ${x}`));medidos+=search.n;telas++;await p.keyboard.press('Escape');
      await p.evaluate(()=>location.hash='#/gel');const tv=p.locator('.engine-commands button[aria-haspopup="menu"]').filter({hasText:/TV/});await tv.waitFor();await tv.click();
      for(const state of ['focus','hover']){if(state==='hover')await p.getByRole('menuitem').first().hover();const menu=await p.evaluate(sonda);menu.ruins.forEach(x=>falhas.push(`${tema} menu TV ${state}: ${x}`));medidos+=menu.n;telas++;}await p.keyboard.press('Escape');
      assert.deepEqual(erros, [], tema + ': erro de página');
      console.log(`ok ${tema}: ${medidos} textos medidos em ${telas} telas/abas/Status, nove módulos; ${ignorados} textos sobre fundos não suportados`);
      await c.close();
    }
    assert.deepEqual(falhas, [], 'texto abaixo do contraste mínimo (WCAG AA):\n' + falhas.join('\n'));
    console.log('ok contraste: nenhum texto abaixo de 4,5:1 (3:1 grande) nos recortes exercitados, nos dois temas');
  } finally { await b.close(); srv.close(); }
})().catch(e => { console.error(e.message || e); process.exitCode = 1; });
