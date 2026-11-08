# Relatório das entregas C2 a C6 (08/11/2026)

**Base:** `main` `1c45308`, que já inclui a C1 e a revisão do PR #18. Pedido: "Siga com o restante".

**Fora desta entrega:**
- **H**, homologação na pasta real: depende do responsável;
- **R-02**, identificador estável da pessoa: depende de decidir o que fazer com responsáveis digitados à mão.

**Princípios mantidos:**
- operação por arquivos;
- cada página grava só a própria base;
- leitura entre páginas só pelo `exports`, com campo novo aditivo e `exportsVersion` 1;
- códigos como texto;
- vigências intocadas;
- kit pela fonte e `aplicar_kit21.py`; Produção pelo `build.py`, só com a regra de versão.

## 1. O que foi feito

| Etapa | Achado | Onde | Correção |
|---|---|---|---|
| C2 | AT-04 | Iniciativas, Equipamentos `vacAoVoltar` | Relê ao voltar; se o resumo é de outro dia (e não há erro, base sumida nem gravação em andamento), grava de novo. É a mesma condição do `init` |
| C2 | AT-05 | Equipamentos `calcExports`, `rota`, entrada | Link `aba=equip&eq=<encodeURIComponent>`. O `&eq=` é separado antes de decodificar. `#aba=equip&eq=` também chama `rota()` ao abrir |
| C2 | AT-10 | Portal `Entrar.entrar`, Sair, evento `storage` | `App.render()` sempre ao trocar de usuário, inclusive quando `vac.user`/`vac.userId` muda em outra aba. O ouvinte é do Portal, não do kit |
| C2 | AT-12 | Iniciativas `filtradas`, `rota` | `App.f.ordem` compara o vínculo `tipo:'ordem'` com a regra `nk` da ficha. A busca de texto fica separada. Pílula para tirar o filtro |
| C3 | AT-06 | Paradas `calcExports`; Portal `reuDados`, cartão, relatório | `eventosCobertura {de, ate, cortado}`, com os eventos em ordem de dia e o corte de 3000 guardando os mais recentes. Fora da cobertura, o Portal mostra "—" e "sem dado de paradas para esse dia (motivo)". Sem a cobertura (exports antigo), continua a regra dos 90 dias |
| C3 | AT-07 | Portal `reuDados` e botão "+ Ação" | Conjunto das ordens do grupo; um vínculo por ordem distinta |
| C3 | AT-09 (Reunião) | Portal `cadRota` e links | `#reuniao=AAAA-MM-DD\|turno` |
| C4 | Excel sempre aprovado | `trelatorios.js` | Sem `lib/xlsx.full.min.js`: "NÃO VERIFICADO", sem baixar (o teste ficava 2 min esperando). Com a biblioteca: abre o arquivo e exige abas |
| C4 | `tvisual` com páginas novas como em construção | `tvisual.js` | Iniciativas e Equipamentos entram pelo `#teste`. A tela cheia é medida por cartões e itens; elas não têm indicadores nem gráficos na tela inicial (esboços aprovados) |
| C4 | Ação no cabeçalho | Equipamentos | "+ Nova OS" no cabeçalho, como o "+ Nova ação" de Iniciativas. O `tvisual` cobra ação visível a 768 e 390 px |
| C4 | Suíte inteira | `testes/tudo.js` | Roda tudo e diz passou, falhou ou não verificado. O `tz` roda de novo uma vez; o `tmeta` sem o pacote `xlsx` fica não verificado |
| C5 | Saúde dos dados | kit `vacFila.contar`; Portal › Versões | Coluna "Pendentes neste navegador" (também no Excel); resumo de outro dia em destaque; cobertura do Paradas; avisos de resumo de antes de ontem, lista cortada e pendências |
| C6 | AT-08 | kit `vacFicha.carregar` | Troca de pasta (`isSameEntry`) limpa a memória e o índice. A cópia do IndexedDB guarda o nome da pasta e não serve para outra |
| C6 | AT-09 (Pareto) | Paradas `acaoPlanner`, `rota`, `abrirPareto` | `#pareto=de\|ate\|eq\|turno\|cls\|grupo\|dim\|k` (o `k` por último, porque `eqcod` tem `\|`). Se a barra não existe mais na base, avisa |

**Versões:** Portal 1.9.2, Produção 2.4.17, Waste 1.8.23, Gel 2.11, Paradas 1.0.22, Iniciativas 1.0.3, Equipamentos 1.0.3, Projetos 0.1.6. As quatro últimas páginas mudaram só pelo kit.

## 2. Eficácia

Teste novo: `testes/tcorrecoes.js`, com 13 checagens, uma por achado ou parte. Na `main` `1c45308` as 13 falham; com a entrega, passam. As saídas estão em `evidencias/tcorrecoes-main-1c45308.txt` e `evidencias/tcorrecoes-c2-c6.txt`.

| Cenário | `main` `1c45308` | Esta entrega |
|---|---|---|
| AT-04 Iniciativas e Equipamentos | falha (resumo continua de 2020) | passa |
| AT-05 | falha (link sem codificar; abre a máquina errada) | passa |
| AT-10 | falha (a fila continua a da Ana) | passa |
| AT-12 | falha (com zeros não acha; sem zeros pega a parecida e a do texto) | passa |
| AT-06 | falha ("0 min") | passa |
| AT-07 | falha (só a ordem 111) | passa |
| Link da Reunião | falha (`#reuniao` sem dia nem turno) | passa |
| `eventosCobertura` | falha (não existe) | passa |
| C5 | falha (sem pendentes nem avisos) | passa |
| AT-08 | falha (mostra a cópia da pasta A na pasta B) | passa |
| AT-09 Pareto (link e aviso) | falha (`#aba=pareto`) | passa |

A suíte inteira roda com `node testes/tudo.js` (resultado no § 4).

## 3. Limites

- **C5:** a "última falha do backup" não aparece, porque as páginas não registram a falha na pasta. O backup antigo (> 3 dias) já é avisado.
- **C5:** a contagem de pendentes é **deste navegador**. Outra estação só aparece quando o Portal for aberto lá.
- **AT-06:** a cobertura termina no último dia com evento publicado. Um dia depois disso aparece como "sem dado", mesmo que não tenha havido parada, porque a página não sabe se o Forms daquele dia já foi importado.
- **AT-08:** cópias antigas do IndexedDB, gravadas antes desta versão e sem o nome da pasta, ainda são aceitas uma vez. Na próxima leitura, a cópia passa a ter o nome.
- **AT-09:** o link do Pareto reproduz os filtros da página. O texto livre da busca (`F.q`) não entra.

## 4. Suíte

Resultado do `node testes/tudo.js`, em `evidencias/tudo-c2-c6.txt`: 31 suítes.
- **29 passaram.**
- O `tplanner` falhou na primeira rodada porque ainda esperava o link antigo do Pareto (`#equipamento=`). O link mudou de propósito no AT-09: o teste passou a conferir `#pareto=` com o filtro e foi rodado de novo, passando.
- **`trelatorios`:** passou, com o Excel do Paradas "NÃO VERIFICADO", porque falta `lib/xlsx.full.min.js` (E3b).
- **`tmeta`:** não verificado, porque falta o pacote npm `xlsx`.
- **`tvisual`:** passou por inteiro, inclusive a Produção a 768 px, que estava na lista de pendências.

`aplicar_kit21.py`, `build.py` e `gerar_paginas.py` reproduzem os HTMLs. O Guia de instalação foi gerado de novo (versões).
