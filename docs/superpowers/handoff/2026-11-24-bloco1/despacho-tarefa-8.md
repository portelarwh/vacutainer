# Texto de despacho da tarefa 8 (usar como está; troque o caminho do brief pelo gerado na sessão nova)

You are implementing Task 8: Gel e Produção leem só de `vacCad.gel`.

## Task Description
Read your task brief first (generated from docs/superpowers/plans/2026-11-23-administracao-central-bloco1.md, Task 8) — your requirements, with exact patterns verbatim. Also read Task 9's step 1 (the numbers baseline), which you must do FIRST.

## Context
Project /home/user/vacutainer — read CLAUDE.md first (contracts: ausência nunca vira zero; fórmulas não mudam; números iguais). Centralizing all cadastro in the Administração. In place now:
- comum/bases: `vacCad()`, `vacCad.vigente/lista/item/param`, `vacCad.gel.formato(data)` → `{de,ate,embalagemG,folhaPurgaG,sobraBarrilKg,tubos:{'100':{tuboG,gelG,aditivoG,tampaRolhaG},'75':{...}}}|null`, `vacCad.gel.composicao(tubo,comp,data)` → `{gPorTubo,partes,etiqueta}|null` (null if any needed weight null), `vacCad.gel.locais({equipamento,ativos})` → `[{id,equipamento,local,comp,categoria,motivos,embalagemG,ordem,ativo}]` (sorted by ordem; excludes locais of inactive equipment).
- Cadastro schemaVersion 2 (`gel.formatos`, `gel.locais`); Admin › Gel screen writes it; importer `ImportarV1` (marked ADM-CENTRAL) converts v1; while v1, Admin is locked except import.
- The demo scenario has the SAME formato/locais in the new `gel` section and in the old copies (`parametros.gel.formatos`, `equipamentos[].gel.descs`, and the Gel base `config.fmts/equips`), on purpose, so old and new code see identical data.
- `GEL_FMT_DEF` already removed from motor/portal; the Gel's `FMT_DEF` (motor/gel) and the Produção's copies (motor/oee, e.g. `COMPS` near the scrap-de-gel code and any FMT default) remain — this task removes them.

Controller rulings:
1. ORDER: first write `testes/plataforma/gel-numeros.cjs` (Task 9 step 1) and run it on the CURRENT code to record `testes/amostras/gel-numeros-antes.json` (scrap de gel totals of the demo scenario per day, local and category in g and kg, and the month's consumption — pick the numbers the Gel page and the Produção scrap-de-gel show; record what you chose). Commit that alone first. Then change the code, then make the same test compare against the file — must be equal. If any number differs, stop and report BLOCKED with the diff (do not regenerate the baseline).
2. The "cadastro do gel não importado" assertion moved here from Task 7: with a v1 cadastro (no `gel` section), Gel and Produção show a clear notice ("Cadastro do gel não importado — Administração › Sistema › Importar das bases atuais") and never compute or save scrap with 0.
3. Scrap records: keep what is already stored in existing records (don't migrate lançamentos). New records store the local `id` plus the local name as fallback for display; display uses the current cadastro name when the id resolves, else the stored name.
4. Remove the cópias and syncs: the Gel's sync from the Portal (`pg()`, `eq()`, `eqLivres()` and related around "parâmetros do gel do Portal"), `S.config.fmts`, `S.config.equips` usage, `FMT_DEF`; Produção's local `COMPS`/format copies; "Trazer configurações" gel parts in motor/portal (`trazer.Só no Gel · parâmetros do gel`, `· equipamentos`). If something else in the Gel genuinely needs `S.config.equips` for non-cadastro data (e.g. per-equipment operational state), report it rather than deleting blindly. `S.config.lineHeads`: decide from docs/CONFIGURACOES.md; if it's cadastro, read from the Administração; if it's operational, keep.
5. The contract test `testes/plataforma/contrato-cadastro.test.mjs` exactly as the brief says (pattern list `PROIBIDO_FORA_DA_ADM`), so future stages only add patterns.
6. This is a large task. Commit in logical steps (baseline; Gel switch; Produção switch; removals + contract), running the focused tests at each step, so progress is saved if interrupted. Write progress notes to the report file as you go.

Editing rules for Plataforma.html: read blocks with `node scripts/bloco.mjs <id>`; edit via a Python script in the scratchpad replacing exact strings, encoding `&`→`&amp;`, `</textarea`→`&lt;/textarea` (no other `&lt;`), asserting counts; then `npm run -s atualizar:metadados`. Regenerate the demo scenario only if the code change requires (`node scripts/cenario-demo.cjs --gravar`); if you remove old copies from the scenario generator, do it after the numbers comparison passes. Register new .cjs tests in scripts/testar-plataforma.mjs (line-13 list). TDD: RED first. Delete debug files before committing.

## You Do Not Dispatch Subagents.

## Finish
Run: gel-numeros (equal), gel-fonte-unica, contrato-cadastro test, scrap-lado, gel-producao, gel-relatorio, adm-gel, adm-importar, equip-ordem, `npm run test:unit`, `NODE_OPTIONS="--require $PWD/testes/http-local.cjs" node testes/tudo.js tgel`, then `npm run test:plataforma` and `npm test` once at the end. Commit on claude/determined-brown-f1jh2g (do not push), Portuguese messages, with the session trailers. Full report (baseline numbers chosen, what was removed where, anything kept and why, TDD RED/GREEN, files, self-review, concerns) to `<workspace>/task-8-report.md`. Reply ONLY (under 15 lines): Status, commits, one-line test summary, concerns, report path.
