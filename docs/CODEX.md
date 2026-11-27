# Codex — operação eficiente no Vacutainer

Regras compartilhadas: [AGENTS](../AGENTS.md). Este documento só define o uso do Codex, sem substituir contratos, alterar permissões ou autorizar merge/implantação. A configuração está em `.codex/config.toml` e os agentes em `.codex/agents/`.

## Roteamento

| Tarefa | Modelo e esforço preferidos |
|---|---|
| Coordenação, implementação usual, CI e documentação técnica | GPT-6.2 Sol / medium |
| Mudança trivial, texto ou CSS isolado | modelo econômico disponível / low; sem delegação |
| Busca focalizada e mapeamento amplo quando necessário | explorador: GPT-6 Luna / high |
| Arquitetura, refatoração transversal ou decisão difícil | arquiteto: GPT-6.2 Astra / high |
| Persistência, migração, concorrência e recuperação críticas | dados: GPT-6.2 Astra / xhigh |
| Revisão independente de alteração relevante | revisor: GPT-6.2 Sol / medium; escalar se necessário |

O coordenador implementa normalmente; não criar outro agente para repetir seu trabalho. Tarefa pequena: um agente. Limite inicial: dois subagentes simultâneos, somente com escopos independentes, sem delegação em cascata. Somente o coordenador escreve no mesmo checkout/HTML. Os quatro especialistas são de consulta por instrução, não por sandbox separado. Nunca usar Max/Ultra ou modo rápido pago como padrão; Max para impasse comprovado, Ultra quando houver trabalho realmente separável e benefício claro. Não comprar créditos nem mudar plano automaticamente.

O cliente pode não aceitar todos os modelos/configurações. Em projeto confiável no app/CLI, confirme leitura da configuração e agentes; escolha modelo autorizado no seletor ou `/model` quando disponível. Se um modelo faltar, use Sol (ou o equivalente disponível), ajuste esforço compatível e continue sem repetir tentativas. Não presumir troca automática do modelo principal nem suporte idêntico no Codex Web. Não alterar configurações pessoais, sandbox, credenciais ou permissões do ambiente.

## Contexto e execução

- Leia Issue/tarefa, AGENTS e índice COMECE-AQUI; consulte seções relevantes e consumidores. Use busca direcionada, não leia HTML gigante integralmente, vendors, planos concluídos nem dumps de logs. Antes do corte modular, extraia por ID com `scripts/bloco.mjs`; após o corte, leia arquivos de fonte diretamente.
- Uma tarefa, branch e escopo; verifique PRs ativos e evite editar os mesmos arquivos em paralelo com Claude. Use Git/Issue como checkpoint: objetivo, branch, commit, decisões, testes, próximo passo. Não duplicar status entre documentos. Ao compactar contexto ou retomar, use checkpoint, não releia tudo.
- Teste proporcionalmente ao risco; use comandos oficiais e CI. Alteração comum, de dados ou arquitetura exige regressão ampla; preserve critérios de aceite e não desabilite testes. Somente fixtures fictícias. Nenhum runtime depende de Codex, internet ou servidor de aplicação.
- Superpowers e skills, quando presentes: usar apenas a habilidade pertinente, sem repetir planos, revisões ou investigações. Claude e Codex compartilham AGENTS e contratos, mas não precisam executar o mesmo ritual. Nenhum agente deve alterar configurações de outro sem escopo aprovado.
- Autonomia para mudanças rotineiras na branch. Merge, publicação, implantação, gastos e migração real seguem autorização específica; a exceção de merge da distribuição não vale automaticamente para outras tarefas. Relatório curto: alterações, testes, impacto, riscos, commit/PR e reversão.

## Validação e ajuste

Em nova sessão, pedir que confirme modelos/agentes efetivamente disponíveis, execute uma consulta curta com explorador e reporte se configuração foi carregada. Se não suportado, aplicar o roteamento manualmente. Medir por sete dias: duração, consumo disponível no cliente, tarefas aceitas sem retrabalho, falhas, número de delegações e resultados de testes. Ajustar somente com evidência; não prometer economia percentual antes de medir. Não aumentar contexto máximo ou alterar cache/compactação sem necessidade.

Referências oficiais: https://learn.chatgpt.com/docs/agent-configuration/subagents ; https://learn.chatgpt.com/docs/config-file/config-basic ; https://learn.chatgpt.com/docs/models .
