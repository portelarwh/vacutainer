# Roteiro da auditoria completa da plataforma (26/11/2026)

Este é o roteiro exato que o agente de desenvolvimento adotou. O mesmo roteiro, com o mesmo formato de saída, deve ser seguido pela contraparte, **de forma independente**, para depois as duas análises serem comparadas e unificadas.

Repositório: `portelarwh/vacutainer`, branch `main`. Produto: `Plataforma.html` (único arquivo e único executável). Tudo é fictício; não existem dados reais.

## 1. Princípios
1. **Varredura completa primeiro, perguntas depois.** Não parar a cada módulo. Só ao final se mostra tudo o que foi visto e se levantam as perguntas de ajuste.
2. **Ordem pelo risco.** O que gera número errado ou dado perdido vem antes do que é estético.
3. **Evidência em todo achado:** onde está (bloco `data-vac-source` e linha dentro do bloco; ou arquivo do repositório), como se reproduz ou mede, e o impacto. O que não foi provado entra como **Suspeita**, em lista separada, com o que falta para provar.
4. **Nada é alterado.** Auditoria só lê, mede e testa; correções viram itens do roadmap.
5. **Contratos do projeto são a régua** (`CLAUDE.md`, contratos 1 a 10): fórmulas, turnos/madrugada, classificação de paradas, vigências imutáveis, base limpa, gravação com releitura/backup/fila, sessão e travas.

## 2. Frentes (ordem de execução)
| # | Frente | Objetivo | O que verificar |
|---|---|---|---|
| A | **Cálculo e operação de chão de fábrica** (junta "Regras de negócio" e "Validação operacional") | Os números estão certos? | Fórmulas de OEE (D, P, Q), arredondamentos, percentuais, totais e subtotais, nulos, divisão por zero, cenários extremos (tempo 0, produção 0, meta 0, valores gigantes); troca de data na meia-noite, turno que atravessa o dia, turno não produtivo, hora extra, paradas programadas e não programadas, meta hora a hora, abonos; consistência entre tela e relatório; reprocessamento ao mudar cadastro |
| B | **Integridade e persistência** (nova) | Dado se perde ou diverge? | Gravação com releitura/backup/fila, duas estações, versão de base, restauração, filas duráveis, Web Locks, recuperação após falha, cadastro como única fonte |
| C | **Rastreabilidade** (nova) | Dá para saber quem alterou o quê? | Auditoria, log de alteração, pessoa por ID (contrato 8), registros sem responsável |
| D | **Segurança** | Alguém consegue manipular? | XSS e injeção de HTML (interpolação sem escape), `localStorage`/`sessionStorage`, upload e download de arquivo, CSV/Excel com fórmula, caminhos de arquivo, exceção do primeiro uso (contrato 4) |
| E | **Bugs e confiabilidade** | Onde quebra? | Campos sem validação, estado inconsistente, ações simultâneas e em sequência, navegação incompleta, erros engolidos (`catch` vazio) |
| F | **Relatórios e exportações** | Exportado = exibido? | Tela × Excel × PDF × CSV, filtros, agrupamentos, ordenação, datas, totais |
| G | **Desempenho** | Onde é lento? | Carga inicial, tamanho do arquivo, loops e re-renderizações, DOM, eventos duplicados, memória |
| H | **Estrutura técnica e arquitetura** | É fácil de manter? | Mapa dos blocos, dependências entre blocos, código repetido entre motores, variáveis globais, convenções |
| I | **Qualidade de código** | Quanto é lixo? | Código morto, variáveis e funções sem uso, duplicadas, funções gigantes, comentários obsoletos |
| J | **UX** | Onde o usuário trava? | Cliques por tarefa, fluxo de preenchimento, feedbacks, mensagens de erro, campos obrigatórios, navegação, responsividade |
| K | **Layout e design** | Está claro? | Espaçamento, alinhamento, contraste, cores, tipografia, legibilidade, agrupamento, ícones, modo escuro |
| L | **Roadmap** | O que fazer e em que ordem | Classificar tudo em Correção Crítica / Correção Importante / Melhoria / Evolução |

## 3. Como a varredura é feita
**Automática (cobre o arquivo inteiro):**
1. Extrair os blocos `data-vac-source` de `Plataforma.html` (texto entre `<textarea data-vac-source="...">` e `</textarea>`, decodificando `&amp;`, `&lt;`, `&gt;`) e, nos blocos `motor/*`, os `<script>` internos.
2. ESLint em cada bloco (`no-undef`, `no-unused-vars`, `no-dupe-keys`, `no-redeclare`, `no-unreachable`, `no-self-assign`, `no-constant-condition`, `eqeqeq`). Um nome indefinido só é bug se não houver definição em **nenhum** outro bloco (os blocos compartilham globais).
3. Código morto: símbolo sem referência no arquivo todo. Funções duplicadas e trechos copiados entre blocos.
4. Segurança: buscas por `innerHTML`/`insertAdjacentHTML`/template literals com `${}` sem `esc(...)`, `localStorage`/`sessionStorage`, `eval`, `new Function`, `document.write`, download e upload de arquivo, `catch` vazio.
5. Tamanho e estrutura: bytes por bloco, linhas muito longas, funções gigantes, número de globais.

**Por raciocínio e prova (trechos críticos):**
6. Leitura dirigida do motor de cálculo (`Engine`, `ProdCad`, turnos, paradas, hora a hora, SQDCP) e das gravações (`Cad.gravar`, `Store`, filas).
7. **Testes de propriedade no navegador** (Playwright/Chromium, `page.evaluate`) sobre o motor: gerar dias sintéticos (zero, nulo, extremos, meia-noite, hora extra) e verificar invariantes: sem `NaN`/`Infinity`, D, P, Q em [0, 1], OEE = D × P × Q, soma dos turnos = total do dia, o mesmo resultado em reprocessamento.
8. Comparar tela × exportação nos relatórios existentes e no que os testes `testes/plataforma/*` já cobrem (listar o que **não** cobrem).
9. Medições de desempenho (tempo de carga, nós de DOM, tempo de render dos módulos) e capturas de tela dos fluxos principais (desktop e celular, claro e escuro) para UX e layout.

**Ferramentas e skills usadas pelo agente de desenvolvimento:** `code-review` (correção de código), `security-review` (segurança), `simplify` (duplicação e código morto), `padrao-visual` (layout e UX), `verification-before-completion` (nada é afirmado sem prova). A contraparte usa o equivalente que tiver.

## 4. Padrão de achado (mesmo formato para as duas análises)
Cada achado é uma linha da tabela final **e** um item numerado no texto:

| Campo | Conteúdo |
|---|---|
| ID | `<frente><nn>`, ex.: `A07`, `D03` |
| Categoria | A a L |
| Item | uma frase |
| Onde | bloco `data-vac-source` + linha no bloco (ou arquivo do repositório) |
| Evidência | como reproduzir ou medir; trecho curto; teste que prova |
| Gravidade | **Crítica** (número errado ou dado perdido), **Alta**, **Média**, **Baixa** |
| Esforço | **P** (até 1 dia), **M** (alguns dias), **G** (semanas) |
| Benefício | Alto / Médio / Baixo |
| Confiança | **Provado** (reproduzido ou medido) ou **Suspeita** (raciocínio, falta prova) |
| Classe do roadmap | Correção Crítica / Correção Importante / Melhoria / Evolução |

Regras: gravidade Crítica exige prova; sem prova, no máximo Alta e marcada Suspeita. Achado novo de arquitetura ou estilo nunca é Crítica.

## 5. Entregas
1. `auditoria-<autor>.md`: resumo, mapa da arquitetura, os achados por frente, as **suspeitas**, o que **não** foi coberto e por quê, as perguntas de negócio.
2. `auditoria-<autor>.csv`: a tabela do item 4, uma linha por achado (abre no Excel).
3. Lista curta de **perguntas de ajuste** (negócio) separada dos achados técnicos.

## 6. Análise comum (depois das duas entregas)
1. Juntar as duas tabelas por **ID de lugar** (mesmo bloco e linha ou mesma função) e classificar cada achado:
   - **Convergente:** os dois viram. Confiança alta.
   - **Só um viu:** o outro reexamina e responde "confirmo / não reproduzo / já coberto por <teste>".
   - **Divergente:** gravidades diferentes ou conclusões opostas. Resolve-se rodando a prova (teste ou medição) e registrando o resultado.
2. Uma tabela única com a coluna **Quem viu** (A = agente de desenvolvimento, B = contraparte, A+B).
3. Roadmap único ordenado por: Correção Crítica → Importante → Melhoria → Evolução, e dentro de cada classe por Gravidade × Benefício ÷ Esforço.
4. As perguntas de ajuste ao responsável saem de uma lista só, sem repetição.

## 7. O que a auditoria não faz
Não altera código, não faz merge, não usa dados reais, não valida o comportamento em pasta de rede real nem com duas estações (isso depende do ambiente do responsável; entra como lacuna conhecida).
