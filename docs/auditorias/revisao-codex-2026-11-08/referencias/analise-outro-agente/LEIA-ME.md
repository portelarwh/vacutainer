# Diagnóstico de 08/11/2026: pacote para revisão independente

- **Commit analisado:** `e043513`, a `main` com o PR #11.
- **Autor:** Claude Code, por pedido do responsável (Pedro).
- **Situação:** somente análise. Nada foi implementado; a aprovação está pendente.

## O que tem nesta pasta

| Arquivo | O que é |
|---|---|
| `diagnostico.md` | O diagnóstico completo, em 9 seções. Resumo e as 10 recomendações (§ 0). Defeitos com problema, onde, por que corrigir, como e critério de aceite (§ 2: B1–B10). Código repetido (§ 3: C1–C5). Integração por número de ordem (§ 4). Interface e visão resumida ou detalhada (§ 5). Funcionalidades por página (§ 6). Motivo de cada página em construção (§ 7). Plano em fases (§ 8). Decisões pendentes (§ 9) |
| `reproducoes/verificar.js` | Reproduz os achados verificáveis (B1–B7, C1, § 4, § 5 e a varredura de estabilidade). Só lê: não grava nada |

**Como rodar** (na raiz do repositório, com Playwright e Chromium):

```bash
node docs/auditorias/diagnostico-2026-11-08/reproducoes/verificar.js
```

Cada linha diz **CONFIRMADO** (o achado continua no código) ou **NÃO REPRODUZ**. Resultado em `e043513`: 10 de 11 confirmados. A varredura de estabilidade, que visita todas as abas das 5 páginas nos 2 temas, termina sem nenhum erro de JavaScript, como esperado. A saída completa vai para `testes/saida/diagnostico-2026-11-08.json` (fora do git).

**O que o script não cobre:** propostas e visão (§ 5 a § 8), C2 a C5 (manutenção) e B8 a B10 (já registrados como pendência no `CLAUDE.md`). Esses itens são opinião técnica e pedem análise, não reprodução.

## Antes de analisar, ler

1. `CLAUDE.md`: regras da plataforma, comandos e "Pendências conhecidas".
2. `docs/auditorias/registro-decisoes.md`, sobretudo § C, § P, § R, § L e o item 5.4 ("perfis não são autenticação", recusado). **Item recusado no registro só volta com fato novo.**
3. `docs/plano-evolucao-plataforma.md` (decisões D1–D11 e a arquitetura-alvo: ficha comum, `exports` v2) e `docs/paginas-construcao.md`.

## Pedido para o agente revisor (copiar e colar)

> Trabalhe no repositório portelarwh/vacutainer, partindo da `main` mais recente. Informe o commit analisado.
>
> **Nesta etapa, apenas analise.** Não altere arquivos, não implemente nem faça commits sem aprovação explícita do responsável.
>
> Leia `docs/auditorias/diagnostico-2026-11-08/LEIA-ME.md` e `diagnostico.md`. Antes, leia o `CLAUDE.md` (inclusive "Pendências conhecidas"), o `docs/auditorias/registro-decisoes.md` e o `docs/plano-evolucao-plataforma.md`.
>
> Rode `node docs/auditorias/diagnostico-2026-11-08/reproducoes/verificar.js` e confira cada resultado no código. Não aceite o diagnóstico automaticamente.
>
> Para cada item (B1–B10, C1–C5, as propostas das § 4 a § 7 e o plano da § 8), responda:
> - **Concordo, concordo parcialmente ou discordo**, com justificativa técnica e evidência (arquivo, função, linha; reprodução quando couber).
> - Se é **defeito reproduzido**, **defeito confirmado só no código**, **risco de escala ou manutenção** ou **proposta de produto**.
> - **Severidade e prioridade** que você daria.
> - Para defeitos: a solução proposta é a adequada? Há solução mais simples ou com menos risco? Os critérios de aceite bastam?
> - Para propostas (ficha da ordem, Resumo/Detalhado, perfil na tela, Minha fila, Reunião diária, gerador de relatório comum, páginas novas): faz sentido para uma linha de produção com operador, liderança, PCP, qualidade e manutenção? O que você mudaria, cortaria ou acrescentaria?
> - Diga também o que o diagnóstico **deixou de ver**: defeitos, riscos ou oportunidades ausentes.
>
> **Respeite:**
> - os contratos de dados: cada página grava só a própria base e as outras leem só o `exports`; vigências imutáveis; códigos como texto;
> - o build da Produção (só por `fontes/producao/`);
> - o kit comum (só por `fontes/kit/` + `aplicar_kit21.py`);
> - as decisões registradas.
>
> Entregue em Markdown: parecer item por item, lista do que faltou e uma proposta de ordem de entregas (PRs), com riscos e validações. Depois, **pare e aguarde a aprovação**.

## Contexto rápido para quem chega agora

- **8 páginas HTML de arquivo único** numa pasta da rede (File System Access API), com as bases `.json` em `00. Bases/`.
- **Estáveis:** Portal, Produção, Waste.
- **Em atualização:** Gestão de Gel, Paradas.
- **Em construção, geradas a partir de um modelo:** Equipamentos, Iniciativas, Projetos.
- **Produção:** montada por `fontes/producao/build.py`, com substituições exatas sobre `OEE-base-2.0.html`.
- **Testes:** Playwright em `testes/` (`tpg`, `tintegra`, `tdiag`, `tvisual`, `tbases`, `trelatorios`, `tconstrucao`, `tseguranca`…).
- **Interface:** sempre em português do Brasil.
