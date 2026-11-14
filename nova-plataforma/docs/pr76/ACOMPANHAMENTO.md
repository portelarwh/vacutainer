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
