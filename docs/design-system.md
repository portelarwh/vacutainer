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

Correções de 12/11/2026 (`testes/tgrade.js`):
- **Barra em todos os cartões da grade.** Um cartão sem gráfico (tabela ou lista, ex.: "Produção por catálogo") que está na mesma grade de um gráfico também ganha a barra. Antes ele ficava parado enquanto os outros mudavam de lugar.
- **A alça ⠿ arrasta de verdade.** O `all:unset` do botão tirava o `-webkit-user-drag`, e o Chrome e o Edge não começavam o arrasto. Agora a alça tem `-webkit-user-drag:element`.
- **Setas apagadas quando não têm efeito.** Com o cartão na ponta ou sozinho no grupo, a seta fica apagada e o título diz o motivo: "Já é o primeiro", "Único cartão deste grupo".
- **O que não muda de lugar, de propósito:** os blocos numerados do topo da Visão geral (01 Situação, 02 Números, 03 Diagnóstico, 05 Explorar) ficam presos ao título da seção, e cada cartão só se move dentro do próprio grupo.

**Impressão e PDF (revisão de 12/11/2026).** Antes, cada saída tinha um formato: a impressão direta levava a faixa de teste, o botão voltar, o painel de filtros e os avisos; os PDFs do Portal/Waste/Paradas, da Produção e do Gel tinham cabeçalho, cores e rodapé diferentes; e o Portal pintava linhas inteiras de vermelho. Agora há um padrão só, todo no kit:

| Saída | O que o kit faz | Onde |
|---|---|---|
| Impressão direta da página (Ctrl+P) | A4 paisagem; some navegação, cabeçalho do módulo, painel de filtros, faixa de teste e de demonstração, avisos e controles; entra o cabeçalho com faixa do sistema e "Uso interno", relatório (módulo · aba), **filtros aplicados por escrito**, base, data, hora, pessoa e versão; rodapé de uso interno; "Página X de Y" | `kit_ds.css` § 9 e `vacShell` (`filtrosTexto`, `impressao`) |
| Relatório em janela própria (Portal, Waste, Paradas `.rep`; Produção `.rp-doc`) | Mesma faixa do sistema no alto; cabeçalho de tabela azul-marinho; cabeçalho da tabela repetido em cada página; linha não quebra entre páginas | `kit_ds.css` § 9 |
| Qualquer PDF (jsPDF: Portal, Waste, Paradas, Produção, Gel) | Faixa "BD · Sistemas da Linha Vacutainer · Uso interno" no alto de todas as páginas; cores antigas convertidas para a paleta (texto, traço, preenchimento, cabeçalho de tabela, verde, vermelho, âmbar) | `vacPdf` no `kit_ds.js` |
| Destaque de linha em tabela (Portal, Waste, Paradas) | Vermelho só na 1ª coluna; a linha mais grave ganha fundo vermelho muito claro. Nunca a linha inteira em vermelho | `Report.pdf` das três páginas e `kit_ds.css` |

Como funciona o `vacPdf`: as páginas carregam o jsPDF só na hora do primeiro PDF; o kit embrulha a biblioteca quando ela chega, e cada documento novo passa a converter as cores e a receber a faixa ao salvar. Título, tabelas, números e rodapé ("página X de Y") continuam os de cada gerador. Desligar numa página: `window.VAC_PDF_PADRAO = false`. Página com impressão própria desliga o cabeçalho da impressão direta com `window.VAC_IMP_PROPRIA = true`. Formulários do Paradas (retrato) e SQDCP (uma A4) têm página própria e não mudam de orientação.

Conferido por `testes/tds.js` § 8 e `testes/trelatorios.js`.

**Símbolos (`vacSimbolos`).** Troca, na tela, o símbolo de texto do início de um botão pelo ícone correspondente. O texto do botão não muda; botão só com símbolo é trocado apenas se tiver `title` ou `aria-label`. Desligar na página: `window.VAC_SIMBOLOS_OFF = true`.

**E-mail para o Outlook (`vacEmail`).** `html(d)` monta o relatório em tabelas com CSS inline e 680 px, sem JavaScript, grid ou flex: cabeçalho, situação, resumo executivo, até 4 KPIs, um gráfico em PNG com texto alternativo e frase de conclusão, até 5 ocorrências, até 5 ações, botão "Abrir relatório completo" (só com endereço http) e rodapé com base e horário. `svgPng(svg)` converte o gráfico da tela em PNG de fundo branco com 1.200 px. `copiar(d)` põe HTML e texto simples na área de transferência. `assunto(d)` devolve "Área | Relatório | Linha | Período | Situação". A página entrega os números prontos; o kit não calcula nada.

**Número da página.** A impressão direta de qualquer página traz "Página X de Y" no rodapé (caixas de margem do `@page`; Chrome e Edge 131 ou mais novos; versões antigas só não mostram).

**Ordem × lote (`vacOrdemLote(lista)`).** Devolve as ordens com mais de um lote e os lotes em mais de uma ordem. Não bloqueia nada. A Produção 2.4.60 publica o resultado em `exports.ordemLote` e cria uma pendência de atenção para cada conflito.

## 4. O que ainda não segue a especificação

- Símbolos de texto: os que abrem um botão, link-botão ou aba (⇩, ↻, ✓, ▶, ⛁, ▣, ✎, ⚙…) viram ícone na tela (`vacSimbolos`, 12/11/2026). Continuam em texto as setas de abrir e recolher (▾, ▸), os símbolos no meio de frases e o ⓘ. O código-fonte das páginas ainda tem os símbolos; tela nova usa `vacIcone` direto.
- Filtros em painel recolhível com "Aplicar": só onde já existia. Chips de filtros ativos: Waste, Paradas e Linha 360°; faltam Produção, Gel, Iniciativas e Equipamentos.
- E-mail: o modelo `vacEmail` existe e a Linha 360° usa; os relatórios de Portal, Waste, Produção, Paradas e Gel continuam com o HTML próprio de cada um (conferido pelo `trelatorios.js`) e podem migrar um a um.
- PDFs: o cabeçalho de cada relatório (título, período, quem gerou) ainda é desenhado por cada gerador, em posições e tamanhos um pouco diferentes; o kit iguala faixa, cores e tabelas. Unificar os três geradores num só continua pendente (registro § P).
- Gel: são cerca de dez relatórios em PDF; todos recebem a faixa e as cores, mas só o "relatório montado" foi olhado página a página.
- Conferir em papel: impressora da linha em preto e branco (o verde e o vermelho viram tons de cinza; o texto "Favorável/Desfavorável" e o sinal continuam).
- Tabelas: cabeçalho claro aplicado pelo kit; primeira coluna fixa, ordenação e paginação continuam como cada página fazia.
- Estados de carregamento em esqueleto.
- Gráficos da Produção e do Gel com cores próprias fora da paleta de `chartColors`.

## Permissão por ação na tela (D6, 13/11/2026)

`vacTravas` (kit_v21.js) desliga os botões de gravação que o perfil do usuário identificado não pode usar (Portal › Administração › Perfis: lançar, fechar, importar, excluir, configurar). O mapa fica num ponto só, `VAC_PODE_MAPA[PAGE.id]`, com os seletores de cada página; a Linha 360° segue o módulo Equipamentos. O botão travado fica apagado (`.vac-trava`), com "Seu perfil (X) não permite … nesta página" no título, e o clique é barrado mesmo em elemento que não é botão. Sem usuário identificado, ou perfil sem permissões gravadas, nada muda.
- **Botão novo de gravação entra no mapa** (senão o perfil Consulta consegue usá-lo).
- Só na tela, por decisão do usuário (13/11/2026): a gravação não é barrada (a sincronização automática do cadastro passa pela mesma gravação). Identifica, não é cofre (registro 5.4/A07).
- Portal: o cadastro já pede a senha de edição (perfil `semSenha`); não está no mapa.
- Versões: Produção 2.4.69, Waste 1.12.5, Gel 2.32, Paradas 1.2.7, Equipamentos 1.0.15, Iniciativas 1.1.11, Linha 360° 1.1.1. Teste: `testes/tpermissoes.js`.

## Peças do e-mail no kit (D8, 13/11/2026)

`vacEmail.pecas` = `moldura`, `cabecalho(sistema, título, sub)`, `situacao(txt, cor, nota)`, `nota(rótulo, texto)`, `sec`, `linha`, `tab`/`th`/`td`, `barra(v, cor)`, `marcadores`, `img`, `rodape` e as cores (`INK`, `MUT`, `LIN`, `COR`); `vacEmail.medidor(valor, meta, cor, título, sub, largura, fmt)` desenha o medidor em PNG (canvas). O `vacEmail.html(d)` padrão é montado com as mesmas peças. Relatório que precisa de blocos próprios (o e-mail do turno e do dia da Produção, 2.4.70) monta com essas peças em vez de escrever HTML de e-mail.

## Layout da pessoa em qualquer computador (Fase 5, 13/11/2026)

Decisão do usuário: um arquivo por pessoa, `00. Bases/Preferencias/<ID>.json` (`{schema:'vac-preferencias', schemaVersion:1, usuario, atualizadoEm, chaves:{<chave>:{v, em}}}`), gravado pelo `vacPrefs` do kit em qualquer página e só pela própria pessoa (não é base de página: a regra 1 continua). Vai: `vac.grade.*` (largura e ordem dos cartões), `vac.grupos.*` (grupos recolhidos), modo da ficha, tema, escolhas dos Paretos (Waste, Paradas) e o que a página registrar (Produção 2.4.72: abas, Editar cards, blocos recolhidos, grupos da Visão Geral, Meu painel, colunas de meta, itens do e-mail). Fica no computador: unidade (`vac.qtd`/qtyDisplay) e TV.
- O mais novo vence por chave (a mesma pessoa em dois computadores); no 1º uso num computador, o que já estava nele não ganha do arquivo. Quando chega layout novo, a página recarrega uma vez.
- Padrão do perfil: `perfis[].layout = {chaves, de, em}` no cadastro, copiado no Portal 1.9.34 (ficha do perfil › Layout padrão do perfil › Copiar o layout de um usuário). Vale no que a pessoa nunca mudou; não vai para o arquivo dela.
- "Restaurar meu layout" (menu da pessoa, kit `vacLogin`): apaga as escolhas dela (computador e arquivo) e volta ao padrão do perfil.
- Sem pasta, sem usuário identificado, no modo de teste e na demonstração: nada é lido nem gravado.
Versões: Produção 2.4.72, Portal 1.9.34, Waste 1.12.6, Gel 2.33, Equipamentos 1.0.16, Iniciativas 1.1.12, Linha 360° 1.1.2. Teste: `testes/tprefs.js`.
- Revisão Codex da PR #72 (13/11/2026), corrigida: (P1) a página só compara as chaves que conhece (`pagina:<id>` só onde a página registrou), então abrir o Paradas não apaga as preferências da Produção; (P2) "Restaurar meu layout" grava `herda: true` (não `null`), e os outros computadores voltam ao padrão do perfil; (P2) outra pessoa no mesmo navegador (`vac.prefs.dono`) recebe o layout dela ou o padrão do perfil, sem herdar nem gravar o de quem saiu. No 1º uso num navegador, o layout que já estava lá fica.

## Pareto comum (D8, 13/11/2026)

`vacPareto` (em `kit_bases.js`, no script `vac-bases`, que carrega antes do código da página): `calc(lista, {valor, abs, ordenar})` → itens com `parte`, `acum`, `ate80` (quem soma 80 %; o 1º sempre) e `barras(itens, op)` → barras horizontais com valor, "· N% acum.", traço dos 80 % (`ref80`), seleção (`sel`), clique (`g[data-k]`; `attrs(x)` para atributos da página, ex.: `data-fk`/`data-dbf`), unidade, `fmtBarra`, `dica`, `total` (base do acumulado quando só os primeiros aparecem). O espaço à direita acompanha o texto mais longo (não corta "% acum."). Usado por: Paradas 1.2.9 (`hbars`), Waste 1.12.7 (`paretoChart`; o Pareto vertical da controladoria usa só o `calc`), Gel 2.34 (`pareto`, `dbParetoHtml`). Números conferidos por referência gravada antes (`tgel_vg`, `twaste_vg` comparam rótulo | valor | % acumulado; `tparadas_ux`/`tparadas_vg`).

Revisão Codex da PR #73: item clicável do Pareto comum recebe foco (Tab, `tabindex="0"`, `role="button"`, `aria-pressed`, `aria-label`) e Enter/Espaço fazem o mesmo clique (filtros do Paradas, do Waste e do Gel pelo teclado, como os botões antigos do Gel).
