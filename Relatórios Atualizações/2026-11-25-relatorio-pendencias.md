# Relatório de pendências e estado técnico · Vacutainer

> **SUBSTITUÍDO em 26/11/2026** por `2026-11-26-relatorio-estado.md`. Este texto fica como histórico do estado de 25/11.

Data: 25/11/2026 · Repositório: `portelarwh/vacutainer` · Main: `4e36199` (plataforma 1.8.65)
Autor: agente de desenvolvimento (sessão de continuidade que centralizou três chats anteriores).
Destino: revisão técnica por uma contraparte (outro agente). Este documento não contém dados reais; tudo o que foi testado usou dados fictícios.

> **Como ler:** a seção 1 resume; as seções 2 a 4 dizem onde o código está; a seção 5 lista as pendências; a seção 6 lista riscos e achados; a seção 7 diz o que foi e o que **não** foi verificado; a seção 8 traz as perguntas que precisam de resposta técnica.

---

## 1. Resumo executivo

- A **base limpa** (decisão do responsável: o projeto começa sem dados antigos e sem migração) está **na main**: formato único com `schemaVersion` exato, Administração sem importadores, e bloqueio de versão anterior também em Ordens, Waste e Gestão de Gel. Plataforma 1.8.65.
- O responsável quer **a plataforma zerada**: nada de dados de local na base da Produção; tudo cadastrado só na Administração, sem configuração duplicada. Isso **ainda não está feito**: a Produção ainda nasce com estrutura de fábrica. Há um WIP (`wip/producao-vazia`) e uma suíte que mede o impacto. Ver 5.1.
- A **carga por tabela** (importar planilha/colagem do Excel por tabela) foi **adiada** a pedido do responsável. O plano existe (Tasks 6 a 8) e ainda não foi implementado. Tabelas que ele tem: catálogos, equipamentos, BOM (CS12, que já tem importador próprio).
- O **migrador pontual** (uso único) foi construído e validado, mas **não foi incorporado** (decisão: base limpa, sem migração). Ficou como PR de reserva (#155), hoje em conflito.
- **Nada foi homologado** na linha real, em SMB ou com duas estações (H01/H02). **A revisão independente do Codex não foi feita.**

---

## 2. Mapa de PRs, branches e SHAs

| Item | Branch / referência | SHA | Estado |
|---|---|---|---|
| main | `main` | `4e36199` | Contém #149 (squash de 22 commits, incluindo a #156) |
| PR #149 | `ccr-fbd0d12f-k0u7cy` → main | `5effea5` | **Mergeada** (CI 5/5 jobs no head) |
| PR #156 | `wip/bloco2-task5` → branch da #149 | `1a1375d` | **Mergeada** na #149 (CI 5/5) |
| PR #155 | `feat/migrador-pontual` → branch da #149 | `ecd86bc` | **Aberta, rascunho, em conflito** (a base mudou). De reserva; não deve ir para a main |
| `wip/bloco2-task4` | sem PR | `f9fec95` | Já incorporada via #156 |
| `wip/producao-vazia` | sem PR | `a5a9bdc` | **WIP não validado**; Produção nasce vazia. Ver 5.1 |
| Issue #151 | checkpoints do Plano Mestre 2.2 | comentários `7160925529` e `7168373251` | Registro das rodadas |

Conteúdo dos PRs principais:
- **#149/#156 (na main):** `vacFormatoBase` e `vacExportsOk` com versão exata; Administração "Criar cadastro vazio" e permissão por assunto só por `perfil.assuntos`; Produção sem migrações (`Model.ensure` não completa campos, base incompleta é recusada); **Ordens, Waste e Gel** recusam base sem versão ou anterior (consulta, sem gravar) e recusam restaurar cópia anterior; remoção do botão "Trazer ações do Waste"; Gel com perdas teóricas e gel padrão por formato do tubo; SQDCP sem a faixa "Resumo executivo".
- **#155 (reserva):** migrador de uso único (itens M1 a M6, M1b), com pré-voo por hash, backup relido, diário, retomada sem duplicar, **restauração tudo-ou-nada** (recusa tudo se um arquivo mudou depois do corte), roteiro e ensaio fictício em OPFS.

---

## 3. O que está entregue (verificável na main)

1. Formato único: `schemaVersion` exato; base sem versão ou menor abre só para consulta, com o texto exato **"Base de versão anterior. Comece uma base nova nesta pasta."**; base mais nova que o código continua bloqueada como antes.
2. Administração: sem importadores nem conversões; "Criar cadastro vazio"; perfil sem `assuntos` só vê.
3. Produção/Ordens: leitura estrita; importar uma base atual sobre uma bloqueada tira o bloqueio pela gravação normal (releitura, backup, confirmação).
4. Waste (`perdas-base.json`) e Gel (`fifo-base.json`): `vacFormatoBase` na leitura (`readRemote`, `fsReadBase`), na sincronização e na restauração.
5. Plataforma 1.8.65, Administração 1.9.84, Produção 2.6.46, Waste 1.12.21, Gel 2.51; entrada em Novidades; contrato 10 do `CLAUDE.md` reescrito ("começa de base limpa, sem migração").
6. Testes novos: `base-limpa-formato.cjs`, `base-limpa-motores.cjs` (Ordens, Waste e Gel numa pasta OPFS fictícia; **falha com o código antigo**: o Ordens **gravava por cima** de base anterior).

---

## 4. Decisões do responsável (registro)

| Data | Decisão |
|---|---|
| 24/11 | Base limpa; "recadastro só depois do bloco 5"; sem compatibilidade com versões anteriores |
| 25/11 | Aprovou a restauração atômica do migrador |
| 25/11 | Cortar a #149 sem a carga por tabela (Tasks 6 a 8) e fazê-la depois |
| 25/11 | **Começar do zero**: sem migração, sem dados antigos; "como instalar pela primeira vez"; a plataforma é alimentada dia a dia |
| 25/11 | Importação fica para um segundo momento; priorizar "plataforma zerada e pronta para uso" |
| 25/11 | **Nada na base da Produção**; tudo só na Administração; **sem configurações duplicadas** (já alinhado antes: CFG-ADM) |
| 25/11 | Autorizou merges e ajustes necessários para chegar a isso |

---

## 5. Pendências abertas

### 5.1 Produção sem estrutura de fábrica (maior pendência técnica)
**Estado:** toda base nova da Produção chama `Model.seed`, que cria: linha `line_vac` (VAC/Vacutainer), máquina `LINHA` e 12 equipamentos (EQ01 a EQ12), famílias EDTA/SST, 9 catálogos com PPH (360037 a 360060), turnos T1 06:00–14:30, T2 14:30–22:47 e T3 22:47–30:00 (inativo), e os códigos de parada de fábrica (REF, REV, APG, TRC, TRL, SET, 3HD, AJP, LIM, MPL, FME … OUT, RTB). Também `DEFAULT_SETTINGS` traz `unitName: 'BD Curitiba'`, `sector: 'Vacutainer'`, `calendar: 'Segunda a sábado'`.

**O que foi feito (`wip/producao-vazia`, `a5a9bdc`):** os 4 pontos de partida passam a usar `Model.emptyBase(...)` sem `seed`; `unitName`, `sector` e `calendar` ficam vazios. Plataforma sobe sem erro de JavaScript com a base vazia.

**Sonda feita:** base vazia + cadastro do cenário de demonstração + `CadSync.aplicar` resultou em `lines=1 machines=13 families=3 catalogs=4 shifts=3 downtimeCodes=3 targets=0`. Ou seja, o `CadSync` já preenche a estrutura a partir do cadastro da Administração, **sem erro**. Pontos **não verificados** nessa sonda: `targets=0` (metas de OEE: vêm do cadastro ou não?), e por que `catalogs=4` com 3 `catalogos` no cadastro.

**Impacto nos testes (resultado parcial):** a suíte `npm test` (`testes/tudo.js`, 70 suítes) com a base vazia falhou em ao menos 12 de 23 suítes rodadas antes de o processo cair, entre elas `tsqdcp_layout` e `tvisaogeral` (`Cannot read properties of undefined (reading 'id')`). A causa é que muitos testes sobem a página da Produção do zero e **contam com a linha/catálogos/turnos de fábrica**. A suíte foi reiniciada e o número final será acrescentado a este relatório (ver apêndice A).

**Decisões de desenho em aberto** (ver perguntas 8.1 a 8.4):
- Corrigir os testes dando a eles um cadastro de fixture aplicado pelo `CadSync` (refatoração grande) ou manter um gancho de teste.
- Sem códigos de parada de fábrica, **a classificação de paradas só existe depois de cadastrada na Administração**; o contrato 7 proíbe alterar a classificação sem autorização. O responsável autorizou "nada na base da Produção", mas é preciso confirmar o efeito prático.
- A solução estrutural é o **bloco 3 do desenho** (Produção sem cópia: sai o `CadSync`, entra um montador em memória `ProdCad`), prova por `prod-numeros`. O caminho curto (base vazia + `CadSync`) mantém uma **cópia derivada** do cadastro dentro da base da Produção; o responsável não a edita, mas ela existe.

### 5.2 Carga por tabela (adiada)
Plano em `docs/superpowers/plans/2026-11-24-bloco2-base-limpa.md`, Tasks 6 a 8 (objeto `CargaTab` em `motor/portal`: ler arquivo/colagem, prévia novo/alterado/igual/erro, gravar pelo `Cad.ops`, modelo .xlsx, vigências, sub-tabelas, Gel). Tabelas que o responsável tem: **catálogos** (vigências), **equipamentos**, **BOM e CS12**.
- A BOM/CS12 **já tem importador** (Administração › Cadastros › Importar › Lista técnica; `parseCS12`), então a sub-tabela `bom.itens` do plano pode ser cortada.
- Equipamentos hoje só têm a importação do MES (EQP-02).
- **Falta amostra** das planilhas (títulos de colunas e 5 a 10 linhas) para o modelo não inventar colunas.
- Task 8 (entrega: cenário regravado, `PENDENCIAS.md`, `docs/CONTRATO-MOTORES.md`, número de suítes no `CLAUDE.md`) está **parcialmente não feita** (ver 5.5).

### 5.3 Migrador de reserva (#155)
- Conteúdo útil e validado (CI 5/5 em `ecd86bc`): restauração tudo-ou-nada; item **M1b**, que carimba `schemaVersion: 1` no Waste e no Gel, porque a **main antiga não gravava `schemaVersion` nesses dois arquivos** (só `ordens-base.json` gravava).
- Está **em conflito** com a base. Decisão pendente: manter de reserva, fechar, ou atualizar. Não foi incorporada para não levar 3.955 linhas de código de uso único para a main.
- Consequência registrada no contrato 10: pasta gravada pela main antiga (Waste/Gel sem versão) **só abre para consulta**; usar pasta nova.
- O ensaio do corte (`testes/plataforma/migracao-ensaio.cjs`) **não roda no CI** mesmo na #155.

### 5.4 Homologação e revisão (dependem de pessoas/ambiente)
| ID | Pendência | Dono |
|---|---|---|
| H01 | Abrir `Plataforma.html` por `file://` em Chrome/Edge corporativos, sem internet, conferir acentos, conexão da pasta e gravação | Responsável e equipe da linha |
| H02 | Duas estações/abas gravando na mesma pasta de rede (SMB) sem perder dados: filas, conflito, queda, backup, relógios. Os testes usam OPFS e HTTP local, **não SMB** | Responsável e equipe |
| Revisão | **Revisão independente do Codex não feita** em nenhuma das PRs | Contraparte/Codex |
| Vigência de perdas do Gel | Cadastrar na Administração › Gel (sem vigência, o teórico não é calculado e aparece o aviso) | Responsável |
| Fila durável pós-restauração | Não demonstrada: módulos rodam em quadros de origem opaca (IndexedDB inalcançável pelo ensaio) | H02 |

### 5.5 Dívida de documentação e processo
- `PENDENCIAS.md` da main **não** tem linha para a base limpa do bloco 2, e os itens MIG-* só existem na #155.
- `docs/CONTRATO-MOTORES.md` ainda não diz "só a versão atual é lida".
- `CLAUDE.md` cita 71 suítes (21/11); hoje `tudo.js` roda 70.
- `dados/cenario` (demonstração) **não foi regravado** (Task 8, passo 1).
- Artefatos do processo no container do chat antigo (`.superpowers/sdd`: ledgers e relatórios de revisão por tarefa) ficam **fora do git** e podem se perder.
- `docs/BASE-LIMPA.md` (inventário do que saiu) está na main; as tabelas de decisão dependem de revisão cruzada.

### 5.6 Itens de produto já existentes em `PENDENCIAS.md` (não tocados nesta rodada)
Aguardando conferência na pasta real: ADM-01, LOGIN-01, EQP-02, IMP-01, TL-01, UX-20, TOT-01, MAIL-02, SEM-01, LANC-01, TUR-04, TUR-05, UI-02, CFG-ADM, CAD-CONS, MT-01, MAN-01, IMG-01, FORM-02, FORM-03, PAR-BUSCA2, GEL-08, GEL-09, PAR-LOTE, LANC-CAB, LANC-03, LANC-04. Parciais/abertos: TL-03, OP-01, UI-01/CTX-01, PLN-01/EQP-01, REL-01/REL-02, CEN-T2. Dependentes de terceiros: E7, E12, E13, E15, REG-01, H03, H04, H05, MAR-01. Vários desses itens descrevem telas que **mudam de natureza** com a base zerada (por exemplo CFG-ADM, GEL-09, GEL-08); precisam ser reavaliados quando a Produção nascer vazia.

---

## 6. Riscos e achados técnicos

1. **Waste e Gel sem `schemaVersion` na main antiga.** Qualquer pasta gravada antes abre bloqueada. Aceitável pela decisão "começar do zero", mas **sem aviso para o usuário de que precisa de pasta nova**, só o texto do bloqueio.
2. **Valores do local ainda no código:** `ORD_PLANTA = '4017'` (filtro do MB51 em Ordens; linhas de outra planta são descartadas silenciosamente), `DEFAULT_CAUSAS`, `DEFAULT_TIPOS`, `DEFAULT_ALIAS` (Waste), `TAGS_PADRAO` (Linha do tempo), `DEFAULT_PERFIS` (semente por botão). O desenho previa tirá-los nos blocos 3 e 4.
3. **Estrutura de fábrica na Produção** (5.1): enquanto existir, a Administração não é a única origem da verdade em instalação nova.
4. **Testes acoplados à semente:** refatorá-los é trabalho relevante e arriscado para a prova de números (OEE).
5. **`db.timeline`:** a gravação da Produção deixou de criá-lo; a Linha do tempo o completa (`TL.store`). Base sem o bloco continua válida, mas dois testes tiveram de ser atualizados (`pasta.cjs`, `tordens.js`).
6. **Backup de local antigo:** a Produção não lê mais `00. Backups/` solto (só `00. Backups/OEE`). Teste `tordens` atualizado.
7. **Tolerância a falhas do GitHub:** durante a sessão houve 503 do serviço de credenciais (push passou na 7ª tentativa). Todo trabalho local relevante foi enviado em branch.
8. **Cobertura de SMB:** inexistente. Web Locks só coordenam abas do mesmo navegador; outras estações não são vistas.
9. **Conflito entre contratos e o pedido atual:** o contrato 6/7 proíbe mudar fórmulas, turnos e classificação de paradas "sem autorização explícita". Zerar a Produção remove os padrões que definiam turnos e classificação iniciais; a autorização foi dada em chat, mas **não está registrada em documento do repositório**.

---

## 7. Verificação: o que foi e o que não foi rodado

**Rodado e passou (com SHA):**
- `a` #149/#156 na main: CI do GitHub 5/5 (run 45663768045 no head `5effea5`); local: lint, `test:unit`, `tudo.js` 70/70 (exceto `tdiag`, corrigido e passando), `test:plataforma` completo, `test:reprodutibilidade`.
- #155 em `ecd86bc`: CI 5/5; local lint, unit 170, `tudo.js` 70/70, `test:plataforma`, ensaio de restauração.
- Testes novos que **falham no código antigo**: `base-limpa-motores` (Ordens gravava por cima), `migracao-retomar (d)` (restauração parcial).

**Não rodado / não provado:**
- Nada em SMB, nenhuma duas-estações, nenhum navegador corporativo (H01/H02).
- `test:celular`, `mt-celular`, `man-celular` não foram repetidos nesta rodada.
- O `wip/producao-vazia` **não foi validado**; resultado parcial acima.
- A sonda do `CadSync` usou o cadastro de demonstração, não um cadastro real.
- Nenhuma revisão independente (Codex) e nenhum `code-review` formal das PRs.
- Layout/UX da Administração com base vazia (telas vazias, mensagens) **não foi inspecionado visualmente**.

---

## 8. Perguntas técnicas para a contraparte

1. **Produção vazia:** o caminho curto (base vazia + `CadSync` preenchendo do cadastro) é aceitável como etapa intermediária, ou o bloco 3 (`ProdCad`, sem cópia) deve vir antes de qualquer "pode usar"?
2. **Testes:** qual a melhor forma de tirar a dependência da semente em ~70 suítes: (a) fixture de cadastro aplicada pelo `CadSync` em um ponto central, (b) gancho de teste que ainda semeia, (c) regravar o cenário? Qual preserva a prova de números do OEE (`prod-numeros`) com menos risco?
3. **Metas (`targets`) e catálogos:** na sonda, `targets=0` e `catalogs=4` para 3 catálogos de cadastro. As metas de OEE chegam à Produção por outro caminho? Há um catálogo derivado extra (preparação/aditivo)?
4. **Códigos de parada:** sem os de fábrica, o OEE de um dia novo é calculado sem classificação? O comportamento é "ausência não vira zero" (contrato 1) ou há risco de OEE falso?
5. **Planta `4017`:** manter fixa, mover para o cadastro (linha/planta) ou perguntar na importação? Qual o impacto no MB51 e nos números?
6. **Pasta antiga bloqueada:** o texto do bloqueio basta ou a plataforma deve oferecer "criar base nova nesta pasta" (como a Administração já oferece) também em Ordens, Waste e Gel?
7. **#155:** fechar, manter de reserva ou atualizar? O carimbo M1b e a restauração atômica têm valor fora do migrador (por exemplo, restauração de backup do próprio módulo)?
8. **CI:** registrar `migracao-ensaio.cjs` e `base-limpa-motores` no CI está correto (apenas o segundo foi registrado em `scripts/testar-plataforma.mjs`)?
9. **Contratos:** a autorização do responsável para zerar a Produção deve ser registrada em `docs/CONTRATO-MOTORES.md`/`CLAUDE.md`? Em qual formato?
10. **SMB/duas estações:** quais testes automatizados, além de OPFS, seriam críticos antes de uso real (por exemplo simulação de latência e queda no `FolderBackend`)?

---

## Apêndice A · Resultado da suíte `wip/producao-vazia`
A execução foi **interrompida de propósito** com 24 de 70 suítes rodadas e **12 falhas**: `tid_backup`, `ttimeline`, `tlote_origem`, `tpermissoes`, `tcalendario`, `temail`, `tgrade`, `tfechar`, `thh24`, `thh_todos`, `tsqdcp_layout`, `tvisaogeral`. Motivo da interrupção: mudança de rumo (seção 9). O branch `wip/producao-vazia` (`a5a9bdc`) fica salvo, **sem previsão de PR**.

## 9. Atualização de rumo (25/11/2026, noite)

O responsável esclareceu o princípio: **fórmulas e cálculos não mudam; muda só a base de cadastros, centralizada na Administração**. A ordem desejada é: Administração completa e ajustada, depois módulo a módulo, ligando cada um aos cadastros dela; coisas muito específicas podem ter cadastro interno da página; cada página consulta os dados da Administração filtrados para o que importa a ela.

Consequência: o atalho "Produção vazia + `CadSync`" (5.1) **foi abandonado**, porque quebrava ~metade das suítes por depender da semente e seria refeito no bloco 3. O caminho passa a ser o **bloco 3 do desenho** (Produção monta a estrutura em memória a partir do cadastro; sai o `CadSync`; a semente some).

Primeiro passo já entregue: **`testes/plataforma/prod-numeros.cjs`** (referência `testes/amostras/prod-numeros-antes.json`), a rede de segurança que o desenho exige. Captura, no cenário de demonstração, `Engine.computeDay` (agg, officialDaily, r, comp, msgs, por turno, hora a hora) e `Engine.periodResult` (mês e dia a dia). Determinístico (gravado e comparado duas vezes). **Limite:** o cenário tem **apenas 1 dia** de produção (2026-11-09), então a prova cobre um dia; para provar a troca de forma robusta convém ampliar o cenário (ver pergunta 8.2). O SQDCP continua coberto por `tsqdcp_layout`.

## Apêndice B · Comandos de verificação
```bash
npm ci
npm run build
npm run lint
npm run test:unit
NODE_OPTIONS="--require $PWD/testes/http-local.cjs" npm test
npm run test:plataforma
npm run test:reprodutibilidade
node testes/plataforma/base-limpa-motores.cjs
node testes/plataforma/base-limpa-formato.cjs
```
