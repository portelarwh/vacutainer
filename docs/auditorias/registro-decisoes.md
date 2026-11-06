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

Status usados: **corrigido** · **corrigido em parte** · **recusado** · **adiado** · **já existia**.

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
