# Correção da integração — PR 76

Direção: a plataforma é o produto; `fontes/` e `paginas/` são as fontes dos motores. Apenas `nova-plataforma/dist/Plataforma.html` será distribuído, após homologação. Nenhuma base real é usada nesta rodada.

| Item | Regressão e resultado | Observação |
|---|---|---|
| 1 — motores atuais | `tests/engines.test.ts`: antes 8 ≠ 9; depois nove HTML idênticos à árvore compilada | Sem substituições textuais no empacotador. Manifesto com commit de compilação, último commit das fontes e arquivos sujos. Round trip funcional será verificado com a ponte corrigida. |

Os commits intermediários corrigem camadas dependentes. A aprovação funcional depende da suíte integrada final, não apenas dos testes unitários de cada camada.

NÃO VERIFICADO nesta máquina: abertura `file://` no Chrome/Edge corporativo, SMB e concorrência entre duas estações. O corte depende desses testes na homologação; não foi autorizado testar nas bases da linha.
| 2 — versão | `tests/compatibility.test.ts`: leitura de versão maior, comparação numérica e recusa de escrita; três testes passam | A proteção envolve todas as subpastas e reavalia a autorização a cada operação de escrita. Falha de leitura bloqueia conexão. |
