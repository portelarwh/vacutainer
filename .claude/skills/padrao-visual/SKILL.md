---
name: padrao-visual
description: Varre a página da plataforma em que se está trabalhando e a adequa ao modelo visual da Produção (Visão geral e Lançamento, plataforma 1.8.38) — marca, identidade visual, formatação, estrutura da página, filtros, gráficos e disposição dos botões. Usar quando o pedido for "deixar a página no padrão", "falar a mesma língua", revisar o visual de uma aba ou módulo, ou antes de concluir qualquer mudança de layout. Não trata fórmulas, cálculos nem regras de negócio.
---

# Padrão visual · uma página com a mesma cara da Produção

O objetivo é que toda página da plataforma tenha a mesma marca, a mesma formatação e a mesma ordem de leitura do modelo: **Produção › Visão geral** (páginas de consulta) e **Produção › Lançamento** (páginas de lançamento). Esta skill trata só da **aparência e da estrutura**. Ela não toca em motor, fórmula, unidade, filtro (o que ele filtra), ID, evento, meta ou período (contrato 6 do CLAUDE.md).

Referências: [DESIGN_SYSTEM](../../../docs/DESIGN_SYSTEM.md) (regras gerais, escala, semáforo) e [BD_Dashboard_Brand_Guidelines](../../../docs/BD_Dashboard_Brand_Guidelines.md) (marca). Quando esta skill e o Design System divergirem, vale o Design System, e a divergência deve ser corrigida num dos dois.

## Passo a passo

1. **Identificar a página.** Módulo e aba (`node scripts/varredura-visual.mjs --lista --modulo "<Módulo>"` lista as abas). Descobrir o bloco que a desenha (`motor/<módulo>`; peças comuns em `comum/interface`, `comum/visual`, `css/kit`, `css/brand`).
2. **Varrer.** Rodar a varredura e tirar o print de antes:
   ```bash
   node scripts/varredura-visual.mjs --modulo "<Módulo>" --aba <id> --saida <scratchpad>/antes.md --print <scratchpad>/antes.png
   ```
   Repetir com `--largura 390` (celular) e `--tema escuro` quando a página for usada nesses casos.
3. **Comparar com o modelo.** Ler o relatório e passar a checklist abaixo na página. A varredura aponta o que é medível; a checklist cobre a estrutura (o que a página tem que ter e em que ordem).
4. **Listar as mudanças antes de editar** e separar em:
   - **só aparência** (cor, fonte, espaço, ordem de blocos, caixa de frase, botão primário/secundário, rótulos): pode seguir;
   - **muda o que a página mostra** (tirar ou juntar indicador, trocar gráfico, mudar o que um filtro faz): perguntar ao responsável, com recomendação.
5. **Editar pelo bloco**: `node scripts/bloco.mjs motor/<módulo> > <scratchpad>/x.js`, editar e aplicar com `node scripts/bloco.mjs motor/<módulo> <scratchpad>/x.js`. Preferir a peça compartilhada (lista abaixo) a copiar CSS ou HTML da Produção. Se a diferença estiver numa peça comum, corrigir na peça comum, que alcança todas as páginas.
6. **Conferir.** Rodar a varredura de novo (`depois.md`, `depois.png`) e confirmar que os achados de "ajustar" sumiram. Rodar os testes do módulo e `npm run test:plataforma` (contraste, abas, grade). Os números da tela antes e depois devem ser os mesmos.
7. **Fechar a entrega.** Subir a versão do módulo e da plataforma, com entrada em **Administração › Novidades** (frase curta, "melhoria"); `npm run atualizar:metadados` e `npm run build`. Mandar os prints antes/depois ao responsável.

## O modelo

### Página de consulta (modelo: Produção › Visão geral)

De cima para baixo:

1. **Cabeçalho da página**: título em caixa de frase (h2, 22 px, negrito) e uma linha de subtítulo em cinza, dizendo o que a página mostra. À direita, **uma fileira de ações**: Personalizar, Imprimir, Exportar e **um** botão primário (Apresentar). Imprimir aparece uma vez só.
2. **Cartão de filtros** (`#gFilters.vgl-fil` na Produção):
   - 1ª linha: **Período** com as duas datas (DD/MM/AAAA, nunca o campo nativo) e os atalhos **Hoje · Ontem · 7 dias · 30 dias · Personalizado**; à direita, o seletor de **Visão**.
   - 2ª linha: os demais filtros lado a lado (Turno, Linha, Máquina, Catálogo, Status…), cada um com o rótulo acima do campo, e **Limpar filtros** (link) no fim da linha.
   - Linha-resumo do recorte abaixo, em cinza: "19/11/2026 · Todos os turnos · Vacutainer · Todas as máquinas".
   - No celular, só Período e Turno aparecem; os outros ficam em **Mais filtros ▾**.
3. **Recolher tudo / Expandir tudo**, à direita, acima das seções.
4. **Seções** com título (h3, caixa de frase) e subtítulo curto em cinza na mesma linha, recolhíveis por ▾, **sem numeração**:
   - **Situação do período**: o indicador principal contra a meta (valor grande, meta vigente, desvio, barra), a ação prioritária e a maior perda.
   - **Números do período**: grade de cartões KPI (rótulo curto em maiúsculas, valor grande com unidade pequena, linha de meta/comparação), com **Editar cards** e **Mais indicadores** recolhido.
   - **Diagnóstico rápido**: melhor e pior dia, confiabilidade do dado.
   - **Análises de desempenho**: gráficos em **grupos** recolhíveis (letra · nome, a pergunta que o grupo responde, "n gráfico(s)" à direita). Com 1 dia no período, grupos recolhidos e **uma nota só**.
   - **Explorar dados**: botões para as outras abas/relatórios do mesmo recorte; o primário é o relatório do período (último da fileira). Linha-resumo do período abaixo.

Peça comum para páginas fora da Produção: `vacLayout` (comum/interface: `sec`, `grupo`, `estado`, `ligar`, estilos `vk-*` em `comum/visual`) e `vacGrade` (largura e ordem dos cartões).

### Página de lançamento (modelo: Produção › Lançamento)

1. **Barra de ações**: Voltar (secundário) e **uma** ação primária laranja (ex.: "Lançar meu turno"); à direita, ações de apoio (Sincronizar, Backup, Modo TV).
2. **Barra do recorte**: ‹ data › com o campo DD/MM/AAAA e **Hoje**; seletor de linha; atalho de consulta à direita ("Ver o dia inteiro").
3. **Cabeçalho do registro** numa linha: data por extenso (h3), **chip de situação** (ponto + texto: Em produção, Fechado…) e contexto em cinza ("Semana 47 · seg–sáb · Vacutainer"). À direita, **a** ação principal (Fechar dia, primário azul) e **⋮ Mais ações**, um menu com o resto e uma **Zona de risco** separada para excluir/reabrir. Abaixo, escolhas em **pílulas segmentadas** (Hora a hora · Por turno · Dia) e a observação geral com contador.
4. **Resumo** recolhível ("Resumo do dia · Recolher"): cartões KPI iguais aos da consulta.
5. **Conteúdo a lançar** logo depois do resumo (os turnos), cada um com cartão de resumo que abre o detalhe.
6. **Blocos de apoio** depois do conteúdo (servidor, lotes, gel).
7. **Validação**: lista de erros e alertas com o número da conta e botões **"Ir para…"** que levam ao campo. Nenhum outro bloco repete esses avisos: quem precisar remete à Validação.
8. **Análises do registro** (cascata, D/P/Q, qualidade do apontamento).
9. **Rodapé**: situação da gravação à esquerda ("Alterações salvas"), uma ação secundária à direita.

### Identidade visual (vale para as duas)

- **Cores só da paleta** (`css/brand`, `var(--…)`): navy e azul para identidade e séries neutras; laranja pontual (ação primária de lançamento, destaque); verde/amarelo/vermelho **só** para resultado × meta, pelo semáforo da Administração (`--ok`, `--warn`/`--warn-fill`, `--crit`). SQDCP, Gel e D/P/Q seguem as exceções do Design System § 20. Cores de catálogo vêm do cadastro.
- **Fonte** só pelas variáveis `--f-body` / `--f-display` (FS Albert Pro com reserva Arial). Nada de Georgia, serifa ou família fixa no CSS do módulo.
- **Caixa de frase** em títulos (h1–h4), seções, cartões, botões e mensagens. Maiúsculas só em rótulos curtos: rótulo de KPI, cabeçalho de tabela, pílula, chip, grupo do menu.
- **Tamanhos**: título da página 22 px; seção 18 px; título de cartão 15–16 px; corpo 14–15 px; notas e rótulos 12–13 px; **nada abaixo de 12 px**.
- **Espaço** na escala 4/8/12/16/24/32 (`var(--sp-8,8px)`), raios 8–12 px, cartões brancos com borda fina e sombra leve sobre o fundo creme.
- **Botões**: um primário por região; os demais secundários (borda) ou link. Ícone só com texto ao lado ou `aria-label`. Controles com 40 px de altura; `sm` com pelo menos 32 px. Ícones pelo `vacIcone` (Lucide), não emoji.
- **Gráficos**: dentro de um cartão com título que diz o que o gráfico responde; "Valores em <unidade>" quando o eixo não traz a unidade; base zero; meta como linha tracejada; barras com semáforo só quando há meta; legenda com as cores usadas; tabela "Ver dados em tabela" recolhida abaixo; com 1 dia, nota em vez de tendência. Largura e ordem pelo `vacGrade` (1/1, 1/2, 1/3).
- **Estados**: carregando, sem dados, erro e dado desatualizado com texto ("Sem dados no período"), nunca zero no lugar de ausência.
- **Responsivo**: sem rolagem lateral da página em 390 px; tabelas largas rolam dentro do cartão.

## Checklist rápida

- [ ] Cabeçalho com título + subtítulo e uma fileira de ações com um só primário.
- [ ] Filtros no cartão-padrão, com atalhos de período, "Limpar filtros" e linha-resumo.
- [ ] Seções na ordem do modelo, com título em caixa de frase, subtítulo e sem número.
- [ ] Cartões KPI no formato da Produção e "Editar cards" quando a página tem grade.
- [ ] Gráficos com título, unidade, legenda, meta e tabela recolhida; agrupados quando são muitos.
- [ ] Nenhuma cor, fonte ou tamanho fora da marca; nada abaixo de 12 px; espaços na escala.
- [ ] Nenhum aviso repetido em dois blocos.
- [ ] Varredura de depois sem achados "ajustar"; números iguais aos de antes; testes do módulo passando.

## Diferenças já conhecidas (varredura de 21/11/2026)

- `vacLayout.sec` (comum/interface, estilos `vk-sec`) ainda mostra a numeração 01–05; a Produção tirou na 2.6.29. Corrigir na peça comum alcança Waste e as demais páginas que a usam.
- Selo "em construção" das abas da casca com 10,5 px (abaixo do piso de 12 px).
- Waste › Painel: fonte Georgia em parte do texto e mais de um botão primário no mesmo grupo.
- A própria Produção tem espaçamentos fora da escala (14, 10, 18 px) no CSS montado pela Visão geral e legendas de 11,5 px no Lançamento: ajustar quando mexer nesses blocos.

## O que a varredura não faz

Não confere número, fórmula, unidade de cálculo nem filtro (o que ele seleciona): isso é dos testes de cada motor. Não mede contraste (`testes/plataforma/contraste.cjs` faz isso) nem impressão, PDF e Outlook (conferir à parte; SQDCP continua uma A4 paisagem). Cor de mistura (`color-mix`) conta como da paleta.
