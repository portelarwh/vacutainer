// Plataforma 1.8.109 · auditoria técnica de 28/11/2026 (Codex, revisada): ferramentas de Saúde dos dados. Dados fictícios, sem pasta real.
//  A07 Comparar importação: com "Manter descrições" desmarcado, um nome curto numa coluna desconhecida é trocado na amostra, e a conferência
//      acusa texto do original que sobrar;
//  A18 Verificar pasta: arquivo com JSON null vira erro daquela linha sem parar a varredura; cadastro sem a versão de formato atual e base sem
//      schemaVersion não recebem OK.
const { chromium } = require('playwright'), assert = require('assert/strict');
const H = require('../../scripts/html.cjs');
(async () => {
  const app = process.env.PLATAFORMA_HTML ? H.fromHtml(require('fs').readFileSync(process.env.PLATAFORMA_HTML, 'utf8')) : H.load();
  let browser;
  try {
    browser = await chromium.launch(require('./chromium.cjs')());
    const erros = [];
    const abrir = async id => { const p = await browser.newPage(); p.on('pageerror', e => erros.push(id + ': ' + e.message)); await p.route(/^https?:/, r => r.abort()); await p.setContent(app.assemble(id), { waitUntil: 'load' }); return p; };

    // A07
    { const p = await abrir('ferramenta/comparar');
      const r = await p.evaluate(() => {
        const sel = document.getElementById('tipo'); sel.value = 'KKBC_ORD';
        document.getElementById('keepDesc').checked = false;
        document.getElementById('txt').value = ['Ordem;Material;Contato;Custos teór.totais;Total custos reais', '100234999;10000001;Ana Lima;1.000,00;1.100,00', '100234999;10000002;Ana Lima;200,00;250,00'].join('\n');
        analisar();
        return { amostra: document.getElementById('out').value, seg: document.getElementById('seg').innerText };
      });
      assert.doesNotMatch(r.amostra, /Ana Lima/, 'o nome fictício da coluna desconhecida não vai para a amostra (A07)');
      assert.doesNotMatch(r.seg, /ainda aparecem/, 'conferência sem sobra: ' + r.seg);
      console.log('ok A07 Comparar importação: nome curto em coluna desconhecida é trocado na amostra');
      const r2 = await p.evaluate(() => { const T = trocaCelula; window.trocaCelula = (v, t, m) => /Ana/.test(v) ? v : T(v, t, m); try { analisar(); } finally { window.trocaCelula = T; } return document.getElementById('seg').innerText; });
      assert.match(r2, /ainda aparecem/, 'se algum texto de pessoa sobrar, a conferência acusa: ' + r2);
      console.log('ok A07: a conferência acusa texto do original que sobrou ("' + r2.slice(0, 70) + '…")');
      await p.close(); }

    // A18
    { const p = await abrir('ferramenta/verificar');
      const r = await p.evaluate(async () => {
        const f = (nome, obj) => new File([typeof obj === 'string' ? obj : JSON.stringify(obj)], nome, { lastModified: Date.now() });
        const mapa = new Map([
          ['00. Bases/vacutainer-cadastros.json', f('vacutainer-cadastros.json', { schema: 'vac-cadastros', schemaVersion: 0, rev: 1, appVersion: 'Portal 1.9.108' })],
          ['00. Bases/portal-base.json', f('portal-base.json', 'null')],
          ['00. Bases/oee-vacutainer-base.json', f('oee-vacutainer-base.json', { rev: 1, appVersion: '2.6.51', exports: { exportsVersion: 1 } })],
          ['00. Bases/perdas-base.json', f('perdas-base.json', { schemaVersion: 1, rev: 1, appVersion: '1.12.22', exports: { exportsVersion: 1 } })]]);
        let falhou = null, R = null; try { R = await conferir({ nome: 'Pasta fictícia', mapa, cortado: false }); mostrar(R); } catch (e) { falhou = e.message; }
        const linhas = [...document.querySelectorAll('tr')].map(tr => tr.innerText.replace(/\s+/g, ' '));
        const de = arq => linhas.find(l => l.includes(arq)) || '';
        return { falhou, cad: de('vacutainer-cadastros.json'), portal: de('portal-base.json'), oee: de('oee-vacutainer-base.json'), perdas: de('perdas-base.json') };
      });
      assert.equal(r.falhou, null, 'a varredura não para no JSON null (A18)');
      assert.match(r.portal, /não é um objeto JSON/, 'JSON null vira erro da linha: ' + r.portal);
      assert.match(r.cad, /formato 0 \(esperado 2\)/, 'cadastro de formato zero não recebe OK: ' + r.cad);
      assert.match(r.oee, /sem versão de formato/, 'base sem schemaVersion não recebe OK: ' + r.oee);
      assert.doesNotMatch(r.perdas, /sem versão de formato|não é um objeto/, 'base com schemaVersion segue normal');
      console.log('ok A18 Verificar pasta: JSON null é erro da linha e a varredura continua; formato zero e base sem schemaVersion não recebem OK');
      await p.close(); }
    assert.deepEqual(erros, [], 'sem erro de JavaScript');
  } finally { if (browser) await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
