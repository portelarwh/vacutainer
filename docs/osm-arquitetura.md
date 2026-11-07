# Iniciativas › OSM · Observações de Segurança · arquitetura (proposta)

> **Atualizado em 06/11/2026 (divisão do Portal 1.7):** a OSM **não é uma página própria**. É a aba **OSM** da página **Iniciativas** (`Iniciativas.html`, `iniciativas-base.json`, id `inic`, backups em `00. Backups/Iniciativas`), ao lado das abas **5S** e **KAS**. Tudo abaixo continua valendo, lido assim: "página" = aba OSM; as abas descritas no § 5 são **subabas** da OSM; a base é o bloco `osm` de `iniciativas-base.json`; os links ganham o prefixo da aba (`Iniciativas.html#osm/…`). A página em construção está especificada em `paginas-construcao.md`.

05/11/2026 · **proposta para aprovação, nada implementado.** Prioridade atual da plataforma (ver `claude/plano-evolucao-plataforma.md`, D1/D2). Segue o padrão das páginas novas (`claude/paginas-novas.md`), o kit do cabeçalho (`claude/kit-cabecalho-e-backups.md`), o padrão comum e o contrato do cadastro.

## 1. O que é

OSM = **Observação de Segurança**. Os operadores abrem observações sobre vários temas (não só máquinas), com uma **meta por operador por mês** (ex.: 4). Cada observação pode gerar **ações**, tratadas no estilo de um planner: responsável, prazo, quadro por status, comentários e cobrança.

A página responde a três perguntas:
1. **Participação**: cada operador está cumprindo a meta do mês? E cada turno?
2. **Riscos**: sobre o que estamos observando (temas, locais, tipos) e o que se repete?
3. **Tratamento**: as ações estão andando? O que está vencido, parado ou sem dono?

## 2. Identidade

| Página | Arquivo | Base | `PAGE.id` | `backupDir` | Título / subtítulo |
|---|---|---|---|---|---|
| Iniciativas › OSM | `Iniciativas.html` (aba OSM) | `iniciativas-base.json › osm` | `inic` | `00. Backups/Iniciativas` | INICIATIVAS · 5S · OSM · KAS (aba OSM · Observações de segurança) |

Núcleo comum (pasta da rede, cópia no navegador, fila de operações reaplicada sobre a versão nova, `rev`/`revId`, backup diário e por botão, restaurar), cabeçalho `vac-cabecalho v1`, Ctrl K, TV, relatórios, tema e usuário comuns (`vac.theme`, `vac.user`). Nome do arquivo sem acento.

**Portal**: já tem a entrada `{id:'inic', nome:'Iniciativas', html:'Iniciativas.html', base:'iniciativas-base.json', futuro:true, sub:'5S · OSM · KAS'}` (Portal 1.7). Não criar `osm` separado.

## 3. Entidades

### 3.1 Observação (OSM)

| Campo | Exemplo | Obrigatório | Observação |
|---|---|---|---|
| `id` / número | `OSM-2026-0142` | auto | sequencial por ano; colisão entre dois PCs resolvida na gravação |
| `data`, `hora` | 2026-11-05 · 09:40 | data sim | |
| `turno` | T1 | sim | do cadastro de turnos |
| `observador` | matrícula / nome | sim | quem abriu; é quem conta na meta |
| `tema` | EPI, Ergonomia, Trânsito interno… | sim | lista configurável (§ 3.4) |
| `tipo` | Ato inseguro · Condição insegura · Comportamento seguro · Quase acidente | sim | **a confirmar** (§ 9) |
| `local` | área / posto / equipamento | sim | área livre ou `EQnn` do cadastro quando for numa máquina |
| `descricao` | o que foi observado | sim | |
| `acaoImediata` | o que foi feito na hora | não | |
| `risco` | Baixo · Médio · Alto | sim | define prazo sugerido da ação |
| `precisaAcao` | sim/não | sim | "não" = OSM encerrada no registro |
| `fotos` | `OSM/<número>/foto1.jpg` | não | arquivo na pasta, só o caminho na base (mesma regra das fotos de equipamento) |
| `situacao` | Registrada · Em análise · Com ações · Concluída · Inválida | auto | ver § 4 |
| `valida` | sim/não + motivo | auto/liderança | só as válidas contam na meta (**critério a confirmar**) |
| `registradoPor`, `registradoEm`, `origem` | | auto | origem: página · importação (planilha/Forms) |

### 3.2 Ação (cartão do planner)

| Campo | Observação |
|---|---|
| `id` | `OSM-2026-0142-A1` (uma OSM pode ter várias ações) |
| `osm` | número da OSM de origem |
| `titulo`, `descricao` | |
| `responsavel`, `apoio[]` | pessoas da lista de participantes ou nome livre |
| `prazo` | sugerido pelo risco (ex.: Alto 7 d · Médio 30 d · Baixo 60 d, configurável) |
| `prioridade` | Urgente · Alta · Média · Baixa |
| `status` | A fazer · Em andamento · Aguardando · Concluída · Cancelada (colunas do quadro) |
| `aguardando` | quando o status é Aguardando: material, compra, outra área, manutenção, decisão (texto livre opcional) |
| `checklist[]` | itens com feito/não feito (progresso no cartão) |
| `comentarios[]` | linha do tempo: autor, data/hora, texto, status no momento; nunca sobrescreve |
| `historico[]` | campo, antes, depois, quem, quando (gerado automaticamente) |
| `concluidaEm`, `concluidaPor`, `evidencia` | evidência = texto ou foto |
| `verificacao` | opcional: liderança confirma que resolveu (vira "Concluída · verificada") |

### 3.3 Participantes e meta

- `participantes[]`: `{ codigo (matrícula), nome, turno, funcao, ativo, ausencias[{de, ate, motivo}] }`. Enquanto o cadastro base não tiver `usuarios` (plano § 5.4), a lista fica na base da OSM; depois passa a vir do cadastro, preso ao código.
- `metas[]` com vigência (mesma regra do plano § 5.3): `{ de, osmPorOperadorMes: 4, proporcionalAusencia: true|false }`.
- Meta do operador no mês = meta × (dias do mês sem ausência ÷ dias do mês), arredondada para cima, **se** a regra proporcional estiver ligada (**a confirmar**).

### 3.4 Listas configuráveis (Configuração da página)

Temas, tipos, locais/áreas, níveis de risco com prazo sugerido, motivos de invalidação, motivos de "aguardando". Ficam na base da OSM; quando a Administração central existir, migram para o cadastro (mesmo código).

## 4. Fluxo

```
Registrar OSM ──► Registrada ──(liderança/SESMT olha)──► Em análise
                       │                                     │
                 precisaAcao = não                    cria 1+ ações
                       ▼                                     ▼
                  Concluída ◄──── todas as ações concluídas ── Com ações
                       ▲
          Inválida (motivo) ── não conta na meta, fica no histórico
```

- A situação da OSM é **calculada** a partir das ações (não se edita à mão), exceto Inválida.
- Excluir não existe: cancelar/invalidar com motivo (auditado).

## 5. Abas

**OPERAÇÃO**
- **Nova OSM**: formulário curto e grande (bom em tablet/celular na linha): observador, turno e data já preenchidos pelo usuário do navegador; tema e tipo em botões; descrição; risco; "precisa de ação?". Depois de salvar: "Registrar outra" ou "Criar ação agora".
- **Observações**: lista com busca livre (número, observador, tema, local, texto) e filtros (mês, turno, tema, tipo, risco, situação); clique abre a ficha da OSM (painel lateral) com dados, fotos, ações e histórico.
- **Ações · Planner**: quatro visões da mesma lista:
  - **Quadro** (Kanban): colunas A fazer · Em andamento · Aguardando · Concluída; arrastar o cartão muda o status (registrado no histórico). Cartão: título, OSM, responsável (iniciais), prazo colorido (verde no prazo · amarelo vence em ≤ 3 dias · vermelho vencida), progresso do checklist, nº de comentários.
  - **Lista**: tabela ordenável, com edição rápida de responsável/prazo/status.
  - **Calendário**: ações por prazo no mês.
  - **Por responsável**: uma raia por pessoa (o que está com cada um).
  - Filtro **"Minhas ações"** (pelo usuário do navegador) e link direto `Iniciativas.html#minhas`.

**ANÁLISE**
- **Painel**: Ação prioritária + Próximas decisões; KPIs do mês (OSM registradas × meta da equipe, % de operadores na meta, ações abertas, ações vencidas, tempo médio para concluir); tendência 13 meses; Pareto de temas e de locais; tipo × risco.
- **Meta por operador**: matriz operador × mês (últimos 12) com a contagem e o semáforo (verde ≥ meta · amarelo ≥ 90 % · vermelho abaixo · cinza ausente/sem meta); visão do mês corrente com "quanto falta" e dias restantes; total por turno.
- **Temas e recorrência**: mesmo tema + local 3 vezes ou mais em 30 dias = recorrente.

**GESTÃO**
- **Cobrança**: pendências de atualização: ação vencida · sem responsável · sem atualização há X dias · "Aguardando" há mais de Y dias · concluída sem verificação · OSM de risco Alto sem ação · operadores abaixo da meta faltando N dias para fechar o mês. Cada item com "Copiar cobrança" (texto pronto para Teams/WhatsApp).
- **Relatórios**: Mensal (para a diretoria: OSM válidas, % na meta, temas, ações), Por pessoa (ações abertas, atrasadas, sem atualização, concluídas no período, comentários recentes), Por turno. Saídas do padrão comum: PDF, Excel, copiar texto, copiar para Outlook, imprimir.
- **Importar**: planilha atual de OSM (histórico) e, se for usado, Excel de respostas do Microsoft Forms (o ID evita duplicar, como no Paradas).
- **Configuração**: participantes, metas, listas (§ 3.4), prazos por risco, dias da cobrança, backups, modo de teste (com botão de saída).

## 6. Base: bloco `osm` de `iniciativas-base.json`

Fica dentro de `iniciativas-base.json` (`{ schema:'vac-iniciativas', schemaVersion:1, rev, revBy, revAt, revId, appVersion, osm:{…abaixo…}, s5:{…}, kas:{…}, auditoria:[…], exports:{…} }`); rev, backup e auditoria são da página inteira.

```
osm: { osms:[ … § 3.1 … ], acoes:[ … § 3.2 … ],
  participantes:[ … ], metas:[ … ],
  config:{ temas[], tipos[], locais[], riscos[{codigo, nome, prazoDias}], motivosInvalida[], motivosAguardando[],
           cobranca:{ semAtualizacaoDias:7, aguardandoDias:15, avisoFimMesDias:7 } },
  importacoes:[ … ], auditoria:[ … ], exports:{ … § 7 … } }
```

Volume esperado: ~4 × nº de operadores por mês (ex.: 40 operadores → ~160 OSM/mês, ~2.000/ano): cabe com folga num JSON; fotos ficam fora.

## 7. `exports` (exportsVersion 1)

- `kpis` (Portal): OSM do mês × meta · % de operadores na meta · ações vencidas · pendências.
- `pendencias`: ações vencidas, Alto sem ação, sem responsável.
- `serie`: OSM válidas por mês (13 meses).
- `porMes [{ mes, registradas, validas, meta, operadoresNaMeta, operadores, acoesAbertas, acoesVencidas }]` — fonte do indicador "OSM válidos" da diretoria no OEE (que hoje está "em construção" e com o texto errado "ordens de serviço de melhoria").
- `porOperadorMes [{ mes, operador, turno, validas, meta }]`.

Links pelo endereço (em `Iniciativas.html`): `#osm` (abre a aba), `#osm=OSM-2026-0142`, `#acao=…`, `#minhas`, `#osm/planner|meta|cobranca`, `#operador=<matrícula>`, `#tv`, `#teste`. O `exports` de Iniciativas publica os blocos da OSM dentro de `exports.osm` e os `kpis`/`pendencias` das 3 abas juntos.

## 8. Entrega proposta

1. **v1.0**: Nova OSM, Observações, Planner (Quadro + Lista + Por responsável), Meta por operador, Painel, Configuração, base e backups, exports, importação da planilha atual.
2. **v1.1**: Cobrança, Relatórios, Calendário, fotos, Forms.
3. Portal: a entrada `inic` já existe; o cartão de Iniciativas na Visão geral vem pelo `exports` (sem código novo no Portal).
4. Pedido ao OEE: indicador "OSM válidos" lendo `exports.osm.porMes` de `iniciativas-base.json` e correção do texto.

## 9. Perguntas para fechar antes de construir

1. **Como as OSM são registradas hoje?** (planilha, Forms, papel, sistema da BD/EHS). Se houver planilha, anexar: ela define os campos reais e a importação do histórico.
2. **Tipos**: ato inseguro / condição insegura / comportamento seguro / quase acidente — são esses?
3. **Temas**: qual a lista usada hoje?
4. **O que torna uma OSM válida** para a meta (quem valida: liderança, SESMT)? OSM repetida ou sem descrição conta?
5. **Quem abre**: só operadores contam na meta? Líderes e técnicos também abrem (e têm meta)?
6. **Quem trata as ações**: liderança, SESMT, manutenção, o próprio observador?
7. **Meta proporcional** em férias/afastamento?
8. **Quem registra no sistema**: o próprio operador num PC/tablet da linha, ou a liderança digita a partir do papel/Forms?
9. Precisa guardar um **número externo** (sistema corporativo de segurança)?
