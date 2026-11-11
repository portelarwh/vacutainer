# Layout do turno no Lançamento (Produção 2.4.46 · 11/11/2026)

Primeira tela da revisão de layout das páginas. Mockup aprovado: https://claude.ai/artifact/RUbST7KvHbuP5fG5KVqDN5 (tema segue o sistema).

Fonte: `fontes/producao/turno_layout.js` (`TurnoUI.bloco`), entra pelo `build.py`. Cada turno vira um painel de largura total, um abaixo do outro, com sete faixas:

1. **Cabeçalho**: ícone (sol ou lua pelo horário), nome, horário, situação (em lançamento · pendente · fechado), **Fechar turno** (ação principal) ou Reabrir, **Hora a hora n/m**.
2. **Catálogo em produção** (catálogo inicial, editável, e "Produzindo:" com os catálogos dos intervalos) · **Responsável do turno** (campo) · **Tempo planejado** · **Meta de produção (dentro do turno)**.
3. **Produção dentro do turno** com barra e % da meta; produção total considerada e a meta (✓ quando atinge); painel de retorno: verde "Meta do turno atingida!", azul "Faltam N" com o ritmo necessário nas horas que restam (turno em andamento hoje) ou "Faltaram N" (fechado), cinza sem meta.
4. **Produção fora do turno** · **Caixas do MES** (1ª e última caixa, trocas de lote/catálogo e total de troca) · **Minutos de parada** · **Scrap** ("Não informado" em âmbar, botão Lançar/Editar/Ver scrap).
5. **Capacidade planejada** · **OEE reportado** (✓ meta) · **OEE real** · **D · P · Q** (2 casas).
6. **Abonos** e **Turno sem produção**.
7. **Segurança e Qualidade do Turno** (formulário do SQDCP, com o botão salvar à direita).
Observações do turno ficam recolhidas no fim (abertas quando há texto).

Regras:
- Só a tela mudou: mesmos números (`Engine.computeDay`, `TurnoCard.real`, `OeeReal.mes`), mesmos campos e `data-*` (`data-psf`, `data-closeps`, `data-reopenps`, `data-scrapturno`, `data-shoff`, `data-hhps`, `data-sq-*`); OEE, bases e `exports` iguais.
- Turno importado como resumo (`ps.summary`) e turno não produtivo continuam com o cartão anterior.
- Grid de 4 colunas → 2 (≤ 1180 px) → 1 (≤ 620 px); botões com 44 px de altura; cores de estado iguais nos dois temas (verde = meta atingida, âmbar = pendência, laranja = parada, roxo = catálogo/caixas, azul-escuro = ação principal).
- Correções do texto da proposta: "Caixas do MES" (não "do mês"), "D · P · Q" (não "D - P - O"), a meta com a janela fora do turno nunca é menor que a do turno.

Testes: `toeereal` e `tfase7` (cartão do turno), `tturnos`, `tgel`, `tsqdcp`, `tperiodo`.

## Servidor, lotes, turno não produtivo e produção fora do turno (Produção 2.4.47 · 11/11/2026)

Fonte: `fontes/producao/lanc_layout.js` (`LancUI.bloco`, no lugar de `SrvUI.dayCard` + `ForaTurnoUI.card` no Lançamento).

- **Produção registrada no servidor**: cabeçalho com Produção do dia (caixas · unidades; retrabalho e a confirmar abaixo), Trocas (de catálogo e de lote) e Validação (verde "Dados conferidos" ou âmbar "N sugestões para revisar" com o botão Revisar). Lotes sem ordem no plano aparecem em faixa âmbar com "Confirmar lotes". Linha do tempo com barras por lote na cor do catálogo ("Lote X · N caixas" dentro), marcador amarelo de troca de catálogo e marrom de troca de lote com dica (horário, catálogo e lote anterior e novo, última e 1ª caixa), hachura para "sem caixa" e retrabalho; legenda em "Entenda as marcações".
- **Lotes do dia**: cartão por lote (catálogo, família, produto, lote, caixas, Marcar como retrabalho, Descontar o tempo do retrabalho) e "Ver histórico de lotes".
- **Turno não produtivo** (ex.: 3º turno): seção própria ao lado dos lotes, com switch "Habilitar … neste dia", horário e o que muda (tempo planejado, produção da janela, indicadores; só neste dia).
- **Produção fora do turno**: resumo (caixas · produção, período, OEE do período ponderado pela duração dos trechos), tabela (Período registrado, Horário das caixas, Caixas, Produção, OEE do período, Contabilizado em) e "Como a produção fora do turno é contabilizada?" (continuidade sem parada maior que o limite, regra vigente desde a data do parâmetro).
- O resto do Lançamento segue a mesma lógica (`#main[data-rota="launch"]`): cartões com cantos de 12 px, títulos e rótulos em texto normal (sem caixa alta).
- Mesmos dados e `data-*` (`#srvRev`, `#srvCls`, `data-rw`, `data-rwapply`, `data-turnonp`, `data-route="lots"`); `SrvUI.bindDay` e `ForaTurnoUI.mount` continuam ligando os botões.
- **Cabeçalho do dia recolhível** (2.4.48): botão ▾ Recolher / ▸ Mostrar no título; a escolha fica neste computador (`App.prefs.cabFold`). Recolhido, mostra só o título com a situação do dia.
