# Retomar: Administração central · Bloco 1 (passagem de sessão, 24/11/2026)

A sessão anterior parou por falta de tokens. Nada ficou pela metade: o último commit é `5bddb87` na branch `claude/determined-brown-f1jh2g`, PR rascunho [portelarwh/vacutainer#148](https://github.com/portelarwh/vacutainer/pull/148), CI verde até `b442b23` (os commits seguintes ainda não tinham resultado do CI quando a sessão parou).

## Leia, nesta ordem
1. `CLAUDE.md` e `AGENTS.md` (regras do projeto).
2. Desenho aprovado: `docs/superpowers/specs/2026-11-23-administracao-central-design.md`.
3. Plano: `docs/superpowers/plans/2026-11-23-administracao-central-bloco1.md`.
4. Inventário com as 14 decisões do responsável (todas aceitas): `docs/CONFIGURACOES.md`.
5. Registro de andamento, decisões e pendências menores: `ledger.md` (nesta pasta). As decisões ("Ruling") **valem**; não reabrir.
6. Relatórios das tarefas 1 a 7 (nesta pasta), para ver como cada uma foi feita.

## Onde está
| Tarefa | Situação | Commits |
|---|---|---|
| 1 Inventário | pronta, revisada | 2eca8d5 |
| 2 `vacCad` único | pronta, revisada | 31d4575 |
| 3 `vacCad.lista/item/vigente/param` | pronta, revisada | 36b9341 |
| 4 Administração por assunto + permissão por assunto | pronta, revisada (1 rodada de correção) | 505eb56, b41fca5 |
| 5 Formato v2 do Gel + `vacCad.gel` + cenário | pronta, revisada (reaberta: teste equip-ordem) | b662f5b, b442b23 |
| 6 Tela Administração › Gel | pronta, revisada | ad713a0 |
| 7 Importador de uso único | pronta, revisada (1 rodada de correção) | e74e8be, 5bddb87 |
| **8 Gel e Produção leem só `vacCad.gel`** | **não começada** (duas tentativas pararam antes de alterar qualquer arquivo) | — |
| 9 Números iguais, cenário, versões, entrega | não começada | — |

## Decisões do responsável que valem para o que falta
- Gel do Tubo 100 = **0,936 g desde 01/10/2025** (no cenário de demonstração a data aparece deslocada para 15/10/2025, porque o cenário anda com o "hoje"; é esperado).
- Valores de fábrica embutidos saem: sem cadastro, aviso — **nunca zero**.
- O importador fica até a importação na pasta real e sai na etapa 8 do desenho (limpeza).
- Perfis iniciais por assunto: Processos edita tudo; PCP edita Planta e linha + Turnos e metas; Almoxarifado edita Gel; quem já edita a Administração hoje (semSenha / ADMIN / `permissoes.portal.configurar|lancar`) edita tudo; o resto só vê.
- Embalagem própria é **por local de descarte** (modelo da página antiga); o importador copia a tara do equipamento para os locais dele.

## Como continuar (mesma qualidade)
Use a skill `superpowers:subagent-driven-development` com o plano acima. Um agente implementa cada tarefa, outro revisa (conformidade + qualidade), correções voltam ao implementador, e no fim há uma revisão do branch inteiro.

1. Copie o registro para a pasta de trabalho da skill (ela é ignorada pelo Git):
   ```bash
   mkdir -p .superpowers/sdd/2026-11-23-administracao-central-bloco1
   cp docs/superpowers/handoff/2026-11-24-bloco1/ledger.md .superpowers/sdd/2026-11-23-administracao-central-bloco1/progress.md
   ```
2. A skill retoma pela tarefa 8. Gere o brief com o script `task-brief` da skill (plano, tarefa 8) e despache o implementador com o **texto de despacho da tarefa 8** (`despacho-tarefa-8.md`, nesta pasta) — ele traz as decisões que corrigem o plano (ordem: primeiro gravar os números de referência com o código atual; aviso "Cadastro do gel não importado"; registros de scrap guardam o id do local e o nome de reserva; o que remover; teste de contrato). Para a tarefa 8, use o modelo mais forte disponível: é a maior integração do bloco (motor/gel e motor/oee).
3. Depois da tarefa 8, a tarefa 9 (Global Constraints do plano): versão da plataforma, Novidades (a versão da plataforma tem de ser a primeira), PENDENCIAS (linha ADM-CENTRAL bloco 1), `docs/CONTRATO-MOTORES.md`, cenário regravado, suíte completa (`npm run lint`, `npm run test:plataforma`, `npm test`). Inclua as pendências menores do ledger que a revisão final mandar corrigir (ex.: `equip-ordem` com rolagem fixa de 120 px → calcular pelas linhas).
4. Revisão final do branch inteiro, PR pronto, CI verde, merge (o responsável autorizou concluir: "siga até o final e conclua tudo").
5. Avise o responsável: na pasta real, abrir Administração › Sistema › **Importar das bases atuais**, conferir a prévia, importar e conferir a tela Administração › Gel.

## Atenção
- `.superpowers/` é ignorado pelo Git; esta pasta (`docs/superpowers/handoff/…`) é a cópia que viaja.
- Não editar `Plataforma.html` enquanto uma suíte longa roda (use `git worktree`).
- Commits terminam com:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_01K8Lz1ur7xxm61KYkrYsTw2` (ou a sessão nova).
