**Vacutainer — revisão consolidada para contra-análise**

Data: 08/11/2026. Repositório: `portelarwh/vacutainer`. Código de referência: `e0435136359847e07a2a775a1d7eea31371495b8`, conferido também como `main` remoto nesta etapa.

**Escopo autorizado: verificar, organizar e documentar. Nenhuma implementação.** Os documentos deste pacote foram criados fora do repositório da aplicação. O diagnóstico anterior e os arquivos do projeto foram preservados.

**Documentos de trabalho**

| Arquivo | Uso |
|---|---|
| [01-PLANO-MESTRE.md](01-PLANO-MESTRE.md) | Leitura principal: diagnóstico consolidado, decisões do usuário, arquitetura por arquivos, Planner, TAGs MES, conciliação, cronologia, TPM e propostas por página |
| [02-PENDENCIAS-E-MELHORIAS.md](02-PENDENCIAS-E-MELHORIAS.md) | Lista única de acompanhamento por ID, com situação, motivo, dependências e critério de aceite; documento a pedir para revisar nas próximas sessões |
| [03-PEDIDO-DE-CONTRA-ANALISE.txt](03-PEDIDO-DE-CONTRA-ANALISE.txt) | Texto pronto para enviar ao outro agente, junto com este pacote |
| [04-MATRIZ-DE-VERIFICACAO.md](04-MATRIZ-DE-VERIFICACAO.md) | O que conferir no código e quais cenários o outro agente deve desafiar; distingue resultados anteriores de leitura desta etapa |
| `referencias/diagnostico-inicial/` | Diagnóstico anterior completo, PDF, Markdown, logs, imagens e reproduções, preservados como histórico |
| `referencias/documentacao-do-repositorio/` | Cópias das regras e decisões do projeto no commit analisado |
| `referencias/esclarecimentos-do-responsavel-2026-11-08.md` | Mensagem do usuário preservada para conferir o significado original das novas necessidades |
| `codigo-analisado-e043513.zip` | Código exato analisado, produzido com `git archive`; permite revisão independente sem depender de uma branch que mude depois |
| `evidencias/` | Manifestos de integridade e contexto desta consolidação |

**Ordem de leitura:** este arquivo → plano mestre → pendências → matriz de verificação → evidências e código. Para cada defeito F01–F11, o diagnóstico inicial contém a reprodução e a correção propostas em maior detalhe.

**Precedência das informações**

1. As definições mais recentes do usuário, registradas no plano mestre, prevalecem sobre recomendações e propostas antigas.
2. O código determina o que existe hoje. Um documento de arquitetura ou uma aba em construção não comprovam implementação.
3. O registro de decisões do repositório deve ser lido antes de apontar regressões ou reabrir decisões recusadas. As novas orientações do usuário são fatos novos para o planejamento; não demonstram sozinhas um defeito do código.
4. A hipótese de API/servidor do diagnóstico inicial saiu do plano atual. Toda entrega proposta deve funcionar por arquivos e pasta compartilhada.
5. OSM vem da plataforma oficial. O formulário de criação local e a validação oficial local sugeridos anteriormente não são o fluxo principal desta revisão.

**Como retomar sem perder contexto**

Pedido sugerido: “Revise `02-PENDENCIAS-E-MELHORIAS.md`, confronte com o código atual e com `01-PLANO-MESTRE.md`, e diga quais IDs já existem, quais faltam e quais podemos executar agora. Não implemente até eu pedir.”

Para encerrar um item futuramente, exigir referência de código/commit e verificação correspondente. “Planejado”, “documentado” e “aba criada” não equivalem a “concluído”.

Os oito conjuntos de testes do diagnóstico inicial foram executados na etapa anterior. Nesta etapa, com o mesmo commit, houve conferência do estado remoto e inspeção estática direcionada; eles não foram reexecutados. Não houve acesso à rede industrial, a SQL/SAP reais, à planilha oficial de OSM ou aos procedimentos detalhados de TPM.

**Portabilidade:** os links de código dos novos documentos apontam para o commit fixo no GitHub. Links locais do diagnóstico histórico continuam representando o ambiente em que ele foi produzido. O arquivo de código deste pacote permite localizar as mesmas linhas em outro computador.
