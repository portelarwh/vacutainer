// Migrador pontual (D02): falhas no meio da aplicação (mudança entre o pré-voo e a gravação, erro de leitura, registro estranho,
// registro que não grava, arquivo pela metade, aba viva, mudança depois da gravação). Pasta em memória, dados fictícios.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CAD, EQUIP, INIC, ORDEM, PORTAL, REG, SESSAO, M, montar, opcoes, lerBase, bases, aplicar, retomar, restaurar} from './migracao-aplicar-comum.mjs';
import {travasTeste} from './pasta-memoria.mjs';

const RESTAURAR = {sessao: SESSAO, confirmacao: M.CONFIRMACAO_RESTAURAR, janela: true, travas: travasTeste()};
const base = f => '00. Bases/' + f;
const mexer = async (fs, f, titulo) => { const d = await lerBase(fs, f); d.mexido = titulo; await fs.gravar(base(f), JSON.stringify(d)); };
const continuar = (ret, extra) => opcoes({escolhas: ret.registro.escolhas, registro: ret.registro, ...extra});

test('mudança entre o pré-voo e a gravação do arquivo: pulado-mudou, os outros seguem; retomar e restaurar fecham o registro', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes({aoGravar: async f => { if (f === CAD) await mexer(fs, EQUIP, 'outra pessoa'); }}));
  assert.equal(r.ok, false);
  assert.equal(r.resultado[EQUIP], 'pulado-mudou');
  for (const f of ORDEM.filter(f => f !== EQUIP)) assert.equal(r.resultado[f], 'gravado', f);
  assert.equal(r.registro.estado, 'incompleto');
  const ret = await retomar(pasta);
  assert.deepEqual(ret.naoTocados, [EQUIP], 'refazer a prévia deste arquivo');
  assert.deepEqual(ret.mudaram, []);
  assert.deepEqual(ret.pendentes, []);
  const n = fs.log.length;
  const de2 = await aplicar(pasta, ret.registro.plano, continuar(ret));
  assert.equal(de2.resultado[EQUIP], 'nao-tocado');
  assert.equal(bases({log: fs.log.slice(n)}).length, 0, 'não sobrescreve o arquivo mudado');
  const rs = await restaurar(pasta, de2.registro, null, RESTAURAR);
  assert.equal(rs.ok, true, rs.motivo);
  assert.equal(rs.resultado[EQUIP], 'nao-tocado');
  assert.equal(rs.registro.estado, 'restaurado');
  assert.equal((await lerBase(fs, EQUIP)).mexido, 'outra pessoa');
});

test('erro de leitura no meio da aplicação: erro (não é arquivo mudado) e a aplicação para', async () => {
  const {fs, pasta, plano} = await montar();
  const falha = c => { if (c === base(EQUIP)) throw new DOMException('disco', 'NotReadableError'); };
  const r = await aplicar(pasta, plano, opcoes({aoGravar: f => { if (f === INIC) fs.ganchos.aoLer = falha; }}));
  assert.equal(r.ok, false);
  assert.equal(r.resultado[EQUIP], 'erro');
  assert.equal(r.registro.arquivos[EQUIP].estado, 'erro');
  assert.deepEqual(bases(fs).map(x => x.caminho), [base(CAD), base(INIC)], 'parou depois do erro');
  for (const f of ORDEM.slice(3)) assert.equal(r.resultado[f], 'nao-gravado', f);
  const ret = await retomar(pasta);
  assert.deepEqual(ret.erros.map(e => e.arquivo), [EQUIP]);
  assert.deepEqual(ret.mudaram, []);
  const rs = await restaurar(pasta, ret.registro, [EQUIP], RESTAURAR);
  assert.equal(rs.resultado[EQUIP], 'erro');
});

test('registro diferente do gravado na pasta, ou que não reproduz o conteúdo: recusa sem gravar', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(M.aplicar(pasta, plano, opcoes({aoGravar: f => { if (f === CAD) throw new Error('queda'); }})), /queda/);
  const ret = await retomar(pasta), n = fs.log.length;
  const velho = {...ret.registro, retomadas: undefined};
  const disco = JSON.parse(await fs.ler(REG));
  disco.retomadas = [{em: '2026-11-25T15:00:00Z', por: 'Outra estação'}];
  await fs.gravar(REG, JSON.stringify(disco));
  let r = await aplicar(pasta, velho.plano, continuar({registro: velho}));
  assert.equal(r.ok, false); assert.match(r.motivo, /registro/i);
  // registro coerente com a pasta, mas com outro hashDepois: não reproduz o mesmo conteúdo
  disco.arquivos[INIC].hashDepois = '0'.repeat(64);
  await fs.gravar(REG, JSON.stringify(disco));
  r = await aplicar(pasta, disco.plano, continuar({registro: disco}));
  assert.equal(r.ok, false); assert.match(r.motivo, /não reproduz/);
  assert.equal(fs.log.length, n, 'nada gravado');
});

test('registro que não grava depois de uma base: a aplicação para e retomar conclui', async () => {
  const {fs, pasta, plano} = await montar();
  let gravou = false;
  fs.ganchos.aoFechar = (c, t) => { if (c === base(CAD)) gravou = true; else if (c === REG && gravou) throw new Error('disco cheio'); return t; };
  await assert.rejects(M.aplicar(pasta, plano, opcoes()), /disco cheio/);
  fs.ganchos.aoFechar = null;
  const ret = await retomar(pasta);
  assert.deepEqual(ret.concluidos, [CAD]);
  const r = await aplicar(pasta, ret.registro.plano, continuar(ret));
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.resultado[CAD], 'ja-concluido');
});

test('arquivo pela metade na retomada (gravando, nenhum dos hashes): para sem sobrescrever', async () => {
  const {fs, pasta, plano} = await montar();
  await assert.rejects(M.aplicar(pasta, plano, opcoes({aoGravar: f => { if (f === INIC) throw new Error('queda'); }})), /queda/);
  assert.equal(JSON.parse(await fs.ler(REG)).arquivos[INIC].estado, 'gravando');
  await fs.gravar(base(INIC), '{"meio":1}');
  const ret = await retomar(pasta);
  assert.deepEqual(ret.mudaram, [INIC]);
  assert.deepEqual(ret.naoTocados, []);
  const n = fs.log.length;
  const r = await aplicar(pasta, ret.registro.plano, continuar(ret));
  assert.equal(r.ok, false);
  assert.equal(r.resultado[INIC], 'pulado-mudou');
  assert.equal(fs.log.length, n);
  assert.equal(await fs.ler(base(INIC)), '{"meio":1}');
});

test('aba viva de uma página envolvida (vac.aba.<página>) recusa antes de gravar e diz qual', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes({abas: p => p === 'inic' ? [{id: 'a1', pend: false}] : []}));
  assert.equal(r.ok, false);
  assert.match(r.motivo, /Iniciativas/);
  assert.deepEqual(fs.log, []);
  const ap = await aplicar(pasta, plano, opcoes());
  const rs = await restaurar(pasta, ap.registro, null, {...RESTAURAR, abas: p => p === 'portal' ? [{id: 'a2'}] : []});
  assert.equal(rs.ok, false); assert.match(rs.motivo, /Administração/);
});

test('mudança depois da gravação: a conferência final deixa o registro incompleto e lista o arquivo', async () => {
  const {fs, pasta, plano} = await montar();
  const r = await aplicar(pasta, plano, opcoes({aoGravar: async f => { if (f === PORTAL) await mexer(fs, CAD, 'depois'); }}));
  assert.equal(r.ok, false);
  assert.equal(r.registro.estado, 'incompleto');
  assert.deepEqual(r.registro.mudaramDepois, [CAD]);
  assert.equal(r.resultado[CAD], 'erro');
  assert.match(r.motivo, /vacutainer-cadastros\.json/);
});

test('reconferência por arquivo: arquivo já no hashDepois vira ja-concluido', async () => {
  const {fs, pasta, plano} = await montar(), outra = await montar();
  const ok = await aplicar(outra.pasta, outra.plano, opcoes());
  const texto = await outra.fs.ler(base(EQUIP));
  const r = await aplicar(pasta, plano, opcoes({aoGravar: async f => { if (f === CAD) await fs.gravar(base(EQUIP), texto); }}));
  assert.equal(ok.ok, true);
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.resultado[EQUIP], 'ja-concluido');
});
