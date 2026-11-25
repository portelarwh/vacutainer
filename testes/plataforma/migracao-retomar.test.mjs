// Migrador pontual (D02): retomada, reversão e retenção dos backups da migração, numa pasta em memória e com dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import helpers from '../../scripts/html.cjs';
import {travasTeste, carregarBackupRegistro} from './pasta-memoria.mjs';
import {ASSUNTOS, BK, CAD, EQUIP, INIC, M, ORDEM, REG, SESSAO, aplicar, bases, lerBase, montar, opcoes, restaurar, retomar} from './migracao-aplicar-comum.mjs';

test('(a) a retenção de backups (backupDias) não apaga os backups da migração', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const velho = Date.now() - 60 * 864e5;
  for (const f of ORDEM) await fs.datar(r.registro.arquivos[f].backup, velho);
  // pasta de backup comum do módulo, com mais de 10 cópias antigas: a limpeza apaga as antigas
  for (let i = 0; i < 12; i++) { await fs.gravar('00. Backups/Cadastros/vacutainer-cadastros-' + i + '.json', '{}'); await fs.datar('00. Backups/Cadastros/vacutainer-cadastros-' + i + '.json', velho - i); }
  const reg = carregarBackupRegistro(7);
  for (const m of new Set(Object.values(BK))) { try { await reg.limpar(await fs.pasta('00. Backups/' + m)); } catch (e) { if (e.name !== 'NotFoundError') throw e; } }
  assert.equal((await fs.listar('00. Backups/Cadastros')).length, 10, 'a limpeza rodou na pasta do módulo');
  for (const f of ORDEM) {
    assert.match(r.registro.arquivos[f].backup, /^00\. Backups\/Migracao\//, f);
    assert.equal(await fs.existe(r.registro.arquivos[f].backup), true, f + ': backup da migração preservado');
  }
});

/* Execução completa numa pasta, para comparar com a retomada. */
async function completa() {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes());
  assert.equal(r.ok, true, r.motivo);
  const out = {};
  for (const f of ORDEM) out[f] = await lerBase(fs, f);
  return out;
}
const interrompe = alvo => ({aoGravar: f => { if (f === alvo) throw new Error('queda simulada em ' + f); }});

for (const alvo of [CAD, INIC]) test('(c) interrupção depois de gravar ' + alvo + ': retomar conclui sem duplicar', async () => {
  const esperado = await completa();
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(alvo))), /queda simulada/);
  const gravados = bases(fs).map(x => x.caminho.slice('00. Bases/'.length));
  assert.deepEqual(gravados, ORDEM.slice(0, ORDEM.indexOf(alvo) + 1));
  const ret = await retomar(pasta);
  assert.ok(ret.registro, 'achou o diário');
  assert.equal(ret.registro.id, '2026-11-25T14-30-00');
  assert.deepEqual(ret.concluidos, gravados);
  assert.deepEqual(ret.pendentes, ORDEM.filter(f => !gravados.includes(f)));
  assert.deepEqual(ret.mudaram, []);
  const antes = fs.log.length;
  const r = await aplicar(pasta, ret.registro.plano, opcoes({escolhas: ret.registro.escolhas, registro: ret.registro}));
  assert.equal(r.ok, true, r.motivo);
  for (const f of gravados) assert.equal(r.resultado[f], 'ja-concluido', f);
  for (const f of ret.pendentes) assert.equal(r.resultado[f], 'gravado', f);
  assert.deepEqual(bases({log: fs.log.slice(antes)}).map(x => x.caminho.slice('00. Bases/'.length)), ret.pendentes, 'só os pendentes, na ordem');
  for (const f of ORDEM) assert.equal(M.canonico(await lerBase(fs, f)), M.canonico(esperado[f]), f + ': igual à execução sem queda');
  const inic = await lerBase(fs, INIC), cad = await lerBase(fs, CAD);
  const ids = inic.acoes.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length, 'sem ação duplicada');
  assert.equal(ids.filter(x => /^AC-W-/.test(x)).length, 2);
  assert.equal(inic.eventos.filter(e => /^MIGW-EV-/.test(e.id)).length, 2);
  assert.equal(inic.importacoes.length, 1);
  for (const c of cad.catalogos) if (c.gel && c.gel.vig) assert.equal(new Set(c.gel.vig.map(v => v.from)).size, c.gel.vig.length, c.codigo + ': sem vigência duplicada');
  assert.equal(cad.auditoria.length, 1, 'uma entrada de auditoria no cadastro');
  const fim = JSON.parse(await fs.ler(REG));
  assert.equal(fim.estado, 'concluido');
  for (const f of gravados) assert.equal(fim.arquivos[f].estado, 'ja-concluido', f);
  // depois de concluído, nada mais a retomar; aplicar de novo o mesmo plano não grava nada
  const de2 = await retomar(pasta);
  assert.equal(de2.registro, null);
  const n = fs.log.length;
  const r2 = await aplicar(pasta, plano, opcoes());
  assert.equal(r2.ok, false);
  assert.equal(bases({log: fs.log.slice(n)}).length, 0);
});

test('(c) retomar: pendente mudado por outro gravador fica não tocado, sem impedir os outros', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(CAD))), /queda simulada/);
  const eq = await lerBase(fs, EQUIP); eq.os[0].titulo = 'Outra pessoa gravou';
  await fs.gravar('00. Bases/' + EQUIP, JSON.stringify(eq));
  const ret = await retomar(pasta);
  assert.deepEqual(ret.naoTocados, [EQUIP]);
  assert.deepEqual(ret.mudaram, []);
  const n = fs.log.length;
  const r = await aplicar(pasta, ret.registro.plano, opcoes({escolhas: ret.registro.escolhas, registro: ret.registro}));
  assert.equal(r.ok, false);
  assert.equal(r.resultado[EQUIP], 'nao-tocado');
  assert.deepEqual(bases({log: fs.log.slice(n)}).map(x => x.caminho.slice('00. Bases/'.length)), ORDEM.filter(f => ![CAD, EQUIP].includes(f)));
  assert.equal((await lerBase(fs, EQUIP)).os[0].titulo, 'Outra pessoa gravou');
});

test('retomar sem diário pendente devolve registro nulo', async () => {
  const {pasta} = await montar();
  assert.deepEqual(await retomar(pasta), {registro: null, pendentes: [], concluidos: [], naoTocados: [], mudaram: [], erros: [], ilegiveis: []});
});

test('(d) restaurar devolve os arquivos afetados ao conteúdo do backup', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(aplicar(pasta, plano, opcoes(interrompe(INIC))), /queda simulada/);
  const {registro} = await retomar(pasta);
  const r = await restaurar(pasta, registro, null, {sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()});
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.resultado[CAD], 'restaurado');
  assert.equal(r.resultado[INIC], 'restaurado');
  for (const f of ORDEM.slice(2)) assert.equal(r.resultado[f], 'ja-restaurado', f);
  for (const f of ORDEM) assert.equal(await M.hash(await lerBase(fs, f)), plano.alteracoes[f].hashAntes, f);
  const fim = JSON.parse(await fs.ler(REG));
  assert.equal(fim.estado, 'restaurado');
  assert.equal(fim.arquivos[CAD].estado, 'restaurado');
  assert.equal((await retomar(pasta)).registro, null, 'restaurado não é retomado');
});

test('(d) restaurar só os arquivos pedidos; arquivo mudado depois do corte não é sobrescrito', async () => {
  const {fs, pasta, plano} = await montar();
  const ap = await aplicar(pasta, plano, opcoes());
  assert.equal(ap.ok, true);
  const eq = await lerBase(fs, EQUIP); eq.os[0].titulo = 'Gravado depois do corte';
  await fs.gravar('00. Bases/' + EQUIP, JSON.stringify(eq));
  const op = {sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()};
  const r = await restaurar(pasta, ap.registro, [CAD, EQUIP], op);
  assert.equal(r.resultado[CAD], 'restaurado');
  assert.equal(r.resultado[EQUIP], 'pulado-mudou');
  assert.equal(r.resultado[INIC], undefined);
  assert.equal(await M.hash(await lerBase(fs, CAD)), plano.alteracoes[CAD].hashAntes);
  assert.equal((await lerBase(fs, EQUIP)).os[0].titulo, 'Gravado depois do corte');
  assert.equal(await M.hash(await lerBase(fs, INIC)), ap.registro.arquivos[INIC].hashDepois);
});

test('(d) restaurar sem sessão ou com confirmação errada recusa sem gravar', async () => {
  const {fs, pasta, plano} = await montar();
  const ap = await aplicar(pasta, plano, opcoes());
  const n = fs.log.length;
  for (const op of [{sessao: null, confirmacao: M.CONFIRMACAO_RESTAURAR}, {sessao: SESSAO, confirmacao: 'x'}]) {
    const r = await restaurar(pasta, ap.registro, null, {...op, janela: true, travas: travasTeste()});
    assert.equal(r.ok, false);
  }
  assert.equal(fs.log.length, n);
});

test('a lista de assuntos da Administração do migrador é a mesma do motor/portal', () => {
  const t = helpers.current().text('motor/portal');
  const ids = [...t.match(/const ADM_ASSUNTOS=\[([\s\S]*?)\];/)[1].matchAll(/\{id:'([a-z]+)'/g)].map(m => m[1]);
  assert.deepEqual(ids, ASSUNTOS);
  assert.deepEqual([...M.ASSUNTOS_ADM], ASSUNTOS);
});
