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
    # 2.4.63 · 1ª linha do relatório diário (12/11/2026, regra do usuário): o MES exporta as últimas 24 h e a 1ª linha (00:00:01) repete o
    # catálogo, o lote e a caixa da última linha do relatório anterior. Com caixa > 0 ela não é uma caixa nova: só diz em que lote e caixa
    # a linha estava. Antes ela era contada de novo, no horário da exportação (caixa em dobro, 1ª caixa do dia às 00:00 e uma lacuna até a
    # caixa seguinte). Agora fixa catálogo e lote, guarda a caixa como ponto de partida e a contagem começa na 2ª linha.
    R("    let cat = null, lot = null, cur = null, snaps = 0, dups = 0, zeros = 0;",
      "    let cat = null, lot = null, cur = null, snaps = 0, dups = 0, zeros = 0, carry = null;")
    R("      if (r.box != null) bi++;\n",
      "      if (r.box != null) bi++;\n"
      "      /* 2.4.63 · 1ª linha com caixa > 0 = situação no início do relatório (última caixa do relatório anterior): não conta, só fixa catálogo, lote e o ponto de partida */\n"
      "      if (i === 0 && r.box != null && r.box > 0 && (r.cat != null || r.lot != null)) { if (r.cat != null) cat = r.cat; if (r.lot != null) lot = r.lot; carry = { t: r.t, lot, cat, box: r.box }; lastOf.set(lot, { lot, b1: r.box, t1: r.t, virtual: true }); continue; }\n")
    R("    return { segments, gaps, mes, range, noise, jumps, snaps, dups, zeros, boxes: U.sum(segments, s => s.n) };",
      "    return { segments, gaps, mes, range, noise, jumps, snaps, dups, zeros, carry, boxes: U.sum(segments, s => s.n) };")
    R("    if (an.zeros) warns.push(",
      "    if (an.carry) warns.push(`1ª linha do arquivo: o lote ${an.carry.lot} estava na caixa ${an.carry.box} (a última do relatório anterior). Ela não conta de novo e o horário dessa linha é ignorado; a contagem começa na caixa ${an.carry.box + 1}. Dias importados antes da versão 2.4.63: importe o período de novo para tirar a caixa repetida das 00:00.`);\n"
      "    if (an.zeros) warns.push(")
