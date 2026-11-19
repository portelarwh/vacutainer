// Plataforma 1.8.21 (Produção 2.6.16, Paradas 1.2.18) · TUR-05: dia em aberto criado antes de a Produção ler a vigência nova do turno
// (sábado 06:00–13:30) fica com o horário antigo: o Lançamento avisa e "Aplicar o horário novo" passa o dia ao horário vigente, mantendo a
// produção das horas que continuam; recusa quando há produção numa hora que some; depois do cadastro aplicado, a lista de dias em aberto.
// PAR-BUSCA: o tipo de parada se busca por texto ("setup"). Dados fictícios (demonstração).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../../Plataforma.html'));
(async () => {
  const srv = http.createServer((q, r) => { r.setHeader('Content-Type', 'text/html'); r.end(html); });
  let browser;
  try {
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    browser = await chromium.launch(require('./chromium.cjs')());
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), erros = [];
    page.on('pageerror', e => erros.push(e.message)); page.on('dialog', d => d.accept('sábado com 1 h a menos'));
    await page.goto('http://127.0.0.1:' + srv.address().port + '/?demo=1');
    await page.getByRole('heading', { name: 'Visão da linha' }).waitFor();
    const w = ms => page.waitForTimeout(ms || 500);

    // 0) Administração: o 1º turno ganha, a partir de um dia passado, a linha do sábado 06:00–13:30
    await page.evaluate(() => { location.hash = '#/portal'; });
    const f = await (await page.locator('iframe[title="Módulo Administração"]').elementHandle()).contentFrame(); await f.waitForFunction(() => typeof Cad !== 'undefined' && Cad.D);
    const datas = await f.evaluate(async () => { const iso = x => x.toISOString().slice(0, 10), h = new Date(); h.setUTCHours(12, 0, 0, 0);
      const de = new Date(h); de.setUTCDate(de.getUTCDate() - 3); const sab = new Date(h); do sab.setUTCDate(sab.getUTCDate() + 1); while (sab.getUTCDay() !== 6); const sab2 = new Date(sab); sab2.setUTCDate(sab2.getUTCDate() + 7);
      const it = Cad.D.turnos.find(t => t.codigo === 'T1'), antes = JSON.parse(JSON.stringify(it.vigencias)), v0 = antes[antes.length - 1], dep = JSON.parse(JSON.stringify(antes)), D0 = iso(de);
      dep[dep.length - 1].ate = iso(new Date(de.getTime() - 864e5));
      dep.push({ ...v0, de: D0, ate: null, dias: [1, 2, 3, 4, 5] }, { ...v0, de: D0, ate: null, fim: '13:30', dias: [6] });
      await Cad.ops([{ acao: 'edição', tipo: 'turnos', codigo: 'T1', mudancas: { vigencias: { antes, depois: dep } }, motivo: 'sábado com 1 h a menos' }]);
      return { sab: iso(sab), sab2: iso(sab2) }; });

    // 1) Produção: dois sábados criados ANTES de ler o cadastro (horário antigo 06:00–14:30), com produção lançada
    await page.evaluate(() => { location.hash = '#/oee?tab=launch'; });
    const o = await (await page.locator('iframe[title="Módulo Produção"]').elementHandle()).contentFrame(); await o.waitForFunction(() => window.vacPagina?.pronto());
    const r1 = await o.evaluate(async ({ sab, sab2 }) => {
      const ivDe = (dt, ini) => { const d = db().productionDays.find(x => !x.deleted && x.date === dt), ps = d.shifts.find(p => p.snap.code === 'T1'); return { d, iv: ps.intervals.find(i => !i.deleted && U.hhmm(i.start) === ini) }; };
      Actions.createDay(sab, 'line_vac', 'mac_line'); Actions.createDay(sab2, 'line_vac', 'mac_line');
      let x = ivDe(sab, '06:00'); Actions.setIv(x.d.id, x.iv.id, 'good', 50000);           // hora que continua
      x = ivDe(sab2, '13:00'); Actions.setIv(x.d.id, x.iv.id, 'good', 30000);              // 13:00–14:30: deixa de existir no sábado (vira 12:00–13:30)
      const antes = db().productionDays.find(d => !d.deleted && d.date === sab).shifts.find(p => p.snap.code === 'T1').snap.end;
      CadSync.aplicar(db(), vacCad(), () => {}); try { Engine.bumpConfig(); } catch (e) { }   // o que a sincronização faz com a pasta conectada
      App.sel.date = sab; go('launch'); render(); await new Promise(r => setTimeout(r, 400));
      const b = document.querySelector('#horNovo'); return { antes, aviso: b ? b.textContent.replace(/\s+/g, ' ') : '' };
    }, datas);
    assert.equal(r1.antes, '14:30', 'sábado criado antes ficou com o horário antigo');
    assert.match(r1.aviso, /O horário do turno mudou no cadastro.*06:00–14:30 → 06:00–13:30/, 'aviso no Lançamento: ' + r1.aviso);
    console.log('ok Lançamento: sábado criado antes da vigência nova avisa "06:00–14:30 → 06:00–13:30"');

    // 2) Aplicar o horário novo: T1 do sábado fica 06:00–13:30 (7 intervalos) e a produção das 06:00 continua
    await o.click('#horAplicar'); await w(500);
    const r2 = await o.evaluate(sab => { const d = db().productionDays.find(x => !x.deleted && x.date === sab), ps = d.shifts.find(p => p.snap.code === 'T1'), iv = ps.intervals.filter(i => !i.deleted);
      return { fim: ps.snap.end, n: iv.length, ultimo: U.hhmm(iv[iv.length - 1].end), seis: (iv.find(i => U.hhmm(i.start) === '06:00') || {}).good, aviso: !!document.querySelector('#horNovo'),
        aud: (db().auditLog || []).some(a => a.field === 'horário dos turnos' && /T|Turno/.test(a.after || '')) }; }, datas.sab);
    assert.deepEqual(r2, { fim: '13:30', n: 7, ultimo: '13:30', seis: 50000, aviso: false, aud: true }, JSON.stringify(r2));
    console.log('ok "Aplicar o horário novo": 1º turno 06:00–13:30 (7 intervalos), produção das 06:00 mantida, registrado no histórico');

    // 3) produção numa hora que some (13:00–14:30): recusa e diz qual; nada muda
    const r3 = await o.evaluate(sab2 => { const d = db().productionDays.find(x => !x.deleted && x.date === sab2); let msg = ''; try { Actions.applyShiftSchedule(d.id); } catch (e) { msg = e.message; }
      return { msg, fim: d.shifts.find(p => p.snap.code === 'T1').snap.end }; }, datas.sab2);
    assert.match(r3.msg, /13:00–14:30/); assert.equal(r3.fim, '14:30');
    console.log('ok com produção em 13:00–14:30 (hora que some no sábado) recusa e diz a hora; o dia não muda');

    // 4) depois do cadastro aplicado: lista dos dias em aberto com o horário antigo (o com produção na hora que some aparece para revisar)
    const r4 = await o.evaluate(async () => { offerCadShiftApply(); await new Promise(r => setTimeout(r, 300)); const m = document.querySelector('.overlay'); const t = m ? m.textContent.replace(/\s+/g, ' ') : ''; document.querySelectorAll('.overlay').forEach(x => x.remove()); return t; });
    assert.match(r4, /Horário dos turnos mudou no cadastro/); assert.match(r4, /com produção lançada/);
    console.log('ok lista dos dias em aberto com o horário antigo depois de aplicar o cadastro');

    // 5) PAR-BUSCA: "setup" filtra o tipo de parada; uma opção só é escolhida sozinha
    const r5 = await o.evaluate(async sab => { App.sel.date = sab; render(); await new Promise(r => setTimeout(r, 300)); eventModal(curDay(), null, null); await new Promise(r => setTimeout(r, 300));
      const inp = document.querySelector('.vac-filtro'), sel = document.querySelector('#eCode'), norm = x => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const vis = () => [...sel.options].filter(o => o.value && !o.hidden).map(o => o.textContent + (o.parentElement.tagName === 'OPTGROUP' ? ' [' + o.parentElement.label + ']' : ''));
      inp.value = 'setup'; inp.dispatchEvent(new Event('input')); const A = vis();
      const todos = [...sel.options].filter(o => o.value).length, uma = [...sel.options].find(o => o.value);
      inp.value = norm(uma.textContent); inp.dispatchEvent(new Event('input')); const B = { vis: vis().length, sel: sel.value === uma.value };
      inp.value = ''; inp.dispatchEvent(new Event('input')); const C = vis().length;
      document.querySelectorAll('.overlay').forEach(x => x.remove()); return { A, todos, B, C, ph: inp.placeholder }; }, datas.sab);
    assert.ok(r5.A.length > 0 && r5.A.length < r5.todos && r5.A.every(t => /setup/i.test(t)), 'setup filtra (no nome, no código ou no grupo) ' + JSON.stringify(r5.A));
    assert.deepEqual(r5.B, { vis: 1, sel: true }, 'uma opção só é escolhida'); assert.equal(r5.C, r5.todos, 'sem texto volta a lista toda');
    console.log(`ok Registrar parada: "setup" deixa ${r5.A.length} de ${r5.todos} tipos; uma opção só é escolhida sozinha; sem texto volta tudo`);

    assert.deepEqual(erros, [], 'sem erro de JavaScript'); console.log('ok horário vigente e busca do tipo de parada: sem erro de JavaScript');
  } finally { if (browser) await browser.close(); srv.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
