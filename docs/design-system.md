# Design System BD · Sistemas da Linha Vacutainer

Entrega de 12/11/2026. Especificação do usuário guardada em `docs/ux/padronizacao-design-system.txt` (padrão visual) e `docs/ux/agente-persona.txt` (como pensar a experiência por público). Este arquivo diz **o que foi implementado, onde está e o que falta**.

## 1. Ideias que valem para qualquer tela nova

- **Preservar o motor.** Mudança de layout não altera fórmula, regra, ID usado pelo JavaScript, evento, chave nem estrutura gravada.
- **Decisão antes de dado.** Ordem de leitura: situação → comparação com a meta → desvio → onde → ação → responsável → prazo → detalhe.
- **Divulgação progressiva.** Primeiro o essencial; o resto em grupo recolhível, ficha, modal ou clique no gráfico.
- **Cor com significado fixo.** Azul = navegação, ação e valor neutro. Verde = favorável. Vermelho = perda ou risco. Âmbar = atenção. Cinza = sem dados. Roxo = só auxiliar. Nunca só a cor: sempre texto, ícone ou forma junto.
- **Três níveis de navegação.** Barra lateral = módulo. Cabeçalho = onde estou, base, busca, usuário. Abas = telas do módulo.
- **Ordem e lote são a base.** Cada ordem tem um lote e cada lote tem uma ordem; toda tela que mostra um fato de produção leva à ficha da ordem (`vacFichaBotao`).
- **Sem dados nunca é zero.** Mostrar "sem dados" e de onde viria.

## 2. Onde está o código

| Parte | Arquivo | Observação |
|---|---|---|
| Tokens, barra lateral, cabeçalho, abas, cartões, grade, impressão | `fontes/kit/kit_ds.css` | Vai no fim do `<style id="vac-visual">`, depois do `kit_visual.css` |
| Ícones, casca, grade de gráficos, `vacOrdemLote` | `fontes/kit/kit_ds.js` | Vai no fim do bloco do kit v2.1 |
| Aplicação nas páginas | `fontes/kit/aplicar_kit21.py`, `fontes/producao/build.py`, `fontes/linha360/build.py` | Os três leem os dois arquivos acima |

Mudou o Design System: editar `kit_ds.css` ou `kit_ds.js` e rodar os builds na ordem do `CLAUDE.md`. Nunca editar o bloco dentro de uma página.

## 3. O que cada peça faz

**Tokens.** Os nomes de variável das páginas continuam (`--bg`, `--surface`, `--ink`, `--accent`, `--ok`, `--crit`…); o kit troca só os valores pela paleta nova, nos dois temas. Há também `--ok-fill`, `--crit-fill`, `--warn-fill`, `--info-fill` para preenchimento; os tokens de texto (`--warn`, `--crit`) são mais escuros para passar de 4,5:1.

**Tema.** Claro é o padrão para quem nunca escolheu. O botão Tema da barra lateral continua alternando automático → claro → escuro. Impressão sempre clara.

**Barra lateral (`vacShell`).** O `header.vsuite` de sempre vira a barra fixa de 232 px (72 px recolhida). Os nós são **movidos**, não recriados: `#sysNav`, `#btnAdmin`, `#btnTheme`, `#vacBusca`, `#stUser` e `#stBase` mantêm ID e eventos. Preferência em `localStorage['vac.sidebarCollapsed']`. Entre 900 e 1.200 px abre recolhida; abaixo de 900 px vira menu sobreposto com fundo escuro, fechado por botão, clique fora ou Esc. Relatórios, Importação e Administração levam às telas do Portal. Ajuda aciona o guia da aba (`vacGuia`); Modo TV aciona o `#btnTV` da página.

**Cabeçalho de 58 px (`#vdsTop`).** "Onde estou" (módulo › aba ativa), situação da base, busca (Ctrl K) e usuário.

**Ícones (`vacIcone(nome, classe)`).** Lucide embutido em `VAC_ICONES`, porque a pasta da rede não tem internet. Ícone novo: acrescentar o desenho ali.

**Grade de gráficos (`vacGrade`).** Todo cartão que contém um gráfico ganha, ao passar o mouse, uma barra com: arrastar, mover para antes ou depois, largura 1/1, 1/2 ou 1/3 e voltar ao original. Gravado por página e por computador em `vac.grade.<página>`. A ordem usa `order` do CSS: o DOM da página não muda. Um bloco só entra na grade se todos os filhos já ocupavam largura inteira, metade ou um terço. Para deixar um bloco de fora: `data-vg-nao` no cartão. Para desligar na página: `window.VAC_GRADE_OFF = true`.

**Impressão.** Some barra lateral, cabeçalho, abas, botões e controles; entram um cabeçalho (sistema, módulo, aba, base, data e hora) e um rodapé de uso interno. Página com impressão própria pode desligar com `window.VAC_IMP_PROPRIA = true`.

**Símbolos (`vacSimbolos`).** Troca, na tela, o símbolo de texto do início de um botão pelo ícone correspondente. O texto do botão não muda; botão só com símbolo é trocado apenas se tiver `title` ou `aria-label`. Desligar na página: `window.VAC_SIMBOLOS_OFF = true`.

**E-mail para o Outlook (`vacEmail`).** `html(d)` monta o relatório em tabelas com CSS inline e 680 px, sem JavaScript, grid ou flex: cabeçalho, situação, resumo executivo, até 4 KPIs, um gráfico em PNG com texto alternativo e frase de conclusão, até 5 ocorrências, até 5 ações, botão "Abrir relatório completo" (só com endereço http) e rodapé com base e horário. `svgPng(svg)` converte o gráfico da tela em PNG de fundo branco com 1.200 px. `copiar(d)` põe HTML e texto simples na área de transferência. `assunto(d)` devolve "Área | Relatório | Linha | Período | Situação". A página entrega os números prontos; o kit não calcula nada.

**Número da página.** A impressão direta de qualquer página traz "Página X de Y" no rodapé (caixas de margem do `@page`; Chrome e Edge 131 ou mais novos; versões antigas só não mostram).

**Ordem × lote (`vacOrdemLote(lista)`).** Devolve as ordens com mais de um lote e os lotes em mais de uma ordem. Não bloqueia nada. A Produção 2.4.60 publica o resultado em `exports.ordemLote` e cria uma pendência de atenção para cada conflito.

## 4. O que ainda não segue a especificação

- Símbolos de texto: os que abrem um botão, link-botão ou aba (⇩, ↻, ✓, ▶, ⛁, ▣, ✎, ⚙…) viram ícone na tela (`vacSimbolos`, 12/11/2026). Continuam em texto as setas de abrir e recolher (▾, ▸), os símbolos no meio de frases e o ⓘ. O código-fonte das páginas ainda tem os símbolos; tela nova usa `vacIcone` direto.
- Filtros em painel recolhível com "Aplicar": só onde já existia. Chips de filtros ativos: Waste, Paradas e Linha 360°; faltam Produção, Gel, Iniciativas e Equipamentos.
- E-mail: o modelo `vacEmail` existe e a Linha 360° usa; os relatórios de Portal, Waste, Produção, Paradas e Gel continuam com o HTML próprio de cada um (conferido pelo `trelatorios.js`) e podem migrar um a um.
- "Página X de Y" vale para a impressão direta da página; os relatórios que abrem em janela própria (Portal, Waste, Paradas, Produção) têm o CSS deles.
- Tabelas: cabeçalho claro aplicado pelo kit; primeira coluna fixa, ordenação e paginação continuam como cada página fazia.
- Estados de carregamento em esqueleto.
- Gráficos da Produção e do Gel com cores próprias fora da paleta de `chartColors`.
