// Análise comum 26/11/2026 (P4): o que sai da lista ativa da trilha vai para o arquivo histórico mensal e fica 12 meses. Pasta fictícia em OPFS.
const assert = require('assert/strict'), abrir = require('./pasta-ficticia.cjs');
(async () => {
  await abrir('perdas', 'Módulo Waste', async f => {
    await f.waitForFunction(() => ST.mode === 'pasta', null, { timeout: 30000 });
    const r = await f.evaluate(async () => {
      const d = await subDir(PAGE.backupDir), vel = await (await d.getFileHandle('historico-auditoria_2025-01.jsonl', { create: true })).createWritable(); await vel.write('{"t":"2025-01-05T10:00:00Z","u":"antigo"}\n'); await vel.close();
      B.audit = Array.from({ length: 3000 }, (_, i) => ({ t: (i < 2 ? '2026-10-0' + (i + 1) : '2026-11-10') + 'T10:00:00.000Z', u: 'x' + i, a: 'a', d: '' }));
      await commit('teste histórico', b => { b.zzx = 1; }); await new Promise(r => setTimeout(r, 1500));
      const nomes = []; for await (const [n] of d.entries()) if (/^historico-auditoria_/.test(n)) nomes.push(n);
      const txt = await (await (await d.getFileHandle('historico-auditoria_2026-10.jsonl')).getFile()).text();
      return { nomes: nomes.sort(), linhas: txt.trim().split('\n').map(x => JSON.parse(x).u), ativa: B.audit.length };
    });
    assert.deepEqual(r.nomes, ['historico-auditoria_2026-10.jsonl'], 'o arquivo de 2025 (mais de 12 meses) foi removido e o do mês entrou: ' + JSON.stringify(r.nomes));
    assert.equal(r.ativa, 3000, 'a lista ativa continua com 3.000 eventos'); assert.deepEqual(r.linhas, ['x0'], 'a entrada que saiu ficou no arquivo: ' + JSON.stringify(r.linhas));
    console.log('ok histórico da auditoria: o que sai da lista ativa vai para o arquivo mensal e arquivos com mais de 12 meses são apagados');
  });
})().catch(e => { console.error(e); process.exit(1); });
