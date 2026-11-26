// P4 (análise comum 26/11/2026): Administração › Auditoria mostra o "Histórico arquivado": escolhe o módulo (Cadastro, Administração,
// Waste, Ordens) e o mês, lê o historico-auditoria_AAAA-MM.jsonl da pasta de backups, normaliza os formatos de cada trilha (Em, Por e ID,
// Ação, Detalhe), filtra por texto e não grava nada. Pasta fictícia em OPFS.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('portal', 'Módulo Administração', async f => {
    await f.waitForFunction(() => typeof Cad !== 'undefined' && Store.mode === 'pasta' && Cad.D && typeof cadHistArq === 'function', null, { timeout: 60000 });
    const r = await f.evaluate(async () => {
      const put = async (pasta, nome, L) => { const d = await Store.sub(pasta, true), w = await (await d.getFileHandle(nome, { create: true })).createWritable(); await w.write(L.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join('\n') + '\n'); await w.close(); };
      await put('00. Backups/Cadastros', 'historico-auditoria_2026-08.jsonl', [{ em: '2026-08-03T10:00:00', por: 'Pessoa A', acao: 'edição', tipo: 'linhas', codigo: 'VAC', campo: 'nome', antes: 'X', depois: 'Y', motivo: 'ajuste' }]);
      await put('00. Backups/Cadastros', 'historico-auditoria_2026-09.jsonl', [{ em: '2026-09-04T10:00:00', por: 'Pessoa B', acao: 'criação', tipo: 'turnos', codigo: 'T9' }, 'linha {quebrada']);
      await put('00. Backups/Perdas', 'historico-auditoria_2026-07.jsonl', [{ t: '2026-07-05T08:00:00Z', u: 'Pessoa C', uid: '9101', a: 'Lançamento', d: 'scrap 12 kg' }, { t: '2026-07-06T08:00:00Z', u: 'Pessoa D', uid: '9102', a: 'Exclusão', d: 'registro 7' }]);
      const box = document.createElement('div'); box.id = 'caixaTeste'; document.body.appendChild(box); const el = document.createElement('div'); box.appendChild(el);
      const espera = () => new Promise(r => setTimeout(r, 400)), linhas = () => [...document.querySelectorAll('#audHist table tr')].slice(1).map(tr => tr.innerText.replace(/\s+/g, ' ').trim());
      const antes = []; for await (const [n] of (await Store.sub('00. Backups/Cadastros', false)).entries()) antes.push(n);
      Cad.ui.aud.h = null; cadAuditoria(el); await espera();
      const o = { meses: [...document.querySelectorAll('#hMes option')].map(x => x.value), cad: linhas() };
      const sel = (id, v) => { const s = document.querySelector(id); s.value = v; s.dispatchEvent(new Event('change')); };
      sel('#hMes', '2026-08'); await espera(); o.cadAgo = linhas();
      sel('#hMod', 'Perdas'); await espera(); o.waste = linhas();
      const q = document.querySelector('#hQ'); q.value = '9102'; q.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 900)); o.busca = linhas();
      sel('#hMod', 'Ordens'); await espera(); o.ordens = document.querySelector('#audHist').innerText.replace(/\s+/g, ' ');
      const depois = []; for await (const [n] of (await Store.sub('00. Backups/Cadastros', false)).entries()) depois.push(n);
      o.semGravar = JSON.stringify(antes.sort()) === JSON.stringify(depois.sort());
      return o;
    });
    assert.deepEqual(r.meses, ['2026-09', '2026-08'], 'meses do mais novo para o mais velho: ' + JSON.stringify(r));
    assert.equal(r.cad.length, 2, JSON.stringify(r)); assert.match(r.cad.join(' | '), /linha ilegível/); assert.match(r.cad.join(' | '), /Pessoa B.*criação.*Turno|Pessoa B.*criação/);
    assert.equal(r.cadAgo.length, 1); assert.match(r.cadAgo[0], /Pessoa A.*edição.*VAC.*nome.*X → Y.*ajuste/, JSON.stringify(r.cadAgo));
    assert.equal(r.waste.length, 2); assert.match(r.waste[0], /Pessoa D 9102 Exclusão registro 7/, 'Waste: mais recente primeiro, com o ID: ' + JSON.stringify(r.waste));
    assert.deepEqual(r.busca.length, 1); assert.match(r.busca[0], /9102/);
    assert.match(r.ordens, /Nenhum arquivo de histórico em 00\. Backups\/Ordens/, 'módulo sem arquivo avisa, sem erro: ' + r.ordens);
    assert.ok(r.semGravar, 'a consulta não grava nada');
    console.log('ok histórico arquivado: módulo e mês, formatos das trilhas normalizados (com ID), busca, linha ilegível marcada, módulo sem arquivo avisa e nada é gravado');
  });
})().catch(e => { console.error(e); process.exit(1); });
