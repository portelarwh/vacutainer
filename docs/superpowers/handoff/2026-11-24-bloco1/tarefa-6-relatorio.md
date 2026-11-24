# Tarefa 6 · Administração › Gel

Commit 8406398 (claude/determined-brown-f1jh2g, sem push). Captura: /tmp/claude-0/-home-user-vacutainer/e3fcccba-7538-5b53-852d-5263fcf06f61/scratchpad/adm-gel.png

## Mudanças (motor/portal)
- Rota `#cadastros/gel` (assunto gel; `ADM_ASSUNTOS.gel.itens=['gel']`, `ADM_ROT.gel`, `CAD_SECS`, `viewCad`). `#cadastros/parametros/gel` redireciona para `gel`.
- `aplicarOp` aceita `tipo:'gel'` (aplicarMud sobre `D.gel`); `admAssuntosOp` mapeia para o assunto gel; `opTxt` e filtro da Auditoria conhecem 'gel'.
- `cadGel`: (1) Formato do tubo: Nova vigência (Vale a partir de, embalagem, folha da purga, sobra/barril, Componente × Tubo 100/75, Etiqueta "contada em unidades", motivo obrigatório) + tabela de vigências, Excluir só se `de` > hoje, sem Editar; data no passado, data repetida e valor inválido são recusados. (2) Composições (só leitura, `vacCad.gel.composicao`, vigência escolhida). (3) Locais de descarte: ⠿ (ponteiro) e ↑ ↓, Editar, "+ Local", Excluir = `ativo:false`. (4) Motivos e parâmetros do gel.
- Removidos: `parGelHtml`/`wireParGel` (`#parGel`, `#pgOk`), `gelEq()` e fmtBox, `GEL_FMT_DEF`, `AJUDA_CAMPO['gel.equip']`. Ficha do equipamento: só o link "Locais de descarte deste equipamento › Gel" (`data-irhash`).

## Campos que as telas removidas editavam e para onde foram
Parâmetros › Gestão de Gel (`parametros.gel`):
- `registroPelaProducaoDesde` (corte), `processo[]` (from, g, pT, pB, pP), `motivos[]` (id, name, comps, active): continuam em `parametros.gel`; editor movido para a 4ª parte (`#gelPar`, `#gpOk`), op `tipo:'parametros'` (assunto gel).
- `formatos[]` (from, tara, taraP, sobra, f.{100,75}.{tubo,gel,adit,tr}): vai para `gel.formatos` (embalagemG, folhaPurgaG, sobraBarrilKg, tubos.*.{tuboG,gelG,aditivoG,tampaRolhaG}). A cópia antiga em `parametros.gel.formatos` não é mais editada nem atualizada.
Ficha do equipamento (`equipamentos[].gel`):
- `tara` vira `embalagemG` de cada local; `descs[]` (id, local, comp, cat, mots) vira `gel.locais` (id, equipamento, local, comp, categoria, motivos, embalagemG, ordem, ativo). A cópia antiga `equipamentos[].gel.*` não é mais editada.
- `GEL_FMT_DEF`: único outro leitor era a tela de Parâmetros (removida); nenhum leitor restante no portal.

## TDD
RED: `adm-gel.cjs` falhou (sem `#gelFmt`). GREEN: todas as asserções (menu, 8,035/5,715/5,735 e 6,709/4,394/4,409, vigência 01/12 com 2 linhas e Excluir só na futura, arrastar 3º para 1º e reabrir, ↓, +Local/Editar/inativar, motivos, `#parGel` ausente, ficha sem tabela, perfil Gel=ver, auditoria com motivo, sem erro JS).
Testes ajustados ao que saiu: tgel.js, equip-ordem.cjs, parametros-semaforo.cjs, adm-assuntos.cjs (SECS + gel); `adm-gel` registrado em scripts/testar-plataforma.mjs.

## Resultados
Verdes: adm-gel, adm-assuntos, cad-consulta, linha-ficha, cfg-adm, gel-producao, scrap-lado, parametros-semaforo, novidades, `npm run test:unit` (67/0), tgel, tportal_vg, build.
equip-ordem.cjs: falha já existente antes da mudança (arrastar equipamentos, linha 41, confirmado com git stash); a parte do Gel desse teste (ajustada) não chegou a rodar.

## Preocupações
1. Gravações novas em `gel.formatos`/`gel.locais` não chegam às cópias antigas (`parametros.gel.formatos`, `equipamentos[].gel.descs`) que a Gestão de Gel e a Produção ainda leem; precisa da tarefa 7 (migrar leitores) ou de espelho.
2. `TrazCfg` (Trazer configurações do Gel) ainda grava as estruturas antigas; fora do escopo.
3. Regra escolhida: nova vigência só de hoje em diante.
4. Sem entrada em Novidades (sem mudança de versão), como nas tarefas 4 e 5.
