# Produção 2.4.35 · CSV do servidor (MES): o registro do lote/catálogo na preparação pertence à 1ª caixa (10/11/2026).
# Antes: a linha "lote X · caixa 0" abria o trecho no horário do registro (ex.: 00:00), contava a caixa 0 como produzida e, quando o
# catálogo vinha na linha seguinte, o trecho ficava sem catálogo/lote. Agora a caixa 0 é só o contador zerado (não conta, não abre
# trecho, não abre lacuna); o trecho começa na 1ª caixa de verdade com o último catálogo e lote registrados acima dela. O horário do
# registro continua em mes[] (a troca mostra última caixa → registro no MES → 1ª caixa).


def aplicar(R):
    R("    let cat = null, lot = null, cur = null, snaps = 0, dups = 0;",
      "    let cat = null, lot = null, cur = null, snaps = 0, dups = 0, zeros = 0;")
    R("      if (r.box == null) continue;\n      const b = r.box, t = tm(r.t);",
      "      if (r.box == null) continue;\n"
      "      if (r.box === 0) { zeros++; continue; }   /* 2.4.35 · contador zerado no registro do lote (preparação): não é caixa */\n"
      "      const b = r.box, t = tm(r.t);")
    R("    return { segments, gaps, mes, range, noise, jumps, snaps, dups, boxes: U.sum(segments, s => s.n) };",
      "    return { segments, gaps, mes, range, noise, jumps, snaps, dups, zeros, boxes: U.sum(segments, s => s.n) };")
    R("    if (an.jumps.length) warns.push(",
      "    if (an.zeros) warns.push(`${an.zeros} registro(s) de lote com o contador em 0 (preparação da linha): não contam como caixa; o catálogo e o lote valem a partir da 1ª caixa seguinte. Dias importados antes da versão 2.4.35 com esse caso: importe o período de novo para corrigir.`);\n"
      "    if (an.jumps.length) warns.push(")
