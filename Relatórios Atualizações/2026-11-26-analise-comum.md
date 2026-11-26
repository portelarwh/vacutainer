# Análise comum das duas auditorias do Vacutainer (26/11/2026)

Etapa de comparação e prova, seguindo a seção 6 do [roteiro](2026-11-26-roteiro-auditoria.md). Preserva as duas auditorias originais, o código do produto e a `main`. Tabela completa: [analise-comum.csv](2026-11-26-analise-comum.csv). Perguntas: [analise-comum-perguntas.md](2026-11-26-analise-comum-perguntas.md). Scripts de prova: `scripts/auditoria/comum/`.

## 1. SHAs analisados e onde reproduzi

| Lado | Revisão | Versão | SHA-256 de Plataforma.html |
|---|---|---|---|
| A (agente de desenvolvimento) | `e22cb92` | 1.8.71 | o mesmo conteúdo de `a9d28b5` (a diferença entre os dois commits é só documentação e scripts: `git diff --name-only e22cb92 a9d28b5` não lista `Plataforma.html`) |
| B (contraparte) | `a9d28b5` | 1.8.71 | `e3e6f70bd4a2…cef6ea` (conferido: o arquivo do worktree tem o mesmo hash que a B declarou) |
| Main atual | `4046d24` | 1.8.72 | `e4805ef4ef4e…f40d` (PR #164: mensagem de permissão, celular, modelo de acesso) |

Cada prova rodou nos dois SHAs (`a9d28b5` e `4046d24`), em worktrees separados e com as bases fictícias que o próprio SHA gera. As correções do PR #165 (1.8.73: fuso, paradas simultâneas, dado impossível) **ainda não estão na main**: onde cito "corrigido no PR #165", o teste novo falha em `4046d24` e passa na branch do PR.

## 2. Como ler as provas

- **Execução** = rodei no Chromium com Playwright, dados fictícios (demonstração ou pasta OPFS). **Leitura** = li o código no SHA indicado, sem executar a falha. **Estática** = busca no arquivo.
- **Tudo o que rodou é local: Chromium com OPFS.** Nenhuma prova desta etapa vale como homologação em SMB ou com duas estações. Nos casos B01 a B04 (persistência) a concorrência é simulada de forma determinística, trocando o arquivo na janela entre a leitura e a gravação ou negando uma leitura; prova que o código não protege aquela janela, não que ela ocorra com frequência na rede.
- "Reproduz em" diz se o defeito aparece naquele SHA. "Não verificado" quer dizer que não tentei, não que não existe.

## 3. Placar

- **59 linhas comuns** cobrindo os 37 IDs da A e os 44 IDs da B (cobertura conferida por script: nenhum ID ficou de fora).
- Classificação: **18 Convergentes**, **37 Só um viu** (28 só da B e 9 só da A), **4 Divergentes**.
- Respostas aos 29 achados que só a B viu: Confirmo: 20; Não verificado: 6; Confirmo a tendência: 1; Já coberto por testes/plataforma/permissoes-paridade.cjs: 1; Confirmo em parte: 1.
- A B afirmou 7 críticos; **os 7 se confirmam**, mas proponho **rebaixar 2 para Alta** (C11 e C13) pelas razões da seção 5.

## 4. Os sete críticos da contraparte

| ID B | Linha comum | Veredito | Prova | Gravidade B → consolidada |
|---|---|---|---|---|
| A01 | C01 | Confirmado nos dois SHAs | `a01.cjs` (Execução (Chromium, demonstração)) | Crítica → Crítica |
| B01 | C10 | Confirmado nos dois SHAs | `b01.cjs` (Execução (Chromium/OPFS; sem SMB)) | Crítica → Crítica |
| B02 | C11 | Confirmado nos dois SHAs | `b02.cjs` (Execução (OPFS)) | Crítica → Alta |
| B03 | C12 | Confirmado nos dois SHAs | `b03.cjs` (Execução (janela simulada de forma determinística)) | Crítica → Crítica |
| B04 | C13 | Confirmado nos dois SHAs | `b04.cjs` (Execução (OPFS)) | Crítica → Alta |
| F01 | C29 | Confirmado nos dois SHAs | `f01b.cjs` (Execução (prévia e XLSX real)) | Crítica → Crítica |
| F03 | C31 | Confirmado nos dois SHAs | `f03.cjs` (Execução) | Crítica → Crítica |

Observações:
- **F03** é a correção mais barata e de maior retorno (um `if` no modelo "Lista de paradas").
- **A01 (B)** exige decisão (pergunta P2): a distinção ausência/zero atravessa Visão da linha, relatórios e exports.
- **B01 (B)** tem causa única e localizada: `fsReadBase` trata qualquer erro de abertura como "arquivo ausente".

## 5. Divergências

### Resolvidas com prova

| Linha | Divergência | Resolução |
|---|---|---|
| C03 | Scrap negativo: A Baixa, B Alta | Média. O `Actions` aceita (o teste do PR #165 falha na main); não provei que o campo da tela aceite o sinal. O número publicado fica errado em silêncio. |
| C04 | Paradas duplicadas ou maiores que o turno: A Média (A02 Alta), B Alta | Média. A tela (`validateEvent`) já barra parada fora do turno e sobreposta; só chega por importação ou dado externo. A B provou o motor, não o formulário. A Alta da A02 estava exagerada e foi corrigida no relatório A. |
| C05 | A A05: "0 NaN/Infinity em 700+ cenários". B: Infinity/NaN com `Number.MAX_VALUE` | Os dois estão certos no que testaram (magnitudes industriais × extremo de ponto flutuante). Reproduzido nos dois SHAs. Baixa: fora da escala real e já barrado no lançamento pelo limite do PR #165. |
| C17 | A C01: a auditoria guarda nome e ID. B C01: Waste e Administração não guardam o ID | A B tem razão: entradas `{t,u,a,d}` sem ID no Waste e na Administração (execução, `c01.cjs`). A afirmação da A vale só para a Produção. Média. |
| C29 | A A06: tela e Excel reconciliam. B F01: 0,5 vira 50,0% no Excel | A B tem razão para valores não inteiros entre -1,5 e 1,5; a A06 só comparou números maiores. Crítica. |
| C11 | Gravidade de B02 (B): Crítica | Mecanismo confirmado, proponho **Alta**: a rota de conexão checa o formato (`vacFormatoBase`); só o `sync` de pendência não checa, e exige pendência, mesma revisão e base de outro schema. **Aguarda aceitação da B.** |
| C13 | Gravidade de B04 (B): Crítica | Confirmado, proponho **Alta**: exige a ação deliberada de restaurar. Fere os contratos 3 e 10. **Aguarda aceitação da B.** |

### Pendentes

| Linha | Divergência | O que falta |
|---|---|---|
| C21 | Modelo de acesso: A Média/Baixa, B Alta (suspeita) | Resposta do responsável à pergunta P1; não há o que provar por execução. |
| C34 | Tempo de abertura: A 0,5 a 0,9 s, B 1,1 a 3,2 s | Baseline em estação alvo (máquina e carga das duas medições diferem). |
| C16 / C37 | SMB, duas estações e abertura em rede: ninguém provou | Homologação física (pasta de rede real, duas estações, desconexão durante a gravação). |
| C11, C13 | Gravidade proposta Alta contra Crítica da B | Aceite ou contraprova da B. |

## 6. Respostas aos achados que só a contraparte viu

| ID B | Linha | Resposta | Método | Prova resumida |
|---|---|---|---|---|
| A01 | C01 | Confirmo | Execução (Chromium, demonstração) | node scripts/auditoria/comum/a01.cjs <wt> em a9d28b5 e 4046d24: dia demo, good=null nos 17 intervalos → agg.goodMissing=17, mas porDia.boa=0, oee=0, sem campo de ausência (chaves: dia,oee,oeeMeta,boa,scrap,metaOp,cap,metaDec,status,origem); idêntico ao zero ex |
| A04 | C05 | Confirmo | Execução | node scripts/auditoria/comum/p1.cjs <wt>: duas quantidades Number.MAX_VALUE → agg.good e agg.goodMin = Infinity (2 campos no agg; a B contou 18 em todo o resultado), em a9d28b5 e 4046d24. |
| B01 | C10 | Confirmo | Execução (Chromium/OPFS; sem SMB) | node scripts/auditoria/comum/b01.cjs <wt> em a9d28b5 e 4046d24: pasta OPFS, base rev 1; arquivo trocado para rev 8 com campo externo; uma leitura recebe NotAllowedError → rev final 2, sem o campo externo, fila vazia. Controle sem a negação: rev 9 com os dois c |
| B02 | C11 | Confirmo (o mecanismo) | Execução (OPFS) | node scripts/auditoria/comum/b02.cjs <wt> em a9d28b5 e 4046d24: pendência com a mesma revisão e arquivo em schema 99 com campo novo → sync grava schema 1, apaga o campo, zera a pendência. |
| B03 | C12 | Confirmo | Execução (janela simulada de forma determinística) | node scripts/auditoria/comum/b03.cjs <wt> em a9d28b5 e 4046d24: outra escrita injetada depois da pré-leitura → arquivo final com a alteração local e sem a externa; pendência limpa. O Gel confere a gravação e regrava até 3 vezes; o Waste não. |
| B04 | C13 | Confirmo | Execução (OPFS) | node scripts/auditoria/comum/b04.cjs <wt> em a9d28b5 e 4046d24: backup sem schemaVersion é aceito e a base sai em schema 1 (rev 2); Store.queue de 1 operação passa a 0. A fila durável (IndexedDB) não foi inspecionada à parte. |
| B05 | C14 | Confirmo (por leitura) | Leitura de código | Leitura do código em 4046d24: const chave = p => 'vac.backup.' + p, só módulo. Não reproduzi com duas pastas. |
| B06 | C15 | Confirmo (por leitura) | Leitura de código | O próprio código diz: "o diário é rotina (falha só avisa no console)" e só dá console.warn; o contrato 9 manda o resultado para vacBackupRegistro. Não executei a falha. |
| C02 | C18 | Confirmo (por leitura) | Leitura de código | Leitura: if(B.audit.length>3000) splice… em perdas e portal (4046d24). |
| D01 | C24 | Não verificado nesta etapa | - | Não executei conteúdo ativo (a B também não). Falta caracterizar o comportamento do Chrome/Edge corporativo. |
| E01 | C28 | Confirmo (por leitura) | Leitura de código | pickFile só escuta onchange (leitura); não executei o cancelamento. |
| E02 | C20 | Confirmo (o estado final) | Execução (OPFS) | node scripts/auditoria/comum/e02c.cjs e e02d.cjs <wt> em a9d28b5 e 4046d24: pasta com vacutainer-cadastros.json de 0 bytes → tela "Cadastro não encontrado… Unexpected end of JSON input"; "Criar o cadastro inicial" abre a Administração presa em "Preparando o mó |
| F01 | C29 | Confirmo | Execução (prévia e XLSX real) | node scripts/auditoria/comum/f01b.cjs <wt> em a9d28b5 e 4046d24: modelo Hora a hora, produção 0,5 mil → prévia "0,5"; XLSX F2=0.5 com formato 0.0% (50.0%). Regra no código: célula numérica entre -1,5 e 1,5 não inteira recebe 0.0%. |
| F02 | C30 | Confirmo | Execução | node scripts/auditoria/comum/f01b.cjs <wt>: catálogo "00123" aparece "00123" na prévia e como número 123 (D2, t=n) no XLSX, em a9d28b5 e 4046d24; num() converte /^\d+$/ em número. Vale também para Lote, Catálogo e Ordem em Lotes do MES. |
| F03 | C31 | Confirmo | Execução | node scripts/auditoria/comum/f03.cjs <wt> em a9d28b5 e 4046d24: um evento FME de catálogo da família SST; com família EDTA, CIT ou SST a linha e o total de 30 min aparecem igual (o modelo "hora" filtra por família; "paradas" só filtra turno e catálogo). |
| F04 | C32 | Confirmo | Execução | node scripts/auditoria/comum/p2.cjs <wt> em a9d28b5: o lote 6275187 (06:01 a 22:08, 881 caixas) sai idêntico sem filtro e com "3º Turno"; só o rótulo muda. |
| G02 | C35 | Não verificado nesta etapa | - | Exige 12 ciclos com CDP e perfil de heap; não repeti. |
| G03 | C36 | Confirmo a tendência; não reproduzo a magnitude | Execução | node scripts/auditoria/comum/p1.cjs <wt> (30/365/730 dias): 5-7 / 113-146 / 256-272 ms na 1ª chamada e 1 / 34 / 136 ms na 2ª, em a9d28b5 e 4046d24 (a B mediu 9 / 202 / 1005 ms). |
| H02 | C41 | Já coberto por testes/plataforma/permissoes-paridade.cjs | Existência do teste | O teste prova que as duas coincidem hoje (9 módulos, 7 ações); não prova que um defeito foi corrigido, porque não há defeito: o risco é de manutenção. |
| H03 | C42 | Não verificado nesta etapa | - | Não rodei os dois parsers; o fluxo padrão leva a importação à Administração, como a B ressalva. |
| I07 | C46 | Confirmo em parte | Leitura de código | loadXLSX do motor/oee ainda lista lib/xlsx.full.min.js e três CDNs como tentativas (leitura). O texto da tela não foi aberto por mim. |
| J02 | C50 | Confirmo (por leitura) | Leitura de código | O modal tem foco inicial, retorno do foco e Escape, mas não contém a tabulação (sem laço de Tab); não executei a jornada. |
| J03 | C51 | Não verificado nesta etapa | - | Jornada por toque a 390 px não repetida. |
| K01 | C52 | Não verificado nesta etapa | - | Medição de contraste não repetida. |
| K02 | C53 | Não verificado nesta etapa | - | Escala do viewBox não repetida. |
| K03 | C54 | Confirmo | Execução | node scripts/auditoria/comum/k03.cjs <wt> em a9d28b5 e 4046d24: 390 px, font-size computado 11px nos temas claro e escuro. |
| L01 | C56 | Confirmo | Leitura | PENDENCIAS.md linha 15 registra E9 como encerrado em 21/11; docs/PLANO-DE-MELHORIAS.md linha 35 ainda o cita como dependência. |
| L02 | C57 | Confirmo | Leitura | A linha BLOCO-3B ainda traz "Falta decidir/autorizar" para itens que CONTRATO7-AUT registra como autorizados em 26/11. |
| L03 | C58 | Confirmo | Leitura | Linha 15 (encerrados) e linha 64 (REL-01 / REL-02 Parcial). |

Nenhum dos achados exclusivos da B foi respondido como "não reproduzo" por completo. Duas respostas parciais: **C36 (G03)**, tendência confirmada e magnitude 4 vezes menor nesta máquina; **C05 (A04)**, reproduzido, mas Baixa.
Cobertura por teste existente: só **C41 (H02)** tem teste anterior (`permissoes-paridade.cjs`), e ele **comprova a paridade**, não a correção de um defeito, porque ali não há defeito, só risco de manutenção.

## 7. Achados que só o agente de desenvolvimento viu

Aguardam o reexame da contraparte ("confirmo / não reproduzo / já coberto"): C06 (fuso), C07 (intervalo invertido), C19, C23, C33, C47, C48, C49, C59. Para C06 e C47 já existe teste (`fuso-planta.cjs`, `celular-lancamento.cjs`) que falha sem a correção.

## 8. Correções que faço à própria auditoria A

1. **A02 não era Alta**: a tela já barra parada fora do turno e sobreposta; só chega por importação. Reclassificada para Média (já corrigido no relatório A).
2. **A05/A06 foram afirmadas de forma ampla demais**: "tela e Excel reconciliam" não vale para valores decimais pequenos (C29), nem "sem NaN/Infinity" para magnitudes extremas (C05), e a "ausência" nunca foi exercitada (C01).
3. **C01 (auditoria "com ID")** vale só para a Produção (C17).
4. **A10 (intervalo invertido)** foi listado como feito na linha `AUDITORIA-26-11` de `PENDENCIAS.md`, mas o PR #165 **não o trata**. O texto será corrigido no PR #165 e a linha C07 fica aberta.

## 9. Roadmap único

Ordem: classe (Correção Crítica, Importante, Melhoria, Evolução) e, dentro dela, gravidade × benefício ÷ esforço (Crítica 4, Alta 3, Média 2, Baixa 1; Alto 3, Médio 2, Baixo 1; P 1, M 2, G 3). Itens já corrigidos ou em PR estão na seção 9.1.

### Correção Crítica (5)

| # | Linha | Item | Grav. | Esf. | Ben. | Quem viu | Situação |
|---|---|---|---|---|---|---|---|
| 1 | C31 | Lista de paradas não aplica o filtro de família | Crítica | P | Alto | B | Confirmado, aberto |
| 2 | C01 | Produção ausente (em branco) vira zero no resumo publicado (porDia): boa=0 e OEE=0, sem marcar  | Crítica | M | Alto | B | Confirmado, aberto |
| 3 | C10 | Gel: leitura transitória negada permite gravar por cima de uma revisão mais nova com o cache an | Crítica | M | Alto | B | Confirmado, aberto |
| 4 | C29 | Excel exibe quantidade decimal como porcentagem (0,5 mil vira 50,0%) | Crítica | M | Alto | B | Confirmado, aberto |
| 5 | C12 | Waste: alteração externa entre a releitura e a gravação é perdida | Crítica | G | Alto | B | Confirmado, aberto |

### Correção Importante (18)

| # | Linha | Item | Grav. | Esf. | Ben. | Quem viu | Situação |
|---|---|---|---|---|---|---|---|
| 6 | C15 | Ordens: falha do backup diário não vai para o registro de backup | Alta | P | Alto | B | Confirmado por leitura; execução pendente |
| 7 | C24 | Anexos de equipamento abertos como Blob sem limite de tipo | Alta (suspeita) | P | Alto | B | Suspeita, aberta |
| 8 | C52 | Rótulos brancos das barras do Gel perdem contraste no tema escuro (1,80:1) | Média | P | Alto | B | Suspeita, aberta |
| 9 | C11 | Administração: sincronização de pendência grava sobre base de outro schema | Alta | M | Alto | B | Confirmado, aberto |
| 10 | C13 | Paradas: restauração aceita backup sem schemaVersion e descarta a fila pendente | Alta | M | Alto | B | Confirmado, aberto |
| 11 | C14 | Status local de backup mistura duas pastas (chave sem escopo da pasta) | Alta | M | Alto | B | Confirmado por leitura; execução pendente |
| 12 | C16 | SMB e duas estações não provados; Web Locks só cobrem o mesmo navegador | Alta | M | Alto | A+B | Suspeita, aberta (homologação física) |
| 13 | C20 | Interromper a primeira gravação deixa cadastro de zero byte e a plataforma não se recupera sozi | Alta | M | Alto | B | Confirmado, aberto |
| 14 | C30 | Excel converte códigos e identificadores em número e perde zeros à esquerda | Alta | M | Alto | B | Confirmado, aberto |
| 15 | C32 | Lotes do MES exibe filtro de turno sem aplicar o recorte | Alta | M | Alto | B | Confirmado (defeito); regra de atribuição depende da pergunt |
| 16 | C07 | Intervalo com início igual ou depois do fim é ignorado em silêncio no tempo líquido | Média | P | Médio | A | ABERTO (não corrigido; a linha AUDITORIA-26-11 de PENDENCIAS |
| 17 | C56 | O plano ainda lista a coleta automática por pasta (E9) após a decisão de manter a importação ma | Média | P | Médio | B | Confirmado, aberto |
| 18 | C57 | A lista oficial ainda pede autorizações que aparecem como concedidas | Média | P | Médio | B | Confirmado, aberto |
| 19 | C17 | Trilha de auditoria de Waste e Administração sem ID da pessoa | Média | M | Alto | A+B | Confirmado, aberto |
| 20 | C50 | Foco sai do diálogo de metas da Produção ao navegar por teclado | Média | M | Alto | B | Confirmado por leitura |
| 21 | C51 | Confirmar a produção por hora volta a tabela para a esquerda e recorta o campo seguinte (celula | Média | M | Alto | B | Suspeita, aberta |
| 22 | C53 | Gráfico OEE por dia do Gel reduz rótulos a cerca de 2,5 px no celular | Média | M | Alto | B | Suspeita, aberta |
| 23 | C25 | Cobertura da guarda de gravação em fluxo aberto (perda de sessão durante a gravação) | Média | M | Médio | A+B | Parcial: mensagem corrigida (#164); caso de sessão perdida e |

### Melhoria (23)

| # | Linha | Item | Grav. | Esf. | Ben. | Quem viu | Situação |
|---|---|---|---|---|---|---|---|
| 24 | C48 | Mensagens técnicas do navegador chegam ao usuário na falha de pasta | Média | P | Médio | A | Parcial (#164) |
| 25 | C44 | Lint padrão não cobre o JavaScript do aplicativo; 370 catch vazios; mais de 800 comparações fro | Média | M | Alto | A+B | Aberto |
| 26 | C08 | Cenário combinado (vários dias, madrugada, hora extra, parada na virada) sem teste de conjunto; | Média | M | Médio | A+B | Suspeita, aberta |
| 27 | C18 | Histórico ativo cortado por contagem (3.000 no Waste e na Administração, 5.000 nas Ordens) | Média | M | Médio | B | Confirmado por leitura |
| 28 | C28 | Cancelar o seletor de arquivo da Produção deixa a promessa pendente | Baixa | P | Médio | B | Confirmado por leitura |
| 29 | C33 | PDF e CSV de Gel, Waste, Paradas e importações (MES, Forms, SAP) não verificados | Média | M | Médio | A | Lacuna comum |
| 30 | C35 | Navegação repetida retém nós e listeners após coleta forçada | Média | M | Médio | B | Suspeita, aberta |
| 31 | C37 | Abertura em pasta de rede e do arquivo de 7,3 MB não medidas | Média | M | Médio | A+B | Lacuna comum |
| 32 | C42 | Dois leitores da Meta OEE FY27 reconhecem famílias diferentes (FX1 aceito na Administração, rec | Média | M | Médio | B | Suspeita, aberta |
| 33 | C43 | Código morto: 31 símbolos sem referência; renderSysNav_v1 ×9; ramo if(false) no painel do Waste | Baixa | P | Médio | A+B | Aberto |
| 34 | C46 | Instrução de importação manda localizar SheetJS ao lado do HTML ou na internet | Baixa | P | Médio | B | Confirmado em parte |
| 35 | C54 | Descrições dos cartões da Central de importações com 11 px no celular | Baixa | P | Médio | B | Confirmado, aberto |
| 36 | C58 | REL-01 aparece como encerrado e como parcial na mesma lista | Baixa | P | Médio | B | Confirmado, aberto |
| 37 | C05 | Valores finitos extremos (Number.MAX_VALUE) viram Infinity e NaN | Baixa | P | Baixo | B | Confirmado, aberto |
| 38 | C19 | Edições seguidas do mesmo campo pelo mesmo usuário viram um registro só | Baixa | P | Baixo | A | Aberto |
| 39 | C23 | document.write em 3 relatórios (título escapado) | Baixa | P | Baixo | A | Aberto |
| 40 | C26 | Chave duplicada idêntica "ampliar" no objeto de ícones | Baixa | P | Baixo | A+B | Aberto |
| 41 | C27 | Auto-atribuição S.shiftId = S.shiftId na troca de data da Linha do tempo | Baixa | P | Baixo | A+B | Aberto |
| 42 | C34 | Abertura dos motores: A mediu 0,5 a 0,9 s; B mediu 1,1 a 3,2 s no primeiro ciclo | Baixa | M | Médio | A+B | Pendente de baseline em estação alvo |
| 43 | C36 | Consolidado de Produção cresce com os dias (busca linear de vizinhos) | Baixa | M | Médio | B | Confirmado, baixa urgência |
| 44 | C40 | Globais implícitas entre scripts; comum/interface depende de globais do Portal | Baixa | M | Médio | A+B | Aberto |
| 45 | C41 | Duas implementações da regra base de permissões (casca e kit) | Baixa | M | Médio | B | Coberto por teste de paridade |
| 46 | C49 | Aba "Equipamentos · em construção" visível a todos; botão Voltar na tela inicial | Baixa | P | Baixo | A | Aberto |

### Evolução (3)

| # | Linha | Item | Grav. | Esf. | Ben. | Quem viu | Situação |
|---|---|---|---|---|---|---|---|
| 47 | C21 | Modelo de acesso só no cliente: PIN/hash legível por quem lê a pasta; sessão e bloqueio em loca | Média | G | Alto | A+B | Pendente da pergunta P1 |
| 48 | C38 | Código repetido entre blocos (336 KB, 132 nomes; renderSysNav idêntico nos 9 motores; Report.*  | Média | G | Médio | A+B | Decidido: unificar. Plano em docs/PLANO-H01-CODIGO-REPETIDO. |
| 49 | C39 | Funções gigantes (Actions 1.068 linhas, Engine 734, Sqdcp 600; App 825) | Baixa | G | Médio | A+B | Aberto |

### 9.1 Já corrigidos ou em PR

| Linha | Item | Onde está a correção |
|---|---|---|
| C02 | Produção ou scrap muito acima da capacidade: P e OEE absurdos (P 75.145%, 170.665%); só aviso por te | Corrigido no PR #165 (aberto): lançamento recusa acima de 3x a capacidade |
| C03 | Scrap negativo aceito: Qualidade acima de 100% | Corrigido no PR #165 (aberto) |
| C04 | Paradas sobrepostas ou maiores que o turno somam em duplicidade: Disponibilidade e Performance negat | Corrigido no PR #165 (aberto) |
| C06 | Parâmetro "Fuso horário" não é aplicado: "hoje" e a janela dos turnos usam o relógio do navegador | Corrigido no PR #165 (aberto) |
| C25 | Cobertura da guarda de gravação em fluxo aberto (perda de sessão durante a gravação) | Parcial: mensagem corrigida (#164); caso de sessão perdida em suspeita |
| C47 | Lançamento no celular (390 px): rolagem horizontal e abas truncadas | Corrigido (#164, mergeado) |
| C48 | Mensagens técnicas do navegador chegam ao usuário na falha de pasta | Parcial (#164) |

Ainda sem correção e **sem item no roadmap acima**: nenhum. Pontos fortes confirmados pelos dois lados: C09, C22, C45, C55.

## 10. Veredito comum

Concordo com a B no essencial: a plataforma serve para **demonstração e consulta assistida**, e não deve liberar **gravação operacional compartilhada, restauração de backup nem relatórios oficiais** antes de corrigir os 5 itens de Correção Crítica (C31, C01, C10, C29, C12) e de decidir os pontos de negócio abertos. A diferença para a B está só em duas gravidades (C11 e C13). A parte de cálculo do motor (D×P×Q, soma dos turnos, reprocesso) se sustenta nos dois lados.

## 11. O que continua sem prova

SMB e duas estações; desconexão física durante a gravação; frequência real das janelas de C10, C11 e C12 em rede; abertura do arquivo de 7,3 MB em rede; PDF e CSV de Waste, Paradas e importações; Outlook corporativo e impressão; leitor de tela; jornadas por toque no celular (C51 a C53); parsers FY27 (C42); anexos (C24); retenção de listeners (C35).
