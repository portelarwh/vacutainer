**Pedido ao próximo revisor**

Analise esta revisão da main 8cad6a66816b174c17df39823c31b799ea9b5ce8 do portelarwh/vacutainer, após o merge do PR #16. Compare com o código, o registro de decisões e o plano único. Não aceite o diagnóstico automaticamente.

Material no GitHub: [docs/auditorias/revisao-main-8cad6a6/](https://github.com/portelarwh/vacutainer/tree/codex/auditoria-main-8cad6a6/docs/auditorias/revisao-main-8cad6a6), branch `codex/auditoria-main-8cad6a6`. O commit de publicação só acrescenta esta pasta; não contém correções da aplicação. O código auditado está em [8cad6a6](https://github.com/portelarwh/vacutainer/tree/8cad6a66816b174c17df39823c31b799ea9b5ce8).

Comece por 00-LEIA-ME.md, 01-DIAGNOSTICO-ATUAL.md, 02-PLANO-DE-CORRECOES-E-EVOLUCAO.md e 03-HOMOLOGACAO-PASTA-REAL.md. As evidências incluem 16 suítes existentes, 656 checagens explícitas, builds sem diferença, 56 cenas das telas novas e cenários adicionais. Informe o SHA que examinar e separe mudanças posteriores.

Tente refutar ou delimitar AT-01–AT-12. Priorize duas abas com alterações pendentes, base conhecida que desaparece, versão própria desconhecida, retorno à aba após virar o dia, rotas/contexto, usuário de Minha fila, protocolo do link de origem e ordem com zeros. Distinga os 12 problemas dos 16 cenários de reprodução, do risco R-01 de retenção de operações e da dependência XLSX já conhecida. Confira os limites dos testes: Excel com aceite incondicional e telas novas ainda tratadas como construção pela suíte visual antiga.

Para cada divergência, apresente arquivo/função/linha e reprodução quando possível; conclusão, severidade, prioridade, solução mais simples e aceite. Reconheça o que já foi corrigido: os três casos exatos do PR #16 passaram; AT-04 é um caminho adicional de aba já aberta, não alegação de que a correção inteira não existe.

Conclua se o sistema está adequado para piloto ou ampliação e revise a ordem C1–C6. Aponte o que faltou sem inventar necessidades. Preserve a operação por arquivos, dono de cada base, leitura por exports, códigos como texto, vigências imutáveis e processos de build. OSM vem da plataforma oficial; MES entra por arquivo SQL; TPM e 5S dependem dos padrões reais.

Nesta etapa apenas verificar e emitir parecer separado. Não implemente, não altere HTMLs, fontes, bases ou documentos existentes, não faça commits nem abra PR. Reproduções devem usar cópia isolada e dados fictícios. A implementação será decidida pelo responsável após a revisão.
