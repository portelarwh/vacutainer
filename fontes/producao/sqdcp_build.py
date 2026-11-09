"""Extensões aditivas SQDCP sobre a base imutável da Produção."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent


def aplicar(R):
    R("['reports', 'Relatórios'], ['equip', 'Equipamentos']",
      "['reports', 'Relatórios'], ['sqdcp', 'SQDCP'], ['equip', 'Equipamentos']")
    R("reports: 'Gestão', equip: 'Gestão'", "reports: 'Gestão', sqdcp: 'Gestão', equip: 'Gestão'")
    R("  return { createDay, setDayField,", ACOES + "\n  return { setShiftSQDCP, setSQDCPVaga, setSQDCPP, setSQDCPManual, createDay, setDayField,")
    R("    const gaps = res.msgs.filter(m => m.ref && m.ref.gap);\n    if (gaps.length && !day.gapJustification)",
      "    out.push(...Sqdcp.avisos(day, shifts));\n    const gaps = res.msgs.filter(m => m.ref && m.ref.gap);\n    if (gaps.length && !day.gapJustification)")
    R("      <label class=\"kv\" style=\"grid-column:1/-1\"><span class=\"l\">Observações do turno</span>",
      "      ${Sqdcp.formularioTurno(day, ps)}\n      <label class=\"kv\" style=\"grid-column:1/-1\"><span class=\"l\">Observações do turno</span>")
    R("      <section class=\"card section\"><header><h3>Fechamento do turno</h3></header><div class=\"form\">",
      "      <section class=\"card section\">${Sqdcp.formularioTurno(day, ps)}</section>\n      <section class=\"card section\"><header><h3>Fechamento do turno</h3></header><div class=\"form\">")
    R("    T['Qualidade do apontamento'] =",
      "    T['Segurança e QN'] = SQDCPModelo.tabela([...new Set(days.map(x=>x.lineId))].flatMap(l=>days.filter(x=>x.lineId===l).flatMap(day=>SQDCPModelo.linhas(d,day.date,day.date,l,App.filters.shiftId||'',Engine,U))));\n    T['Qualidade do apontamento'] =")
    R("      porMes, porDia, porDiaTurno, porDiaCatalogo, paradasEquipamento, calendario,",
      "      sqdcp: SQDCPModelo.exportar(db, today, Engine, U), porMes, porDia, porDiaTurno, porDiaCatalogo, paradasEquipamento, calendario,")
    R("  return { type: R.type, title, sub, a: x.a, b: x.b, x, kpis, blocks, key, auto:",
      "  blocks.push(Sqdcp.blocoRelatorio(x.a, x.b));\n  return { type: R.type, title, sub, a: x.a, b: x.b, x, kpis, blocks, key, auto:")
    R("    blocks: [{ id: 'hh', l: 'Hora a hora',",
      "    blocks: [Sqdcp.blocoRelatorio(day.date, day.date, ps.shiftId), { id: 'hh', l: 'Hora a hora',")
    R("  return L.join('\\n');\n}\nfunction rpShiftModel",
      "  L.push(Sqdcp.resumoTexto(x.a, x.b));\n  return L.join('\\n');\n}\nfunction rpShiftModel")
    R("ps.note ? 'Observação: ' + ps.note : ''].filter(Boolean).join('\\n');",
      "Sqdcp.resumoTexto(day.date, day.date, ps.shiftId), ps.note ? 'Observação: ' + ps.note : ''].filter(Boolean).join('\\n');")
    R("      if (existing) {\n        if (existing.origin !== 'importação')",
      "      SQDCPModelo.preservarImportacao(existing, day);\n      if (existing) {\n        if (existing.origin !== 'importação')")
    modelo = (ROOT / 'sqdcp_modelo.js').read_text().replace("if (typeof module !== 'undefined') module.exports = SQDCPModelo;\n", "")
    js = (ROOT / 'sqdcp.js').read_text()
    css = (ROOT / 'sqdcp.css').read_text()
    impressao = json.dumps((ROOT / 'sqdcp_impressao.css').read_text(), ensure_ascii=False)
    R("</script>\n</body>", "</script>\n<style>\n" + css + "</style>\n<script>\n" + modelo +
      "\nconst IMPRESSAO_CSS=" + impressao + ";\n" + js + "\n</script>\n</body>")


ACOES = """
  function sqRaiz(db) {
    if (!db.sqdcp || typeof db.sqdcp !== 'object' || Array.isArray(db.sqdcp)) db.sqdcp = {};
    db.sqdcp.quadros = db.sqdcp.quadros || {}; db.sqdcp.manuais = db.sqdcp.manuais || {};
    return db.sqdcp;
  }
  function setShiftSQDCP(dayId, psId, valor) {
    if (typeof vacPode === 'function' && !vacPode('oee', 'lancar')) throw new Error('Seu perfil não permite lançar na Produção.');
    const dados = SQDCPModelo.validarTurno(valor);
    const diaAtual = Store.S.db && Store.S.db.productionDays.find(d => d.id === dayId && !d.deleted);
    const turnoAtual = diaAtual && diaAtual.shifts.find(p => p.id === psId && !p.deleted);
    if (!turnoAtual) throw new Error('Turno não encontrado.');
    assertEditable(diaAtual, turnoAtual);
    const alterados = ['acidente','qn'].filter(k => JSON.stringify(SQDCPModelo.lerEvento((turnoAtual.sqdcp || {})[k])) !== JSON.stringify(dados[k]));
    if (!alterados.length) return;
    Store.mutate((db, audit) => {
      const d = dayById(db, dayId), ps = d.shifts.find(p => p.id === psId && !p.deleted);
      if (!ps) throw new Error('Turno não encontrado.');
      assertEditable(d, ps);
      const before = ps.sqdcp || null;
      ps.sqdcp = { ...(ps.sqdcp || {}), por: by(), em: U.nowIso() };
      for (const k of alterados) ps.sqdcp[k] = SQDCPModelo.copiar(dados[k]);
      touch(d); startEditing(d);
      audit({ action:'edição', entity:'turno', entityId:ps.id, field:'segurança e QN', before, after:ps.sqdcp });
    });
  }
  function setSQDCPVaga(linha, key, cfg, dia, turno, manual) {
    if (typeof vacPode === 'function' && !vacPode('oee', 'configurar')) throw new Error('Seu perfil não permite configurar o quadro.');
    cfg = Sqdcp.validarVaga(key, cfg);
    if (!SQDCPModelo.dataValida(dia)) throw new Error('Data inválida.');
    if (manual && manual.valor != null && (!Number.isFinite(manual.valor) || Math.abs(manual.valor) > 1e15)) throw new Error('Valor manual inválido.');
    Store.mutate((db, audit) => {
      if (!db.lines.some(l => l.id === linha && !l.deleted)) throw new Error('Linha inválida.');
      const r = sqRaiz(db), q = r.quadros[linha] || (r.quadros[linha] = { p:'pessoas', slots:{} });
      q.slots = q.slots || {};
      const before = q.slots[key] || null; q.slots[key] = SQDCPModelo.copiar(cfg);
      audit({ action:'edição', entity:'quadro SQDCP', entityId:linha+'|'+key, before, after:cfg });
      if (manual !== undefined) {
        const m = r.manuais[linha] || (r.manuais[linha] = {}), k = key+'|'+dia+'|'+(turno || ''), b = m[k] || null;
        if (manual.valor == null) delete m[k];
        else m[k] = { valor:manual.valor, nota:String(manual.nota || '').slice(0,300), por:by(), em:U.nowIso() };
        audit({ action:'edição', entity:'indicador manual SQDCP', entityId:linha+'|'+k, before:b, after:m[k] || null });
      }
    });
  }
  function setSQDCPP(linha, valor) {
    if (!['pessoas','produtividade'].includes(valor)) throw new Error('Coluna P inválida.');
    if (typeof vacPode === 'function' && !vacPode('oee','configurar')) throw new Error('Seu perfil não permite configurar o quadro.');
    Store.mutate((db,audit) => {
      if (!db.lines.some(l => l.id === linha && !l.deleted)) throw new Error('Linha inválida.');
      const r=sqRaiz(db),q=r.quadros[linha]||(r.quadros[linha]={slots:{}}),before=q.p||'pessoas';
      q.p=valor; audit({action:'edição',entity:'quadro SQDCP',entityId:linha,field:'coluna P',before,after:valor});
    });
  }
  function setSQDCPManual(linha,key,dia,turno,valor,nota) {
    if (typeof vacPode === 'function' && !vacPode('oee','lancar')) throw new Error('Seu perfil não permite registrar valores.');
    if (!SQDCPModelo.dataValida(dia) || !/^[SQDCP][0-4]$/.test(key) || (valor != null && (!Number.isFinite(valor) || Math.abs(valor)>1e15))) throw new Error('Referência ou valor inválido.');
    Store.mutate((db,audit) => {
      const r=sqRaiz(db),q=r.quadros[linha],slot=q&&q.slots&&q.slots[key];
      if (!slot || slot.indicador!=='manual') throw new Error('Esta posição não usa registro manual.');
      const m=r.manuais[linha]||(r.manuais[linha]={}),k=key+'|'+dia+'|'+(turno||''),before=m[k]||null;
      if (valor==null) delete m[k]; else m[k]={valor,nota:String(nota||'').slice(0,300),por:by(),em:U.nowIso()};
      audit({action:'edição',entity:'indicador manual SQDCP',entityId:linha+'|'+k,before,after:m[k]||null});
    });
  }
"""
