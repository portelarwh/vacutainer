# Correção da integração — PR 76

Direção: a plataforma é o produto; `fontes/` e `paginas/` são as fontes dos motores. Apenas `nova-plataforma/dist/Plataforma.html` será distribuído, após homologação. Nenhuma base real é usada nesta rodada.

| Item | Regressão e resultado | Observação |
|---|---|---|
| 1 — motores atuais | `tests/engines.test.ts`: antes 8 ≠ 9; depois nove HTML idênticos à árvore compilada | Sem substituições textuais no empacotador. Manifesto com commit de compilação, último commit das fontes e arquivos sujos. Round trip funcional será verificado com a ponte corrigida. |

Os commits intermediários corrigem camadas dependentes. A aprovação funcional depende da suíte integrada final, não apenas dos testes unitários de cada camada.

NÃO VERIFICADO nesta máquina: abertura `file://` no Chrome/Edge corporativo, SMB e concorrência entre duas estações. O corte depende desses testes na homologação; não foi autorizado testar nas bases da linha.
| 2 — versão | `tests/compatibility.test.ts`: leitura de versão maior, comparação numérica e recusa de escrita; três testes passam | A proteção envolve todas as subpastas e reavalia a autorização a cada operação de escrita. Falha de leitura bloqueia conexão. |
| 3 — identidade | `tests/auth.test.ts`: lista removida; sessão ausente/expirada/ID divergente e Consulta recusam escrita | O login continua no kit; permissões por ação continuam no vacTravas. Testes completos de senha serão exercitados na suíte integrada. |
| 4 — contrato | `tests/bridge.test.ts`: dois testes vermelhos antes; verdes após remover eval e publicar API | O teste `contrato.cjs` verifica a presença das seis operações nos nove módulos no navegador. Erro/ausência de contrato bloqueia troca de pasta. |
| 5 — navegação | `tests/tabs.test.ts` falhou com a lista fixa e passa com `vacPagina.abas()` | `contrato.cjs` compara os botões da casca às rotas publicadas por cada motor. Comandos e versão do cabeçalho vêm da mesma API. |
| 6 — pasta e fila | `tests/scopes.test.ts`: A → B → A usa a identidade original; fila durável e falha de leitura bloqueiam troca | Busca em todos os handles com isSameEntry; importa o escopo da primeira versão. Lê reservas, operações e cópias pendentes sem abrir o módulo. |
| 7 — urgência | `tests/severity.test.ts`: reproduziu inversão 2,1; agora 1,2, inclusive relatório, fila e contadores | Portal 1.9.37 mantém o significado de cada alerta antigo, sem inverter as saídas dos motores. A referência do tintegra foi atualizada para a convenção decidida. |
| 8 — testes/CI | `tests/ci.test.ts`: vermelho na revisão anterior, verde com matriz de quatro partes e job da plataforma | `pasta.cjs` gera bases pelas factories/exports atuais e verificou os oito módulos: versão e todas as chaves preservadas; bases futuras recusam escrita. `tpermissoes` passou dentro da plataforma. Login e suíte final continuam sendo conferidos. |

A proteção de escrita no navegador intercepta a API no realm de cada motor. Os handles continuam nativos e clonáveis no IndexedDB. Essa validação nasceu no round trip; um Proxy de handle não serve para persistir a conexão.

A suíte da raiz foi executada integralmente: 67 suítes, 12 passaram, 54 falharam e uma ficou sem verificação (xlsx ausente). A maioria das falhas é `ERR_BLOCKED_BY_ADMINISTRATOR` na navegação file://. Isso NÃO comprova falha do motor nem aprovação funcional; a alternativa HTTP local é registrada separadamente, sem substituir a homologação de file://.
| 9 — preparação do corte | `tests/cutover.test.ts`: modelo antigo falhou; guia e roteiro novos passam | Somente documentação e demonstração do produto atualizadas. Corte NÃO EXECUTADO: aguarda conclusão dos testes e homologação autorizada. |
| A3/A4 — rolagem/filtro | `tests/ux.test.ts`: vermelho com os dois filtros; verde após usar apenas o filtro do motor | Altura do iframe acompanha conteúdo por ResizeObserver. Cabeçalhos duplicados do vacShell foram ocultados; comandos continuam na barra da casca. |
| M1 — eventos/cadastro | `tests/storage.test.ts`: vermelho antes, verde com publicação canônica | Eventos chegam aos outros módulos como vac.cadastros/vac.sessao, sem prefixo. A cópia do cadastro na casca é atualizada pelo Portal, com revisão conferida; escrita idêntica não cria ciclo de eventos. |
| M3 — execução | `tests/lifecycle.test.ts`: vermelho antes, verde após configurar em useEffect, carregar bibliotecas quando solicitadas e descartar recursos | Handles nativos continuam protegidos. O adaptador descartar encerra timers e observers antes da remoção do iframe. |
| M6 — build | `tests/build.test.mjs`: vermelho sem inspeção interna; teste de dependência e hash inválido passam | Verificação descomprime os nove motores e confere SHA-256, tamanho e recursos externos. Fontes remotas redundantes foram removidas das fontes; usa-se o kit local. |
| I1 — Design System | `tests/design.test.ts`: vermelho antes, verde com importação direta do kit_ds.css | Casca usa os tokens oficiais; a ponte deixa de impor uma paleta diferente aos motores. |
| M5 — impressão | `tests/print.test.ts`: vermelho antes, verde com encaminhamento ao motor | Ctrl+P no aplicativo e dentro do iframe imprime o módulo ativo. Barra também oferece Imprimir módulo; o motor conserva seu cabeçalho e regras de impressão. |

## Ajustes encontrados na validação final

- Os formulários longos de login precisam usar a altura visível da janela, e não a altura completa do conteúdo do motor. O teste de autocadastro no navegador reproduziu o botão fora da tela; o fluxo completo de login passou após a correção.
- Os comandos ocultos no cabeçalho original são acionados pela barra da casca. A demonstração admite ações fictícias sem exigir sessão real; o modo real permanece em consulta sem sessão.
- A conexão só é anunciada depois de concluir a leitura. O teste de round trip flagrou a sinalização anterior à leitura completa.
- O descarte usa callback ref estável, antes de o iframe perder a referência. O teste de pasta confirmou os oito motores descartados na troca de escopo.
- O bloqueio de versão inclui cadastro do Portal e ordens da Produção. A regressão do arquivo auxiliar mais novo falhou antes da correção e passa depois.
- Links internos conservam o módulo de origem. As substituições estruturais agora exigem exatamente uma âncora; o empacotador não faz alterações textuais.
- A SheetJS 0.20.3 usa uma única fonte em paginas/lib, com a mesma licença e hash já verificados; os testes de Meta e Excel da raiz também usam essa versão. O adapter Node do teste configura fs explicitamente.

Contrato detalhado: [CONTRATO-MOTORES.md](../CONTRATO-MOTORES.md).
