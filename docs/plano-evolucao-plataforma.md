# Plano de evolução da plataforma · Sistemas da Linha Vacutainer

05/11/2026 (corrigido no mesmo dia: OSM = Observação de Segurança; KAS e 5S separados; MB51 sem referência do estorno; **prioridade atual: Waste**; divisão dos módulos em D1) · **planejamento, nada implementado** (decisão: nenhuma alteração antes de fechar o plano).
Base: "Documento consolidado de melhorias" (05/11/2026) cruzado com os HTMLs atuais — **Portal 1.6, OEE 2.0, Gestão de Gel V1.91, Perdas 1.7.3, Paradas 1.0.1** — e com os contratos do projeto (`arquitetura-integracao-sistemas`, `cadastro-base-contrato`, `portal-e-padrao-comum`, `paginas-novas`, `paradas-arquitetura`, `kit-cabecalho-e-backups`).

Como ler: § 1 diz o que já existe; § 2 lista as decisões que precisam ser fechadas antes de começar (é onde o documento consolidado conflita com decisões anteriores); § 3 a § 7 são a arquitetura-alvo; § 8 é a ordem de execução; § 9 são os pontos a validar, com o que a análise do código já respondeu.

---

## 1. Diagnóstico: o que o código já tem

Muita coisa do documento consolidado **já existe** em alguma página. O trabalho é mais de **unificar e mover** do que de criar.

| Item do documento | Situação hoje | Onde |
|---|---|---|
| Paleta verde/amarelo/vermelho/cinza/azul/roxo/laranja (§ 3.3) | **Feito em 3 páginas**: tokens `--ok --warn --crit --none --info --rule --pend` idênticos. Gel e Paradas usam paleta própria (`--hold`, laranja no lugar do âmbar, `--accent` diferente no Paradas) | Portal, OEE, Perdas · falta Gel e Paradas |
| Semáforo relativo à meta 100 / 90 (§ 7.8) | **Feito no OEE** (`semaphore.green/yellow`, padrão 0,9, configurável). Fica só no OEE | OEE › Configurações › Parâmetros |
| OEE = boa ÷ capacidade; P fecha a cascata (§ 7.7) | **Feito**: `oee = good/cap`, `P = oee/(D×Q)` | OEE `Engine` |
| Scrap por turno ou diário (§ 7.6) | **Feito** (`scrapMode` no cabeçalho do dia) | OEE › Lançamento |
| Abas agrupadas com rótulo de seção (§ 3.4) | **Feito no OEE** (Operação · Análise · Planejamento · Gestão) e no **Paradas** (rótulo `.grp`). Portal, Gel e Perdas: abas soltas | — |
| Busca Ctrl K (§ 3.1, 17.3) | **Feito por página** (cada página busca o que é dela + nomes das páginas). **Não é global**: no OEE não se acha uma LP; no Gel não se acha um código de parada | kit `vac-cabecalho v1` |
| Cadastro central com senha (§ 4) | **Feito no Portal 1.1–1.6** (catálogos, BOM CS12, equipamentos, componentes, turnos, códigos de parada, modos de falha, matriz). **Ninguém lê ainda em modo travado**: OEE só mostra a pílula "Cadastro rev N"; Gel e Perdas não leem; Paradas lê | Portal › Cadastros |
| Matriz de paradas (§ 10.3) | **Duplicada**: oficial no Portal 1.6 (Cadastros › Matriz) e provisória no Paradas (Formulários › Matriz, "até o Portal ganhar a matriz") | Portal + Paradas |
| Vigências (§ 5) | **Parcial**: Portal encaixa vigência antiga em ordem cronológica e fecha a anterior. Mas `de`/`ate` são **editáveis**, "já existe vigência nessa data → edite essa", e não há criador/origem/"em uso" por vigência (só na auditoria) | Portal › ficha |
| BOM só leitura, nova vigência por importação (§ 16) | **Quase feito**: CS12 é a única fonte, vigência a partir de hoje, prévia com diferenças. Falta travar visualmente (cinza) e impedir edição manual dos itens na ficha | Portal › Importar |
| Modo teste com saída (§ 3.5) | **Inconsistente**: OEE ("Sair do modo exemplo") e Paradas ("sair") têm saída; Gel tem `exitDemo`; **Portal e Perdas mostram a faixa sem botão de saída** (só recarregando) | todas |
| Lançamento com acesso duplicado ao hora a hora (§ 7.3) | **Confirmado**: botão segmentado "Lançamento \| Hora a Hora" na barra do dia **e** botão "Hora a hora ›" abaixo da Observação geral | OEE › Lançamento |
| Página inicial por pessoa (§ 6.5) | **Parcial no OEE**: Configurações › Abas tem "Inicial" por pessoa (só dentro do OEE) | OEE |
| Usuário | Só nome digitado (`vac.user`) comum às páginas; lista `editores` do cadastro | todas |
| Equipamentos (§ 11) | **Espalhado em 4 lugares**: ficha no Portal (fotos, documentos, componentes); aba "Equipamentos" do OEE (**em construção**); aba Equipamentos do Paradas (MTBF/MTTR/MTBS); Gel › Configuração › Equipamentos da linha (descartes de scrap) | 4 páginas |
| Ações / melhorias | **Duas listas de ações**: Perdas › Ações e Paradas › Ações; OEE tem "OSM válidos" e "KAS registrados" como indicadores externos em construção | Perdas, Paradas, OEE |
| Detalhe da ordem (§ 9) | **Existe só no Perdas** (`openOrder`): clicar numa ordem no OEE ou no Gel abre `Perdas-Ordem.html#ordem=`. Mostra custo/KKBC, não produção/paradas | Perdas |
| Ordens SAP MB51/COOIS (§ 8) | **Não existe**. Ordens hoje entram pelo plano do PCP colado no OEE (Plano do mês), ligadas a lotes pelo MES e a barris no Gel | — |
| OSM, KAS (§ 12, 13) | **Não existem** como módulo | — |

---

## 2. Decisões a fechar antes da Fase 1

Cada item tem uma **recomendação**. São os pontos em que o documento consolidado e as decisões já registradas no projeto não batem, ou em que o documento deixa dois caminhos.

**D1 · Divisão dos módulos. DECIDIDO (Pedro, 05/11/2026):**
- **Produção (OEE)**: apontamentos, produção e OEE. **Waste**: perdas por ordem.
- **Máquinas**: estado das máquinas, tempo de ciclo, performance, paradas e motivos, **manutenção**.
- **OSM**: observações de segurança e melhorias do dia a dia do operador, conduzidas pela área de Qualidade, Segurança e Meio Ambiente; **não tem ligação com máquina nem com a linha**. Meta por operador (ex.: 4 por mês). Ações tratadas no estilo planner.
- **Projetos**: reúne vários tipos — projetos de melhoria, projetos grandes, compra de máquina, **KAS** (pequenos kaizens) e **5S**.
- A fusão proposta antes (Máquinas → Equipamentos, Manutenção → OSM, Projetos → KAS) foi recusada.

**D2 · Prioridade. DECIDIDO (05/11/2026):** **Waste primeiro** (reunião de reporte de waste em 05/11). OSM é tratada depois, junto com Projetos, KAS e 5S. O texto do OEE "Ordens de serviço de melhoria" está errado e deve ser corrigido no chat do OEE.

**D3 · Uma lista de ações só.** Hoje Perdas e Paradas têm cada um a sua lista de ações (causa, responsável, prazo, status). **Em aberto** depois da correção do D1/D2: as ações das OSM ficam na página OSM; se as ações de Perdas e Paradas migram para KAS ou ficam onde estão, decidir quando a página KAS for planejada.

**D4 · Renomear só o nome exibido.** OEE → Produção, Perdas → Waste.
→ **Arquivos, bases e ids não mudam** (`OEE-Vacutainer.html`, `oee-vacutainer-base.json`, `id:'oee'`; `Perdas-Ordem.html`, `perdas-base.json`, `id:'perdas'`), porque as páginas se acham pelo nome e os links `#ordem=` já estão em uso. Cuidado técnico: a barra de sistemas usa a lista `vac.sistemas` **gravada no navegador**, que guarda o `nome` antigo e tem prioridade sobre o padrão do código. O Portal precisa de uma migração única que troque o nome dos ids conhecidos (se o usuário não tiver personalizado).

**D5 · "Paradas é a fonte oficial" × "cada página só grava na própria base".** O documento pede que Produção e Equipamentos "criem/sugiram eventos que entram na base Paradas". A regra do projeto é que nenhuma página grava na base de outra.
→ Recomendo manter a regra e fazer a convergência **por identificador**, não por gravação cruzada:
- Todo evento de parada tem um **id estável com prefixo de origem** (`FN-` Forms, `OE-` lançado no hora a hora, `EQ-` sugerido por relatório de máquina, `M-` manual no Paradas).
- Cada origem publica os seus no `exports.eventosParada`; o **Paradas lê todos, deduplica (dia + turno + equipamento + janela de horário) e grava só a classificação/validação** presa ao id.
- O Paradas publica `exports.eventos` (validados) e `exports.reclassificacoes`; **Produção recalcula D/OEE a partir dos validados** e mostra a diferença enquanto houver evento pendente (é o "diagnóstico de sincronização" do § 10.5).
- Isso fecha o que ficou em aberto em `paradas-arquitetura` § 7 itens 3–4.

**D6 · Onde moram metas de OEE, PPH e semáforo.** O contrato atual diz que metas de OEE ficam no OEE ("o que é de uma página fica nela"); o documento quer um painel único de vigências com Metas, PPH e Regras de scrap.
→ Recomendo **mover para o cadastro**: `metasOee` (por família/catálogo, com vigência), `pphNominal` (já está), `parametros.semaforo {verde:1, amarelo:0.9}` e `parametros.scrap`. Motivo: Portal, Equipamentos, TV e relatórios passam a pintar com a mesma régua. O OEE continua **congelando no dia fechado** a meta/PPH usados (regra já existente).

**D7 · Vigência editável ou imutável.** Hoje o Portal deixa editar início/fim com motivo; o OEE tem a regra "editar a vigência de turno vale para dias criados depois". O documento pede: depois de salva, não edita; errou, desativa e cria de novo; vigência usada por registro fechado não sai.
→ Recomendo adotar a regra do documento **para todas as vigências do cadastro**, com uma exceção prática: a vigência **criada nesta sessão e ainda não gravada** pode ser corrigida (hoje já existe o "Remover" para `_nova`). `ate` deixa de ser digitado: é **calculado** pela próxima vigência (o arquivo continua guardando `ate` para quem lê, por compatibilidade).

**D8 · Onde ficam as ordens do SAP (MB51/COOIS).** O documento põe em Produção › Ordens. Os dados brutos de MB51/COOIS por competência são volumosos e interessam a Waste, Gel e à ficha da ordem.
→ Recomendo: a **tela** fica em Produção › Ordens, mas os dados vão para uma **base própria `ordens-base.json`**, gravada só pela tela de Ordens (backup em `00. Backups/Ordens/`). É a primeira página com duas bases; a alternativa é uma página separada `Ordens.html`. Manter dentro do `oee-vacutainer-base.json` deixaria a base do OEE pesada e misturaria regras de gravação.

**D9 · Competência: MB51 × período da KKBC × plano.** O Waste hoje importa a KKBC com "Mês de referência" e mostra FY/período fiscal; o documento diz que a competência da ordem vem só do MB51 e que não existe competência manual.
→ Recomendo **dois campos, sem conflito**: `competencia` (da ordem, pela data do último 101 válido, do MB51) e `periodoCusto` (da KKBC, como o SAP apurou). O Waste filtra por competência por padrão e mostra um aviso quando os dois diferem (ordem produzida em setembro com variação apurada em outubro). Confirmar se o período fiscal BD coincide com o mês civil.

**D10 · Identificação e perfis num HTML local.** Perfis com campos visíveis/editáveis por campo são caros de construir e não dão segurança real (o JSON pode ser editado na pasta; a própria nota do documento reconhece isso).
→ Recomendo três níveis, em fases: (1) **perfil por página e função** (ver, lançar, fechar/reabrir, importar, excluir, configurar, restaurar) + página inicial; (2) campos travados só onde já existe regra de negócio (BOM, vigências, dados SAP); (3) por campo, só se houver necessidade concreta. Identificação: **nome/matrícula escolhidos de uma lista cadastrada** (em vez de texto livre), lembrado por navegador, com "Trocar usuário" visível no cabeçalho para o PC compartilhado. Ações sensíveis continuam pedindo a senha de administrador (a senha do cadastro de hoje). Entra ID fica para a Fase 10.

**D11 · Onde vive o "detalhe unificado" da ordem/lote.** Hoje o hub é o Perdas (`#ordem=`). Com o nome Waste, deixa de fazer sentido como entrada geral.
→ Recomendo uma **ficha comum** (painel lateral) que **toda página tem igual**, montada só com os `exports` dos módulos. Cada seção traz o botão "Abrir em <módulo>" com o filtro aplicado. Detalhe em § 3.5.

---

## 3. Arquitetura-alvo

### 3.1 Módulos

| Módulo (nome exibido) | Arquivo | Base | id | Dono de |
|---|---|---|---|---|
| Portal | `Portal.html` | `portal-base.json` | `portal` | entrada, visão geral, pendências, TV geral |
| Administração (dentro do Portal) | `Portal.html#admin` | `vacutainer-cadastros.json` | — | cadastros, configurações, vigências, usuários e perfis |
| Produção | `OEE-Vacutainer.html` | `oee-vacutainer-base.json` | `oee` | plano do mês, lançamento, hora a hora, scrap, OEE/D/P/Q, lotes do MES |
| Produção › Ordens | (mesma página) | `ordens-base.json` | `ordens` | MB51, COOIS, competências, ordens produzidas (D8) |
| Waste | `Perdas-Ordem.html` | `perdas-base.json` | `perdas` | KKBC, desvios de material, custo de waste |
| Gestão de Gel | `Gestão-Gel-Vacutainer.html` | `fifo-base.json` | `gel` | LPs, FIFO, validade, consumo, scrap de gel, programação, simulador |
| Paradas | `Paradas.html` | `paradas-base.json` | `paradas` | eventos validados, camada técnica, Pareto, recorrência, guia, formulários |
| OSM | `OSM.html` | `osm-base.json` | `osm` | **observações de segurança**, meta por operador, ações estilo planner (prioridade atual) |
| KAS | `KAS.html` | `kas-base.json` | `kas` | ideias e melhorias (iniciativa própria; depois) |
| 5S | `5S.html` | `5s-base.json` | `5s` | auditorias 5S (iniciativa própria; depois) |
| Máquinas / Equipamentos, Manutenção, Projetos | já reservados no Portal 1.5 | — | — | escopo a rever depois (D1) |

Ordem na barra: Portal · Produção · Waste · Gel · Paradas · OSM · (KAS · 5S · demais quando existirem) · ⚙ (Administração, ao lado do tema).

### 3.2 Dono de cada entidade (fonte única)

| Entidade | Chave | Dono (só ele grava) | Quem lê |
|---|---|---|---|
| Catálogo, família, material, BOM | código | Cadastro (Portal) | todos |
| Equipamento, componente, tipo do ativo | `EQnn`, `EQnn-Cnn` | Cadastro | todos |
| Turno (com pausas) | `T1…` | Cadastro | Produção, Gel, Paradas, Equipamentos, OSM (meta por turno) |
| Código de parada, matriz, microparada | 3 letras (+ nº de 3 dígitos) | Cadastro | Produção, Paradas, Equipamentos |
| Metas de OEE, PPH, semáforo, regra de scrap | por vigência | Cadastro (D6) | Produção, Portal, Equipamentos |
| Usuário, perfil, especialidade | matrícula / código | Cadastro (D10) | todos |
| Temas de OSM, meta OSM por operador | código / vigência | a definir em `osm-arquitetura` (na página OSM até o cadastro ter o tipo) | OSM, Portal |
| Plano do mês, calendário, dia/turno/hora | data + turno | Produção | Gel, Waste, Paradas, Equipamentos |
| Ordem (planejada, PCP) | nº da ordem | Produção (plano) | todos |
| Ordem (produzida, SAP) | nº da ordem (+ material + UM) | Produção › Ordens | todos |
| Lote (MES) | nº do lote | Produção (`server`) | Gel, Waste, ficha |
| Evento de parada | id com prefixo de origem | cada origem publica; **Paradas valida** (D5) | Produção, Equipamentos |
| Custo / desvio por ordem | ordem + componente | Waste | ficha, Portal |
| LP, consumo e scrap de gel | LP / ordem | Gel | ficha, Waste |
| OSM (observação de segurança) e suas ações | `OSM-AAAA-nnnn` | OSM | Portal, Produção (indicador da diretoria) |
| Ideia / ação de melhoria | `KAS-AAAA-nnnn` | KAS | Portal, ficha |

### 3.3 Pasta

```
Vacutainer/
  Portal.html  OEE-Vacutainer.html  Gestão-Gel-Vacutainer.html  Perdas-Ordem.html
  Paradas.html  Equipamentos.html  OSM.html  KAS.html  Modelo-Pagina.html
  vacutainer-cadastros.json                 ← só Administração grava
  portal-base.json  oee-vacutainer-base.json  ordens-base.json  fifo-base.json
  perdas-base.json  paradas-base.json  equipamentos-base.json  osm-base.json  kas-base.json
  Logo.png  lib/  Equipamentos/<código>/  Importacoes/<módulo>/<competência>/   ← arquivos originais (opcional)
  00. Backups/Cadastros|Portal|OEE|Ordens|Gel|Perdas|Paradas|Equipamentos|OSM|KAS/
```

### 3.4 Contrato `exports` v2 (aditivo, `exportsVersion: 2`)

Mantém tudo do v1 e acrescenta blocos padronizados que a ficha comum e a busca global leem:

- `indice` — o que a página sabe achar: `[{ tipo:'ordem'|'lote'|'lp'|'osm'|'kas'|'evento'|'equipamento', chave, rotulo, link }]` (limite ~2.000 itens recentes).
- `porOrdem` — `{ "<ordem>": { … resumo daquela página para a ordem … } }`, com chaves fixas por módulo:
  - Produção: `catalogo, lotes[], planejado, produzidoBoa, scrap, dias[], turnos[], horas[{dia,turno,inicio,fim,boa}], oee, D, P, Q, inicioReal, fimReal`
  - Ordens: `competencia, dataPrincipal, saldos[{material, um, qtd}], status, conciliacao, cooiS{…}`
  - Waste: `desvio, perda, ganho, nivel, causa, periodoCusto`
  - Gel: `lps[], consumoKg, scrapKg, gPorTubo, indice`
  - Paradas: `eventos[{id, dia, equipamento, codigo, minutos}], minutos, quebras`
- `porLote` — mesmo formato, chave lote.
- `eventosParada` — eventos que a página originou (D5).
- Cada bloco traz `geradoEm` e `fonte` para o selo de origem dos relatórios (§ 7.1).

### 3.5 Navegação contextual

**Gramática única de links** (todas as páginas aceitam e geram):
`Pagina.html#<alvo>=<chave>&de=AAAA-MM-DD&ate=AAAA-MM-DD&turno=T1&eq=EQ02&cat=360060&ordem=…&lote=…&origem=<página>`
Ao abrir com `origem=`, a página mostra "← voltar para <origem>" que devolve com os filtros de antes. Os links atuais (`#dia=`, `#ordem=`, `#lp=`, `#equipamento=`, `#evento=`) continuam valendo.

**Ficha comum (componente `vac-ficha v1` do kit)**, aberta como painel lateral por clique em ordem, lote, LP, equipamento ou evento em qualquer página:
- Cabeçalho: ordem · material · descrição · lote(s) · tipo · competência · data principal · quantidade por unidade · status · conciliação.
- Abas: Resumo · Planejado · Produção · Hora a hora · Paradas · Equipamentos · Scrap/Refugo · Aproveitamento · Waste · Gel · Dados SAP · Histórico.
- Cada número é clicável e leva à página dona com o filtro (ex.: minutos de parada → `Paradas.html#ordem=…&origem=oee`).
- A ficha **só lê `exports`** (nunca a estrutura interna de outra base) e mostra, no rodapé, de onde veio cada bloco e quando foi gerado; módulo sem dado para a ordem aparece em cinza ("sem dados"), nunca escondido.
- Clique em barra de gráfico/Pareto: abre a lista dos registros que formam a barra; cada linha abre a ficha.

### 3.6 Kit comum v2 (`vac-cabecalho v2`)

Um bloco copiado igual em todas as páginas (mesmo processo do kit v1, aplicado no chat de cada página):
1. Barra com os 8 módulos + **⚙ Administração** ao lado do tema.
2. **Usuário** escolhido da lista do cadastro, com perfil e "Trocar usuário"; aplica a página inicial e esconde abas/funções sem permissão.
3. **Busca global** Ctrl K: itens da página + `exports.indice` de todos os módulos (lidos da pasta, com cópia no navegador).
4. **Semáforo central**: função `semaforo(valor, meta)` e as 7 classes de cor lidas do cadastro; Gel e Paradas passam a usar os mesmos tokens.
5. **Modo demonstração padrão**: faixa roxa permanente "MODO DEMONSTRAÇÃO" + botão "Sair do modo demonstração" + "Exportar dados de teste"; os dados reais ficam guardados e voltam ao sair; nada é gravado na pasta.
6. **Abas agrupadas** com rótulo de seção acima (padrão do OEE/Paradas), virando menu suspenso em tela estreita.
7. **Ficha comum** (§ 3.5) e leitor da gramática de links.

---

## 4. Diretrizes de interface (consolidadas)

- **Cores com significado fixo** (tokens que já existem no Portal/OEE/Perdas): verde `--ok` bom/conforme · amarelo `--warn` atenção · vermelho `--crit` ruim · cinza `--none` sem dados/inativo · azul `--info` informação · roxo `--rule` configuração/regra e modo demonstração · laranja `--pend` pendência/revisão. Nenhuma página cria cor de status própria; cores de família/catálogo continuam vindo do cadastro.
- **Semáforo**: verde ≥ 100 % da meta vigente; amarelo 90–99,99 %; vermelho < 90 %; cinza sem meta ou sem dado. Limites em `parametros.semaforo` (um lugar só). Indicadores "quanto menor melhor" (scrap, waste, tempo parado, idade de OSM) usam a régua invertida, declarada no indicador.
- **Relatório exportado** (PDF, Excel, Outlook) usa as mesmas cores e mostra fonte, atualização, filtros, competência e nº de registros.
- **Ação no lugar**: botões de ação ficam onde o dado está (ex.: "Abrir ação" no evento de parada, "Comentar causa" na ordem crítica).
- **Diferença não se esconde**: quando dois módulos discordam (ex.: minutos de parada em Produção × Paradas), mostrar os dois valores e a pendência.

---

## 5. Administração (Portal)

### 5.1 Estrutura (reorganiza o que o Portal já tem)

| Administração › | Vem de (Portal 1.6) | Novo |
|---|---|---|
| Cadastros | Cadastros (listas, fichas, matriz, importar SAP) | tipos `usuarios`, `perfis`, `tiposOsm`, `prioridades`, `motivosScrap`, `especialidades`, `metasOee`; equipamento com `tipoAtivo` + `participacaoOee` |
| Configurações | Cadastros › Segurança › Parâmetros gerais | semáforo, regras de scrap, comportamento das paradas, campos obrigatórios, modo TV, notificações |
| Usuários e perfis | Segurança › editores | cadastro de usuários, perfis, permissões, página inicial, primeiro acesso |
| Vigências | (ficha de cada item) | painel único: metas de OEE, PPH, turnos, catálogos, BOM, códigos de parada, regras de scrap |
| Integrações SAP | Importar do SAP (CS12, materiais, componentes) | atalhos para MB51/COOIS (Produção › Ordens) e KKBC (Waste), com a última importação de cada um |
| Base e backup | Configuração (pasta, pasta única, módulos) + Cadastros › Backups | backups de todos os módulos em uma lista (cada página continua restaurando os seus) |
| Diagnóstico | Configuração › Versões das páginas | sincronização entre módulos (§ 7.2), cadastro lido por cada página, `exports` desatualizado |
| Auditoria | Cadastros › Auditoria | inclui login, mudança de perfil, restauração |

A aba "Configuração" atual do Portal e a aba "Cadastros" viram uma área só, aberta pela engrenagem.

### 5.2 Inventário do que ainda está fora do cadastro (a centralizar)

| Página | Seção atual | Destino |
|---|---|---|
| Produção | Configurações › Estrutura, Turnos, Catálogos, Tipos de parada | cadastro (só leitura + "Editar na Administração") |
| Produção | Metas e capacidades, Parâmetros (semáforo) | cadastro (D6) |
| Produção | Abas (ordem, inicial) | perfil (inicial) + preferência pessoal (ordem) |
| Gel | Configuração › Catálogos, Turnos e ritmo, Equipamentos da linha | cadastro (catálogo, turno, equipamento); os **descartes de scrap por equipamento** ficam no Gel presos ao código `EQnn` |
| Gel | Formatos de tubo (pesos de tubo, gel, aditivo, tampa+rolha, sobra de barril) | cadastro `formatos` com vigência (são dados do produto; Waste e Simulador também usam) |
| Gel | Motivos de descarte | cadastro `motivosScrap` (compartilhado com Produção) |
| Paradas | matriz provisória (`config.matriz`), limite de microparada | remover a cópia local; ler só do cadastro |
| Paradas | de-para Forms → código/máquina | fica no Paradas (é regra de importação dele) |
| Perdas | Regra de sinal, grupos da KKBC | fica no Waste (regra de importação dele) |

### 5.3 Vigências (regra única)

- Lista por item, mais recente em cima: início · fim **calculado** · status (vigente / futura / encerrada / desativada) · criada por · em · origem · **em uso** (nº de registros fechados que a usaram) · ação.
- Nova vigência em qualquer data, inclusive antiga: entra na ordem e recalcula o fim das vizinhas; nunca apaga outra.
- Depois de gravada não se edita. Errou → **Desativar** (motivo obrigatório, auditado) e criar de novo. Vigência **em uso** por registro fechado não pode ser desativada sem reabrir os registros (o sistema lista quais).
- Quem lê sempre usa a vigência da **data do fato**; registro fechado guarda o valor usado (regra que já existe no OEE).
- Painel **Administração › Vigências**: todas as vigências do cadastro numa linha do tempo filtrável por tipo, com as próximas a começar e as criadas nos últimos 30 dias.

### 5.4 Usuários e perfis

- `usuarios`: `{ codigo:<matrícula>, nome, email, perfil, turno, especialidade, status, paginaInicial, primeiroAcessoEm, ultimoAcessoEm }`. O último acesso é gravado pela própria página no navegador e publicado no `exports` dela (o cadastro não recebe gravação de todas as páginas).
- `perfis`: `{ codigo, nome, paginas:{ <modulo>: { ver, lancar, fechar, reabrir, importar, exportar, excluir, configurar } }, paginaInicial, restaurarBackup }`.
- Perfis iniciais: Administrador · Liderança · Operador · Técnico de manutenção · Processos · Qualidade · PCP · Almoxarifado · Consulta · TV.
- Primeiro acesso: escolhe o nome na lista → a página mostra perfil, página inicial e permissões principais → confirma. Nome fora da lista: entra como **Consulta** e aparece como pendência para o administrador.
- Página inicial: o Portal abre a do perfil (Operador → `OEE-Vacutainer.html#turno`; Liderança → Produção › painel do turno; Técnico → Paradas › Fila técnica; quem trata ações de OSM → `OSM.html#minhas`; PCP → Produção › Plano; Administrador → Portal). Link `Portal.html#geral` sempre abre o Portal.
- Senha mestre = a senha do cadastro de hoje, renomeada para **senha de administrador**; ações sensíveis (configurar, restaurar backup, reabrir mês fechado, mudar perfil) pedem a senha.

---

## 6. Módulos

### 6.1 Produção (atual OEE)

**Já tem**: cascata OEE oficial, scrap por turno/dia, semáforo relativo, abas agrupadas, calendário, conferência de turno, plano do PCP, lotes do MES, retrabalho fora do OEE.
**Muda:**
1. **Um ponto de entrada**: "+ Novo apontamento" (assistente em 4 passos do documento: contexto → modo de lançamento diário/turno/hora a hora → modo do scrap → gerar). Sai o botão "Hora a hora ›" da área de observação; o segmentado Lançamento | Hora a hora vira navegação dentro do apontamento já aberto.
2. **Cabeçalho do apontamento** com tudo do documento (data, linha, máquina, turno, ordem, lote, catálogo, modos, status, responsável, última atualização, plano aplicável, meta vigente); depois: Observações → Hora a hora → Paradas → Scrap → Fechamento.
3. **Hora a hora**: intervalos gerados do cadastro de turnos; dividir/criar intervalo; catálogo predominante por hora; várias paradas por hora; troca de catálogo/setup lançada como parada.
4. **Paradas**: o seletor usa o cadastro (filtrado pela matriz do equipamento, código digitável pelo número 801 → FME); cada parada lançada vira evento `OE-…` no `exports.eventosParada`; reclassificações do Paradas aparecem em Pendências para aceitar (D5).
5. **Aba Paradas da Análise** deixa de calcular Pareto próprio: usa os eventos validados do Paradas e mostra a diferença com o lançado, se houver.
6. **Indicador no calendário** quando o turno tem observação/check relevante; clique mostra observação, turno, responsável, data/hora e ligação com ordem/lote/parada. (Quais checks contam: § 9.)
7. Aba "Equipamentos" (em construção) sai: vira link para `Equipamentos.html`.
8. Configurações de cadastro ficam só leitura (§ 5.2).

### 6.2 Produção › Ordens (MB51 + COOIS)

Regras do documento mantidas integralmente (§ 8.5–8.21 do consolidado). Pontos de projeto:
- Base `ordens-base.json` (D8): `competencias[{ comp:'2026-09', planta:'4017', importacoes[{ id, em, por, arquivo, tipo:'MB51'|'COOIS', linhasBrutas[] }], ordens[…], regrasAplicadas, substituidaPor }]`.
- **Fluxo na tela** (passos numerados, sempre visíveis): 1 Competência → 2 MB51 (colar/arquivo) → 3 Resultado preliminar (indicadores + Válidas / Estornadas / Pendências) → 4 Lista para COOIS (copiar, TXT, ausentes) → 5 COOIS → 6 Cobertura → 7 Consolidado.
- **Vínculo 102 → 101 (corrigido em 05/11/2026)**: o MB51 de vocês traz só os movimentos 101 e 102, **sem a referência do documento estornado**. Regra proposta, sem LIFO e sem escolha arbitrária:
  1. **Correspondência exata**: o 102 é ligado a um 101 quando há **um único** 101 anterior com a mesma Ordem + Material + Lote + UM e a mesma quantidade (com sinal invertido). Fica marcado "vinculado por correspondência exata".
  2. **Estorno total**: se a soma dos 102 zera a combinação Ordem + Material + UM, todos os 101 dela ficam estornados (não precisa de vínculo).
  3. **Senão**: "Estorno sem referência documental suficiente", saldo líquido mantido, data principal = último 101 **se** nenhum 102 puder ter cancelado ele; caso contrário, pendente para decisão do usuário (escolha registrada na auditoria).
  A confirmar com uma amostra real do MB51: quantos estornos parciais aparecem por mês (se forem raros, o passo 3 quase não acontece).
- **Relação com o plano do PCP**: ordem do plano × ordem produzida (MB51) vira a conciliação "planejado × produzido" da ficha. Ordem no plano sem 101 na competência = "não produzida"; 101 sem estar no plano = "fora do plano".
- **Substituição de competência**: tela de comparação antes de gravar (adicionadas, removidas, quantidades por material/UM, novos 102, data principal alterada, pendências novas/resolvidas); nunca soma duas importações.
- Publica no `exports`: `porOrdem` (competência, data principal, saldos por material/UM, status, conciliação) e `indice`.

### 6.3 Paradas

**Já tem**: guia, formulários, matriz provisória, fila técnica, validação diária, Pareto, MTBF/MTTR/MTBS, recorrência, exports com camada técnica.
**Muda:** lê matriz/componentes/modos/limite só do cadastro (remove `config.matriz`); passa a ler `exports.eventosParada` de Produção e Equipamentos e deduplicar (D5); publica `exports.eventos` validados; cada evento ganha "Abrir OSM" (cria OSM com evento, equipamento, ordem e lote preenchidos) e mostra as OSM ligadas; "Ações" migra para KAS (D3); diagnóstico de sincronização (origem, última leitura, nº de eventos, minutos recebidos, pendentes de classificação, diferença entre módulos).
**Microparada**: uma definição só — código com `classe:'porDuracao'` e `parametros.limiteMicroMin`. Não existe código "MIC" (já inativado com `substituidoPor`).

### 6.4 Equipamentos (novo, era "Máquinas")

**Aprovado por Pedro (05/11/2026), com a regra do OEE por máquina:**
- **OEE de reporte = o da Linha** (ponto de medição, normalmente a última máquina).
- Cada máquina terá **OEE próprio** a partir dos **4 estados**: Produzindo · Parada · Ociosa · Bloqueada. O OEE da máquina **exclui Ociosa e Bloqueada** do tempo (a máquina esperou a anterior ou foi travada pela seguinte); assim aparece o **gargalo do dia** de forma estruturada (a máquina com menor OEE próprio e mais tempo Parada/Produzindo no limite).
- Fonte dos estados: relatório de cada máquina (amostras pendentes) → Equipamentos importa e calcula; Linha continua sendo a referência oficial.
- Até a fase Equipamentos, Tipo e Papel continuam no cadastro (exibidos em maiúsculas no Portal 1.7.2); a troca para Tipo do ativo + Participação no OEE acontece nessa fase, com migração automática.

- Abas: Visão geral (cards por máquina com OEE/D/P, tempo parado, semáforo) · Máquina (ficha do cadastro + fotos/documentos + componentes + indicadores + eventos) · Relatórios de máquina (importação) · Intervalos anormais (sugestão de parada) · Comparativo.
- Indicadores do documento (§ 11.2). MTBF/MTTR vêm do Paradas (não recalcular); OEE por máquina só para ativos com `participacaoOee:'proprio'`.
- **Importação de relatórios de máquina**: um leitor por formato (pendente: amostras de cada máquina, § 9). Intervalo anormal vira evento `EQ-…` sugerido no `exports.eventosParada`.
- A aba Equipamentos do Paradas vira atalho para cá (a análise de falhas continua no Paradas).
- **Campo Papel** (§ 9): substituído por `tipoAtivo` (Linha/ponto de medição · Máquina principal · Equipamento auxiliar · Periférico · Esteira · Motor · Molde · Sistema de inspeção · Utilidade) e `participacaoOee` (`proprio` · `afetaLinha` · `soParadas` · `monitoramento`). Migração: `LINHA` (`papel:'oee'`, `tipo:'linha'`) → Linha/ponto de medição, `proprio`; `EQ01…EQ12` (`papel:'equipamento'`) → Máquina principal, `soParadas` (até haver relatório da máquina). `tipo` e `papel` ficam no arquivo por compatibilidade até todas as páginas lerem os campos novos.

### 6.5 OSM · Observações de Segurança (prioridade atual)

**Corrigido em 05/11/2026**: OSM = observação de segurança, com meta por operador por mês, vários temas e ações tratadas no estilo planner. A arquitetura completa fica em **`claude/osm-arquitetura.md`**. As ideias do documento consolidado sobre status, histórico de eventos, comentários em linha do tempo, Kanban, cobrança e relatórios por pessoa (§ 12.4–12.11) **valem para as ações das OSM**; os campos de máquina, compra e fornecedor do § 12.2 não se aplicam.

### 6.6 KAS e 5S

Iniciativas separadas, cada uma com a sua página, a planejar depois da OSM. Os campos do documento (§ 13) são o ponto de partida do KAS.

### 6.7 Waste (atual Perdas)

1. Nome exibido Waste (D4).
2. **Busca livre** na lista de ordens (ordem, lote, catálogo, material, descrição, competência, status, tipo, máquina, centro de custo, observação), filtrando enquanto digita.
3. **Competência** da ordem vinda de Produção › Ordens; o mês de referência da importação vira `periodoCusto` (D9).
4. **Exclusão lógica** da ordem (justificativa, histórico, restaurar; custos e vínculos preservados).
5. Botão **sair do modo teste** (hoje só a faixa).
6. O detalhe da ordem atual vira a aba **Waste** da ficha comum; a tela própria continua para análise de custo.
7. Destino das ações: em aberto (D3).

### 6.8 Gestão de Gel

1. "Programação e simulador" vira **duas abas**: Programação (calendário, necessidade, lotes, sequência, aderência, dias produtivos, ordens) e Simulador (cenários, volumes, consumo, capacidade, estoque, validade, **Calculadora**, comparações).
2. **Registro de produção** lê de Produção tubos bons por turno, abonos e dias sem produção (fluxo OEE → Gel já aprovado e ainda não feito); o Gel guarda só os complementos dele (pesagens de scrap, barris).
3. Catálogos, turnos, equipamentos e formatos vêm do cadastro (§ 5.2).
4. Paleta de status trocada pelos tokens comuns (hoje `--hold` e laranja próprio).
5. **Aditivo** (§ 9): **tem função** — é o peso do aditivo/spray por tubo em Formatos de tubo e entra na conversão da pesagem de scrap (composições "Tubo completo" e "Tubo + gel + spray"): desconta do peso bruto para chegar ao gel líquido e aparece em "materiais perdidos". Manter; mover para o cadastro `formatos` e mostrar ⓘ explicando isso.

### 6.9 BOM

Já vem só da CS12 com vigência. Falta: linhas e campos em cinza com cadeado na ficha (sem edição manual de itens), selo "SAP CS12 · extraída em · arquivo · por · vigência", e a regra de vigência do § 5.3.

### 6.10 Portal

1. Renomes e módulos novos (D1, D4) com migração do `vac.sistemas`.
2. ⚙ Administração (§ 5).
3. Página inicial por perfil (§ 5.4).
4. Busca global (`exports.indice` de todos).
5. Cards e gráficos com o semáforo central.
6. Botão de saída do modo de teste.
7. Cartão da OSM na Visão geral (meta do mês por operador, ações vencidas) e pendências pelo `exports` da página OSM; KAS e 5S quando existirem.

---

## 7. Relatórios, sincronização e auditoria

### 7.1 Selo de origem (todo relatório e todo painel)
Fonte · última atualização (`exports.geradoEm`) · filtros · competência · nº de registros · pendências de sincronização. Vai junto no PDF/Excel.

### 7.2 Diagnóstico de sincronização (Administração › Diagnóstico)
Para cada par que troca dados (Produção↔Paradas, Produção→Gel, Ordens→Waste, Paradas→Equipamentos): última leitura, nº de itens, totais comparáveis (ex.: minutos de parada por dia), diferenças e o link para resolver.

### 7.3 Auditoria
Cada base mantém a sua (padrão atual). Ações a registrar em todas: criação, alteração, exclusão lógica, mudança de status, fechamento, reabertura, importação, substituição de competência, vigência criada/desativada, restauração de backup, mudança de perfil/permissão. Importações guardam as **linhas originais** para conferência (MB51, COOIS, KKBC, Forms, relatórios de máquina).

### 7.4 Drill-down
Todo gráfico relevante abre os registros que formam a barra/ponto; cada registro abre a ficha (§ 3.5).

---

## 8. Roteiro de atualizações (revisado em 05/11/2026, 08:38 · ordem definida por Pedro)

1. **Waste, antes da reunião** (`Perdas-Ordem.html`, nenhuma outra página muda): relatórios de custo e perdas já definidos (KKBC_ORD), importação por arquivo ou colagem, dados brutos, busca livre em qualquer campo, filtro por competência, localizar ordem/lote/material/status, dashboards e relatórios melhores, detalhe da ordem, exclusão lógica com justificativa e restauração, nome Waste, saída do modo teste; **tudo o que já funciona é preservado**.
   - MB51/COOIS **só se** forem necessários para completar ou validar as ordens, e então como **serviço importador reutilizável** (`vac-ordens-sap`: leitor, regras 101/102, consolidação, cobertura), em bloco de código separado e com dados num bloco próprio da base (`ordensSap`), pronto para ser movido. **Provisório**: o dono final é Produção › Ordens; o Waste passará a consumir a base consolidada de ordens e acrescentar custos, waste, variações, refugo, aproveitamento e dados financeiros.
2. **Portal e Administração**: usuários, perfis, permissões, página inicial, cadastros compartilhados, configurações, vigências, navegação, novos nomes, inclusão de OSM e KAS, **contratos entre todas as bases**. Só depois disso as demais páginas, uma por vez.
3. Produção · 4. Paradas · 5. Equipamentos · 6. OSM · 7. KAS · 8. Gestão de Gel.

## 9. Pontos a validar

| Ponto | Situação |
|---|---|
| Uso do campo **Aditivo** | **Respondido**: alimenta a conversão do scrap pesado (gel líquido e materiais perdidos). Manter e mover para o cadastro (§ 6.8) |
| Uso do campo **Papel** | **Respondido**: `oee` = ponto de medição do OEE (só a LINHA); `equipamento` = recebe paradas. Redundante com `tipo`. Substituir (§ 6.4) |
| Uso da **matriz de paradas** | **Respondido**: oficial no Portal 1.6; cópia provisória no Paradas deve sair (§ 6.3) |
| Limite técnico de microparada | Aberto: 10 min (OEE Definition rev. out/2024) × 5 min (Performance Code set/2023). Confirmar no documento controlado |
| Campos de referência do 102 no MB51 | **Respondido**: o MB51 só mostra 101/102, sem referência. Regra de correspondência exata (§ 6.2) |
| Sigla OSM | **Respondido**: Observação de Segurança (D2) |
| Período fiscal BD = mês civil? | A confirmar (D9) |
| Relatórios e formatos de cada máquina | Precisa de uma amostra exportada de cada máquina |
| Checks do turno que aparecem no calendário | Definir a lista |
| Identificador dos usuários | Matrícula ou ID corporativo? (D10) |
| Identificação em computador compartilhado | Proposta: lista + "Trocar usuário" (D10) |
| Perfis definitivos e permissões | Partir dos 10 perfis do § 5.4 |
| Regras da OSM (válida, meta, temas, quem trata as ações) | Perguntas em `claude/osm-arquitetura.md` § 9 |
| REF/REV, RTB, 3 Hours Delay | Ainda abertos desde `paradas-arquitetura` (D6–D8 daquele documento) |
| Integração Teams/Outlook | Depende de TI (fase 12) |
