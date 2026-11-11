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
