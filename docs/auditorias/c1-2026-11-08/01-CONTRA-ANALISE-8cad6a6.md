# Contra-análise da revisão do Codex sobre a `main` 8cad6a6

**Data:** 08/11/2026.

**O que foi examinado:**
- código: `8cad6a6` (merge do PR #16), numa cópia isolada (worktree) sem nenhuma mudança;
- revisão: `64f9794`, branch `codex/auditoria-main-8cad6a6`, que contém só documentos.

**Antes da análise, li:**
- `CLAUDE.md`;
- `docs/auditorias/registro-decisoes.md`, § U em especial;
- o plano único de 08/11/2026;
- os 5 documentos da revisão e o `LEIA-ME.md` das evidências.

**Natureza desta etapa:** só análise.
- Nenhum HTML, fonte, base ou documento do repositório foi alterado.
- Não houve commit nem PR.
- As reproduções rodaram na cópia isolada, com dados fictícios e uma pasta simulada no navegador (OPFS) servida por HTTP local.
- O script é `repro.js`, independente dos scripts do Codex. O resultado está em `repro.json`. Os dois ficam ao lado deste parecer.

---

## 1. Conclusão

| Pergunta | Resposta |
|---|---|
| Os 12 achados procedem? | **Sim, os 12 se reproduzem.** Reproduzi 10 em navegador; AT-08 e AT-09 eu confirmei pela leitura do código, que é inequívoca. Discordo de 3 classificações de gravidade (AT-04, AT-08 e AT-09, abaixo) |
| A revisão deixou algo de fora? | **Sim, 3 extensões:**<br>• o AT-01 e o AT-02 também acontecem no **Paradas** (reproduzidos);<br>• o AT-11 também acontece no **Equipamentos** (reproduzido);<br>• pela leitura do código, a forma de guardar pendências que causa o AT-01 também está no Portal (fila do cadastro e base pendente), no Waste e no Gel. Isso não foi reproduzido |
| Também são minhas | as duas lacunas de teste apontadas, que eu mesmo introduzi: o aceite do Excel no `trelatorios.js:78` passa sempre (`ok(!!fx \|\| true, …)`), e o `tvisual.js:7` ainda trata Iniciativas e Equipamentos como páginas em construção |
| Piloto? | **Sim, piloto assistido**, com 3 regras de uso até a C1 entrar: (1) uma aba por página em cada computador; (2) não usar Iniciativas, Equipamentos e Paradas com a pasta desconectada; (3) conferir a cópia diária em `00. Backups` |
| Ampliação (várias estações, uso diário)? | **Ainda não.** Antes, a C1 (abaixo) e a conferência na pasta real |
| Primeira entrega | **C1**: alterações pendentes guardadas sem perda entre abas (AT-01), base que some não vira base vazia (AT-02), formato desconhecido não é gravado (AT-03) e link de origem só com endereço seguro (AT-11). As quatro usam o mesmo caminho de código, gravar e ler a base. Juntas custam menos e fecham o risco de perder dados |

---

## 2. Os 12 achados

**Legenda:**
- **D-R** = defeito reproduzido em navegador;
- **D-C** = defeito confirmado só no código;
- **Risco** = depende de uma condição externa;
- **Produto** = melhoria.

**Prioridade:** P1 = antes de ampliar o uso; P2 = antes de consolidar o piloto; P3 = depois.

As linhas citadas são de `8cad6a6`.

### AT-01 · Duas abas: uma alteração pendente some · **Concordo e amplio**
- **Evidência:**
  - `Store.init` lê `inic.fila` uma vez (Iniciativas:1161–1162);
  - `cache()` grava a fila inteira por cima (Iniciativas:1177);
  - `commit` chama `cache` (Iniciativas:1183);
  - igual no Equipamentos (1161, 1179, 1183) e no **Paradas** (628, 651).
- **Reprodução:**
  - duas abas sem pasta, uma operação em cada;
  - a fila guardada fica só com a da segunda aba (`AUD-2`);
  - **reproduzido nas três páginas.**
- **Mesma forma, só no código:** Portal, fila do cadastro (`cadFila`, linha 1796) e base pendente (`idb 'base'`); Waste (`IDB.set('base')`); Gel (`fsPending`, linha 1304). Ali o efeito é o mesmo: a última aba a gravar vence, se as duas tiverem pendências.
- **Quando acontece:** com a pasta respondendo, cada aba grava em cerca de 0,6 s e a perda só ocorre se a aba fechar antes disso. O risco real é **sem pasta ou com erro de leitura**, exatamente quando a fila deveria proteger.
- **Tipo / gravidade / prioridade:** D-R · **alta** · **P1**.
- **Solução mais simples:**
  - uma fila durável no kit, `vacFila(pagina)`, no IndexedDB, com **um registro por operação** (chave = id da operação);
  - grava ao confirmar a operação e apaga só depois da releitura que confirma a gravação;
  - ao abrir, lê todos os registros, em ordem de data;
  - o `localStorage` fica só com a cópia de leitura (`*.cache`);
  - na 1ª abertura da versão nova, importa a fila antiga de `localStorage` antes de esvaziá-la;
  - mesmo modelo para a fila do cadastro do Portal e o `fsPending` do Gel.
  - Para Portal e Waste, que guardam a **base inteira** pendente, a correção mínima é outra: avisar quando há outra aba da mesma página com alteração pendente (`BroadcastChannel`), e a 2ª aba não editar enquanto a 1ª não gravar. Não se descarta nada.
- **Aceite:**
  - duas e três abas, sem pasta e com erro de leitura;
  - fechar em qualquer ordem e reabrir: todas as operações presentes uma única vez;
  - depois de gravar na pasta, a fila zera nas duas abas;
  - fila antiga de `localStorage` importada sem duplicar;
  - falha do IndexedDB vira aviso visível ("alteração não protegida neste navegador"), nunca silêncio.

### AT-02 · Base conhecida some e é recriada vazia · **Concordo e amplio**
- **Evidência:**
  - `reload` põe `baseFound=false` quando `ler()` volta `null` (Iniciativas:1173–1175);
  - `save` começa de `vazio()` (Iniciativas:1192; Equipamentos:1191; **Paradas:657**, `vazio()` quando `findBase` volta `null`);
  - `usar()` (Iniciativas:1167, Equipamentos:1167) cria a base em qualquer pasta escolhida, **sem perguntar**. O Portal pergunta ("Criar a base nesta pasta?").
- **Reprodução:** uma base com rev 5 e um registro é lida; o arquivo some; "Gravar" cria um arquivo com rev 1 e 0 registros. **Reproduzido em Iniciativas e Paradas.**
- **Como acontece na prática:**
  - arquivo movido ou apagado por alguém;
  - unidade de rede mapeada para outra cópia;
  - pasta errada escolhida no seletor.
- **Tipo / gravidade / prioridade:** D-R · **alta** (o histórico local deixa de ser recuperável e a substituição passa despercebida) · **P1**.
- **Solução mais simples:**
  - **ao conectar** uma pasta sem a base: perguntar como o Portal (`confirm`);
  - **durante o uso**, a base já foi lida nesta estação (o `localStorage` guarda o último `revId`) e passa a "não existir":
    - não gravar;
    - mostrar "a base sumiu da pasta";
    - oferecer **recriar a partir da cópia deste navegador** (a cópia guardada mais a fila, não `vazio()`) ou **escolher outra pasta**.
  - Vale para Iniciativas, Equipamentos e Paradas.
- **Aceite:**
  - 1ª instalação continua sem pergunta extra além da confirmação;
  - base que some: zero gravações até a decisão;
  - recriar mantém registros, histórico e fila;
  - trocar de pasta não leva dados da pasta anterior sem a pessoa pedir;
  - o mesmo vale com a fila vazia.

### AT-03 · Formato próprio desconhecido é aceito para gravar · **Concordo**
- **Evidência:** `validarBase` (Iniciativas:1135; Equipamentos:1139) não confere `schema` nem `schemaVersion`. O Paradas também não.
- **Reprodução:** uma base com `schema: 'vac-futuro'`, `schemaVersion: 99` e rev 100 recebeu gravação (rev 101).
- **Tipo / gravidade / prioridade:** D-R · **média**. Hoje não existe outra versão do formato, então o risco é futuro, mas real: duas estações com versões diferentes da página na mesma pasta, durante uma atualização · **P1 pelo custo** (o mesmo trecho da C1).
- **Solução mais simples:**
  - uma função no kit, `vacFormatoOk(base, schema, versaoMax)`, chamada no `ler()`:
    - `schema` igual ao da página, ou ausente na base antiga, que é aceita como v1;
    - `schemaVersion` até a versão conhecida;
  - fora disso: só leitura, com o aviso "base gravada por uma versão mais nova da página: atualize".
- **Aceite:** versão suportada grava; `schema` alheio, versão futura ou listas inválidas → zero gravações e o aviso.

### AT-04 · Aba aberta depois da virada do dia não atualiza o resumo · **Concordo parcialmente (gravidade menor)**
- **Evidência:** `vacAoVoltar` só faz `reload` e redesenha (Iniciativas:1213; Equipamentos:1211). A regra do PR #16 está só no `init` e no `save`.
- **Reprodução:** com o resumo (exports) de 2020 na base, voltar à aba não o atualizou.
- **Impacto real menor que o descrito:**
  - a **Minha fila** do Portal calcula o atraso das ações pelo prazo que vem no exports, então não é afetada;
  - a OS programada já publica o atraso com `aPartirDe` (PR #16);
  - o que fica velho:
    - o cartão e as pendências do Portal (ação "vence em" que já venceu);
    - a vigência de TAG que começa no dia.
- **Tipo / gravidade / prioridade:** D-R · **média-baixa** · **P2**.
- **Solução mais simples:** em `vacAoVoltar`, a mesma condição do `init`: se o exports não é de hoje, sem erro de leitura e sem gravação em andamento, chamar `save()`.
- **Aceite:**
  - aba aberta na virada do dia e do mês, ao voltar o foco: resumo de hoje;
  - fila pendente preservada;
  - testes do PR #16 continuam passando.

### AT-05 · Link da anomalia abre o 1º equipamento · **Concordo**
- **Evidência:**
  - o link da pendência é `aba=equip&eq=…` (Equipamentos:1219);
  - na entrada, `#aba=` só aplica a aba e não chama `rota()` (Equipamentos:1374);
  - `rota()` sabe tratar `&eq=` (1360).
- **Reprodução:** abriu EQ01 em vez de EQ03.
- **Tipo / gravidade / prioridade:** D-R · **média** · **P2**.
- **Solução mais simples:** gerar o link `eq=<código>` com `encodeURIComponent`, e manter `#aba=equip&eq=` funcionando chamando `rota()` também quando o endereço começa com `#aba=`.
- **Aceite:** nova janela, mesma aba e página já aberta selecionam a máquina; código com caractere especial não se perde.

### AT-06 · Fora da janela do Paradas aparece como 0 min · **Concordo**
- **Evidência:** `reuDados` (Portal:3193) calcula `min=0` mesmo com `fora=true`; o cartão mostra o número (3210) e o relatório também (3231).
- **Ponto que a revisão menciona de passagem:** o Paradas publica no máximo **3000 eventos** dos 90 dias (`ult90.slice(-3000)`), então mesmo dentro dos 90 dias a lista pode ser parcial.
- **Reprodução:** reunião de 120 dias atrás mostrou "0 min".
- **Tipo / gravidade / prioridade:** D-R · **média** · **P2**.
- **Solução mais simples:**
  - o Paradas publica `eventosCobertura {de, ate, cortado}` (aditivo);
  - fora da cobertura ou com lista cortada, o Portal mostra "—", com "sem dado de paradas para esse dia", e o relatório repete isso.
- **Aceite:**
  - dia coberto e sem paradas = 0;
  - fora da cobertura, base ausente ou lista cortada = "sem dado" na tela, no PDF, no texto e no Excel.

### AT-07 · Ação de grupo com várias ordens liga só a 1ª · **Concordo**
- **Evidência:** a agregação guarda `ordem:e.ordem||''` só do 1º evento (Portal:3196), e o botão usa esse valor (3220).
- **Reprodução:** grupo EQ03·FAL com as ordens 111 e 222 → vínculo só com 111.
- **Tipo / gravidade / prioridade:** D-R · **média** · **P2**.
- **Solução mais simples:** guardar o conjunto das ordens do grupo e criar um vínculo por ordem distinta, na mesma ação (sem duplicar a ação). A fotografia continua com o total.
- **Aceite:** duas ordens, evento sem ordem e ordem repetida: a ficha de cada ordem acha a ação, e os totais não mudam.

### AT-08 · Cache da ficha não considera a pasta · **Concordo parcialmente (gravidade baixa)**
- **Evidência:** o reaproveitamento compara só data e tamanho do arquivo (`kit_v21.js:266`, em `carregar`).
- **Quando acontece:** é preciso trocar de pasta na mesma aba **e** as duas bases terem exatamente o mesmo tamanho e a mesma data. Na prática, só uma cópia recém-feita da mesma pasta, e aí os dados também são iguais.
- **Tipo / gravidade / prioridade:** D-C · **baixa** · **P3**.
- **Solução mais simples:** guardar a pasta usada na última leitura e, se a pasta atual for outra, limpar o que a ficha tem em memória e o índice da busca. A cópia do IndexedDB fica marcada com o nome da pasta.
- **Aceite:** troca de pasta na mesma aba sempre relê; a fonte mostrada é da pasta atual.

### AT-09 · Reconsultar a origem perde o filtro · **Concordo parcialmente (melhoria, não defeito)**
- **Evidência:**
  - `acaoPlanner` (Paradas:1554–1560) monta o link só com aba, equipamento ou evento;
  - na Reunião, o link é `#reuniao`, sem dia nem turno (Portal:3220/3223).
- **Por que não é defeito:** a **fotografia** (período, minutos, ocorrências) fica guardada na ação e é o registro do que motivou. O link é uma conveniência para voltar ao lugar.
- **Tipo / gravidade / prioridade:** Produto · **baixa** · **P3**. A exceção é o link da Reunião com dia e turno, que é barato e pode ir junto com AT-06/07.
- **Solução mais simples:** rotas com o filtro, por exemplo `Paradas.html#pareto=de|ate|eq|turno|cls|dim|k` e `Portal.html#reuniao=AAAA-MM-DD|T1`. Quando a fonte já saiu da janela, o link mostra a fotografia e avisa que o detalhe não está mais disponível.
- **Aceite:** abrir o link em navegador limpo reproduz o filtro, ou diz que o dado saiu da janela.

### AT-10 · Trocar de usuário mantém a Minha fila anterior · **Concordo**
- **Evidência:** `Entrar.entrar` (Portal:3142) só redesenha as abas Visão geral e Cadastros (3150).
- **Reprodução:** entrar como Bia com a fila aberta continuou mostrando a ação da Ana.
- **Tipo / gravidade / prioridade:** D-R · **média** · **P2**.
- **Solução mais simples:** ao trocar de usuário, redesenhar sempre (`App.render()`, que já atualiza o contador). Fazer o mesmo quando `vac.user` muda em outra aba (evento `storage`).
- **Aceite:** trocar pelo "Entrar" ("Ficar no Portal") ou em outra aba atualiza a lista e o contador sem F5.

### AT-11 · Link de origem executa `javascript:` · **Concordo, amplio e subo a gravidade**
- **Evidência:**
  - Iniciativas: o link de origem é escapado mas não tem o protocolo conferido (detalhe, 1286; formulário, 1315);
  - **Equipamentos**, no detalhe da OS, "abrir na origem" (1278), com o mesmo problema, e o dado chega por `#novaOS=`.
- **Reprodução:** clicar executou o script (`__x=1`) **nas duas páginas**.
- **Por que a gravidade é maior:** o script roda **dentro da página, que tem permissão de gravação na pasta**. Um link montado de propósito e enviado por Teams poderia alterar ou apagar registros das bases se a pessoa clicar em "ver na origem". O ataque exige o link montado e o clique.
- **Tipo / gravidade / prioridade:** D-R · **média-alta** · **P1** (a correção custa poucas linhas).
- **Solução mais simples:**
  - uma função no kit, `vacLinkSeguro(url)`, que aceita só:
    - HTML relativo da própria pasta com `#`;
    - `https:`;
    - `file:`;
    - `\\servidor\…`;
  - aplicar ao **receber** (`#nova=`, `#novaOS=`) e ao **mostrar** (ações e OS já gravadas);
  - a política dos links de evidência que já existe passa a usar a mesma função.
- **Aceite:**
  - `javascript:`, `data:` e `vbscript:` nunca viram link, nem em registro antigo;
  - links internos, `https:` e caminhos de rede continuam abrindo.

### AT-12 · Ordem com zeros à esquerda não acha a ação no Planner · **Concordo**
- **Evidência:** a rota `#ordem=` vira busca de texto (Iniciativas:1415; `filtradas`, 1248), enquanto a ficha compara sem os zeros.
- **Reprodução:** `#ordem=000100234567` não lista a ação ligada a `100234567`.
- **Tipo / gravidade / prioridade:** D-R · **média** · **P2**.
- **Solução mais simples:** um filtro próprio, `App.f.ordem`, que compara o vínculo `tipo:'ordem'` com a mesma regra da ficha: sem zeros só para comparar, e o código continua guardado como texto. A busca de texto livre continua separada.
- **Aceite:** ordem com e sem zeros, ordem não numérica, ordem citada só na descrição (não entra) e ordens parecidas (não entram).

### Riscos e lacunas citados pela revisão

| Item | Parecer |
|---|---|
| **R-01** · prazo de 30 min / 500 operações para regravar o que outra estação sobrescreveu | **Concordo.** É risco, não defeito; o limite é conhecido e foi registrado no PR #15. Com a fila durável da C1, guardar os ids das operações confirmadas por **7 dias** (só os ids, que são pequenos) amplia a recuperação quase sem custo. O que não tem solução sem servidor: se aquela estação nunca mais abrir a página, ninguém regrava. Isso deve ficar escrito na regra de uso do piloto |
| **R-02** · responsável guardado pelo nome | **Concordo**, como melhoria (identificador estável da pessoa). Depende de decidir o que fazer com nomes digitados à mão. **P3** |
| **R-03** · janelas de cobertura | **Concordo.** Coberto por AT-06 e pela regra "sem dado não é zero", que já vale na ficha |
| **R-04** · falha do backup diário pouco visível nas páginas novas | **Concordo.** O Portal já tem isso como pendência de decisão. Mostrar a data da última cópia confirmada e a última falha cabe na C5 |
| Aceite do Excel sempre passa (`trelatorios.js:78`) | **Concordo, é meu.** Trocar por: sem `lib/xlsx` → "não verificado (falta a biblioteca)", que não conta como aprovação; com a biblioteca → conferir o arquivo baixado |
| `tvisual.js:7` trata as páginas novas como "em construção" | **Concordo, é meu.** Tirar Iniciativas e Equipamentos da lista de construção e entrar nelas pelo `#teste` |
| XLSX sem internet | **Já conhecido** (E3b). Depende do arquivo da pasta da linha |

---

## 3. Plano único de implementação (substitui C1–C6)

**O que mudou em relação ao Codex:**
- AT-03 e AT-11 entram na **C1**: mesmo trecho de código, e o AT-11 é de segurança;
- a C1 passa a cobrir **Paradas, Portal (fila do cadastro e base pendente), Waste e Gel**, e não só as duas páginas novas;
- AT-08 e AT-09 descem para P3 (C6).

**Princípios mantidos em todas as entregas:**
- operação por arquivos, sem servidor;
- cada página grava só a própria base;
- leitura entre páginas só pelo `exports`;
- códigos como texto;
- vigências imutáveis;
- kit pela fonte mais `aplicar_kit21.py`, e Produção pelo `build.py`.

**Em todas as entregas:**
- teste novo que falha na `main` anterior;
- a suíte inteira rodando;
- versão nova das páginas tocadas;
- registro § U;
- documentação da página.

| # | Entrega | Escopo | Depende de | Risco | Esforço | Validação | Recuperação |
|---|---|---|---|---|---|---|---|
| **C1** | **Proteção das alterações e da base** (P1) | AT-01 (fila durável no kit; Iniciativas, Equipamentos, Paradas, fila do cadastro do Portal, `fsPending` do Gel; aviso de 2ª aba no Portal e no Waste) · AT-02 (confirmação ao conectar; base que some não vira vazia; recriar da cópia local) · AT-03 (`vacFormatoOk`) · AT-11 (`vacLinkSeguro`) · R-01 (ids confirmados por 7 dias) | nada | **Médio**: mexe na gravação de 5 páginas. A importação da fila antiga não pode perder nem duplicar | **G** (a maior). Pode sair em 2 PRs: C1a = Iniciativas, Equipamentos e Paradas (mesmo modelo de gravação); C1b = Portal, Waste e Gel | Teste novo de pendências: 2 e 3 abas, sem pasta, erro de leitura, fechar em qualquer ordem, importação da fila antiga, IndexedDB com falha, base que some com e sem fila, formato futuro e `schema` alheio, links maliciosos e legítimos. Mais a suíte inteira | Bases sem mudança de formato (aditivo). Para voltar: HTMLs da versão anterior; a fila antiga de `localStorage` só é apagada depois da importação conferida, e fica uma versão sem ser usada |
| **H** | **Conferência na pasta real** | Roteiro `03-HOMOLOGACAO-PASTA-REAL.md` do Codex mais os casos da C1: duas abas, base renomeada de propósito, duas estações, retorno depois de 30 min | C1 | — | P (seu tempo) | Registro de cada passo | — |
| **C2** | **Ajustes pequenos de tela e rota** (P2) | AT-04 (`vacAoVoltar`) · AT-05 (link `eq=` e rota na entrada) · AT-10 (redesenhar ao trocar de usuário, e em outra aba) · AT-12 (filtro por vínculo de ordem) | nada (pode correr junto da C1 em outro PR) | Baixo | P | Testes em `tequip`, `tplanner` e `tfila` mais a suíte | Volta a versão anterior; nenhuma base muda |
| **C3** | **Números sem dado ≠ zero e ação de grupo** (P2) | AT-06 (`eventosCobertura` no Paradas; "—" no Portal e no relatório) · AT-07 (vínculo para cada ordem do grupo) · link da Reunião com dia e turno (parte barata do AT-09) | nada | Baixo-médio: muda o que a reunião mostra para dias antigos | P-M | `tfila`, `trelatorios`, `tcontratos` | Campo novo opcional no exports (regra 6) |
| **C4** | **Testes que não enganam** (P2) | Excel "não verificado" em vez de aprovado · `tvisual` com as páginas novas entrando pelo `#teste` · um comando que roda a suíte inteira e diz falhou, passou ou não verificado | nada; o Excel de verdade depende da E3b | Baixo | P | A própria suíte | Só testes |
| **C5** | **Saúde dos dados** (EV-01 + R-04) | Portal › Versões mostra, por página: última leitura, quando o exports foi gerado, cobertura, fila pendente, última cópia diária confirmada e última falha | C1 (a fila durável dá o número de pendências) | Baixo | M | Testes no Portal | Só leitura |
| **C6** | **Refinos** (P3) | AT-08 (cache da ficha por pasta) · AT-09 completo (Pareto reproduzível pelo link) · R-02 (identificador estável da pessoa, se você aprovar) | C1 | Baixo | P-M | `tficha`, `tplanner` | Aditivo |

**Ordem recomendada:**
1. **C1**, com C2 em paralelo se quiser;
2. **H**, a conferência na pasta real;
3. **C3**;
4. **C4**;
5. **C5**;
6. **C6**.

**Critério para ampliar o uso:** C1 entregue, H registrada sem perda, e C2 e C3 entregues ou com a restrição escrita no piloto.

---

## 4. O que já pode avançar e o que depende de você

**Pode avançar sem material:**
- C1 a C6;
- calendário da Produção visível no Portal;
- Gel lendo catálogos e equipamentos do Portal;
- produção e calendário → Gel;
- resumo único do Waste (EV-09);
- agenda de OS com as datas que já existem (EV-06);
- resumo no celular (EV-07), que vale validar com quem usa.

**Depende de material ou decisão sua:**

| Etapa | O que falta |
|---|---|
| **E3b** | o arquivo SheetJS 0.20.3 (com o hash) da pasta da linha |
| **E7 · OSM** | amostra da planilha da plataforma oficial |
| **E9** | qual estação coleta os arquivos |
| **E10c** | lista do que cada perfil usa no dia a dia |
| **E12 · MES** | amostras SQL e regras |
| **E13 · TPM e 5S** | padrões técnicos |
| **E15 · Projetos** | escopo |
| **EV-02 / EV-04** | recorte do relatório por responsável e método de eficácia |
| **R-02** | o que fazer com responsáveis digitados à mão (identificador estável) |
| **C1 · aviso de 2ª aba** | se prefere só avisar ou bloquear a edição na 2ª aba enquanto a 1ª tem pendência. Recomendo **bloquear sem descartar** |

---

## 5. Reprodução

`node repro.js <pasta da cópia de 8cad6a6>` (Playwright e Chromium; HTTP local e OPFS; dados fictícios). Resultado, uma linha por cenário:

```
REPRODUZ  AT-01 Iniciativas / Equipamentos / Paradas · fila guardada só com AUD-2
REPRODUZ  AT-02 Iniciativas / Paradas · rev 5 com 1 registro → depois de sumir e "Gravar": rev 1, 0 registros
REPRODUZ  AT-03 Iniciativas · schema vac-futuro v99 recebeu gravação (rev 101)
REPRODUZ  AT-04 Iniciativas · exports continua de 2020 depois de voltar à aba
REPRODUZ  AT-05 Equipamentos · #aba=equip&eq=EQ03 abriu EQ01
REPRODUZ  AT-06 Portal · 120 dias atrás: 0 min (fora=true)
REPRODUZ  AT-07 Portal · ordens 111 e 222 → ação ligada só a 111
REPRODUZ  AT-10 Portal · depois de entrar como Bia, a fila mostra a da Ana
REPRODUZ  AT-11 Iniciativas / Equipamentos · javascript: executado ao clicar
REPRODUZ  AT-12 Iniciativas · #ordem=000100234567 não lista a ação de 100234567
REPRODUZ  AT-08 kit (código) · reuso compara só data e tamanho
REPRODUZ  AT-09 Paradas (código) · reconsulta sem período, turno e classe
```
