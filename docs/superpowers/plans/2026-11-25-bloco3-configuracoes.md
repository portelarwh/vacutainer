# Bloco 3 · Task 7 — Levantamento das configurações que ainda vivem na Produção

Data: 25/11/2026. **Só levantamento.** Nada é implementado nesta rodada; a execução vira plano próprio, depois da aprovação.

Referências: [CONFIGURACOES](../../CONFIGURACOES.md) (decisões 1–14, aceitas em 23/11/2026), spec do bloco 3, `DEFAULT_SETTINGS` e `Cfg.parametros` (motor/oee), `ProdCad.montar` (motor/oee) e as chaves `parametros.*` de motor/portal.

Regra de partida (CONFIGURACOES): a Administração guarda o que define **como a linha funciona**; a página guarda o que é **lançado ou planejado**; preferência de tela não é cadastro. Fórmulas e cálculos não mudam: só a origem do valor.

Legenda de destino: **ADM** = vai para a Administração · **PREF** = fica na página como preferência · **INFRA** = infraestrutura (base, pasta, backup, importação) · **PAGINA** = fica na página (lançado/planejado ou regra específica) · **AUT** = exige autorização explícita (contrato 7).
Legenda de tela: **existe** = a Administração já tem o campo · **parcial** · **falta** = precisa ser construída.

## 1. Já derivados do cadastro (nada a fazer na Produção além de tirar o campo local)

O `ProdCad.montar` já entrega estes valores quando o cadastro os tem. A Administração tem a tela; o campo local da Produção só serve de reserva e sai na migração.

| Chave na Produção | Chave na Administração | Tela ADM | Destino | Observação |
|---|---|---|---|---|
| `longStopMin` | `paradaLongaMin` | existe | ADM | 5 usos |
| `semaphore.green/yellow` | `semaforoVerdePct/AmareloPct` | existe | ADM | 20 usos; cor continua relativa à meta |
| `abMotivos` | `motivosAbono` | existe | ADM | lista |
| `offMotivosProg` / `offMotivosNP` | `motivosSemProducaoProg/NP` | existe | ADM | decisão 8 (vocabulário fixo na origem) |
| `entryUnit` | `parametros.producao.unidadeLancamento` | existe | ADM | |
| `unitLabel` | `parametros.producao.rotuloUnidade` | existe | ADM | |
| `roundingUnit` / `roundingVig` | `parametros.producao.arredondamentoMeta` | existe | ADM | vigência já tratada |
| `continuityMin` | `parametros.producao.continuidadeMin` | existe | ADM | |
| `foraTurnoDesde` | `parametros.producao.foraTurnoDesde` | existe | ADM | |
| `tailMergeMax` | versão do turno (cadastro) | existe | ADM | por vigência de turno |
| `coverageMin` | `coberturaMin` (via metas) | existe | ADM | 16 usos; confirmar que a Produção lê só o cadastro |
| `divergenceMax` | `divergenciaMax` (via metas) | existe | ADM | confirmar leitura única |

Ação futura: remover o campo da tela `Cfg.parametros` e o valor de `DEFAULT_SETTINGS`; ausência no cadastro → mensagem de cadastro incompleto (contrato 1: ausência nunca vira zero).

## 2. Ainda locais na Produção — a mover para a Administração

| Chave | Padrão em código | Usos | Destino | Tela ADM | Decisão / nota |
|---|---|---|---|---|---|
| `unitName` | `'BD Curitiba'` | 1–2 | ADM (Planta e linha) | parcial (`unidade`) | dado de local em código; sem cadastro → vazio, nunca o texto fixo |
| `sector` | `'Vacutainer'` | 1–2 | ADM (Planta e linha) | parcial (`setor`) | idem |
| `timezone` | `'America/Sao_Paulo'` | 1–2 | ADM (Planta e linha) | parcial (`fuso`) | afeta madrugada/turno → **AUT** para trocar a fonte (contrato 7); valor igual, só origem |
| `calendar` | `'Segunda a sábado'` | 1 | ADM (Planta e linha) | falta | texto descritivo; o cálculo usa `planWorkdays`/marcas |
| `planWorkdays` | `[1..6]` | 1–2 | ADM (Planta e linha, dias de trabalho do plano) | falta | decisão 11: Plano do mês só lê calendário |
| `perfMode` | `2` | 1–2 | ADM (Parâmetros de cálculo) | falta | **AUT**: muda o modo da cascata de Performance (fórmula); mover só a origem, com o mesmo valor |
| `speedLossPremise` | `0.05` | 1–2 | ADM (Parâmetros de cálculo) | falta | **AUT**, idem |
| `pendDaysBack` | `14` | 1–2 | ADM (Parâmetros de cálculo) | falta | regra de pendência, não preferência |
| `openHoursAlert` | `24` | 3 | ADM (Parâmetros de cálculo) | falta | idem |
| `serverBoxQty` | `1000` | 8 | ADM (Parâmetros de cálculo › Servidor) | falta | conversão caixa→peças; muda número exibido se errado |
| `serverGapMin` | `10` | 6 | ADM (Parâmetros de cálculo › Servidor) | falta | |
| `serverHourTol` | `2` | 1–2 | ADM (Parâmetros de cálculo › Servidor) | falta | |
| `serverSetupMax` | `240` | 6 | ADM (Parâmetros de cálculo › Servidor) | falta | |
| `abDefault` | `{}` | 3 | ADM (Parâmetros de cálculo › Abono) | falta | padrão de abono por motivo |
| `horaExtraMax` | — | 1 | ADM (Turnos e metas › Hora extra) | falta | |
| `qnProblemas` | lista | 3 | ADM (Paradas e perdas › Listas) | falta | lista de Problemas de QN |
| `tagMap` (`db.timeline`, `Cfg.tags`) | `TAGS_PADRAO` | — | ADM (Equipamentos › Tags) | falta | decisão 5: unificar tags — **AUT** (contrato 7: Timeline) |
| `calIgnorados` / marcas locais de calendário | — | 3 | ADM (calendário) | existe (marcas do Portal) | decisão 11; hoje persiste só quando há dias ignorados |
| `settings.users` | `[]` | 5 | ADM (Pessoas e acesso) | existe (`usuarios[]`) | contrato 8: pessoa = ID do cadastro; lista local sai |
| `settings.logo` | — | 1 | ADM (Sistema › Marca) | parcial | decisão 14: um só lugar para o logo |

## 3. Ficam na página (preferência ou infraestrutura)

| Chave | Destino | Motivo |
|---|---|---|
| `tabState` | PREF | abas abertas |
| `tvRotateSec` | PREF | rotação da TV |
| `autoReloadSec` | PREF | recarga automática da tela |
| `demo` | INFRA | modo demonstração |
| base, pasta, backup, importação (`Cfg.base`, `Cfg.importacao`, `Cfg.exportacao`, `Cfg.demo`, `Cfg.auditoria`) | INFRA | contratos 3 e 9 |
| AM/TPM padrão | PAGINA | decisão 6 |

## 4. Defaults embutidos em código (decisão 9)

| Constante | Destino |
|---|---|
| `GEL_FMT_DEF` | sai ou vira sugestão na Administração (Gel) |
| `DEFAULT_PERFIS` | sai ou vira sugestão (Pessoas e acesso) |
| `TAGS_PADRAO` | sai ou vira sugestão (Equipamentos › Tags); ligado à decisão 5 |
| `DEFAULT_CAUSAS` | sai ou vira sugestão (Paradas e perdas) |
| `DEFAULT_TIPOS` | sai ou vira sugestão (Paradas e perdas) |
| `ORD_PLANTA = '4017'` (Ordens) | dado de local em código → Planta e linha na Administração |
| Gel Tubo 100 = 0,936 g desde 2025-10-01 (decisão 10) | cadastro de produto/Gel com vigência |

## 5. Pontos que exigem autorização antes de executar (contrato 7)

1. `timezone`, `perfMode`, `speedLossPremise`: só a **origem** muda, o valor e a fórmula ficam iguais. Pedir confirmação do responsável.
2. Unificação de tags (decisão 5) altera a Timeline Operacional.
3. Recuperar vigência/descrição das paradas (decisão 7) toca a classificação de paradas.

## 6. Riscos e conflitos

- **Dado de local em código** (`BD Curitiba`, `Vacutainer`, `Segunda a sábado`, planta `4017`): numa instalação limpa aparece texto que ninguém cadastrou. Sem cadastro deve vir vazio e com aviso.
- **Mudança de número exibido**: `serverBoxQty`, `coverageMin`, `divergenceMax` entram em contas. A prova `prod-numeros` deve passar igual antes e depois de cada migração.
- **Vigência**: parâmetro que muda no tempo precisa de vigência (contrato 2). Os campos novos (`perfMode`, `speedLossPremise`, `serverBoxQty`…) nascem com vigência ou ficam como valor único documentado.
- **Versão de base**: mover chave de `settings` para o cadastro muda o formato do cadastro/da base da Produção → subir `schemaVersion` e atualizar o bloqueio da base limpa (contrato 10).
- **Leitura dupla** durante a migração: nunca ler local e cadastro ao mesmo tempo; o cadastro vence, o local é removido no mesmo passo.

## 7. Telas da Administração a construir (resumo)

Planta e linha (calendário, dias de trabalho, descrição) · Parâmetros de cálculo (modo da Performance, premissa de perda, pendências, servidor, abono padrão) · Equipamentos › Tags · Paradas e perdas › Listas (Problemas de QN) · Turnos e metas › Hora extra · Sistema › Marca (logo único) · Gel (regras de estoque e ritmo, decisões 2 e 3) · Produto › Preços (decisões 4 e 12).

## 8. Ordem sugerida para a execução (plano próprio, a aprovar)

1. Construir as telas que faltam na Administração (sem mexer na Produção), com testes de gravação e vigência.
2. Estender `ProdCad.montar` para derivar as novas chaves; `prodcad-equivalencia` e `prod-numeros` iguais.
3. Remover os campos locais de `Cfg.parametros`, `DEFAULT_SETTINGS` e os defaults de local (um grupo por vez, com `prod-numeros` a cada grupo).
4. Subir `schemaVersion`, atualizar BASE-LIMPA, `PENDENCIAS` e Novidades.
5. Itens AUT só depois da autorização.

Fora do escopo desta rodada: implementação, carga por tabela, verificação em SMB/duas estações.
