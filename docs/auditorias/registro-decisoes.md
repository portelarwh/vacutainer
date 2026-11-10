# Auditorias externas · registro de decisões

Este arquivo responde às auditorias externas da plataforma e registra, para cada apontamento, **o que foi feito, o que não foi feito e por quê**.

**Para quem for fazer a próxima análise:**
- Um item **recusado** aqui só volta com fato novo: código diferente, dado real ou decisão nova do responsável.
- Um item **corrigido** traz o teste que o reproduz. Se o teste passa, o problema não existe mais naquele ponto.
- Um item **adiado** tem o motivo e o gatilho que o traz de volta.

| Auditoria | Data | Commit analisado | Resposta |
|---|---|---|---|
| Auditoria de integração (A01–A10) | 05/11/2026 | anterior a `ca46d0c` | Portal 1.8.3 e 1.8.4 (PRs portelarwh/vacutainer#1 e #2) |
| Diagnóstico técnico (F01–F08, § 5) | 06/11/2026 | `9cc1dc4` | Portal 1.8.5, Produção 2.4.3, Waste 1.8.9, Gel 1.97, Paradas 1.0.7 (PR portelarwh/vacutainer#4) |
| Diagnóstico pós-merge (M01–M04, ressalvas) | 06/11/2026 | `c2ca6af` | Portal 1.8.6, Produção 2.4.4, Waste 1.8.10, Gel 1.98 (§ 0, PR portelarwh/vacutainer#5) |
| Revisão do PR #5 (base que some) | 06/11/2026 | `142b9c2` | Portal 1.8.7 (§ 0.1) |
| Auditoria visual (V01–V08) | 06/11/2026 | `142b9c2` (registrada em `ce1d971`) | Portal 1.8.8, Produção 2.4.5, Waste 1.8.11, Gel 1.99, Paradas 1.0.8 (§ L) |
| Revisão da migração, do layout e do guia (B01–B07 e visuais) | 06/11/2026 | `c341f8e` | Portal 1.8.10, Produção 2.4.7, Waste 1.8.13, Gel 2.01, Paradas 1.0.10 (§ R) |
| Relatórios, saídas e aba Painel | 07/11/2026 | `c341f8e` | Portal 1.8.11, Produção 2.4.8, Waste 1.8.14, Gel 2.02, Paradas 1.0.11 (§ P) |
| Achados do Codex (segurança, dados, TV, scripts, desempenho) com revisão independente | 07/11/2026 | `065fe6f` | Portal 1.8.13, Produção 2.4.10, Waste 1.8.16, Gel 2.04, Paradas 1.0.13, páginas em construção 0.1.1 (§ C) |
| Plano único (diagnósticos de 08/11 do Claude e do Codex), etapas E1 a E4 (Ordens e backups; versões, datas e metas; números; contratos por ordem) | 08/11/2026 | `e043513` / `9af2d3e` | Produção 2.4.12, Waste 1.8.18, Gel 2.06, Portal 1.8.15, Paradas 1.0.15 (§ U) |
| Plano único, blocos A e B (E5 ficha da ordem e Ctrl K; E6/E8 Iniciativas, Planner, KAS e ações de OEE; E10a/b Minha fila e Reunião diária; E10d relatório do Paradas; E11 Equipamentos) | 08/11/2026 | `8ecec91` | Portal 1.9.0, Produção 2.4.15, Waste 1.8.21, Gel 2.09, Paradas 1.0.19, Iniciativas 1.0.0, Equipamentos 1.0.0 (§ U) |

| Revisão do Codex sobre `8cad6a6` (AT-01–AT-12) com contra-análise; entrega C1 | 08/11/2026 | `8cad6a6` (revisão `64f9794`) | Portal 1.9.1, Produção 2.4.16, Waste 1.8.22, Gel 2.10, Paradas 1.0.21, Iniciativas 1.0.2, Equipamentos 1.0.2 (§ V) |
| Briefing de alterações (Fases 0, 1 e 2: respostas, POR-04, ARQ-09, Portal como fonte única ARQ-01..07, PRD-04, turnos TUR-01..04, POR-10) | 09–10/11/2026 | `1aca521` | Portal 1.9.5–1.9.10, Produção 2.4.21–2.4.25, Waste 1.8.26, Gel 2.14–2.15 ([briefing-2026-11-09-fase0-fase1.md](../briefing-2026-11-09-fase0-fase1.md)) |

Status usados: **corrigido** · **corrigido em parte** · **recusado** · **adiado** · **já existia**.

---

## NV. Estabilização após a varredura de 81ea71b (08/11/2026)

A solicitação de realizar as cinco correções foi atendida em branch separada da main. Não representa aprovação de merge ou homologação na pasta real.

| Achado | Tratamento implementado |
|---|---|
| NV-01 | Identidade local da pasta por handle/isSameEntry (OPFS por caminho verificável); operações e confirmadas vinculadas à origem; filas de outras origens preservadas; destino de legado pendente exige confirmação |
| NV-02 | Web Locks durante edição, conexão e sincronização do Portal/Waste; revalidação dentro da trava; snapshot com aba dona; retomada usa a cópia pendente mais recente |
| NV-03 | Cache da ficha com origem comprovada; nomes iguais não identificam uma pasta; cache legado não é atribuído a uma pasta conectada |
| NV-04 | Reserva local por operação; limpeza limitada à cópia aceita e à aba dona; reabertura e volta do IndexedDB preservam as alterações |
| NV-05 | Portal distingue cópia inteira pendente, fila, reserva e estado desconhecido; leitura dos estados locais não escreve nas bases alheias |

Versões: Portal 1.9.3; Produção 2.4.18; Waste 1.8.24; Gel 2.12; Paradas 1.0.23; Equipamentos/Iniciativas 1.0.4; Projetos 0.1.7. Testes e procedimento: [estabilizacao-nv-01-05.md](../estabilizacao-nv-01-05.md).

Limites preservados: retenção de confirmadas por 24 h/2.000 operações, dependência do navegador que fez a alteração, restauração de backup e etapa H. Confirmadas antigas sem origem comprovada não são reaplicadas automaticamente; podem ser baixadas na cópia de recuperação. Perfis não viraram autenticação; nenhuma API/servidor foi introduzida.

## V. Revisão do Codex sobre `8cad6a6` e contra-análise (08/11/2026)

**Documentos:**
- revisão do Codex: `docs/auditorias/revisao-main-8cad6a6/`;
- contra-análise e plano C1–C6: `docs/auditorias/c1-2026-11-08/01-CONTRA-ANALISE-8cad6a6.md`;
- relatório da C1: `00-RELATORIO-C1.md`, na mesma pasta.

**Contra-análise:** os 12 achados procedem. Reproduzi 10 de forma independente e confirmei 2 pelo código (AT-08, AT-09). Ela também amplia:
- AT-01 e AT-02 valem também para o Paradas;
- AT-11 vale também para o Equipamentos;
- a forma de guardar pendências do AT-01 também está no Portal, no Waste e no Gel.

**Decisão do responsável (08/11/2026):** C1 como recomendada; na 2ª aba do Portal e do Waste, **bloquear sem descartar**.

| ID | Situação |
|---|---|
| AT-01 duas abas perdiam alteração pendente | **corrigido** (C1): fila durável `vacFila` no kit (Iniciativas, Equipamentos, Paradas, fila do cadastro do Portal, Gel) e trava da 2ª aba (Portal, Waste) |
| AT-02 base que some era recriada vazia | **corrigido** (C1): pergunta ao conectar; base conhecida que some → zero gravações, "Recriar a base" com a cópia local ou "Escolher outra pasta" (Iniciativas, Equipamentos, Paradas) |
| AT-03 formato próprio desconhecido recebia gravação | **corrigido** (C1): `vacFormatoBase` (Iniciativas, Equipamentos, Paradas). Portal, Waste, Gel e Produção têm validação própria do conteúdo; o `schema` delas não foi tratado nesta entrega |
| AT-11 link de origem executava `javascript:` | **corrigido** (C1): `vacLinkSeguro` ao receber e ao mostrar (Iniciativas, Equipamentos) |
| R-01 regravação das confirmadas sobrescritas | **corrigido em parte** (C1): 24 h na fila durável, também no Paradas. Não 7 dias: depois de uma restauração de backup, as alterações deste computador fora do backup voltariam |
| AT-04 aba aberta na virada do dia | **corrigido** (C2): `vacAoVoltar` de Iniciativas e Equipamentos refaz o resumo de outro dia |
| AT-05 link da anomalia | **corrigido** (C2): código codificado no link; `#aba=equip&eq=` seleciona a máquina também ao abrir |
| AT-10 troca de usuário na Minha fila | **corrigido** (C2): Entrar/Sair e a troca em outra aba redesenham o Portal |
| AT-12 ordem com zeros no Planner | **corrigido** (C2): `#ordem=` filtra pelo vínculo de ordem, com a regra da ficha |
| AT-06 sem dado ≠ zero | **corrigido** (C3): Paradas publica `eventosCobertura`; fora dela o Portal mostra "—" e "sem dado de paradas" |
| AT-07 várias ordens no grupo | **corrigido** (C3): a ação do grupo é ligada a cada ordem distinta |
| AT-09 reconsulta com filtros | **corrigido** (C3: `#reuniao=dia\|turno`; C6: `#pareto=de\|ate\|eq\|turno\|cls\|grupo\|dim\|k`, com aviso quando o período saiu da base) |
| AT-08 cache da ficha por pasta | **corrigido** (C6): troca de pasta limpa a memória e o índice; a cópia do IndexedDB só vale para a pasta dela |
| Teste do Excel que sempre passava; `tvisual` com as páginas novas como em construção | **corrigido** (C4): Excel "NÃO VERIFICADO" sem a biblioteca; `tvisual` entra em Iniciativas e Equipamentos pelo `#teste`; `testes/tudo.js` roda a suíte inteira |

Teste novo: **`testes/tpendencias.js`**, com 37 falhas na `main` anterior e sem erros com a C1.

**C2–C6 (08/11/2026, aprovadas com "Siga com o restante"):** Portal 1.9.2, Produção 2.4.17, Waste 1.8.23, Gel 2.11, Paradas 1.0.22, Iniciativas 1.0.3, Equipamentos 1.0.3, Projetos 0.1.6.
- Teste novo **`testes/tcorrecoes.js`**: as 13 checagens das C2, C3, C5 e C6 falham na `main` `1c45308` e passam com a correção.
- Relatório: `docs/auditorias/c1-2026-11-08/03-RELATORIO-C2-C6.md`.
- **C5, saúde dos dados** (EV-01 e R-04 em parte): Portal › Versões mostra:
  - as alterações deste navegador que ainda não chegaram à pasta (`vacFila.contar`);
  - o resumo de outro dia;
  - a cobertura do Paradas e a lista cortada.

  O backup antigo já era avisado. A **última falha do backup** não é mostrada, porque as páginas não registram a falha na pasta: fica pendente, junto com a decisão do backup diário do Portal (§ C).
- **Fora desta entrega:**
  - **R-02**, identificador estável da pessoa: depende de decidir o que fazer com nomes digitados à mão;
  - **H**, homologação na pasta real.

**Revisão do Codex no PR #18 (commit `0b8eee9`)**, os três apontamentos procedem e foram corrigidos (Iniciativas, Equipamentos e Paradas):
- **P1, reserva ignorada quando o IndexedDB volta:** a reserva em `localStorage` só era lida quando a fila durável falhava; com o IndexedDB de volta, a próxima gravação da fila apagava a reserva. Agora a reserva entra na fila ativa (sem repetir, pela `qid`) e só sai depois que a fila durável aceitar tudo.
- **P2, fila antiga que não migrou:** se o IndexedDB falhava na importação, a fila antiga saía da fila ativa. Agora ela continua na memória e no `localStorage` até migrar.
- **P2, erro antigo pulava a pergunta de criar a base (Paradas):** `usar()` limpa o erro antes de ler a pasta nova.
- `tpendencias.js` ganhou 7 checagens; as 7 falham em `0b8eee9` e passam com a correção.


**Origem.**
- Análise do Claude em `c3ae4b0` (`docs/auditorias/diagnostico-2026-11-08/`).
- Revisão consolidada do Codex em `e3dc973`, branch `codex/revisao-consolidada-2026-11-08`.
- Parecer comparativo e plano em 15 etapas (E1–E15): `docs/auditorias/plano-unico-2026-11-08/plano-unico.md`. Esse arquivo tem o backlog rastreável aos IDs F/ARQ/IMP/RAS/PLA/OSM/KAS/OEE/TAG/MES/TPM/UX/REL/REF/FIL/REU do Codex e aos B/C do Claude.

**Aprovação.** O responsável aprovou a E1 em 08/11/2026, depois a E2 a E4. Na mesma data aprovou fazer em sequência os blocos A (fundação: E5 e o modelo único de ação) e B (telas: E6, E8, E10, E10d, E11), depois dos esboços em `docs/auditorias/plano-unico-2026-11-08/esbocos/`, aprovados como estão:
- ficha com os blocos numa ordem fixa (Produção, Paradas, Waste, Gel, SAP, Ações); "Detalhado" mostra as listas dentro da ficha;
- quadro do Planner com A fazer · Em andamento · Aguardando · Concluída (+ Cancelada, escondida); o Planner é a 1ª aba de Iniciativas;
- "Minha equipe" = pessoas da mesma área no cadastro do Portal;
- Reunião diária por dia e por turno;
- OS com aberta · programada · em execução · concluída · cancelada, e o número da nota/OS do SAP PM como campo opcional.

### E1 · Produção › Ordens: gravação e backups confiáveis · **corrigido** (Produção 2.4.11)

O teste novo **`testes/tordens.js`** simula a pasta no sistema de arquivos do navegador e injeta as falhas no próprio acesso ao arquivo. Rodado sobre `e043513`, ele reproduz a **perda real**: com a leitura falhando, a página gravou só a competência nova e apagou a que outra estação tinha gravado. Falha em 9 checagens e para na 10ª, por causa da competência apagada. Depois da correção, passa nas 15.

| ID | Problema | Correção |
|---|---|---|
| F01 (B1) | `readSibling` devolvia "vazio" para qualquer erro; `Ord.gravar` gravava por cima e `Ord.carregar` usava o cache sem avisar | Leitura estrita `readSiblingStrict`: só "não existe" é ausência. Erro de leitura: o `carregar` mostra a cópia deste navegador identificada ("Nada será gravado na pasta…") e o `gravar` não escreve. O `readSibling` antigo continua para o cadastro do Portal, onde "ausente" mantém a última cópia e é o comportamento seguro |
| F02 (B6) | Sem releitura depois de gravar | Relê e confere o `revId`. Se divergir ou a releitura falhar, a gravação não é dada como feita |
| — | Alteração perdida quando a gravação falhava (a tela mostrava a competência como salva) | **Pendência recuperável:** antes de gravar, a cópia e a lista de competências pendentes vão para o navegador (IDB `ordens.pend`). A tela mostra "Alteração pendente… Gravar de novo". Ao carregar de novo, a pendência é reaplicada sobre a versão da pasta. A auditoria não se repete no reenvio |
| F03 | Substituição de competência seguia sem backup; nomes podiam colidir no mesmo minuto | Backup obrigatório antes de substituir: se falhar, nada é gravado. Nome com segundos e um sufixo aleatório. O backup diário continua rotina e não bloqueia |
| F04 | `FolderBackend` tinha duas chaves `readBackup`; a segunda ignorava o local antigo `00. Backups/` | Fica uma só, a que trata o local antigo e o do módulo (regra `R` no `build.py`) |

**Limites:** a pasta é simulada no navegador. Duas estações reais na rede (HOM-01) continuam como homologação pendente. A releitura confere a gravação, mas não é uma transação: uma gravação de outra estação logo depois é tratada no próximo carregamento, com a mesclagem por competência.

### E2 · Versões, datas e metas · **corrigido** (Waste 1.8.17, Gel 2.05, Portal 1.8.14, Paradas 1.0.14 e kit)

**Decisão do responsável (08/11/2026):**
- o waste permitido já está na BOM;
- a meta da linha (WASTE-MES) é um valor só e segue a regra dos itens com vigência;
- duas vigências no mesmo mês → média ponderada.

O teste novo é o **`testes/tvigencias.js`**. Sobre `e043513`, ele falha nas versões do Waste e do Gel e para na função de data, que ainda não existia.

| ID | Problema | Correção |
|---|---|---|
| F05 (B2) | A meta WASTE-MES era lida pela data de hoje para qualquer mês | Função comum `vacMetaAreaMes(codigo, 'AAAA-MM')` no kit: vigência de cada dia do mês e média ponderada pelos dias cobertos. O Waste usa a meta de cada mês no painel (período = soma das metas dos meses), na tabela por mês, na tendência (um traço de meta por barra quando os meses têm metas diferentes; uma linha quando são iguais), na TV e no relatório mensal (com a nota "ponderada pelos dias: R$ a × d + R$ b × d"). Mês sem vigência no Portal: vale a meta local da página |
| F12 (B4) | `vacVig`/`vacCambio` sem data usavam o dia em UTC (às 22h de Brasília já era amanhã) | `vacHoje()` no kit, com o dia local. A data explícita continua valendo. Nenhum consumidor atual chamava sem data, então era um risco latente |
| F10 (B3) | Waste com três versões (título 1.8.13, tela/base/`exports` 1.8.15, código 1.8.16); Gel com o rótulo fixo em v2.01 e o código em 2.04 | Uma constante por página: `PAGE.versao = APP_VER` no Waste; no Gel o rótulo vem de `APP_VERSION`. Título sem número. O teste confere tela, código, constante, base e Portal › Versões nas 8 páginas |

### E3 · Números por contrato de campo · **corrigido** (Gel 2.06, Paradas 1.0.15 e kit)

Teste novo: **`testes/tnumeros.js`**.

| ID | Problema | Correção |
|---|---|---|
| F13 (B5) | Gel: o preço "12a" com cotação 5 gravava 12 e R$ 60/kg, sem aviso; outros campos digitados também aceitavam texto parcial. Paradas: "12a" e "15-" nos minutos do Forms viravam 12 e 15 | `vacNumero(texto, {ponto, sap})` no kit, estrito (vazio = null, inválido = NaN), com a regra de cada campo ou fonte: ponto sozinho = decimal no Gel e milhar (3 dígitos) no Paradas, como cada página já fazia; sinal no fim só com `sap:true`. **Gel:** campos numéricos digitados (lista dos lidos por `parseNum` e os com `inputmode`) ficam vermelhos, a prévia mostra "valor inválido" e os botões de ação do mesmo cartão ou janela não executam; Cancelar e Fechar continuam. O `parseNum` e o adaptador SAP não mudam, então os valores válidos gravam como antes. **Paradas:** linha do Forms com minutos ou vezes inválidos vai para os erros da importação, com o motivo |

### E4 · Contratos de integração por ordem · **corrigido** (Produção 2.4.12, Waste 1.8.18, Gel 2.06, Paradas 1.0.15 e kit)

Teste novo: **`testes/tcontratos.js`**. Tudo é aditivo na `exportsVersion` 1 (regra 6), e quem não conhece os campos novos os ignora.

| ID | Problema | Correção |
|---|---|---|
| RAS-02 (parte) | A Produção publicava só as ordens do mês atual e do anterior | `exports.porOrdem` com até 24 meses (mês, ordem, lote, catálogo, quantidades, início e fim previstos e reais, produzido, dias do lote e de retrabalho) e `porOrdemCobertura`. Com 720 ordens: 11 ms e 156 KB. O bloco `ordens` antigo continua igual. Sem OEE por ordem: falta a regra de atribuição |
| RAS-02 (parte) | O Paradas não resumia por ordem | `exports.porOrdem` (eventos, minutos, equipamentos, primeiro e último dia), sobre todos os eventos com ordem |
| RAS-03 (parte) | Cobertura das ordens do Gel implícita | `exports.ordensCobertura` (150 dias, fontes) |
| F06 | Leitores usavam o `exports` de outra página sem conferir a versão | `vacExportsOk(ex)` no kit. Waste (Produção, Ordens), Produção › Ordens (Waste) e Paradas (Produção) não usam versão desconhecida e avisam o motivo |
| F07 | No Waste, uma ordem em várias competências perdia informação (a última do arquivo apagava as outras, ex.: o tipo do COOIS) | Índice por ordem que junta as competências. O tipo vem da competência mais recente com COOIS; unidades e materiais, de todas |
| F08 | O Waste procurava o lote no valor de `dayLot`; o lote está na chave "dia\|lote" | Leitura pela chave (LX1 não pega LX10). A Produção também publica os dias do lote no `porOrdem` |

**Ficou para depois:** o Waste ainda cai na base da Produção (plano do mês, `lotClass`/`lotNotes`) para ordens fora da janela de 24 meses e para a classificação e observação dos lotes mais antigos que os 150 dias do `exports.lotes` (B7). Os eventos manuais com ID estável vão para a E12, junto da conciliação MES.

### E5 · Ficha da ordem, do lote e da LP; Ctrl K; links · **feito** (kit; Portal 1.8.16, Produção 2.4.13, Waste 1.8.19, Gel 2.07, Paradas 1.0.16, páginas em construção 0.1.2)

Teste novo: **`testes/tficha.js`** (pasta simulada com os `exports` das 5 páginas).

| ID | O que era | O que ficou |
|---|---|---|
| RAS-01 | Para ver uma ordem inteira era preciso abrir cada página | **Ficha comum** no kit (`vacFicha`), painel lateral igual nas 8 páginas: Produção, Paradas, Waste, Gel, SAP e Ações. Só mostra o `exports` de cada página (regra 1), com a fonte e a hora em cada bloco. Bloco sem dado fica cinza e diz por quê (fora da janela publicada não é zero; base ausente; versão desconhecida do `exports`, que não é usada). Resumo ou Detalhado (listas de eventos, competências, LPs e dias do lote). Ficha do **lote** (ordens do lote e dados do servidor) e da **LP** (ordens que baixaram o barril) |
| F09 / RAS-01 | Links de outra página caíam no topo | "Abrir em …" leva à página dona já filtrada (`#ordem=`, `#lote=`, `#lp=`). O Paradas ganhou a rota `#ordem=` (eventos filtrados pela ordem). O link da ficha é `<página>#ficha=ordem/<n>` (também `lote/` e `lp/`) e funciona em qualquer página |
| Ctrl K | A busca de cada página só via os próprios dados e adivinhava pelo número de dígitos | A busca comum ganhou um **índice** do que existe nos `exports` e no cadastro: ordem, lote, LP, catálogo e equipamento (com apelidos). "LX1" mostra o lote LX1 antes do LX10. A ordem do SAP com zeros à esquerda é a mesma ordem (comparação sem mudar o código guardado, regra 4) |
| Sem pasta | — | Cada base é lida só quando muda (data e tamanho). Sem pasta ou com erro de leitura, a ficha usa a última cópia lida neste computador (IndexedDB `vac-ficha`), com a data e o motivo |
| ← Voltar | — | A ficha entra no histórico: o voltar do navegador fecha a ficha e mantém a tela e os filtros |

Cada página só informa a pasta conectada (`vacPastaAtual()`) e põe o botão **Ficha** onde mostra uma ordem (Waste › ordem, Gel › ordem, Paradas › evento, Produção › Ordens SAP). A ficha não grava nada.

**Limites:** a Produção não publica OEE por ordem (falta a regra de atribuição); a lista de eventos do Paradas vai até 90 dias (os totais por ordem são de todo o histórico). O bloco "Ações ligadas" aparece quando a base de Iniciativas existir (E6).

### E6 e E8 · Iniciativas: Planner e KAS; ações de OEE a partir das outras páginas · **feito** (Iniciativas 1.0.0; Paradas 1.0.17, Produção 2.4.14, Portal 1.8.17, Waste 1.8.20, Gel 2.08, páginas em construção 0.1.3; kit)

Teste novo: **`testes/tplanner.js`**. Documentação: `docs/iniciativas-planner.md`.

| ID | O que ficou |
|---|---|
| PLA-01/02 | Iniciativas virou página de verdade (saiu do gerador). Base `iniciativas-base.json` em `00. Bases`: ação com dono, apoios, prioridade, prazo atual e **original**, origem, vínculos (ordem, lote, equipamento, código, evento), checklist, comentários e evidências (link). Visões Quadro (arrastar ou botão), Lista, Por responsável e Minhas |
| PLA-03/05 | Histórico de eventos (criação, situação, responsável, prazo com motivo, prioridade). Tempo por situação e por responsável calculado **por intervalo**, com a ação aberta, em dias corridos rotulados. Testado com transferência, espera e reabertura |
| PLA-06 | Gravação por operações (fila, releitura, reaplicação, `revId`), como o Paradas. Sem leitura não grava (alteração pendente com "Gravar de novo") |
| PLA-08 | As ações do Waste e do Paradas **não** foram migradas; continuam onde estão |
| OEE-01/02 | Botão "+ Ação no Planner" no Paradas (Pareto selecionado, recorrência, evento), na Produção › Paradas (eventos filtrados por um item do Pareto) e na ficha da ordem. Abre Iniciativas com a origem, a **fotografia** (período, minutos, ocorrências, hora) e o link de reconsulta. A página de origem não grava nada lá (regra 1). Antes de criar, Iniciativas mostra as ações abertas ligadas ao mesmo equipamento, código, ordem ou referência |
| KAS-01 | Aba KAS: problema, proposta, linha de base, meta, resultado, dono, área e situação. As ações do KAS entram no mesmo quadro, com origem KAS |
| — | Base nova na lista `VAC_BASES` do kit (`iniciativas-base.json` e, para a E11, `equipamentos-base.json`): sem isso a base ia para a raiz da pasta |

**Achado durante o teste:** duas estações gravando no mesmo instante. A segunda pode gravar por cima depois que a primeira já confirmou pela releitura: a releitura não é transação. Agora as operações confirmadas nos últimos 30 minutos ficam guardadas no navegador. Na leitura seguinte (gravação, volta para a página, F5), se o id delas não está na auditoria da base, elas voltam para a fila e são gravadas de novo. O teste reproduz o caso e confere que nada se perde.

**Fora desta etapa (decisões registradas):** SLA, dias úteis e regras de prioridade (PLA-04, PLA-07); eficácia da ação de OEE (OEE-04) e ganho validado do KAS (KAS-02), que pedem método; OSM (E7, falta a amostra) e 5S (E13).

### E10a e E10b · Portal: Minha fila e Reunião diária · **feito** (Portal 1.9.0)

Teste novo: **`testes/tfila.js`**.

| ID | O que ficou |
|---|---|
| FIL-01 | As pendências passam a levar `responsavel`, `apoios`, `prazo` e `id` quando a página publica (aditivo). Iniciativas e Equipamentos já publicam; as outras páginas, quando passarem a publicar |
| FIL-02 / RAS-05 | Aba **Minha fila**: ações abertas de Iniciativas e pendências de todas as páginas, em Atrasadas · Hoje e próximos 7 dias · Mais adiante · Sem prazo. Filtros **Minhas** (responsável ou apoio), **Minha equipe** (mesma área no cadastro: campo novo `usuarios.area`, com ⓘ) e **Sem responsável**. Só leitura: cada item abre na página dona. Contador de itens atrasados na aba |
| REU-01/02 | Aba **Reunião diária**, por **dia** ou **turno** (os turnos vêm do cadastro): OEE e produzido (dia ou turno), paradas (dia ou turno, com as maiores), Gel (agora), Waste (competência, com a meta do mês ponderada) e ações (hoje). Cada número leva o rótulo da granularidade. Pauta e decisões ficam no `portal-base.json` (`reunioes`, por dia e recorte), com quem e quando. "Fotografar números" guarda os números junto da pauta. "Encaminhar ao Planner" e "+ Ação" na maior parada abrem Iniciativas preenchida. Relatório pelo Report do Portal (PDF, Excel, texto, Outlook) |

**Limite:** o Paradas publica a lista de eventos dos últimos 90 dias; uma reunião sobre um dia mais antigo mostra o aviso no lugar dos números de parada.

### E10d · Relatório do Paradas · **feito** (Paradas 1.0.19)

Paradas ganhou o botão **Relatório**: o mesmo `Report` do Portal e do Waste (prévia, PDF em paisagem, Excel, texto, Outlook com o gráfico como imagem, impressão), com os filtros da tela. Tem indicadores, o gráfico e a tabela do Pareto por código, os equipamentos (MTBF, MTTR, disponibilidade) e a recorrência dos 30 dias. O código foi copiado com adaptadores mínimos; a unificação dos geradores no kit continua pendente (§ P). Teste: `trelatorios.js` › Paradas.

### E11 · Equipamentos 1.0 · **feito** (Equipamentos 1.0.0; Paradas 1.0.19; kit)

Teste novo: **`testes/tequip.js`**. Documentação: `docs/equipamentos-v1.md`.

| ID | O que ficou |
|---|---|
| — | Equipamentos virou página de verdade (saiu do gerador). Base `equipamentos-base.json` em `00. Bases`, com a mesma gravação de Iniciativas |
| Ficha | Cadastro do Portal (nome, apelidos, link para editar lá); falhas lidas do `exports` do Paradas e rotuladas como **histórico** (7/30/90 dias, MTBF/MTTR por mês, componentes); OS, TAGs, anomalias e padrões. Sem estado atual nem gargalo (sem MES) |
| OS | Situações aprovadas nos esboços; nota/OS do SAP PM opcional; apontamentos e histórico. A OS aberta de um evento do Paradas guarda só a referência (sem cópia). O Paradas mostra "OS-… aberta" no evento, lendo `exports.porEvento`, e tem "+ Abrir OS" |
| TAG-01/04 | TAG com propósito, nome no MES, tipo e unidade por vigência. Nova vigência não apaga a anterior; corrigir = desativar com motivo e criar outra (regra 3) |
| TPM-01/02/06 | Estrutura do ponto AM/TPM (tipo, ponto, periodicidade, faixa, habilitação, referência) **sem conteúdo inventado**; anomalia registrada vira OS ligada |
| Ctrl K | Equipamento na busca abre a ficha em Equipamentos (antes, o cadastro no Portal) |

### Revisão do Codex no PR #15 (08/11/2026) · **corrigido** (Iniciativas 1.0.1, Equipamentos 1.0.1, Paradas 1.0.20)

Os três apontamentos (P2) foram conferidos no código e reproduzidos por teste: cada checagem nova falha com as páginas do merge `ef7793f`.

| Apontamento | Correção |
|---|---|
| Exports com data velha: sem alteração na fila e com a mesma `appVersion`, a gravação pulava o `exports`. Uma OS que vencia sem nova edição não chegava à Minha fila, e uma vigência de TAG que começava não era publicada | O atalho "nada a gravar" só vale se o `exports` foi gerado **hoje** (dia local). Ao abrir a página com a pasta, um `exports` de outro dia é gerado de novo. Em Equipamentos, a OS programada já publica a pendência de atraso com `aPartirDe` = dia seguinte à data programada: ela aparece no Portal no dia certo, sem depender de nova gravação. Vale também para Iniciativas |
| Anomalia perdida: com "abrir OS em seguida" marcado, cancelar o formulário da OS descartava a anomalia | A anomalia é gravada primeiro (sem OS); a OS criada depois se liga a ela |
| Recorrência do relatório do Paradas fora do recorte: só filtrava pelo equipamento; turno, classe e data final eram ignorados | A entrada da recorrência usa o mesmo recorte (equipamento, turno, classe, até a data final), com o histórico anterior para os meses seguidos |

Testes: `tequip.js`, `tplanner.js` e `trelatorios.js` › Paradas.

### Não feito nesta rodada (aguarda decisão ou material)

| Etapa | O que falta |
|---|---|
| E10c · telas por perfil | lista de jornadas por perfil, validada com operador e liderança (§ 6 do plano). A aba inicial por perfil já existe (`vacAbaInicial`) |
| E3b · XLSX local | o arquivo SheetJS 0.20.3 da pasta da linha |
| E7 · OSM | amostra descaracterizada da planilha da plataforma |
| E9 · importação por pasta | decisão IMP-05 (estação coletora) |
| E12 · MES | amostras SQL, regras de impacto, ponto oficial de medição |
| E13 · AM/TPM e 5S | padrões técnicos da manutenção |
| E15 · Projetos | escopo |

---

## C. Achados do Codex sobre `065fe6f`, com revisão independente (07/11/2026)

O Codex analisou `065fe6f`. Antes de implementar, uma revisão independente conferiu cada achado no código, reproduziu os de comportamento e mediu os de escala. O responsável aprovou o diagnóstico e o plano.

O teste novo **`testes/tseguranca.js`** cobre todos os itens. Rodado sobre `065fe6f`, dá **24 falhas**; depois das correções, nenhuma.

| # | Achado | Status | O que foi feito |
|---|---|---|---|
| 1 | Waste: identificador importado executava código no clique | **corrigido** (Waste 1.8.16) | **Reproduzido:** componente `MAT');…` e ordem `OS'+(…)+'` executaram código em "Copiar link". **Causa:** `esc()` entre aspas simples dentro de `onclick` (o navegador desfaz o `&#39;` antes de rodar). **Correção:** `jsArg(v)=esc(JSON.stringify(…))` nos 21 pontos (12 com identificadores e 9 com ids internos). O dado continua como veio (regra 4). Um código com apóstrofo legítimo (`D'AGUA`) agora funciona; antes quebrava o botão. Só o Waste tinha o padrão |
| 2 | Portal: restaurava sem a cópia anterior | **corrigido** (Portal 1.8.13), **e no Gel** (2.04) | Se a cópia `_antes-restaurar_` falhar, a página avisa o motivo e só continua com "Restaurar mesmo assim?" (o padrão é não), como o Waste já fazia. O Gel por arquivo também ignorava a falha e nem confirmava antes de restaurar: agora confirma. O cadastro do Portal, o Paradas e a Produção já paravam na falha |
| 3 | CSV com fórmulas (Waste, Gel) | **corrigido**; vale nas três páginas que exportam CSV | Regra comum no kit, `vacCsvTexto`: texto que começa com `= + - @`, tabulação ou retorno ganha o prefixo `'`, mas número escrito como texto (`-1.234`, `-12,5`, `-3%`) e códigos (`0123`, `EQ01`) ficam iguais. A Produção (2.4.10), que já protegia, passou à mesma regra: antes ela também prefixava número escrito como texto que começa com `-`. O `.xlsx` do Waste já era seguro |
| 4 | Produção: gráficos paravam depois de sair da TV | **corrigido** (Produção 2.4.10) | **Reproduzido:** a dica sumia depois da TV. **Causa:** a TV limpava o registro de todos os gráficos (`Charts.reset`). **Correção:** `TV.close()` redesenha a tela, mantendo a rolagem (regra `R` no `build.py`). Testado na Visão geral e no Painel (TV pela visão) |
| 5 | Scripts deixavam páginas pela metade | **corrigido** | `aplicar_kit21.py` monta e confere tudo antes de gravar. `gerar_paginas.py` devolve as páginas se o kit falhar. Os 3 scripts gravam com `\n` (no Windows o padrão gravaria CRLF). Rodar de novo dá os mesmos arquivos, byte a byte |
| 6 | Waste: varreduras de comentários e ações por ordem | **adiado** | Medido: +~50 ms com 10 mil comentários; nos volumes reais o efeito é pequeno. **Gatilho:** Painel do Waste acima de 300 ms, ou mais de 2 mil comentários na base. A solução já está desenhada: índices por ordem montados uma vez por tela, mantendo a precedência do `causeOf` |
| 7 | Gel: varredura por dia no Painel | **corrigido** (Gel 2.04) | Índice das baixas por dia, válido só durante o `dbCtx`, que não altera movimentações; fora dele, tudo lê `S.events` como antes. Com 7.200 movimentações e 12 meses: 6 ms, contra 144 ms antes. Números e indicadores idênticos com e sem índice (período, comparação e todos os KPIs) |
| 8 | Complexidade concentrada | **adiado** (manutenção) | `computeDayRaw` (204 linhas), `CadSync.aplicar` (101), `openConfig` do Gel (236 linhas, 44 KB), `parseMetaFY27` (~114) e `cadValidarItem`. Não são defeitos, e não houve refatoração. O risco mais concreto é a leitura da Meta FY27 duplicada (Produção `parseMetaFY27` e Portal `mof*`). **Gatilho:** a próxima mudança numa dessas funções começa por um teste que fixe o comportamento atual |
| 9 | Waste: URLs de download sem revogação | **corrigido** (Waste 1.8.16) | `downloadJSON`, `exportCsv` e o download de backup usam o `downloadBlob`, que libera a URL. Paradas, Produção e Portal têm contagens parecidas e ficam para a próxima revisão dessas páginas |
| 10 | `toast` declarado duas vezes no modelo | **corrigido** (páginas em construção 0.1.1) | Linha duplicada (idêntica, sem efeito) tirada do modelo; páginas geradas de novo |

**Não corrigido de propósito:** o backup diário automático do Portal (`writeRemote`) continua ignorando a falha. Não é o mesmo defeito, e o tratamento (aviso no status) depende de decisão do responsável.

---

## P. Relatórios, saídas e aba Painel (auditoria de `c341f8e`, 07/11/2026)

**Limite:** o relatório `auditoria-relatorios-paineis-c341f8e.md` e o zip de evidências **não chegaram** nesta sessão. Os seis achados citados no pedido foram reproduzidos nos arquivos gerados, não só no código: PDF conferido com `pdfinfo`/`pdftotext`, impressão em mídia print A4, texto e HTML copiados. Antes de implementar, o diagnóstico e o plano foram entregues e aprovados pelo responsável.

**Decisões do responsável (07/11/2026):**
- Visão geral em 1º e Painel em 2º. Na Produção, os dois viram os primeiros grupos do menu. Portal e Paradas mantêm "Visão geral" em 1º, sem renomear. No Gel, o Painel passa a ser a 1ª aba na ordem padrão. O Waste já estava certo.
- A aba que abre é definida pelo **perfil** do usuário.
- O relatório montado do Gel ganha campo de comentário.
- A cópia para o Outlook do Portal e do Waste fica igual à da Produção, com os gráficos como imagem.

### Achados

| Item | Status | O que mudou · teste (`testes/trelatorios.js`) |
|---|---|---|
| Comentário cortado no PDF (Portal, Waste, Produção) | **corrigido** | O comentário e o bloco de texto continuam na página seguinte. Antes, um comentário de 70 linhas parava na linha 44 (Portal/Waste) ou 40 (Produção) |
| Gel: PDF montado com 40 linhas, sem aviso | **corrigido** | Todas as linhas (64 no teste), e o `pdfTable` quebra a página. O texto do bloco sem tabela também sai inteiro (antes, 180 caracteres) |
| Cores escuras nas exportações | **corrigido** | Portal e Waste: o gráfico do PDF usa sempre as cores do tema claro (imagem igual nos dois temas). Impressão: o kit põe o tema claro no `beforeprint` e devolve no `afterprint` (`vacTemaClaro`), nas cinco páginas. Gel: o vigia de tema não desfaz mais o tema claro do PDF |
| Paradas: impressão da análise vazia | **corrigido** | A regra do formulário só vale enquanto imprime formulários (classe `imprimindo-forms`, página nomeada em retrato). Ctrl+P no Pareto: 930 caracteres (antes 0) |
| Encaixe em retrato / orientação diferente do PDF | **corrigido** | A impressão do relatório (Portal, Waste, Produção) sai em A4 paisagem, como o PDF. A tabela larga quebra o texto nas células: 14 colunas cabem |
| Diferenças na cópia para o Outlook | **corrigido** | Portal e Waste copiam os gráficos como imagem, como a Produção, com a opção "gráficos como imagem no Outlook" (desmarcada, o lugar diz "gráfico no PDF"). O aviso informa o tamanho |
| Copiar texto cortava a tabela em 15 linhas sem aviso (Portal, Waste; Gel em 5) | **corrigido** | O corte continua, por ser resumo de WhatsApp, mas agora vem com "… e mais N linha(s): veja o PDF ou o Excel" |
| Impressão do relatório da Produção com cabeçalho e faixa de exemplo | **corrigido** | Só o relatório é impresso |
| Rótulo do cartão cortado no PDF ("ATENDIMENTO AO PLANO") | **corrigido** | O rótulo sai em até 2 linhas na Produção; rótulo e detalhe também no Portal e no Waste |
| Recortes sem aviso | **corrigido** | Waste: "20 maiores de N (todos no Excel)" no Pareto mensal. Gel: "Mostrando os 40 primeiros de N barris" no risco de vencimento |
| Aba Painel em 1º, Visão geral ao lado | **corrigido** (conforme a decisão) | Produção: grupos "Visão geral" e "Painel" no início do menu. Gel: `TABS` com Painel em 1º; quem já ordenou as abas mantém a sua ordem |
| Aba inicial por perfil | **novo** | O campo "Página inicial" de Perfis e Usuários no Portal passa a oferecer página e aba (ex.: "Produção › Painel"). Lista comum no kit (`VAC_INICIAL_ALVO` em `kit_bases.js`) |

**Ordem ao abrir uma página:**
1. link direto (`#aba=…`, `#dia=`, `#turno`, `#tv`…);
2. aba do perfil, só na 1ª abertura da página na sessão;
3. preferência da pessoa (última rota da Produção, página inicial do Gel);
4. padrão da página.

Sem perfil cadastrado, nada muda. O Gel continua abrindo na Operação, salvo se o perfil ou a pessoa escolherem outra aba.

### Limitações (não corrigidas, registradas)
- **Paradas sem relatório próprio:** não tem PDF, Excel nem cópia da análise; só Ctrl+P na aba. Entra se a liderança pedir.
- **Relatório do Waste por período:** usa o mês escolhido em Relatórios, não os filtros do Painel. É de propósito: o selo mostra os critérios.
- **Imagens no Outlook:** cada gráfico vira um PNG `data:` (cerca de 40 KB). O Outlook desktop aceita; o Outlook web e algumas políticas de e-mail removem as imagens. Validar com o Outlook da empresa (homologação). Desmarcar a opção deixa o aviso no lugar.
- **"Salvar como PDF" do navegador × PDF próprio:** nunca saem idênticos (margens e "Gráficos de fundo" são da janela de impressão). Agora têm a mesma orientação e o mesmo tema.
- **Três geradores de PDF** (`Report` do Portal/Waste, `rpPdf` da Produção, funções do Gel): unificar no kit fica para depois, se estas correções não bastarem.
- **Formulário de papel da LINHA no Paradas:** ocupa 2 páginas A4 com os dados de teste, igual em `c341f8e`. Não mudou com esta entrega.

---

## R. Revisão `c341f8e`: migração para 00. Bases, fechamento do layout e guia

**Limite desta resposta:** o relatório `revisao-vacutainer-c341f8e.md` e o zip de evidências **não chegaram** nesta sessão. Cada item foi reproduzido a partir da descrição recebida, com testes próprios. Todos os cenários novos **falham no código de `c341f8e` e passam agora**, menos o B06, que é um procedimento e passa nos dois.

### Prioridade 1 · migração segura (kit `vac-bases v2`, `fontes/kit/kit_bases.js`)
| Item | Decisão | O que mudou · teste |
|---|---|---|
| B01 Gravação recente na raiz apagada depois da cópia | **corrigido** | Antes de tirar a base da raiz, o código confere de novo se ela mudou desde a leitura; se mudou, não apaga nada. A base também não é mais apagada: é **movida** para `00. Backups/<módulo>`, então uma gravação de último instante fica guardada lá, e a página avisa. Teste: `tbases.js` › B01 |
| B02 Migração atrasada sobrescrevendo gravação confirmada no destino | **corrigido** | Trava entre computadores (arquivo `.<base>.migrando` em `00. Bases`, com prazo de 2 min; só é pega quando a base ainda está na raiz, então a conexão normal não grava nada nem espera) e nova conferência do destino antes de pôr a cópia no lugar. Se o destino já tiver base, não sobrescreve: decide pela data, e a raiz mais velha vai para o backup. Teste: `tbases.js` › B02 (dois momentos) e concorrência |
| B03 Conferência divergente apagando o arquivo de outra sessão | **corrigido** | Quando a conferência diverge, não apaga nada (nem destino nem raiz) e avisa o conflito. Teste: `tbases.js` › B03 |
| B04 Erro de leitura interpretado como ausência | **corrigido** | Só `NotFoundError`/`TypeMismatchError` contam como "não existe" (`vacNaoAchou`). Qualquer outro erro é "estado desconhecido", e nada é mudado. Valeu também para `vacRaiz` (não troca `00. Bases` pela raiz se a pasta der erro) e para a conexão de Portal, Waste, Gel e Produção, que não oferecem mais "Criar a base" quando a base existe mas não pode ser lida. Teste: `tbases.js` › B04 e "página: base ilegível" |
| B05 Cópia interrompida deixando arquivo vazio como base preferida | **corrigido** | A cópia vai para um arquivo temporário (`.<base>.copiando-<sessão>`), é conferida e só então entra no lugar. Na leitura, um arquivo vazio em `00. Bases` não é preferido. Temporários com mais de 10 min são limpos. Teste: `tbases.js` › B05 (interrupção e sobra vazia) |
| Procedimento "F5 depois da troca" / "nada se perde" | **corrigido** | Guia (itens 5, 6, 9 e 10) e `LEIA-ME.txt`: é **obrigatório** que nenhuma página esteja aberta em nenhum computador durante a troca e a primeira abertura. A primeira abertura é feita num único computador. Os dados de uma página antiga **não se juntam sozinhos**. O guia lista as condições de uma migração segura e como saber que ela terminou |

### Prioridade 2 · recuperação e compatibilidade
| Item | Decisão | O que mudou · teste |
|---|---|---|
| B07 Backup na retomada depois de interrupção | **corrigido** | Toda saída da raiz passa por `tirarDaRaiz`, que move a base para o backup, inclusive quando a cópia já estava em `00. Bases`. Teste: `tbases.js` › B07 |
| B06 Volta para a versão anterior depois da migração | **definido e validado** | **Reproduzido:** a Produção antiga (2.4.5, commit `38542d0`), ao reconectar, cria uma base nova vazia na raiz. **Procedimento** (guia, item 9): fechar tudo; mover os 7 `.json` de `00. Bases` para a raiz (sem substituir, guardando antes a que uma página antiga tenha criado); só então copiar os HTML antigos. Teste `tbases.js` › B06: com o procedimento, a Produção antiga abre a base real, e numa nova atualização a base volta para `00. Bases`. **Não automatizado de propósito:** um botão "devolver as bases" com páginas novas abertas causaria a mesma divisão de dados |
| Pasta original no IndexedDB, `vacRaiz` só no acesso | **mantido** | Sem mudança: as páginas continuam guardando a pasta do seletor |

### Prioridade 2 · fechamento do layout
| Item | Decisão | O que mudou · teste |
|---|---|---|
| Marca colorida da aba ativa (Portal, Waste, Gel, Paradas) | **corrigido** | O `kit_visual.css` zerava a borda de todas as abas, inclusive da ativa; a regra da aba ativa (`.on`/`aria-selected`) foi devolvida. Teste: `tvisual.js` mede a borda da aba ativa nas 5 páginas e nos 2 temas |
| Aba ativa à vista ao redimensionar o Gel | **corrigido** | O redimensionamento chama a mesma função que leva a aba ativa à área visível. Teste: troca de aba e redimensiona para 1024/768/390 px sem recarregar |
| Contraste dos contadores no submenu da Produção | **corrigido** | `.nmenu .cnt` passa a usar `--cnt-bg`/`--cnt-ink` (antes 2,19:1 no escuro). Teste: mede com o submenu aberto, nos 2 temas |
| Faixa de teste do Paradas | **corrigido** | Antes âmbar com texto preto (ficou pior com o `--warn` mais escuro da entrega anterior). Agora usa o roxo de exemplo, igual ao Portal e ao Waste, com o texto "Ambiente de teste · dados fictícios". Teste: contraste da faixa ≥ 4,5 (7,7 no claro, 8,1 no escuro) e entrada de fato no modo de teste (`modoTeste()`; antes o teste chamava uma função que não existe) |
| Unidade da escala mensal do Paradas | **corrigido** | A chamada real usava um formatador próprio (`h` acima de 6000, número puro abaixo); passou a usar `fmtMin`, com uma unidade para a escala inteira. O Pareto (`hbars`) tinha o mesmo problema (h e min misturados) e foi corrigido junto. Teste: cada gráfico de barras da Visão geral e do Pareto com uma unidade só |
| Preferências antigas de tema | **corrigido** | Seção `vac-prefs` do kit, que roda antes de qualquer página: converte `vac.theme`, `vac.user` etc. gravados com aspas (`"dark"`) para texto simples. Teste: as 5 páginas aplicam o tema com o valor antigo |
| Cabeçalhos em telas menores | **avaliado e corrigido em parte** | Status e ações continuam visíveis e dentro da tela nas 5 páginas, em 768 e 390 px. **Achado:** a regra comum que esconde o subtítulo (`.vpage .rule`) também escondia a pílula roxa de estado ("Modo de teste"), que usa a classe `rule`, no Portal e no Waste em telas pequenas; corrigido no kit. A altura da faixa (52 a 180 px) continua variando conforme a quantidade de status e ações de cada página; reduzir isso tiraria informação e fica para a validação com o uso (§ L) |

### Guia de instalação
- **Incorporado:** o guia e o gerador (`fontes/guia/`) estavam no branch, sem merge no `main` auditado. Entram neste PR.
- **Revisado contra as telas atuais:**
  - conexão de cada módulo, com um print novo da janela "Base encontrada" do Gel;
  - as perguntas de confirmação ("Criar a base nesta pasta?" = Cancelar);
  - a migração das 7 bases, com condições de segurança, critérios de "terminou" e as mensagens possíveis;
  - recuperação (volta de versão e duas cópias da base).

### Testes reforçados
- **`tbases.js` (36 checagens):**
  - B01 a B07 com falhas injetadas no meio da migração;
  - duas sessões migrando ao mesmo tempo e trava expirada;
  - conexão normal (nada na raiz): sem trava, sem espera e sem aviso falso de "aguardando";
  - base ilegível na conexão;
  - volta de versão com a Produção antiga real;
  - conferência do conteúdo final e dos backups.
- **`tvisual.js` (170 checagens):**
  - entrada real no modo de teste do Paradas, sem `try/catch` que esconda falha;
  - telas do exemplo preenchidas (indicadores e gráficos);
  - marca da aba ativa e troca de aba;
  - redimensionamento sem recarregar;
  - contraste com o submenu da Produção e o menu Mais do Gel abertos;
  - unidade única por gráfico do Paradas;
  - faixa de teste;
  - tema antigo com aspas;
  - status e ações do cabeçalho em telas menores.
- **Na versão auditada**, o novo `tvisual.js` acusa 18 falhas e o novo `tbases.js`, 12.

**Limites:**
- Os cenários de pasta usam o sistema de arquivos do navegador (OPFS), com falhas e concorrência simuladas. Não substituem duas estações reais na pasta da rede.
- O `move()` de arquivos foi validado no OPFS. Na pasta da rede, se o navegador não oferecer `move()`, o código grava o backup e confere a raiz antes de apagar. Nesse caminho alternativo ainda existe uma janela de milissegundos entre a conferência e a remoção.

---

## L. Resposta à auditoria visual (`docs/auditorias/layout-2026-11-06/`)

### Parecer
A auditoria foi conferida contra o código atual, que inclui as entregas posteriores ao `142b9c2` (PRs #5 e #6). Nenhuma delas tinha mexido em layout, então **todos os achados ainda valiam**. O novo `testes/tvisual.js` reproduziu os números da auditoria: Gel com 8 px de margem e deslocado 30 px, Paradas 20 px à esquerda, abas do Gel com 84 px em 1024 px e 169 px em 390 px, e contadores com 2,19:1 e 2,89:1. São 48 checagens que falhavam antes e 112 que passam agora.

**Divergências encontradas:**
- **V08 era mais amplo.** O Paradas também lia `vac.user` e `vac.logo` com `JSON.parse`. Por isso não reconhecia o usuário nem a logo gravados pelo Portal, e o nome que gravava aparecia com aspas nas outras páginas. Corrigido junto.
- **Contraste no tema claro.** Também havia pares abaixo de 4,5:1 que a auditoria não listou: pílula "Adiantado" do Gel (4,29), contador do Waste (4,45) e texto de pílulas de estado (3,4 a 4,3). Corrigidos.
- **Botão "Resolver" do Paradas (2,58:1).** Não aparece no estado vazio. A causa, texto branco sobre o `--accent` claro do escuro, foi corrigida com `--accent-ink`, e o `.b.pri` passa no `tvisual.js`.

### Prioridade 1 · **corrigida**
| Item | O que mudou | Conferência |
|---|---|---|
| V08 Tema entre páginas | Paradas lê e grava as chaves comuns em texto simples, lendo também o formato antigo | Portal escuro → Paradas escuro → troca no Paradas → as cinco páginas iguais na volta |
| V01 Estrutura e cabeçalho | `kit_visual.css`: corpo sem margem, 1560 px + 16 px, faixa de 52 px, botões de 30 px. Gel: Importar, Sincronizar, Backup, TV e **Mais** | Barra, título e conteúdo no mesmo x nas cinco páginas, nas 5 larguras e nos 2 temas |
| V02 Abas | 15 px, marca de 3 px, uma linha com rolagem e setas ‹ ›; aba ativa à vista | Abas do Gel com 44,8 px em todas as larguras (antes 84 px a 169 px) |
| V05 Contraste no escuro | `--cnt-bg`/`--cnt-ink` e `--on-fill`; Paradas com `color-scheme: dark` | Nenhum contador, badge ou botão abaixo de 4,5:1; campos de data no esquema escuro |
| V06 Gráficos compactos do Portal | `miniChart` na largura do card; menos rótulos; título com unidade | Texto renderizado de 11,7 px em 1440 px (antes ~5,3 px) |

### Prioridade 2 · **corrigida em parte**
| Item | Decisão |
|---|---|
| V04 Cores de estado | **Corrigido.** Mesmos `--ok`, `--warn`, `--crit`, `--info` e `--none` nas cinco páginas; Paradas com a paleta comum; modo exemplo em roxo no Gel e no Paradas, que antes usavam vermelho e âmbar |
| V04 Sinais contraditórios no indicador | **Corrigido.** Na Produção, o valor segue o estado do card (antes: borda âmbar e número vermelho). No Waste, a borda segue o âmbar do valor. Nenhum limiar mudou |
| V04 Pílulas | **Corrigido.** Gel com pílula suave por padrão; ficam cheias só onde precisam destacar (cabeçalho do barril, cor do catálogo). No Paradas, "Conectar pasta" deixou de ser vermelha cheia |
| V03 Cards | **Corrigido em parte.** Indicador principal com valor de 28 px nas cinco páginas (Waste 24 → 28, Gel 30 → 28); resumo do Portal como variante compacta. **Mantida a diferença** entre o topo do Gel (borda lateral) e o Painel analítico (borda superior, com minigráfico): é a variante analítica. Agora há um título para cada faixa, em vez de unificar a borda |
| V06 Unidades dos gráficos | **Corrigido** no Paradas (uma unidade por escala) e nos cards do Portal (título com unidade). **Adiado:** revisão de títulos e legendas de todos os gráficos de cada página. Gatilho: a próxima mudança em cada gráfico |
| V07 Densidade | **Corrigido em parte.** Produção: um aviso de demonstração a menos no modo exemplo. Gel: título "Período selecionado · datas" separa as faixas do Painel. **Adiado:** juntar Resumo e indicadores do Waste e uniformizar a posição de Ação prioritária e filtros. A própria auditoria pede validar isso com o uso; vai com a conferência na pasta real |

### Prioridade 3
- **Feito:** o CSS comum passou a ser distribuído pelo kit e pelo build (`kit_visual.css`), e há uma verificação visual curta (`testes/tvisual.js`), que também roda com `--sem-print`.
- **Adiado:** exemplos visuais de componentes; conferência na pasta real com a equipe, observando tarefas de operador e liderança.

### Diferença que continua de propósito
- **Abas da Produção:** 49,8 px de altura, contra 44,8 px nas demais. As abas agrupadas mostram o subtítulo da seção aberta (ex.: "Análise · Visão geral"). Elas não rolam, porque os menus dos grupos seriam cortados pela faixa rolável.

---

## 0. Resposta ao diagnóstico pós-merge (`c2ca6af`, 06/11/2026)

### Parecer sobre o relatório

Os quatro achados (M01 a M04) e as duas ressalvas sobre este registro foram **todos confirmados no código e corrigidos**. O relatório leu o registro antes, não reabriu decisões recusadas e marcou com precisão o limite de cada achado (o M01 não é perda permanente, porque havia backup; o M04 não demonstrou perda). Os cenários viraram testes em `testes/tdiag.js`. **Todos falham no código de `c2ca6af` e passam no código corrigido**, menos o caso do catálogo local legado, que é um teste de não-regressão e passa nos dois.

Ao reproduzir o M02, achamos **um defeito a mais no mesmo trecho**: ao criar a nova vigência, o CadSync marcava como "usado" o id calculado (`cat_<código>`), e não o id que o registro recebia de fato. Com isso, a vigência antiga escapava da desativação do F04. Corrigido junto.

### M01 · P1 · Portal e Waste gravavam depois de falhar a leitura prévia · **corrigido** (Portal 1.8.6, Waste 1.8.10)
- **Confirmado:** em `Store._commit` (Portal) e em `commit` (Waste), a exceção da leitura era ignorada e a gravação seguia. Isso também acontecia **sem** alteração pendente: bastava outra pessoa ter gravado e a leitura falhar.
- **Feito:** sem leitura da base, a página **não grava**. A alteração é aplicada na cópia local e fica pendente (`pendFrom` = revisão conhecida), com o aviso "Não consegui ler a base da pasta…". A sincronização, que já existia, confere a base antes de gravar: se ela não mudou, grava; se mudou, preserva a da pasta e baixa a cópia local como `_NAO-GRAVADO`.
- **Teste:** `tdiag.js` › M01 Portal e M01 Waste, com a sequência do relatório (rev 10, A1 falha, B grava rev 11, leitura de A2 falha). O resultado é B na pasta, A1 e A2 pendentes e, depois da sincronização, B preservado e A1/A2 no `_NAO-GRAVADO`.

### M02 · P1 · CadSync reaproveitava a vigência antiga como a nova · **corrigido** (Produção 2.4.4)
- **Confirmado:** a segunda busca (`ex.find(x => !usados.has(x.id) && !vs.some(…))`) reaproveitava qualquer registro com data fora da lista nova.
- **Feito:**
  - O reaproveitamento com outra data só vale no **mapeamento inicial de um catálogo local nunca sincronizado**: sem `portalDe`, não criado pelo Portal (`createdBy !== 'Portal'`) e com data que não é de vigência desativada.
  - Cada registro sincronizado passa a guardar `portalDe`, a data da vigência do Portal que ele representa.
  - O defeito do id "usado" foi corrigido junto.
- **Resultado:** a vigência antiga mantém id, data e PPH, e fica inativa (F04); a nova recebe outro registro.
- **Teste:** `tdiag.js` › M02, com duas sincronizações. Também confere que o catálogo local legado continua sendo aproveitado.
- **Efeito colateral conhecido:** na primeira sincronização depois da atualização, os registros já sincronizados ganham `portalDe`. Isso gera uma linha de auditoria "sincronização do Portal" por registro, uma única vez.

### M03 · P1 · A volta para o Portal no dia seguinte não redesenhava a tela · **corrigido** (Portal 1.8.6)
- **Confirmado:** o `visibilitychange` comparava só `f.mod`.
- **Feito:** `readModules` conta as mudanças nos dados adaptados (`MOD.versao`, que só muda quando uma base é reprocessada ou quando aparece ou muda um erro de leitura). A volta para a página e a rotina de 1 minuto redesenham pelo mesmo critério.
- **Teste:** `tdiag.js` › M03, que confere o **DOM**, como o relatório pediu. Com o relógio simulado, a pendência está ausente em 06/11 e presente em 07/11 depois do evento de retorno, sem trocar de aba.

### M04 · P2 · Gel limpava a fila sem uma releitura válida · **corrigido** (Gel 1.98)
- **Confirmado:** com `fsReadHead` retornando `null`, ou sem `rev`, o código seguia para `FS.pending.splice`.
- **Feito:** releitura ausente, ilegível ou sem `rev` no início significa gravação **não confirmada**. A fila fica, com o aviso "Não consegui conferir a gravação…", e a nova tentativa a cada 30 s continua valendo. O próprio `fsWriteBase` sempre grava `{"rev":N,"revBy":…}` no início, então uma releitura válida sempre tem `rev`.
- **Teste:** `tdiag.js` › M04.

### Ressalvas sobre a precisão deste registro · **corrigidas**
- **Waste lê estruturas internas da Produção:** a descrição antiga estava **incompleta** e foi corrigida na tabela do § 1. A correção de código continua adiada, com o motivo e o gatilho lá.
- **Leitor do Gel no Waste com `exports` de versão desconhecida:** **corrigido no código** (Waste 1.8.10). `gelFind` não lê nada desse `exports`, nem pela busca genérica, e a tela pede para atualizar o Waste. Teste: `tdiag.js` › Ressalva.
- **"Teste aprovado não prova ausência de outras falhas":** concordamos. Neste registro, um teste aprovado vale **só para o cenário que ele reproduz**.

### 0.1 · P2 · Base que some da pasta deixava números antigos na tela · **corrigido** (Portal 1.8.7)
- **Apontado na revisão do PR #5 e confirmado:** quando `findModule` não achava mais a base, o Portal trocava os dados pelo erro, mas **não subia `MOD.versao`**. A tela não redesenhava e o cartão continuava com os números antigos. Era uma lacuna da correção do M03: só o erro de leitura subia o contador.
- **Feito:** as duas transições para erro (base não encontrada e erro de leitura) passam por `modErro`. Ele sobe o contador quando o erro é novo e esquece o arquivo lido. A recuperação já funcionava (a base que volta é reprocessada) e foi mantida.
- **Teste:** `tdiag.js` › "Base some", que confere o DOM em três momentos: com os dados, depois do sumiço (aviso no lugar dos números) e depois da volta da base (dados de novo). No código de `142b9c2`, só o cenário do sumiço falha.

---

## 1. Resposta ao diagnóstico de 06/11/2026

### Parecer sobre o relatório

O relatório é bom. Os oito problemas foram conferidos no código, e **sete se confirmaram como descritos**. As reproduções isoladas foram o ponto forte: cada uma virou um teste em `testes/tdiag.js`. Os 15 cenários desse teste **falham no código de `9cc1dc4` e passam no código corrigido**.

Três ressalvas para as próximas análises:
1. **F05:** a correção proposta para os zeros à esquerda contradiz uma regra documentada em `docs/cadastro-base-contrato.md`, que vale também no Portal. Aplicada, ela quebraria a ligação entre ordem e cadastro. Antes de propor mudar uma normalização, vale procurar a mesma regra nas outras páginas e na documentação.
2. **F07:** é um defeito real, mas **latente**. O OEE ainda não publica `paradasEventos`, então hoje nenhum evento é escondido. O relatório marca P1 sem citar isso. Corrigimos mesmo assim, porque a regra estava errada.
3. **`S.cadDoc` (dentro do F04):** a correção sugerida ("limpar o documento") seria pior que o problema. Detalhe abaixo.

### F01 · P0 · Produção dava "salvo" sem ter salvo · **corrigido** (Produção 2.4.3)
- **Confirmado:** a releitura depois da gravação comparava só `databaseVersion`. Duas gravações simultâneas geram a mesma versão.
- **Feito:** cada gravação leva um `saveId` (identificador único), e a releitura confere esse campo. Se não bater, a alteração continua pendente, com o aviso "Outra pessoa gravou ao mesmo tempo…", e a próxima tentativa entra no caminho de conflito que já existia. Esse caminho é o `reapply`, que reaplica as operações da sessão sobre a versão da outra pessoa.
- **Onde:** `fontes/producao/build.py` (regras `R(...)` sobre `OEE-base-2.0.html`).
- **Teste:** `tdiag.js` › F01. O primeiro resultado fica "pendente" e o arquivo final tem as duas alterações (A e B), na versão 12.
- **Alteração feita durante a gravação:** já era tratada antes (`rev0`, "continua pendente e grava de novo"). Não mudou.

### F02 · P0 · Gel limpava a fila depois de 3 colisões · **corrigido** (Gel 1.97)
- **Confirmado:** em `fsFlush`, quando `++tries<3` dava falso, o código seguia para `FS.pending.splice`.
- **Feito:** ao esgotar as tentativas, o código lança "Gravação simultânea com outra pessoa…". A fila continua no IndexedDB, e a nova tentativa automática a cada 30 s, que já existia, grava de novo.
- **Teste:** `tdiag.js` › F02, com colisão em todas as tentativas: 1 pendência mantida e o aviso exibido.

### F03 · P1 · Pendência do Waste não aparecia na virada do dia · **corrigido** (Portal 1.8.5)
- **Confirmado:** o defeito foi introduzido pela nossa entrega anterior (`aPartirDe`, Portal 1.8.4). O cache de `readModules` só reprocessava quando o arquivo mudava.
- **Feito:** a chave do cache inclui o dia (`MOD.files[id].dia`), e a comparação que decide redesenhar também. A sincronização automática, a cada minuto, reprocessa na virada do dia.
- **Teste:** `tdiag.js` › F03, com o relógio do navegador simulado: 0 pendências em 06/11 e 1 pendência em 07/11, sem nova gravação no Waste.

### F04 · P1 · CadSync não levava desativações · **corrigido em parte** (Produção 2.4.3)
- **Vigência de catálogo desativada:** **corrigido.** Fica `active:false` na Produção. **Não** é marcada `deleted`, de propósito: os registros antigos acham o catálogo pelo id (`catalogs.find(x => x.id === …)`), e a vigência inativa preserva o histórico (regra 3). Só se aplica quando o catálogo tem vigências no Portal, válidas ou desativadas.
- **Última meta desativada:** **corrigido.** O Portal passa a mandar quando tem metas cadastradas, mesmo que estejam todas inativas. Antes, mandava só com pelo menos uma ativa.
- **Turno inativo:** **corrigido.** As vigências ficam inativas (`active: v.ativo !== false && t.ativo !== false`).
- **`S.cadDoc` mantido quando o arquivo some:** **recusado como proposto ("limpar").**
  - Se o documento for limpo, a Produção entende que não há cadastro do Portal e **destrava** as abas de configuração.
  - Uma falha momentânea da pasta deixaria editar localmente o que a próxima sincronização apagaria.
  - **Feito no lugar:** mantém a última cópia, com as travas, e a faixa "Vem do cadastro do Portal" avisa que o arquivo não foi achado na última leitura (`S.cadDocAusente`).
- **Teste:** `tdiag.js` › F04, com os três casos.

### F05 · P1 · Importador SAP · **corrigido em parte** (Produção 2.4.3)
- **Data impossível (31.02.2026):** **corrigido.** É recusada; 29.02.2028 continua aceita.
- **Número parcial ("123abc" virava 123):** **corrigido.** Só é aceito se o texto inteiro for número. Os formatos válidos continuam: `1.234,56`, `1,234.56`, `15-` (negativo do SAP) e `4 500,0`.
- **Zeros à esquerda do material (`0000456` vira `456`):** **recusado.**
  - É uma normalização **intencional e documentada** (`docs/cadastro-base-contrato.md`: "códigos numéricos perdem os zeros à esquerda").
  - Ela é igual nos dois lados: `normMat` no Portal (importação da CS12) e `cod` na Produção. O SAP completa materiais numéricos com zeros até 18 dígitos, e essa limpeza é o que faz o material da ordem bater com o cadastro.
  - Mudar só o importador quebraria a ligação.
  - A regra 4 do `CLAUDE.md` dizia "nunca perder zero à esquerda", e isso causou a confusão. Foi reescrita: códigos sempre como **texto**, e material SAP numérico normalizado **do mesmo jeito em todas as páginas**.
- **Verificação:** as amostras de `testes/amostras/` (MB51 e COOIS) produzem resultado idêntico antes e depois (hash do resultado). Teste: `tdiag.js` › F05.

### F06 · P1 · Waste somava o scrap ao consumo de gel · **corrigido** (Waste 1.8.9)
- **Confirmado:** a expressão `/consumo|kg|gel/` também pegava `scrapKg`.
- **Feito:**
  - Com `exports` do Gel (v1), o consumo e o scrap são lidos pelos nomes do contrato: `ordens[].consumoKg` e `ordens[].scrapKg`.
  - A busca por nome de campo fica só para base sem `exports` e não soma mais nenhum campo de scrap, purga ou descarte no consumo.
- **Teste:** `tdiag.js` › F06. Dá 100 kg e 5 kg pelo contrato e também pela base sem `exports`.

### F07 · P1 · Evento do OEE escondia o Forms do dia inteiro · **corrigido** (Paradas 1.0.7)
- **Confirmado no código, mas latente:** o OEE ainda não publica `exports.paradasEventos` (o campo não existe em `OEE-Vacutainer.html`). Hoje nenhum evento é escondido.
- **Feito:** troca pelo critério já decidido em `docs/paradas-arquitetura.md` (D1): mesma parada é mesmo dia e equipamento, mesmo turno quando os dois têm, e início a até 10 min (sem horário, duração a até 1 min).
  - Cada evento do OEE substitui no máximo um evento.
  - Contagem de microparadas (`tally`) nunca é substituída.
  - Evento sem equipamento nunca é considerado duplicado.
- **Teste:** `tdiag.js` › F07. O Forms do EQ02 continua, o do EQ01 (a mesma parada) sai e a microparada fica.
- **Ainda falta:** um `eventoId` comum entre OEE e Paradas. Entra quando o OEE publicar os eventos (etapa 3 do roteiro em `paradas-arquitetura.md`).

### F08 · P1 · Versão desconhecida do `exports` ainda alimentava números · **corrigido** (Portal 1.8.5)
- **Confirmado:** `adaptOEEBruto` e `adaptPerdas` liam `exports.porMes` sem testar a versão.
- **Feito:** os dois caminhos ignoram o `exports` inteiro quando `exportsVersion` não é 1. Com versão desconhecida, o Waste mostra "–" nos cartões financeiros. `r.ex` e `cadProp` do Paradas também passam pelo teste de versão.
- **Teste:** `tdiag.js` › F08, para o OEE e para o Waste.

### § 5 · Pendências adicionais

| Item | Decisão | Motivo |
|---|---|---|
| 5.2 Versões não reconhece os campos da Produção | **corrigido** (Portal 1.8.5) | `baseInfo` e o cartão leem `databaseVersion`, `lastModifiedAt`, `lastModifiedBy` e `applicationVersion`. Teste: `tdiag.js` › 5.2 |
| 6.2 `tintegra.js` não falhava com código de erro | **corrigido** | `tintegra.js` e o novo `tdiag.js` saem com código 1 quando algo falha |
| Meta `WASTE-MES` lida pela data de hoje | **adiado** (P2) | Viola a regra 3 (vigência da data do fato), mas só afeta a consulta de meses antigos, e a meta raramente muda. Gatilho: primeira mudança de valor da meta no Portal |
| `Ord.gravar` sem releitura depois de gravar | **adiado** (P2) | A gravação já relê antes e aplica só a competência importada sobre a versão nova; importar uma competência substitui os dados do SAP dela por inteiro. Falta a confirmação depois de gravar (mesmo padrão do F01). Gatilho: próxima mudança em Ordens |
| Waste lê estruturas internas da Produção | **adiado** (P2) · *descrição corrigida após o diagnóstico pós-merge* | O detalhe da ordem no Waste lê da base da Produção, **mesmo com `exports`**: `monthPlans`, para ordens fora da janela de `exports.ordens` (só o mês atual e o anterior), e `server.lotClass` / `lotNotes` / `dayLot` (classificação, observação e dias do lote). `exports.lotes` já cobre classificação e observação por 150 dias, mas não `dayLot` nem ordens antigas. Para sair, a Produção precisa publicar ordens de todos os meses e os dias do lote no `exports`. Gatilho: a próxima mudança no `exports` da Produção |
| Gel e Waste dependem da cópia do cadastro no navegador | **já existia, por decisão** | Regra 2: as páginas leem `localStorage['vac.cadastros']` em modo consulta. É o desenho da plataforma, não um defeito |
| Catálogos e equipamentos no Gel, produção OEE → Gel, calendário comum | **adiado** (P3) | Já estão nas pendências conhecidas do `CLAUDE.md` |
| Recortes temporais dos `exports` (120 dias, 13 meses…) | **já existia** | As janelas estão documentadas em `docs/portal-e-padrao-comum.md` § 4 |
| Persistência, permissões e cabeçalho duplicados | **recusado** (extração em bibliotecas) | Ver A05 abaixo. O que precisava ser igual já é copiado por script (`aplicar_kit21.py`, `sistemas.js`) |
| Mecanismos de gravação diferentes por página | **recusado** (unificar agora) | Cada página tem o modelo que cabe na base dela (operações reaplicadas na Produção, fila de mudanças no Gel, `rev` no Portal e no Waste). Os defeitos reais foram corrigidos em cada um (A06, F01, F02). Unificar seria reescrever o que funciona (regra 6) |
| Build por substituições exatas | **já existia, por decisão** | O build para com `ERRO` se o trecho não for achado exatamente uma vez. A fragilidade é proposital: obriga a revisar a regra |
| Sem `package.json`, CI ou `lib/` no repositório | **adiado** (P2) | A pasta `lib/` fica na pasta da rede, e a tela "Versões das páginas" do Portal confere as versões. CI precisa de decisão do responsável |
| Documento de centralização com pendências já entregues | **adiado** | Os registros históricos ficam como estão (com data); o estado atual está no `CLAUDE.md` e neste registro |
| 5.4 Perfis não são autenticação | **recusado** | O próprio relatório reconhece que é característica da arquitetura (HTML na pasta da rede). A proteção real são as permissões de pasta do Windows |

---

## 2. Resposta à auditoria de integração de 05/11/2026

| Item | Decisão | Motivo e onde |
|---|---|---|
| A01 Estoque do Gel no Portal sem as retiradas parciais | **corrigido** (Portal 1.8.3, Gel 1.96) | O Portal lê `exports.estoque` (saldo); o Gel publica `estoque.porLocal`. Teste: `tintegra.js` |
| A02 OEE recalculado no Portal | **corrigido** (Portal 1.8.3) | Cartões, pendências, série e ordens vêm do `exports` do OEE; o cálculo bruto ficou só para base sem `exports` (pílula "dados brutos") |
| A03 Série do Paradas não aparecia | **corrigido** (Portal 1.8.3) | `adaptParadas` lê `{rotulo, pontos}`; o formato do Paradas não mudou |
| A04 Urgência invertida | **corrigido** (Portal 1.8.3) | Contrato registrado: `sev 1` = urgente e `sev 2` = atenção, como OEE, Gel e Paradas já publicavam. **A numeração proposta (0/1/2, com 2 = crítica) foi recusada:** inverteria o significado de um campo em três páginas e exigiria `exportsVersion 2` |
| A05 Extrair código comum para `shared/*.js` | **recusado** | Quebraria o arquivo único na pasta da rede. O comum é copiado por script (`aplicar_kit21.py`). O problema real encontrado (`DEFAULT_SYSTEMS` diferente por página) foi corrigido com `fontes/kit/sistemas.js` |
| A06 Gravação pendente por cima de outra pessoa | **corrigido** (Portal 1.8.3, Waste 1.8.7) | A pendência só vai para a pasta se a base de lá não mudou; se mudou, a cópia local é baixada como `_NAO-GRAVADO` |
| A07 Segurança no navegador | **recusado** | Mesmo motivo do 5.4 |
| A08 Tela "Saúde do sistema" | **corrigido em parte** | Em vez de uma tela nova, a tela "Versões das páginas", que já existia, passou a avisar sobre `exports` em versão desconhecida ou mais antigo que a gravação |
| A09 Funcionar sem internet, navegadores, acentos | **adiado** | Fica para a lista de conferência da homologação na pasta real |
| A10 Contagem dupla OEE × Paradas | **corrigido em parte** | A regra de deduplicação foi corrigida no F07. O `eventoId` comum entra quando o OEE publicar os eventos |
| Contrato `schemaVersion 2` (`series`, `status`) | **recusado** | Renomearia campos que funcionam (`serie` → `series`), contra a regra 6 |
| Painéis por papel, BI e etapas 0–6 | **recusado** (escopo) | Não corrigem dado. A etapa 0 (versionamento) já existe no git |
| Waste: mês aberto como provisório | **corrigido** (Portal 1.8.3) | Usa `porMes[].fechado`, que o Waste já publicava |
| Waste: pendências pelo `exports` | **corrigido** (Waste 1.8.8, Portal 1.8.4) | `exports.pendencias` com `aPartirDe` para ação que vence sem nova gravação; a virada do dia foi corrigida no F03 |

---

## 3. Como verificar

```bash
python fontes/producao/build.py   # a Produção precisa sair idêntica ao paginas/OEE-Vacutainer.html versionado
node testes/tdiag.js              # cenários deste registro (diagnóstico de 06/11/2026); código 1 se algo falhar
node testes/tintegra.js           # Portal × exports (auditoria de 05/11/2026); código 1 se algo falhar
node testes/tpg.js
```

**Limites:** os testes de gravação usam pastas simuladas em memória. Eles reproduzem a ordem dos acontecimentos, mas **não** substituem um teste com duas estações gravando na pasta de rede real. A conferência na pasta real continua pendente (`CLAUDE.md` › Pendências conhecidas).


## DEM · Demonstração integrada (09/11/2026)

Pedido do responsável: navegar pelo sistema inteiro em demonstração, ou, se inviável, ter um exemplo em cada página. Implementada a primeira opção em um pacote HTML offline, reaproveitando as oito páginas e seus modos de memória. Antes, sete exemplos locais não compartilhavam navegação/cenário; Projetos era somente o esqueleto.

- **Implementado:** entrada comum, cenário fictício relacionado, ficha/Ctrl K, encaminhamento entre páginas, memória da sessão, reiniciar e sair; `docs/demonstracao-integrada.md`.
- **Preservado:** contratos de exports, propriedade das bases e cadastros, build da Produção e kit comum. Não altera nenhuma base da linha.
- **Limite explícito:** Projetos continua em construção; a demonstração não implementa as pendências de MES, OSM e procedimentos AM/TPM. Fechar/recarregar o pacote inicia outra sessão.
- **Validação:** `testes/tdemo.js` e regressão consolidada; evidências e restrições em `docs/auditorias/demonstracao-2026-11-09.md`.


## SQ · Quadro SQDCP e segurança/QN por turno (09/11/2026)

Pedido explícito: desenvolver cinco colunas e cinco posições, uma A4 paisagem por indicador, alimentado também por acidente e Quality Notification de cada turno.

- **Implementado:** quadro configurável com três modelos de impressão, fontes existentes por exports e indicadores manuais; Sim/Não houve/Não informado, quantidades e referências em texto; QN identificada sem duplicação; cobertura e contagens provisórias visíveis.
- **Integração:** passagem de turno, relatórios diário/semanal/mensal, CSV/Excel e `exports.sqdcp`. Reimportação preserva S/Q sem duplicar produção.
- **Preservado:** propriedade das bases, campos opcionais, vigências e cálculo de OEE, build da Produção por fontes.
- **Validação:** `testes/tsqdcp.js`, incluindo uma página A4 paisagem, ausência de resposta, gravação/releitura e troca de pasta.
- **Pendências:** lista ao final de `docs/producao-sqdcp.md`; não presume fonte automática de pessoas/custo diário nem histórico de acidentes anteriores ao sistema.
