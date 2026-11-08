**Vacutainer — revisão do estado atual após o PR #16**

Data: 08/11/2026. Código examinado: `8cad6a66816b174c17df39823c31b799ea9b5ce8`, merge do PR #16 e main consultada no início da revisão. Esta edição substitui a avaliação de maturidade do diagnóstico de e043513; os documentos antigos permanecem como histórico.

**Parecer:** o sistema já tem um MVP funcional e uma organização de páginas adequada. Cabe um piloto assistido, com cópia de segurança, controle de alterações pendentes e homologação da pasta. Ainda não recomendo ampliar o uso simultâneo sem corrigir os problemas de persistência descritos aqui. Não vejo necessidade de reescrever o sistema ou abrir outra página agora.

**O que melhorou:** ficha integrada e Ctrl K, Planner/KAS, Minha fila, Reunião diária, relatório de Paradas, Equipamentos/OS/TAGs e estrutura AM/TPM. Os testes das correções anteriores passaram. Os três apontamentos tratados pelo PR #16 estão corrigidos nos cenários cobertos; há um cenário adicional de virada do dia com a aba já aberta, descrito como AT-04.

**Verificação:** 16 suítes existentes concluídas sem falha, com 656 linhas de checagem `ok`, além de cenários complementares. Os três comandos de geração reproduzem os arquivos publicados sem diferenças. Os testes não equivalem à homologação física de duas estações na rede.

**Novos achados:** 12 problemas distintos AT-01–AT-12, reproduzidos em navegador com dados fictícios. O principal é perder uma das alterações pendentes ao usar duas abas do mesmo módulo. Há também recriação silenciosa de base vazia, falta de validação do formato próprio, dados derivados desatualizados e falhas de contexto, identidade e navegação. O número de cenários é maior que o de problemas porque alguns afetam as duas páginas novas.

| Arquivo | Para que serve |
|---|---|
| [01-DIAGNOSTICO-ATUAL.md](01-DIAGNOSTICO-ATUAL.md) | Parecer completo, 12 achados com local/motivo/correção/aceite, avaliação por página, limites e oportunidades |
| [01-DIAGNOSTICO-ATUAL.pdf](01-DIAGNOSTICO-ATUAL.pdf) | Mesmo diagnóstico em PDF para leitura e compartilhamento |
| [02-PLANO-DE-CORRECOES-E-EVOLUCAO.md](02-PLANO-DE-CORRECOES-E-EVOLUCAO.md) | Ordem de entregas propostas, riscos, dependências e melhorias que podem ou não avançar |
| [03-HOMOLOGACAO-PASTA-REAL.md](03-HOMOLOGACAO-PASTA-REAL.md) | Roteiro de conferência na rede, incluindo os quatro pontos levantados pelo responsável |
| [04-PEDIDO-DE-CONTRA-ANALISE.md](04-PEDIDO-DE-CONTRA-ANALISE.md) | Texto para o próximo agente tentar refutar os achados e revisar a sequência de correções |
| [evidencias/LEIA-ME.md](evidencias/LEIA-ME.md) | Como as verificações foram feitas, scripts e seus limites |

**Não houve implementação.** Nenhum HTML, fonte, base ou documento preexistente do projeto foi modificado na revisão. Os testes e builds foram executados em cópias separadas. Caso esta pasta seja publicada em um commit documental, isso não significa correção dos achados nem autorização de implementação.

Os IDs AT pertencem exclusivamente a esta revisão do commit 8cad6a6. Não confundir com F01–F13 do diagnóstico anterior nem com A/B/C de outras auditorias.

**Publicação documental:** seguindo a autorização anterior para disponibilizar as análises no GitHub, esta edição é destinada à branch `codex/auditoria-main-8cad6a6`, pasta `docs/auditorias/revisao-main-8cad6a6/`. Somente arquivos novos dessa pasta entram no commit documental; a aplicação e a main permanecem sem alteração. Nenhuma PR será aberta nesta revisão. O código dos links de evidência continua sendo o SHA 8cad6a6, anterior ao commit dos documentos.

**Próximo passo recomendado:** corrigir AT-01/02/03/11, conferir os efeitos nas duas páginas novas e executar a homologação descrita. Depois, resolver atualização e contexto antes de ampliar as novas funcionalidades. As dependências de planilha OSM, estação coletora, regras MES e padrões TPM continuam válidas.
