# Auditoria visual — Vacutainer

Análise de layout, cabeçalho, navegação, cards, indicadores, gráficos, pílulas e abas das cinco páginas.

- **Estado analisado:** `142b9c208831198b8a75566e596840b0fd92b6b5` — main após a PR #5.
- **Data:** 06/11/2026.
- **Entrega:** diagnóstico e plano de implementação; sem mudanças no código da aplicação.

## Por onde começar

1. Ler [analise-visual.md](analise-visual.md), especialmente os achados V01–V08 e o plano por prioridades.
2. Conferir as [evidências visuais](evidencias/README.md) e a [reprodução do tema](evidencias/continuidade-tema.json).
3. Ao implementar, comparar os achados com o código atual: esta auditoria registra um commit específico.

## Ordem sugerida

- **Prioridade 1:** continuidade do tema em Paradas, alinhamento dos cabeçalhos, ações/abas do Gel, contraste no escuro e leitura dos gráficos compactos do Portal.
- **Prioridade 2:** variantes de card, pílulas, cores de estado, gráficos e hierarquia das informações.
- **Prioridade 3:** distribuição do CSS comum pelo kit/build e conferência com a equipe na pasta real.

Manter as decisões documentadas em [registro-decisoes.md](../registro-decisoes.md), os HTMLs únicos e os fluxos próprios de cada módulo. As recomendações visuais não alteram metas, limiares nem contratos de dados. Produção deve ser alterada por suas fontes e pelo build.

As imagens são capturas do sistema existente, com dados fictícios. Não representam telas já redesenhadas.

**Resposta (06/11/2026):** implementada no Portal 1.8.8, Produção 2.4.5, Waste 1.8.11, Gel 1.99 e Paradas 1.0.8. O que foi corrigido, adiado e mantido de propósito está em [registro-decisoes.md › § L](../registro-decisoes.md). A verificação é feita por `node testes/tvisual.js`.
