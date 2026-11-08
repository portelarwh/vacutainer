# Parecer comparativo e plano único de implementação · Linha Vacutainer

- **Data:** 08/11/2026.
- **Autor:** Claude Code. Responde ao `06-ENCAMINHAMENTO-PLANO-DE-IMPLEMENTACAO.md` (commit `e3dc973`, branch `codex/revisao-consolidada-2026-11-08`).
- **Código examinado:** `e0435136359847e07a2a775a1d7eea31371495b8` (a `main`, conferida de novo hoje e inalterada).
- **Material comparado:**
  - a minha análise, em `c3ae4b0` (`docs/auditorias/diagnostico-2026-11-08/`);
  - a revisão consolidada do Codex, em `e3dc973` (`docs/auditorias/revisao-codex-2026-11-08/`): `00`, `01`, `02`, `03`, `05` e as evidências.
- **Escopo:** somente análise. Nada foi alterado na aplicação, nas bases ou nos documentos; não houve commit nem PR. As conferências desta etapa foram feitas numa cópia isolada da `main`, por inspeção de código.
- **Localização futura sugerida (proposta):** `docs/auditorias/plano-unico-2026-11-08/`.

Convenções:
- **Severidade** é a consequência do problema. **Prioridade** é a ordem recomendada.
  - P1: proteger gravação e recuperação.
  - P2: núcleo das jornadas pedidas.
  - P3: ampliação e manutenção.
- **Tipo:**
  - **[R]** defeito reproduzido em execução;
  - **[I]** defeito confirmado só por inspeção;
  - **[M]** risco de manutenção ou escala;
  - **[P]** proposta de produto.
- **Esforço relativo:** P (pequeno), M (médio), G (grande). É estimativa, não prazo.

---

## 1. Conclusão comparativa

### 1.1 O que corrijo na minha própria análise (o Codex tem razão)

| Afirmação minha (`c3ae4b0`) | Fato no código | Conclusão |
|---|---|---|
| "Paradas: não há busca nem link por ordem" | `buscaPagina` (`Paradas.html:1036-1040`) inclui `e.ordem` na busca | **Discordo de mim.** Falta só a **rota/filtro** por ordem e a ficha integrada |
| "Gel: incluir as LPs no `exports.ordens`" | `gelOrdersCalc` já monta `lps` em cada ordem | **Já atendido** quanto ao campo. Falta cobertura, detalhe por LP e link exato |
| "Passagem de turno: a informação não fica registrada" | Produção tem `ps.note` e o relatório "Passagem de turno" | **Discordo de mim.** A proposta passa a ser **evoluir** o existente (ciência, pendência para o próximo turno) → TUR-01 |
| Waste: "a tela diz 1.8.16" | O rótulo visível usa `APP_VER` (`Perdas-Ordem.html:2365`, mostra 1.8.15); 1.8.16 está só em `PAGE.versao` | **Corrijo:** a divergência é entre `PAGE.versao` (lido pelo Portal) e `APP_VER` (tela, base, `exports`). Não vi o Gel, cujo rótulo está fixo em "v2.01" (`Gel:880`) com o código em 2.04 |
| B4: "à noite, preço, câmbio, meta e turno de amanhã passam a valer" | Nenhuma chamada sem data a `vacVig`, `vacCambio`, `vacPrecoEm`, `vacMetaArea` ou `vacTurnosEm` nas páginas e fontes (busca nesta etapa) | **Corrijo:** o defeito do padrão UTC existe e foi reproduzido, mas é **latente**; nenhum consumidor real foi afetado |
| B5: "o Waste está certo; mesma tabela nas 5 páginas" | `1.234` decimal × milhar depende da fonte; o adaptador SAP do Gel já trata o formato brasileiro (linha 1020) | **Corrijo:** validação **por fonte e campo**, não um resultado único para todo texto. O defeito real é aceitar texto parcial (`12a` → 12) |
| "O sistema está estável" | Só mostrei que não houve erro de JavaScript nos percursos; existem defeitos de gravação | **Corrijo a redação:** "nenhum erro de execução nos cenários percorridos" |
| `verificar.js`: "§4 confirmado", hash de 400 caracteres em C1, "10 de 11" | O § 4 confirma sempre; o hash não mede equivalência; a estabilidade marcada como "não reproduz" é o esperado | **Concordo com o Codex** (AUD-01). As 10 marcações **não são 10 defeitos** |
| B9: "downloads sem liberação no Paradas, Produção e Portal" | `download` da Produção e `downloadBlob` do Portal já liberam a URL | **Corrijo:** ficam os pontos específicos (backup e imagem no Paradas, documentos no Portal) → MEM-01 |
| C3: "a importação da FY27 na Produção sobrou" | `cad_sync.js:172` já encaminha ao Portal quando há metas centrais; o modo local é legado intencional | **Corrijo:** não remover sem decisão (REF-02) |

### 1.2 Onde divirjo do Codex (com evidência)

| Ponto do Codex | Minha posição | Motivo |
|---|---|---|
| Ordem do § 15 do plano mestre: Planner e OSM **antes** da ficha da ordem | **Discordo parcialmente.** Contratos e ficha da ordem vêm **logo depois** da integridade; o núcleo do Planner vem em seguida e a importação de OSM espera a amostra | 1) A integração por ordem é o pedido central e repetido do responsável. 2) Cerca de 80 % dos dados já estão publicados (Waste `porOrdem`, Paradas `eventos[].ordem`, Gel `ordens.lps`, Ordens `porOrdem`, Produção `ordens`), então o retorno é rápido. 3) **A importação de OSM depende de amostra que ainda não existe** (OSM-01: "amostra descaracterizada"). A própria lista de PRs do Codex já põe a ficha (PR-06) antes da OSM (PR-07); o § 15 diverge da lista dele |
| PR-02 junta F04 com F10 | **Ajuste:** F04 vai com F01–F03 | F04 está no mesmo `FolderBackend` da Produção e é recuperação de backup, testada pelo mesmo cenário de pasta simulada. F10 é metadado de versão e combina com F05 e F12 |
| F12/B4 em P2 | **Concordo parcialmente:** severidade **baixa** (latente), mas no mesmo PR de metadados, por ser barato | Nenhum consumidor sem data encontrado (§ 1.1). Corrigir o padrão evita o problema quando alguém chamar sem data |
| 5S (S5-01) só no fim | **Ajuste:** 5S e AM compartilham o **mesmo motor de checklist versionado** | Auditoria 5S e checklist AM/CILT têm a mesma estrutura (padrão versionado → execução com a revisão aplicada → não conformidade → ação). Construir uma vez evita duas implementações |
| Relatório próprio do Paradas | **Concordo** que não espera a fusão dos geradores; entra como PR pequeno e independente | O `Report` do Portal/Waste já serve de modelo (§ 1.3) |

### 1.3 Onde concordo com o Codex e incorporo

- Os novos achados de integridade, **conferidos nesta etapa:**

| Achado | Conferência |
|---|---|
| **F03** | Substituição de competência com backup que falha segue gravando: `ordens_tela.js:38`, `catch` com `console.warn`. O nome tem resolução de minuto e pode se sobrepor |
| **F04** | Duas chaves `readBackup` no mesmo objeto (`OEE-base-2.0.html:1616` e `:1620`). A segunda vence e ignora `legacy`. **Confirmado** |
| **F07** | `loadOrdens` (`Perdas-Ordem.html`) indexa só por ordem; outra competência sobrescreve. **Confirmado** |
| **F08** | O Waste procura o lote no **valor** de `dayLot` com `JSON.stringify(v).includes(lote)` (linha 1616); o lote está na **chave** "dia\|lote". **Confirmado** |
| **F11** | `paginas/lib/` só tem jsPDF e AutoTable; falta o XLSX. **Confirmado** |

- **F06** (verificação de versão do `exports` não uniforme): aceito pela evidência do Codex. Conferi só parte; detalhar no próprio PR.
- **F09** (links de LP e dia sem o item): aceito pela evidência do Codex (`oeeBlock`/`gelBlock`). Detalhar no PR.
- **Minha fila** exige responsabilidade publicada (FIL-01): pendência urgente não é automaticamente "minha".
- **Reunião diária:** declarar granularidades diferentes (OEE diário × Waste por competência × Gel como retrato).
- **OEE por ordem:** não ratear OEE por ordem sem regra de atribuição; `produzido` não basta.
- **Equipamentos:** histórico de falhas não dá "estado atual" nem "gargalo".
- **OSM:** a fonte oficial é importada; status oficial e status da ação local são distintos; não migrar automaticamente as ações de Waste e Paradas.
- **Arquivos:** monitoramento por pasta com arquivo estável, identidade de conteúdo e cobertura; designar estação coletora não é trava.
- **Perfil:** separar permissão funcional de preferência de foco. "Mais" só reúne o que é permitido. Não reabrir o item 5.4 (autenticação).
- **Utilitários:** compartilhar só os de **contrato igual**; não unificar `uid`, `toast` ou `modal` apenas pelo nome (REF-01).

### 1.4 Mapa de equivalência (sem somar listas)

| Minha análise | ID único (backlog do Codex) | Decisão |
|---|---|---|
| B1 | F01 (ampliado com o cache silencioso) | unir |
| B6 | F02 | unir |
| B2 | F05 | unir |
| B3 | F10 (inclui o Gel em 2.01) | unir |
| B4 | F12 | unir (severidade baixa, § 1.2) |
| B5 | F13 | unir (política por campo) |
| B7 | RAS-02 + F08 | unir |
| B8 | MES-03, MES-07, RAS-03 (o `eventoId` vira conciliação por intervalos) | unir |
| B9 | MEM-01 (pontos específicos) | unir |
| B10 | BKP-01 | unir |
| C1 | REF-01 | unir (só contratos iguais) |
| C2 | REF-03 | unir (gradual, sem bloquear outras frentes) |
| C3 | REF-02 | unir (manter o legado) |
| C4 | REF-01 (refino com teste de comportamento) | unir |
| C5 | REF-04 | unir (opcional, P3) |
| § 4 (ficha da ordem) | RAS-01, RAS-02, RAS-03, F06, F07, F09, REL-01 | unir |
| § 5 (Resumo/Detalhado, perfil, Minha fila) | UX-01, UX-02, UX-03, FIL-01, FIL-02 | unir |
| § 6 (funcionalidades por página) | REU-01/02, TUR-01, RIT-01, REL-03, RAS-04, OEE-02 | unir |
| § 7 (páginas em construção) | PLA, OSM, KAS, OEE, S5, TAG, MES, TPM, PROJ | substituído pelo modelo do Codex (OSM importada, TAGs, TPM/AM) |
| Proposta "previsão de falta de gel" | sem ID; incluir como **GEL-01** (novo) | adiar para P3 (cobertura já existe) |
| "Alerta de ritmo" | RIT-01 | unir |
| Script `verificar.js` | AUD-01 | corrigir no primeiro PR de testes (meu material) |

**Considerado já atendido** (não entra como trabalho novo):
- busca por ordem no Paradas;
- campo `lps` no Gel;
- registro e relatório de passagem de turno;
- encaminhamento da FY27 ao Portal no modo central;
- liberação de URL nos downloads comuns da Produção e do Portal;
- a Produção › Ordens já respeita a permissão "importar".

**Descartado:** "remover a importação FY27 da Produção" como proposta imediata (fica REF-02, condicionada a decisão).

**Fora do escopo** (mantido): LIM-01 a LIM-04 (sem API, servidor ou SQL direto; OSM local não é a fonte; sem monitoramento com o computador fechado).

---

## 2. Backlog final por etapa (rastreável)

Situação inicial de todos os itens: **pendente** (nenhum implementado). Cada etapa lista os IDs do `03-PENDENCIAS-E-MELHORIAS.md` e, entre parênteses, os B/C da minha análise.

| Etapa | IDs | Tipo | Severidade | Prioridade |
|---|---|---|---|---|
| E1 · Integridade da Produção › Ordens e backups | F01 (B1), F02 (B6), F03, F04 | [R]/[I] | alta (F01–F03), média (F04) | **P1** |
| E2 · Versões, datas e metas | F10 (B3), F05 (B2), F12 (B4) | [R]/[I] | baixa / média / baixa | P2 |
| E3 · Números por contrato de campo | F13 (B5) | [R] | média | P2 |
| E3b · Biblioteca XLSX local | F11 | [I] | média (instalação sem internet) | P2, **depende do arquivo vindo da linha** |
| E4 · Contratos de integração por ordem | F06, F07, F08, RAS-02, RAS-03 (B7) | [I]/[P] | média | P2 |
| E5 · Ficha da ordem, lote e LP; Ctrl K; rotas | RAS-01, F09, UX-03 (parte), REL-01 (tela) | [P]/[I] | — | P2 |
| E6 · Iniciativas: base e Planner (núcleo) | PLA-01, PLA-02, PLA-03, PLA-05, PLA-06 (mínimo), PLA-08, ARQ-01, ARQ-02 | [P] | — | P2 |
| E7 · OSM importada | OSM-01, OSM-02, OSM-03, OSM-04 (básico) | [P] | — | P2, **depende da amostra** |
| E8 · Ações de OEE e KAS | OEE-01, OEE-02, OEE-03 (básico), KAS-01; depois OEE-04, KAS-02 | [P] | — | P2 / P3 |
| E9 · Importação por pasta (padrão comum) | IMP-01 a IMP-07, IMP-08 (por fonte), HOM-01, IMP-05 (decisão) | [P]/[M] | — | P2 |
| E10 · Minha fila, Reunião diária e telas por perfil | FIL-01, FIL-02, REU-01, REU-02, RAS-05, UX-01, UX-02, TUR-01, RIT-01 | [P] | — | P2 |
| E10b · Relatório do Paradas | REL-03 (Paradas) | [P] | — | P2 (independente) |
| E11 · Equipamentos v1 | TAG-01, TAG-04, TPM-01, TPM-02 (estrutura), TPM-06 (anomalia → OS), ficha e OS | [P] | — | P2 |
| E12 · MES por arquivo, conciliação e cronologia | TAG-02, TAG-03, MES-01 a MES-08 (B8) | [P] | — | P2, **depende de amostras e regras** |
| E13 · AM/TPM com conteúdo, mais 5S | TPM-03, TPM-04, TPM-05, TPM-07, S5-01, REL-03 (TPM) | [P] | — | P2/P3, **depende dos padrões técnicos** |
| E14 · Relatórios e manutenção do código | REL-02, REF-01 a REF-04 (C1–C5), MEM-01 (B9), BKP-01 (B10), AUD-01, RAS-04, GEL-01 (novo) | [M]/[P] | baixa | P3 (BKP-01 P2/P3) |
| E15 · Projetos | PROJ-01, KAS-02 (método de ganho) | [P] | — | P3, **depende do escopo** |
| Decisões sem PR | PLA-04, PLA-07, IMP-05, MES-08, TAG-03, OEE-03 (critério) | decisão | — | antes da etapa correspondente |

Todos os IDs do backlog do Codex estão alocados acima, inclusive os de decisão. LIM-01 a LIM-04 ficam fora.

---

## 3. Plano em etapas e recortes de PR

Regras para todas as etapas:
- mudança cirúrgica e aditiva;
- Produção só por `fontes/producao/` e `build.py`;
- kit só por `fontes/kit/` e `aplicar_kit21.py`;
- versão única por página e `appVersion` gravado;
- documentação da página e registro de decisões atualizados;
- testes novos em `testes/`, com cenário que **falha antes** e **passa depois**;
- suíte completa a cada PR;
- **reversão:** `git revert` do PR. Contratos só aditivos (leitor antigo ignora campo novo). Base nova (`iniciativas-base.json`, `equipamentos-base.json`) não é lida por ninguém se a página voltar atrás.

### E1 · Integridade da Produção › Ordens e backups (PR-1) · **P1 · esforço M**

- **Objetivo:** nunca sobrescrever, sem leitura válida, o arquivo de Ordens de outra estação; nunca dar sucesso sem releitura; nunca substituir competência sem backup.
- **Problema resolvido:** F01, F02, F03 e F04, que causam perda silenciosa de competências SAP e de backups antigos ilegíveis.
- **Escopo:**
  - `readSibling` distingue "não existe" (`vacNaoAchou`) de erro;
  - `Ord.carregar` mostra o cache identificado ("cópia local de dd/mm hh:mm; não é a pasta");
  - `Ord.gravar` bloqueia sem leitura válida, mescla, grava, relê, confere `revId` e mantém a operação pendente se não conferir;
  - backup obrigatório antes de substituir, com nome único (segundos e sufixo);
  - `readBackup` único, que trata o local novo e o legado.
- **Fontes:** `fontes/producao/ordens_tela.js`, `fontes/producao/build.py` (regras de `readSibling` e `readBackup`) → `paginas/OEE-Vacutainer.html` gerado.
- **Dependências:** nenhuma. Pode começar já.
- **Riscos:** alterar o reenvio e a concorrência; duas estações na mesma competência.
- **Mitigação:** operação pendente reaplicável; teste com as duas competências.
- **Aceite:**
  - erro de leitura (permissão, rede, JSON) → zero gravações e aviso;
  - arquivo realmente ausente → criação explícita;
  - releitura divergente → nenhum "gravado" e pendente preservado;
  - backup de substituição que falha → substituição não acontece;
  - dois backups no mesmo minuto não se sobrescrevem;
  - backup legado listado e restaurável.
- **Validação:** novo `testes/tordens.js` (pasta simulada no sistema de arquivos do navegador, falhas injetadas, como o `tbases.js`); `tdiag`, `tz`, `tseguranca`.
- **Homologação externa:** duas estações reais (HOM-01) quando possível; não bloqueia o merge.
- **Incertezas:** nenhuma de negócio.

### E2 · Versões, datas e metas (PR-2) · P2 · esforço P

- **Objetivo:** metadados e regras temporais corretos.
- **Escopo:**
  - **F10:** uma constante por página alimenta o rótulo, `PAGE.versao`, `appVersion` e o `exports` (Waste e Gel; inventário nas 8). Respeitar a ordem de inicialização: derivar `PAGE.versao` da constante, não o contrário.
  - **F05:** meta WASTE-MES pela competência (regra: vigência no último dia do mês, a confirmar; período de vários meses usa a meta de cada mês).
  - **F12:** padrão de data local no kit (`vacHoje`), sem tocar em carimbos de auditoria.
- **Fontes:** `paginas/Perdas-Ordem.html`, `paginas/Gestão-Gel-Vacutainer.html`, `fontes/kit/kit_v21.js` (+ `aplicar_kit21.py` + build).
- **Dependências:** nenhuma. Pode ser feita em paralelo à E1.
- **Riscos:** alterar números históricos do Waste.
- **Mitigação:** o teste compara out/nov com duas vigências; o registro de decisões documenta a mudança.
- **Aceite:**
  - tela, Portal › Versões, base e `exports` com a mesma versão nas 8 páginas;
  - outubro com a meta de outubro;
  - 30/11 às 22h30 (Brasília) com chamada sem data → novembro;
  - data explícita preservada.
- **Validação:** teste de versões (novo, no `tconstrucao` ou `tseguranca`); `trelatorios` (PDF do Waste); `tintegra`.
- **Decisão pendente:** a regra da meta mensal (último dia do mês × média ponderada, se a meta mudar no meio do mês).

### E3 · Números por contrato de campo (PR-3) · P2 · esforço M

- **Objetivo:** recusar texto parcial e deixar explícito como cada campo lê números.
- **Escopo:**
  - leitor estrito com política (separadores, sinal SAP `15-` permitido só nas fontes SAP, unidade, vazio, faixa);
  - aplicado primeiro aos campos digitados do Gel (preço, cotação, kg, cm, tolerâncias, scrap) e aos minutos e ocorrências do Paradas;
  - prévia "= 1.234 kg";
  - adaptador SAP do Gel mantido.
- **Fontes:** Gel, Paradas e o kit (só se a política for comum).
- **Dependências:** nenhuma.
- **Riscos:** mudar o significado de decimal e milhar em dados existentes.
- **Mitigação:** tabela de casos **por campo**; dado já gravado não é reinterpretado.
- **Aceite:** `12a` não prepara gravação e mostra erro no campo; os formatos válidos de hoje continuam iguais; códigos nunca passam pelo leitor.
- **Validação:** testes de formulário real (preço do Gel) e da importação Forms do Paradas; `tg`, `tpg`.

### E3b · XLSX local (PR-3b) · P2 · esforço P · **depende de você**

- **Escopo:** subir `paginas/lib/xlsx.full.min.js` (SheetJS 0.20.3) com a licença; carregamento sem CDN.
- **Bloqueio:** o ambiente de desenvolvimento não alcança cdn.sheetjs.com; o arquivo precisa vir da pasta da linha.
- **Aceite:** instalação limpa, sem internet, importa e exporta Excel nas 5 páginas.

### E4 · Contratos de integração por ordem (PR-4a produtores, PR-4b leitores) · P2 · esforço M+M

- **Objetivo:** cada página publicar, de forma aditiva e com cobertura declarada, o que sabe de cada ordem e lote.
- **Escopo PR-4a (produtores):**
  - **Produção:** `porOrdem` com histórico (janela declarada, ex.: últimas N ordens ou 24 meses, com o campo `cobertura`): lote, catálogo, planejado e real, início e fim, `produzido`, dias do lote (corrige a fonte do F08) e eventos manuais com ID estável (RAS-02). **Sem OEE por ordem** até haver regra.
  - **Paradas:** resumo por ordem (minutos, eventos, equipamentos).
  - **Gel:** cobertura do `ordens` declarada.
  - **Todos:** `geradoEm`, `cobertura`, `origem` (RAS-03).
- **Escopo PR-4b (leitores):**
  - verificação de versão e estrutura em todos os leitores (F06);
  - índice de Ordens por ordem **e** competência, com precedência (F07);
  - Waste lê os dias do lote pelo contrato, com o leitor antigo como reserva até o produtor estar na pasta (F08, B7).
- **Fontes:** `fontes/producao/` (build), `paginas/Paradas.html`, Gel, Waste, Portal (aceitar campos novos no `exportsVersion` 1).
- **Dependências:** E1 (gravação confiável da Produção).
- **Riscos:**
  - quebrar o leitor antigo: mitigado por campos opcionais e testes com pares de versões;
  - aumento do JSON: mitigado por janela e índice.
- **Aceite:**
  - ordem em duas competências não perde dado;
  - ordem fora da janela aparece como "fora da cobertura", não como zero;
  - Portal antigo com `exports` novo continua funcionando;
  - Waste com e sem o campo novo mostra os mesmos dias.
- **Validação:** `tintegra` ampliado (pares de versões), `tdiag`, teste novo de contrato por ordem.
- **Incertezas:** a janela de histórico (decisão simples).

### E5 · Ficha da ordem, do lote e da LP; Ctrl K; rotas (PR-5) · P2 · esforço M

- **Objetivo:** digitar ou clicar a ordem em qualquer página e ver tudo.
- **Escopo:**
  - componente `vac-ficha` no kit (painel lateral);
  - leitor comum de `exports` com cache identificado e data;
  - Ctrl K reconhece ordem, lote, LP, catálogo e equipamento por **índice**, não por quantidade de dígitos;
  - gramática `#ordem=`, `#lote=`, `#lp=`, `&origem=` em todas as páginas;
  - links exatos (F09);
  - cada número leva à página dona filtrada;
  - bloco sem dado aparece em cinza.
- **MVP:** ficha da **ordem** com Resumo, Produção, Paradas, Gel, Waste e SAP (só leitura), aberta pelo Ctrl K e por clique em ordem nas 5 páginas. Lote e LP no PR seguinte.
- **Fontes:** `fontes/kit/kit_v21.js` (+ CSS no `kit_visual.css`), páginas para as rotas, build.
- **Dependências:** E4.
- **Riscos:** recontar números de forma diferente da página dona; reler as bases a cada tecla.
- **Mitigação:** a ficha **só exibe** o que o `exports` traz (sem recalcular); índice por revisão.
- **Aceite:** os números da ficha são iguais aos das páginas donas; funciona sem pasta (pelo cache, com data); o "← voltar" preserva os filtros; ordem com várias competências ou lotes; múltiplas correspondências.
- **Validação:** teste novo de ficha nos 2 temas e em 390 px; `tvisual`.

### E6 · Iniciativas: base e Planner, núcleo (PR-6) · P2 · esforço G

- **Objetivo:** um lugar para tratar ações com dono, prazo, status e histórico, pronto para receber OSM, KAS e OEE.
- **Escopo:**
  - `iniciativas-base.json` (gravação no padrão das bases: ler antes, mesclar, reler, backup);
  - ação com ID local, origem, vínculos (ordem, lote, equipamento, evento), responsável e apoios, prioridade, prazo original e atual, checklist, comentários e evidência (link);
  - eventos de histórico (status, responsável, prazo, prioridade) para o cálculo de tempos (PLA-03, PLA-05);
  - visões Quadro, Lista, Por responsável e Minhas (PLA-02; calendário depois);
  - mudança de status por botão, além de arrastar;
  - **sem migrar** as ações de Waste e Paradas (PLA-08).
- **Fora do MVP:** SLA, dias úteis, regras de prioridade (PLA-04 e PLA-07 são decisões; o MVP mostra as datas e as durações em dias corridos, rotulados).
- **Fontes:** a página deixa o gerador (`fontes/modelo/gerar_paginas.py`) e passa a ser editada direto (regra do `CLAUDE.md` para páginas que começam de verdade); kit.
- **Dependências:** padrão de persistência validado (E1 como referência). **Não depende** de E4, E5, da fusão de relatórios nem do monitoramento de pasta.
- **Riscos:**
  - tempo atribuído à pessoa errada: mitigado pelo histórico por intervalo e não pelo campo atual;
  - concorrência na base nova: mitigada pelo mesmo protocolo de releitura.
- **Aceite:**
  - transferência, espera e reabertura com tempos por responsável e por status corretos (casos de teste);
  - nenhuma cópia de ação entre visões;
  - gravação concorrente sem perda.
- **Validação:** teste novo de Planner (`tbases` adaptado à base nova); `tconstrucao` atualizado.

### E7 · OSM importada (PR-7) · P2 · esforço M · **depende da amostra**

- **Objetivo:** importar as observações da plataforma oficial e tratar as ações localmente, sem perder trabalho na reimportação.
- **Escopo:**
  - importador manual (planilha) com ID oficial, campos de origem, cobertura e hash;
  - reimportação atualiza a origem e preserva ações locais;
  - status oficial × status local, com divergência visível;
  - ausência na planilha não cancela nada;
  - indicadores básicos (abertas, sem ação, defasagem da extração).
- **Dependências:** E6 e **amostra descaracterizada da plataforma oficial** (colunas, ID, status, datas).
- **Riscos:** ID ausente ou repetido.
- **Mitigação:** regra assistida, nunca correspondência aproximada silenciosa.
- **Aceite:**
  - reimportar o mesmo arquivo não duplica;
  - arquivo com status alterado atualiza a origem e mantém as ações;
  - extração parcial não fecha nada;
  - backup antes de aplicar.

### E8 · Ações de OEE e KAS (PR-8) · P2 · esforço M

- **Objetivo:** "Abrir ação de OEE" a partir do Pareto, da recorrência ou do evento em Produção e Paradas, com evidência, sem escrita cruzada.
- **Escopo:**
  - link estruturado para Iniciativas (contexto mínimo: origem, código, equipamento, período, minutos, contagem, referências), com confirmação na página dona;
  - antes de criar, mostrar as ações já ligadas ao mesmo código, equipamento e período;
  - origem OEE separada nos filtros;
  - cadastro de KAS (problema, proposta, baseline, ações, resultado).
- **Fora do MVP:** OEE-04 (eficácia) e KAS-02 (ganho validado), que dependem de método.
- **Dependências:** E6. OEE-03 completo depende de eventos deduplicados (E12); o MVP usa os eventos **validados** do Paradas.
- **Riscos:** ações duplicadas; URL grande demais.
- **Mitigação:** referências em vez de dados completos.
- **Aceite:**
  - a mesma evidência não gera duas ações sem aviso;
  - a ação guarda a fotografia e o link de reconsulta;
  - Produção e Paradas não gravam na base de Iniciativas.

### E9 · Importação por pasta, padrão comum (PR-9 núcleo; um PR por fonte depois) · P2 · esforço G

- **Objetivo:** levar o padrão do Gel (busca periódica, aviso ou importação automática) às outras fontes, com segurança.
- **Escopo do núcleo:**
  - configuração por fonte (pasta, padrão, intervalo, modo desligado/avisar/automático);
  - arquivo estável (ignorar `~$` e arquivos em escrita);
  - identidade de conteúdo (hash);
  - cobertura (retrato completo × incremental);
  - marcar como importado **só depois** de gravar e reler;
  - status (última busca, última importação, erro);
  - retomada ao voltar à página.
- **Primeira fonte:** KKBC do Waste em modo **avisar**, que já tem pasta de entrada e importador maduro.
- **Depois:** Ordens SAP, OSM (depois da E7), MES (depois da E12).
- **Dependências:** E1 (persistência confiável); importador manual validado por fonte.
- **Riscos:** importar arquivo parcial; duas estações importando o mesmo pacote.
- **Mitigação:** estabilidade de tamanho e data, hash, estação coletora designada (IMP-05) e reconciliação na releitura. Não prometer trava.
- **Aceite:** os casos da seção 3 da matriz do Codex (arquivo em escrita, `~$`, renomeado, corrigido, incremental atrasado, extrato parcial, falha de gravação, duas estações).
- **Validação:** teste novo com pasta simulada; HOM-01 na rede real.
- **Decisão pendente:** IMP-05 (qual estação coleta cada fonte).

### E10 · Minha fila, Reunião diária e telas por perfil (PR-10a, 10b e 10c) · P2 · esforço M cada

- **PR-10a · Minha fila:**
  - publicar responsabilidade nas pendências e ações (FIL-01): ID, responsável ou equipe, prazo, status, origem e link;
  - Portal com Minhas / Minha equipe / Sem responsável (FIL-02);
  - visão global de ações, com edição no dono (RAS-05).
  - **Depende de E6** (o Planner é a principal fonte de responsabilidade).
- **PR-10b · Reunião diária:**
  - aba no Portal por dia e turno, com OEE, paradas, gel, waste (na competência certa, rotulada) e ações;
  - pauta, decisões e encaminhamento ao Planner;
  - fotografia da pauta (REU-01, REU-02).
  - **Depende de E4** (contratos) e de E6 (para encaminhar).
  - Reutiliza os geradores atuais; **não espera** a fusão de relatórios.
- **PR-10c · Tela por perfil:**
  - Resumo/Detalhado (mesmos cálculos e filtros);
  - perfil define a aba inicial e o que fica em "Mais" (só o que é permitido);
  - redução de repetição no Waste (UX-01, UX-02);
  - evolução da passagem de turno (TUR-01) e alerta de ritmo por turno, rotulado como projeção (RIT-01).
- **Aceite:**
  - item sem responsável não aparece em "Minhas";
  - Resumo e Detalhado dão os mesmos totais;
  - perfil nunca mostra ação não permitida;
  - a reunião rotula a granularidade de cada número.

### E10b · Relatório do Paradas (PR-10d) · P2 · esforço P

- **Escopo:** relatório do Paradas (Pareto, equipamentos, recorrência) pelo modelo `Report` já usado no Portal e no Waste. Independente das outras etapas.
- **Aceite:** PDF, Excel, texto e Outlook com os testes do `trelatorios`.

### E11 · Equipamentos v1 (PR-11) · P2 · esforço G

- **Objetivo:** ficha do ativo, OS e o cadastro de TAGs, sem inferir estado atual.
- **Escopo:**
  - `equipamentos-base.json`;
  - ficha (cadastro do Portal + histórico de falhas do `exports` do Paradas, rotulado como **histórico**);
  - ordens de serviço (encaminhadas pela fila técnica do Paradas por referência);
  - cadastro de TAGs com propósito, nome no MES, tipo, unidade e vigência (TAG-01, TAG-04);
  - **estrutura** de padrões AM/TPM (TPM-01, TPM-02) e anomalia → OS (TPM-06), **sem conteúdo inventado**.
- **Dependências:** padrão de persistência (E1). **Não depende** de MES nem dos padrões técnicos.
- **Riscos:** mostrar "estado" sem fonte.
- **Mitigação:** sem estado atual nem gargalo nesta etapa.
- **Aceite:**
  - TAG com vigência preservada em revisão;
  - OS ligada ao evento sem cópia;
  - nenhum texto de procedimento inventado.

### E12 · MES por arquivo, conciliação e cronologia (PR-12a, 12b e 12c) · P2 · esforço G · **depende de amostras e regras**

- **Escopo:**
  - adaptador do relatório SQL por arquivo (MES-01), sem mexer no importador atual de caixas e lotes;
  - intervalos normalizados `[início, fim)`, com fronteiras de turno noturno, eventos abertos e lacunas (MES-02);
  - semântica das TAGs (TAG-02, TAG-03);
  - conciliação MES × manual vários-para-vários, com divergência visível (MES-03, MES-04);
  - reimportação e correção sem duplicar e sem realimentar (MES-07);
  - cronologia da linha e por máquina (MES-05);
  - tempos (MES-06);
  - automação só dentro de regra aprovada (MES-08).
- **Dependências:**
  - E11 (TAGs);
  - E4 (eventos manuais publicados);
  - amostras SQL por máquina;
  - regras de impacto no OEE e do ponto oficial de medição.
- **Riscos:** duplicar paradas; inventar horários; alterar dia fechado.
- **Mitigação:** núcleo puro de intervalos com testes de fronteira (MES-02) antes de qualquer tela.
- **Aceite:** os casos do § 8 e do § 9 do plano mestre do Codex (sobreposições, noturno, vários-para-vários, reimportação idempotente, dia fechado com divergência e não com alteração).

### E13 · AM/TPM com conteúdo, mais 5S (PR-13) · P2/P3 · esforço G · **depende dos padrões técnicos**

- **Escopo:**
  - **motor de checklist versionado** (padrão → execução com a revisão aplicada → não conformidade → anomalia ou ação), usado por CILT (TPM-03), Center Line (TPM-04), lubrificação (TPM-05) e auditoria 5S (S5-01);
  - indicadores de cumprimento (TPM-07).
- **Dependências:** E11; procedimentos, pontos, faixas e periodicidades fornecidos pelo responsável.
- **Riscos:** padrão novo alterar execução antiga.
- **Mitigação:** a execução guarda a revisão.
- **Aceite:** checklist antigo mantém a revisão usada; "não aplicável" exige motivo; não conformidade gera anomalia ou OS vinculada.

### E14 · Relatórios e manutenção (contínuo, PRs pequenos) · P3

| Item | O que fazer |
|---|---|
| REL-02 | relatórios por responsável |
| REF-03 (C2) | modelo de documento comum e adaptadores, migrando uma saída por vez |
| REF-01 (C1/C4) | utilitários de contrato igual; refino de funções longas com teste de comportamento |
| REF-02 (C3) | decisão sobre a FY27 legada |
| REF-04 (C5) | fontes do Gel, só se justificar |
| MEM-01 (B9) | URLs do Paradas e do Portal |
| BKP-01 (B10) | última falha e última cópia confirmada do backup diário |
| AUD-01 | corrigir o meu `verificar.js` (critérios reais e escopo explícito) |
| RAS-04 | Gel lendo produção e calendário da Produção |
| GEL-01 | previsão de falta de gel (novo) |

Nenhum bloqueia as etapas acima.

### E15 · Projetos (PR-15) · P3 · **depende do escopo**

- **Escopo:** PROJ-01 (carteira, dono, marcos, benefício esperado × validado) e KAS-02 (método de ganho, sem contar duas vezes).
- **Bloqueio:** escopo definido pela liderança.

---

## 4. Primeira entrega e menor versão útil de cada frente

**Primeira entrega recomendada: E1 (PR-1, integridade de Ordens e backups).**

| Critério | Por que a E1 |
|---|---|
| Risco | maior risco real: perda silenciosa de dados SAP e backups antigos ilegíveis |
| Decisões | nenhuma pendente |
| Base para o resto | o protocolo de gravação dela é o modelo para as bases novas (Iniciativas, Equipamentos) e para o monitoramento de pasta |
| Tamanho | um PR pequeno e revisável |

| Frente | Menor versão útil | Avança sozinha? | Espera o quê |
|---|---|---|---|
| Integridade | E1 | sim | — |
| Metadados e datas | E2 | sim (em paralelo à E1) | regra da meta mensal (decisão rápida) |
| Números | E3 (campos do Gel e do Paradas) | sim | — |
| XLSX local | E3b | — | o arquivo SheetJS 0.20.3 da pasta da linha |
| Ordem integrada | ficha da **ordem** só leitura (E4 → E5) | depois da E1 | janela de histórico (decisão rápida) |
| Planner | E6: ações, histórico, quadro/lista/por responsável, sem SLA | sim (só precisa do padrão de gravação) | PLA-04 e PLA-07 só para a versão completa |
| OSM | E7: importação manual e reimportação segura | depois da E6 | **amostra da plataforma oficial** |
| Ações de OEE | E8 com eventos validados do Paradas | depois da E6 | critério de impacto (OEE-03 completo) |
| Monitoramento de pasta | E9 núcleo + KKBC em modo "avisar" | depois da E1 | estação coletora (IMP-05); homologação em rede real |
| Minha fila | E10a | depois da E6 | — |
| Reunião diária | E10b | depois da E4 (e da E6 para encaminhar) | quem conduz e o recorte (dia ou turno) |
| Telas por perfil | E10c | sim | lista de jornadas por perfil (validar com operador e liderança) |
| Relatório do Paradas | E10b' (PR-10d) | sim | — |
| Equipamentos | E11: ficha + OS + cadastro de TAG + estrutura AM | sim (só o padrão de gravação) | — |
| MES e cronologia | E12 | depois da E11 | **amostras SQL**, regras de impacto, ponto oficial de medição |
| AM/TPM | E13 | depois da E11 | **procedimentos, pontos, faixas, periodicidades** |
| Projetos | E15 | — | **escopo** |

**Pode avançar de forma independente:** E1, E2, E3, E10d, E6 e E11. As duas últimas criam bases novas e só reutilizam o padrão de gravação, sem depender da E4 nem da E5. O Planner e a estrutura de AM **não ficam condicionados** à fusão dos relatórios nem ao MES.

**Precisa esperar:** E5 (pela E4), E7 (pela amostra), E10a (pela E6), E12 (amostras e regras), E13 (padrões) e E15 (escopo).

---

## 5. Avaliação da ordem entre as frentes

| # | Frente | Posição recomendada | Justificativa |
|---|---|---|---|
| 1 | **Integridade** | primeiro | perda de dados reproduzida; base técnica das bases novas e da automação. As duas análises concordam |
| 2 | **Contratos e ordem integrada** | segundo | pedido central do responsável; dados majoritariamente já publicados; a E4 corrige junto F06–F08. **Divergência com o § 15 do Codex**, que punha o Planner antes; a lista de PRs do próprio Codex (PR-05/06 antes do PR-07) já concorda comigo |
| 3 | **Planner (núcleo)** | terceiro, e pode correr em paralelo à 2 se houver capacidade | base nova e independente; habilita OSM, OEE, KAS e Minha fila |
| 4 | **OSM importada** | logo após o Planner, **quando houver amostra** | sem amostra não há importador; o Planner não espera por ela |
| 5 | **Minha fila / Reunião diária** | depois do Planner (fila) e dos contratos (reunião) | precisam de responsabilidade e de números por ordem e dia com granularidade correta |
| 6 | **Monitoramento de pastas** | depois da integridade, **por fonte**, começando pela KKBC em "avisar" | automação sobre gravação insegura multiplica o risco; cada fonte precisa de importador manual validado antes |
| 7 | **Equipamentos/TAGs** | pode começar logo depois da integridade (ficha, OS, cadastro de TAG e estrutura AM) | não precisa do MES; o cadastro conceitual de TAGs prepara o MES |
| 8 | **MES/cronologia** | depois de Equipamentos e dos contratos de eventos manuais, **com amostras** | a conciliação exige eventos manuais publicados (E4), TAGs (E11) e regras |
| 9 | **TPM/AM (conteúdo)** | junto com o 5S, no motor de checklist, **quando os padrões chegarem** | a estrutura já entra na E11; o conteúdo não pode ser inventado |
| 10 | **Projetos** | por último | escopo indefinido |

Comparado com a minha análise anterior (§ 8 de `c3ae4b0`), esta ordem:
- **antecipa** o Planner e Equipamentos v1, que eu tinha deixado para "páginas novas no fim";
- **retira** a fusão dos relatórios como pré-condição;
- **incorpora** as frentes que eu não cobria: importação por pasta, OSM oficial, TAGs, MES e TPM/AM.

Comparado com o Codex, ajusta:
- contratos e ficha antes do Planner;
- F04 junto da E1;
- 5S no motor de AM;
- F12 com severidade baixa.

---

## 6. Amostras e decisões que faltam (por etapa)

| Para | O que é preciso | Quem |
|---|---|---|
| E2 | regra da meta WASTE-MES quando a vigência muda no meio do mês | responsável |
| E3b | o arquivo `xlsx.full.min.js` 0.20.3 e a licença, da pasta da linha | responsável |
| E4 | janela de histórico por ordem (ex.: 24 meses) | responsável |
| E6 | estados do Kanban, reabertura, dias úteis ou corridos, prioridade/SLA (PLA-04, PLA-07). O MVP segue sem isso | responsável e qualidade |
| E7 | **amostra descaracterizada da planilha da plataforma OSM** (colunas, ID, status, datas, cobertura) | SSMA |
| E8 | critério de impacto para priorizar oportunidades de OEE | liderança |
| E9 | estação coletora por fonte; disponibilidade e permissões da pasta | TI e responsável |
| E10 | quem conduz a reunião diária (turno ou dia); jornadas por perfil | liderança |
| E12 | **amostras SQL por máquina**; formato (eventos ou transições); fuso; regras de impacto no OEE; ponto oficial de medição | engenharia e TI |
| E13 | **procedimentos CILT, pontos de Center Line e faixas, pontos de lubrificação, periodicidades, habilitações** | manutenção |
| E15 | escopo de Projetos | liderança |
| REF-02 | se o modo local da FY27 pode ser desligado | responsável |
| BKP-01 | se o aviso de backup diário entra (decisão já registrada como pendente) | responsável |

---

## 7. O que preciso para começar

**Aprovação da etapa E1 (PR-1).** Ela não depende de nenhuma decisão ou amostra.

Se quiser ganhar tempo, a E2 e a E3 podem ser aprovadas junto. São independentes e pequenas, e a E2 só precisa da regra da meta mensal.

Nada será implementado até a sua aprovação.
