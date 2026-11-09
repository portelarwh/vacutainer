# Texto para enviar ao outro agente

Analise a nova varredura do Codex e confronte com sua implementação C1–C6. Não aceite os achados automaticamente. Nesta etapa apenas verifique: não altere HTMLs, fontes ou bases, não implemente, não faça commit nem abra PR. Reproduções devem usar dados fictícios em cópia isolada.

Repositório: https://github.com/portelarwh/vacutainer

Código examinado pelo Codex: `81ea71bb82cc62f08360684c7ce1a5df54697202`, main após PR #19. Informe seu SHA e se houve mudanças posteriores relevantes.

Material novo na branch `codex/varredura-main-81ea71b`, pasta `docs/auditorias/varredura-main-81ea71b/`:

- Índice: https://github.com/portelarwh/vacutainer/blob/codex/varredura-main-81ea71b/docs/auditorias/varredura-main-81ea71b/00-LEIA-ME.md
- Diagnóstico: https://github.com/portelarwh/vacutainer/blob/codex/varredura-main-81ea71b/docs/auditorias/varredura-main-81ea71b/01-VARREDURA.md
- Plano e homologação: https://github.com/portelarwh/vacutainer/blob/codex/varredura-main-81ea71b/docs/auditorias/varredura-main-81ea71b/02-PLANO-E-HOMOLOGACAO.md
- Método e reproduções: https://github.com/portelarwh/vacutainer/tree/codex/varredura-main-81ea71b/docs/auditorias/varredura-main-81ea71b/evidencias

Leia também, no SHA examinado:

- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/CLAUDE.md
- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/docs/auditorias/registro-decisoes.md
- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/docs/auditorias/c1-2026-11-08/01-CONTRA-ANALISE-8cad6a6.md
- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/docs/auditorias/c1-2026-11-08/03-RELATORIO-C2-C6.md
- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/docs/auditorias/revisao-main-8cad6a6/01-DIAGNOSTICO-ATUAL.md
- https://github.com/portelarwh/vacutainer/blob/81ea71bb82cc62f08360684c7ce1a5df54697202/docs/auditorias/plano-unico-2026-11-08/plano-unico.md

Verifique separadamente:

1. NV-01, P1: operações confirmadas de Iniciativas, Equipamentos e Paradas são reaplicadas na segunda pasta por não terem origem delimitada. Reproduza A → B com duas bases válidas já existentes.
2. NV-02, P1: Portal e Waste passam pela guarda nas duas abas antes de terminar a primeira leitura; se as leituras falharem, o segundo snapshot local substitui o primeiro. Confira a diferença entre a barreira de leitura da reprodução e o teste sequencial já existente.
3. NV-03, P2: em nova aba, cache da ficha vindo de RaizA/Linha é aceito em RaizB/Linha quando a leitura falha. A correção em memória continua válida; examine a identidade persistida.
4. NV-04, P2: IndexedDB vac-fila indisponível + duas abas sobrescrevem a reserva em localStorage. Há aviso de alterações não protegidas; decida o tratamento proporcional, sem atribuir o problema à fila normal funcional.
5. NV-05, P2: Portal › Versões conta operações do diário, mas mostra zero mesmo havendo uma cópia inteira pendente do próprio Portal ou do Waste. Avalie ampliar a leitura ou explicitar o escopo.

Para cada um: concordo, concordo parcialmente ou discordo; evidência em arquivo/função/linha; reprodução independente; severidade/prioridade; solução mínima e critérios de aceite. Distinga reprodução em navegador/OPFS, confirmação apenas no código e validação física na pasta da fábrica.

Revise a matriz AT-01–AT-12, os limites R-01, a cobertura da suíte e o plano de entregas. Confirme que as melhorias entregues não devem ser refeitas. Aponte algo relevante que tenha faltado e diga se o produto já está suficiente para piloto e o que impede ampliar o uso.

Respeite: sem API ou servidor de negócio; cada página escreve só a própria base; leitura cruzada pelos exports; códigos como texto; vigências imutáveis; Produção pelas fontes/build; kit pelas fontes/aplicador; perfis não são autenticação. Itens recusados só voltam com fato novo. Não invente amostra OSM, biblioteca local, regras MES ou padrões técnicos TPM.

Entregue um Markdown com parecer por item, correções mínimas sugeridas, lista do que falta e plano final de PRs com riscos e validações. Não declare aprovada a homologação com duas estações reais com base nos testes locais. Ao terminar, aguarde a decisão do responsável sobre implementação.
