# Bloco 3b · Execução: configurações da Produção passam a vir da Administração

Data: 25/11/2026. Base: [levantamento](2026-11-25-bloco3-configuracoes.md).

**Autorização do responsável (25/11/2026):** aprovado o levantamento. Fica autorizada a troca **só da origem** de `timezone`, `perfMode` e `speedLossPremise` (mesmo valor, mesma fórmula). Continuam **sem autorização**: unificar tags (decisão 5) e recuperar vigência/descrição das paradas (decisão 7); entram só quando o responsável pedir.

**Regras:** fórmulas e cálculos não mudam; `prod-numeros` e `prodcad-equivalencia` iguais a cada grupo; ausência de cadastro nunca vira zero nem texto fixo (contrato 1); parâmetro que varia no tempo tem vigência (contrato 2); testes em camadas (lint, unit, suítes da área, `prod-numeros`; regressão completa só no CI/ao fim). Edição de blocos por `node scripts/bloco.mjs`, depois `npm run -s atualizar:metadados`.

## Grupos (um commit por grupo, na ordem)

### G1 · Limpeza dos 12 já derivados
- Tirar de `Cfg.parametros` e de `DEFAULT_SETTINGS` os campos que o `ProdCad` já deriva (parada longa, semáforo, abono, sem produção, unidade/rótulo, arredondamento, continuidade, fora de turno, fim de turno).
- Cobertura e divergência: confirmar leitura única pelo cadastro; remover o local.
- Cadastro ausente → aviso "cadastro incompleto" no banner `[data-vac-cadastro]`.
- Prova: `prod-numeros`, `prodcad-equivalencia`, `prodcad-casos`.

### G2 · Planta e linha (ADM)
- Administração › Planta e linha: unidade, setor, fuso, calendário (texto), dias de trabalho do plano, descrição da linha, planta das Ordens (`ORD_PLANTA`).
- `ProdCad.montar` deriva `unitName`, `sector`, `timezone`, `calendar`, `planWorkdays`; Ordens lê a planta do cadastro.
- Remover `'BD Curitiba'`, `'Vacutainer'`, `'Segunda a sábado'`, `'4017'` do código; vazio com aviso quando não cadastrado.
- Teste novo: instalação limpa não mostra texto de local.

### G3 · Parâmetros de cálculo (ADM)
- Administração › Parâmetros de cálculo: modo da Performance, premissa de perda, pendências (dias, horas), Servidor (caixa, intervalo, tolerância, setup máx.), abono padrão.
- Valores iniciais do cadastro novo iguais aos padrões de hoje (2, 5 %, 14, 24, 1000, 10, 2, 240), para os números não mudarem.
- `ProdCad.montar` deriva; remover de `DEFAULT_SETTINGS` e de `Cfg.parametros`.
- Prova: `prod-numeros` (cenário traz esses valores no cadastro fictício).

### G4 · Listas e turnos (ADM)
- Paradas e perdas › Listas: Problemas de QN. Turnos e metas › Hora extra (máximo).
- Derivar no `ProdCad`; remover `settings.qnProblemas` e `settings.horaExtraMax`.

### G5 · Pessoas, marcas e logo
- `settings.users` sai; leitura por `usuarios[]` via `vacPessoa` (contrato 8).
- Marcas locais de calendário e `calIgnorados`: calendário do Portal é a fonte (decisão 11).
- Logo: um só lugar, Sistema › Marca (decisão 14).

### G6 · Defaults embutidos (decisão 9)
- `GEL_FMT_DEF`, `DEFAULT_PERFIS`, `DEFAULT_CAUSAS`, `DEFAULT_TIPOS`: sair do caminho normal ou virar botão "usar sugestão" na Administração. `TAGS_PADRAO` só junto da decisão 5 (fica fora até autorização).
- Gel Tubo 100 = 0,936 g desde 2025-10-01 (decisão 10) como cadastro com vigência.

### G7 · Fechamento
- `schemaVersion` do cadastro/base sobe; atualizar `docs/BASE-LIMPA.md`, `CONTRATO-MOTORES.md`, `PENDENCIAS.md`, `CLAUDE.md` (se contrato mudar), Novidades da plataforma e versões; `base-limpa.test.mjs` (`PROIBIDO`) cobre a volta dos padrões de local.
- `node scripts/cenario-demo.cjs --gravar` e regravar referências só se mudarem exports.
- Regressão completa (`npm test`, `test:plataforma`) e PR.

## Por grupo (checklist)
1. Teste que falha (tela da Administração grava e relê; `ProdCad` deriva; ausência mostra aviso).
2. Implementar; 3. `prod-numeros` igual; 4. lint + unit + suítes da área; 5. metadados; 6. commit e push.

## Riscos
- Mudar o formato do cadastro bloqueia base antiga (esperado, contrato 10); cenário demo precisa dos novos campos.
- Leitura dupla: cadastro vence, local removido no mesmo grupo.
- Itens ainda sem autorização ficam como estão e listados em `PENDENCIAS.md`.

Fora do escopo: carga por tabela, SMB/duas estações, tags e vigência de paradas.
