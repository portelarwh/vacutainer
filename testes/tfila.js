// E10a e E10b do plano único (08/11/2026): Portal › Minha fila e Reunião diária.
// Portal em modo de teste com exports sintéticos de Iniciativas, Produção, Paradas, Gel e Waste. node testes/tfila.js → "sem erros"; código 1 se falhar
const path = require('path'), fs = require('fs'); const RAIZ = path.resolve(__dirname, '..') + '/'; const PG = 'file://' + RAIZ + 'paginas/';
const { chromium } = require('playwright');
const errs = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FALHA ') + m); if (!c) errs.push(m); };
const addDaysN = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const SAI = RAIZ + 'testes/saida/fila/'; fs.mkdirSync(SAI, { recursive: true });

const PREP = () => {
  enterTest(); const h = todayISO(), ontem = addDays(h, -1), D = ontem, mes = D.slice(0, 7);
  const C = vacCad() || JSON.parse(JSON.stringify(Cad.base || {})); C.usuarios = [{ codigo: '1', nome: 'J. Lima', area: 'Manutenção', ativo: true }, { codigo: '2', nome: 'R. Nunes', area: 'Manutenção', ativo: true }, { codigo: '3', nome: 'A. Souza', area: 'Produção', ativo: true }];
  C.metasArea = [{ codigo: 'WASTE-MES', ativo: true, vigencias: [{ de: '2020-01-01', valor: 20000 }] }];
  if (Cad.base) { Cad.base.usuarios = C.usuarios; Cad.base.metasArea = C.metasArea; } localStorage.setItem('vac.cadastros', JSON.stringify(C)); localStorage.setItem('vac.user', 'J. Lima'); localStorage.setItem('vac.userId', '1');
  const ac = (id, t, resp, prazo, st = 'em andamento', ap = []) => ({ id, titulo: t, status: st, responsavel: resp, apoios: ap, prazo, atrasada: !!prazo && prazo < h, origem: { tipo: 'paradas' }, vinculos: [], checklist: [1, 3] });
  MOD.data.inic = { sys: sysOf('inic'), kpis: [], pend: [], ex: { exportsVersion: 1, acoes: [ac('AC-1', 'Ajustar guia EQ03', 'J. Lima', addDays(h, -2)), ac('AC-2', 'Trocar mola', 'R. Nunes', addDays(h, 3)), ac('AC-3', 'Apoio na limpeza', 'A. Souza', null, 'a fazer', ['J. Lima']),
    ac('AC-4', 'Sem dono', '', addDays(h, 10), 'a fazer'), ac('AC-5', 'Já feita', 'J. Lima', addDays(h, -9), 'concluída')] } };
  MOD.data.oee.ex = { exportsVersion: 1, porDia: [{ dia: D, oee: 0.714, oeeMeta: 0.75, boa: 412000, metaOp: 440000 }], porDiaTurno: [{ dia: D, turno: 'T1', oee: 0.81, boa: 150000 }, { dia: D, turno: 'T2', oee: 0.62, boa: 120000 }] };
  MOD.data.paradas = { sys: sysOf('paradas'), kpis: [], pend: [{ sev: 1, mod: 'paradas', txt: 'Classificar 4 eventos', link: 'aba=fila', responsavel: '', apoios: [], prazo: null }], ex: { exportsVersion: 1, eventos: [
    { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 64, ordem: '100234567' }, { dia: D, turno: 'T1', equipamento: 'EQ03', codigo: 'FAL', minutos: 20 }, { dia: D, turno: 'T2', equipamento: 'EQ05', codigo: 'TRB', minutos: 27 }, { dia: D, turno: 'T2', equipamento: 'EQ01', codigo: 'OUT', minutos: 5 }, { dia: addDays(D, -1), turno: 'T1', equipamento: 'EQ01', codigo: 'X', minutos: 99 }] } };
  MOD.data.gel.ex = { exportsVersion: 1, estoque: { disponivelKg: 1234.5, coberturaDias: 9 }, vencendo: [{ lp: 'L1', dias: 5 }, { lp: 'L2', dias: 20 }] };
  MOD.data.perdas.ex = Object.assign(MOD.data.perdas.ex || {}, { exportsVersion: 1, porMes: [{ per: mes, liquido: 18400 }] });
  App.show('fila'); return { D };
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pe = [];
  const p = await ctx.newPage(); p.on('pageerror', e => pe.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(PG + 'Portal.html'); await p.waitForTimeout(900); const { D } = await p.evaluate(PREP); await p.waitForTimeout(300);
  // o Portal troca o cadastro em memória (Cad.base) depois de entrar no teste: usuários com área e meta postos depois disso
  const USR = () => { const C = vacCad(); C.usuarios = [{ codigo: '1', nome: 'J. Lima', area: 'Manutenção', ativo: true }, { codigo: '2', nome: 'R. Nunes', area: 'Manutenção', ativo: true }, { codigo: '3', nome: 'A. Souza', area: 'Produção', ativo: true }]; C.metasArea = [{ codigo: 'WASTE-MES', ativo: true, vigencias: [{ de: '2020-01-01', valor: 20000 }] }]; App.render(); };
  await p.evaluate(USR); await p.waitForTimeout(150);
  const lista = () => p.evaluate(() => [...document.querySelectorAll('.fl-i')].map(x => x.querySelector('.fl-t div').textContent));
  // E10a
  let L = await lista();
  ok(L.includes('Ajustar guia EQ03') && L.includes('Apoio na limpeza') && !L.includes('Trocar mola') && !L.includes('Sem dono') && !L.includes('Já feita'), `Minhas (J. Lima): responsável ou apoio, só abertas (${L.join(' | ')})`);
  const g = await p.evaluate(() => [...document.querySelectorAll('h3.fl-g')].map(h => h.childNodes[0].textContent.trim()));
  ok(g[0] === 'Atrasadas' && g.includes('Sem prazo'), `grupos por prazo (${g.join(', ')})`);
  const badge = await p.evaluate(() => (document.querySelector('#nav [data-t="fila"] .cnt') || {}).textContent);
  ok(badge === '1', `aba "Minha fila" com 1 item seu atrasado (${badge})`);
  const href = await p.evaluate(() => [...document.querySelectorAll('.fl-i a')].map(a => a.getAttribute('href'))[0]);
  ok(/^Iniciativas\.html#acao=AC-1$/.test(href), `abre na página dona (${href})`);
  await p.screenshot({ path: SAI + 'fila.png' });
  await p.click('[data-fs="equipe"]'); await p.waitForTimeout(150); L = await lista();
  ok(L.includes('Trocar mola') && L.includes('Ajustar guia EQ03') && !L.includes('Sem dono'), `Minha equipe (área Manutenção): inclui R. Nunes (${L.join(' | ')})`);
  await p.click('[data-fs="sem"]'); await p.waitForTimeout(150); L = await lista();
  ok(L.includes('Sem dono') && L.includes('Classificar 4 eventos') && !L.includes('Ajustar guia EQ03'), `Sem responsável: ação sem dono e pendência das páginas (${L.join(' | ')})`);
  await p.evaluate(() => { localStorage.setItem('vac.userId', '3'); localStorage.setItem('vac.user', 'A. Souza'); Fila.seg = 'equipe'; App.render(); });
  L = await lista(); ok(L.includes('Apoio na limpeza') && !L.includes('Trocar mola'), 'outra pessoa (área Produção): equipe diferente');
  await p.evaluate(() => { localStorage.removeItem('vac.userId'); localStorage.removeItem('vac.user'); Fila.seg = 'minhas'; App.render(); });
  ok(/Entre com o seu ID/.test(await p.evaluate(() => document.getElementById('main').innerText)), 'sem usuário: pede para entrar (item sem responsável nunca aparece em "Minhas")');
  await p.evaluate(() => { localStorage.setItem('vac.user', 'J. Lima'); localStorage.setItem('vac.userId', '1'); });
  // 1.9.37 · Pendências e Minha fila numa tela só ("Pendências e ações"): abre em Minhas; Linha = tudo da linha, ações de início só as atrasadas
  const U = await p.evaluate(() => ({ abas: [...document.querySelectorAll('#nav [data-t]')].map(b => b.dataset.t + '=' + b.textContent.trim()), seg0: (() => { App.show('geral'); return Fila.seg; })() }));
  ok(!U.abas.some(x => /^pend=/.test(x)) && U.abas.some(x => /^fila=Pendências e ações/.test(x)) && U.seg0 === 'minhas', `uma aba só, "Pendências e ações", que abre em Minhas (${U.abas.join(' | ')})`);
  await p.evaluate(() => App.show('pend')); await p.waitForTimeout(200);
  const V = await p.evaluate(() => ({ tab: App.tab, seg: Fila.seg, on: (document.querySelector('#flSeg .on') || {}).textContent }));
  ok(V.tab === 'fila' && V.seg === 'linha' && /^Linha/.test(V.on || ''), `#pend (antiga aba Pendências) abre a visão Linha (${V.on})`);
  L = await lista();
  const pillU = await p.evaluate(() => { const i = [...document.querySelectorAll('.fl-i')].find(x => /Classificar 4 eventos/.test(x.innerText)); return i && /atenção/.test(i.innerText); });
  ok(L.includes('Ajustar guia EQ03') && L.includes('Classificar 4 eventos') && !L.includes('Trocar mola') && !L.includes('Sem dono') && !L.includes('Já feita') && pillU, `Linha: todas as pendências (urgência escrita: "atenção") e só as ações atrasadas (${L.join(' | ')})`);
  ok(/Ver todas as ações \(4\)/.test(await p.evaluate(() => (document.getElementById('flTodas') || {}).textContent || '')), 'Linha: botão "Ver todas as ações (4)"');
  await p.click('#flTodas'); await p.waitForTimeout(150); L = await lista();
  ok(['Ajustar guia EQ03', 'Trocar mola', 'Apoio na limpeza', 'Sem dono'].every(x => L.includes(x)) && !L.includes('Já feita'), 'Ver todas as ações: as 4 abertas, de qualquer pessoa; concluída não entra');
  await p.click('[data-fa="pagina"]'); await p.waitForTimeout(150);
  const GP = await p.evaluate(() => [...document.querySelectorAll('h3.fl-g')].map(h => h.childNodes[0].textContent.trim()));
  ok(GP.includes('Paradas') && GP.some(x => /Iniciativas/.test(x)), `agrupar por página (${GP.join(', ')})`);
  const C = await p.evaluate(() => [...document.querySelectorAll('#flCont [data-fc]')].map(b => b.dataset.fc + ':' + b.querySelector('b').textContent));
  ok(C.includes('paradas:1') && C.some(x => /^inic:4$/.test(x)), `contadores por página na visão escolhida (${C.join(' · ')})`);
  await p.click('#flCont [data-fc="paradas"]'); await p.waitForTimeout(150); L = await lista();
  ok(L.length === 1 && L[0] === 'Classificar 4 eventos', 'clicar no contador filtra a página');
  await p.click('#flCont [data-fc="paradas"]'); await p.evaluate(() => { Fila.agr = 'prazo'; Fila.todas = false; Fila.seg = 'minhas'; App.render(); }); await p.waitForTimeout(150);
  // E10b
  await p.evaluate(() => App.show('reuniao')); await p.waitForTimeout(250);
  const k = () => p.evaluate(() => [...document.querySelectorAll('.reu-k .kpi')].map(x => x.querySelector('.l').textContent.replace(/\s+/g, ' ').trim() + '=' + x.querySelector('.v').textContent));
  let K = await k();
  ok(K.includes('OEE dia=71,4%') && K.includes('Produzido (boas) dia=412.000') && K.includes('Paradas dia=116 min'), `dia: OEE, produzido e paradas do dia (${K.slice(0, 3).join(' · ')})`);
  ok(K.some(x => /^Gel disponível agora=1\.235 kg$/.test(x)) && K.some(x => /^Waste competência \d\d\/\d{4}=R\$\s?18\.400$/.test(x)) && K.some(x => /^Ações hoje=1 · 0$/.test(x)), `granularidade rotulada: Gel agora, Waste na competência, Ações hoje (${K.slice(3).join(' · ')})`);
  await p.screenshot({ path: SAI + 'reuniao.png', fullPage: true });
  await p.click('[data-rr="T2"]'); await p.waitForTimeout(150); K = await k();
  ok(K.includes('OEE turno T2=62,0%') && K.includes('Paradas turno T2=32 min'), `turno T2: números do turno (${K.slice(0, 3).join(' · ')})`);
  const top = await p.evaluate(() => [...document.querySelectorAll('.reu-par > div')].map(x => x.children[0].textContent));
  ok(top[0] === 'EQ05 · TRB' && top.length === 2, `maiores paradas do turno (${top.join(', ')})`);
  await p.click('[data-rr="dia"]'); await p.waitForTimeout(150);
  await p.fill('#rNovo', 'EQ03 de novo no topo'); await p.click('#rAdd'); await p.waitForTimeout(300);
  await p.fill('.reu-dec', 'Manutenção avalia mola hoje'); await p.click('[data-dec]'); await p.waitForTimeout(300);
  await p.click('#rFoto'); await p.waitForTimeout(300);
  const R = await p.evaluate(d => Store.B.reunioes[d + '|dia'], D);
  ok(R && R.itens.length === 1 && R.itens[0].decisao === 'Manutenção avalia mola hoje' && R.itens[0].por === 'J. Lima', 'pauta e decisão gravadas no Portal (por dia e recorte), com quem');
  ok(R && R.foto && R.foto.k.some(x => /^OEE \(dia\)$/.test(x[0]) && x[1] === '71,4%'), 'fotografia dos números guardada com a pauta');
  const enc = await p.evaluate(() => { const a = [...document.querySelectorAll('.reu-it a')].find(x => /nova=/.test(x.href)); return a && JSON.parse(decodeURIComponent(a.getAttribute('href').split('#nova=')[1])); });
  ok(enc && enc.origem.tipo === 'reuniao' && enc.titulo === 'EQ03 de novo no topo' && enc.descricao === 'Manutenção avalia mola hoje', 'Encaminhar ao Planner: abre Iniciativas com o item e a decisão');
  const ac = await p.evaluate(() => { const a = document.querySelector('.reu-par a[target]'); return a && JSON.parse(decodeURIComponent(a.getAttribute('href').split('#nova=')[1])); });
  ok(ac && ac.vinculos.some(v => v.tipo === 'ordem' && v.cod === '100234567') && ac.origem.foto.minutos === 84, '+ Ação na maior parada: vínculos (equipamento, código, ordem) e fotografia');
  // Pauta automática (Portal 1.9.21 / Iniciativas 1.1.5): ações por item, gravadas na reunião, publicadas no exports e criadas por Iniciativas sem duplicar
  for (const [q, r, z] of [['Trocar a vedação do EQ03', 'R. Nunes', addDaysN(4)], ['Conferir a mola', '', null]]) {
    await p.fill('.reu-aq', q); await p.fill('.reu-ar', r); await p.evaluate(z => { const i = document.querySelector('.reu-ap'); i.value = z || ''; }, z);
    await p.click('[data-nac]'); await p.waitForTimeout(300);
  }
  const R2 = await p.evaluate(d => Store.B.reunioes[d + '|dia'], D), A2 = R2.itens[0].acoes || [];
  ok(A2.length === 2 && A2[0].oque === 'Trocar a vedação do EQ03' && A2[0].resp === 'R. Nunes' && /^\d{4}-\d{2}-\d{2}$/.test(A2[0].prazo) && A2[1].prazo === null && A2[0].por === 'J. Lima', 'pauta: várias ações por item (o quê, responsável, prazo) gravadas na reunião');
  const EX = await p.evaluate(() => PAGE.exports(Store.B).acoesReuniao);
  ok(EX.length === 2 && EX[0].ref === 'reuniao|' + D + '|dia|' + R2.itens[0].id + '|' + A2[0].id && /Decisão: Manutenção avalia mola hoje/.test(EX[0].descricao) && /^Portal\.html#reuniao=/.test(EX[0].link.replace(/^.*\//, '')), 'exports.acoesReuniao com ref única, item/decisão na descrição e link da reunião');
  let sit = await p.evaluate(() => [...document.querySelectorAll('.reu-ac .reu-st')].map(x => x.textContent));
  ok(sit.length === 2 && sit.every(t => /aguardando Iniciativas/.test(t)), 'reunião: ação ainda não criada aparece como "aguardando Iniciativas"');
  await p.evaluate(id => { MOD.data.inic.ex.acoes.push({ id: 'AC-R-' + id, titulo: 'Trocar a vedação do EQ03', status: 'em andamento', responsavel: 'R. Nunes', prazo: addDays(todayISO(), 4), atrasada: false, origem: { tipo: 'reuniao' }, vinculos: [], checklist: [0, 0] }); App.render(); }, A2[0].id);
  sit = await p.evaluate(() => [...document.querySelectorAll('.reu-ac .reu-st')].map(x => x.textContent));
  ok(sit[0].startsWith('AC-R-' + A2[0].id + ' · em andamento') && /aguardando/.test(sit[1]), `reunião mostra a situação lida de Iniciativas (${sit[0]})`);
  {
    const ip = await ctx.newPage(); ip.on('pageerror', e => pe.push('inic: ' + e.message));
    await ip.goto(PG + 'Iniciativas.html#teste'); await ip.waitForTimeout(700);
    const n = await ip.evaluate(async ex => {
      vacFicha.carregar = async () => { }; vacFicha.dados = id => id === 'portal' ? { estado: 'pasta', d: { acoesReuniao: ex } } : null;
      const antes = Store.data.acoes.length; await ImpReuniao.rodar(); await ImpReuniao.rodar();
      const R = Store.data.acoes.filter(a => (a.origem || {}).tipo === 'reuniao' && /^AC-R-/.test(a.id));
      return { novas: Store.data.acoes.length - antes, R: R.map(a => [a.id, a.titulo, a.responsavel, a.prazo, a.origem.ref, a.status]) };
    }, EX);
    ok(n.novas === 2 && n.R.length === 2 && n.R[0][0] === 'AC-R-' + A2[0].id && n.R[0][2] === 'R. Nunes' && n.R[0][4] === EX[0].ref && n.R[0][5] === 'a fazer', `Iniciativas cria as ações da reunião ao abrir, sem duplicar ao rodar de novo (${n.novas} nova(s))`);
    await ip.close();
  }
  await p.click('#rRel'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !!document.querySelector('.modal.on, .rep, #repModal, [id^="rep"]')), 'relatório da reunião (PDF, Outlook, texto) abre a prévia');
  await p.keyboard.press('Escape');
  // 390 px
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const q = await c2.newPage(); q.on('pageerror', e => pe.push(e.message)); await q.goto(PG + 'Portal.html'); await q.waitForTimeout(800); await q.evaluate(PREP); await q.waitForTimeout(300); await q.evaluate(USR);
  for (const t of ['fila', 'reuniao']) { await q.evaluate(t => App.show(t), t); await q.waitForTimeout(200); const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(sw <= 1, `${t} a 390 px sem rolagem horizontal (${sw}px)`); await q.screenshot({ path: SAI + t + '-390.png', fullPage: true }); }
  await c2.close();
  ok(!pe.length, 'sem erro de página' + (pe.length ? ': ' + pe.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(errs.length ? `\n${errs.length} falha(s)` : '\nsem erros'); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
