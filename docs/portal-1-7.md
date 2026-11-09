# Portal 1.7 · Administração, pessoas e vigências

05/11/2026 · feito. Complementa "Cadastro base · contrato" (`claude/cadastro-base-contrato.md`), "Portal e padrão comum" e o plano (`claude/plano-evolucao-plataforma.md`). **Nenhuma outra página foi alterada.**

## 1. Decisões do Pedro (05/11/2026)

- Nomes exibidos: **Produção** (OEE), **Waste** (Perdas), **Gestão de Gel**, **Paradas**, **Equipamentos** (inclui manutenção), **Iniciativas** (5S · OSM · KAS, **uma página com 3 abas**, `Iniciativas.html` + `iniciativas-base.json`, id `inic`), **Projetos** (tratado à parte, mais complexo), **Outros** (menu).
- Máquinas e Manutenção saem da lista (manutenção fica em Equipamentos).
- **Outros** = menu ▾ com as páginas marcadas "mostrar no menu Outros" e links externos cadastrados no Portal.
- Usuário entra pelo **ID**; quem não está cadastrado se cadastra sozinho (nome + ID) e entra como **Consulta** até o administrador mudar. Objetivo: registrar quem mexeu.
- Página inicial do perfil: o Portal leva a pessoa **uma vez por sessão** do navegador.

## 2. O que mudou no Portal

- **Barra**: Portal · Produção · Waste · Gestão de Gel · (Paradas, Equipamentos, Iniciativas, Projetos quando o HTML estiver na pasta) · Outros ▾ · **⚙** (Administração) ao lado do tema. O link "Cadastros" da barra saiu do Portal (as outras páginas ainda mostram até receberem o kit v2; o link continua funcionando).
- **Migração do `vac.sistemas`** (lista guardada no navegador, que as outras páginas leem): troca OEE → Produção, Perdas → Waste, Gel → Gestão de Gel quando o nome ainda é o antigo; tira Máquinas/Manutenção que não existem na pasta (se existirem, vão para Outros). **Arquivos, bases e ids não mudam** (`oee`, `perdas`, `gel`; pastas de backup `00. Backups/OEE|Perdas|Gel`).
- **⚙ Administração** (aba única; "Configuração" virou parte dela): menu agrupado
  - Cadastros: linhas … modos de falha, Matriz de paradas
  - Pessoas: **Usuários**, **Perfis e permissões**
  - Regras: **Vigências**, **Parâmetros e semáforo**
  - Sistema: Integrações SAP (Importar), Configuração do Portal (pasta, logo, módulos, links do menu Outros, modo de teste), Versões das páginas, Auditoria, Backups do cadastro, Segurança e senha
  - Endereços: `#admin`, `#cadastros/usuarios`, `#cadastros/perfis`, `#cadastros/vigencias`, `#cadastros/parametros`, `#config`.
- **Entrar** (topo): ID → usuário do cadastro (mostra nome reconhecido, perfil, página inicial, o que pode ver e lançar, botão "Ir para …"); ID novo → "Primeiro acesso" (nome, turno, especialidade) → cria o usuário com perfil CONSULTA (e o perfil CONSULTA, se faltar) **sem pedir a senha** (só essa operação), auditoria com `origem:"autocadastro"`. Grava `vac.user` (nome), `vac.userId`, `vac.perfil` no navegador; as outras páginas já registram `vac.user` nas alterações. "Sair" esquece o usuário no navegador.
- **Página inicial**: `irPaginaInicial()` ao abrir o Portal sem `#`, uma vez por aba/sessão (`sessionStorage vac.inicial`); usa a do usuário ou, se "(do perfil)", a do perfil; só vai para página que existe na pasta. Na Visão geral: "Ir para minha página inicial".
- **Permissões no Portal**: a barra esconde páginas com `ver:false` no perfil. As outras páginas passam a respeitar quando receberem o cabeçalho comum v2. Editar o cadastro continua pedindo a **senha de administrador** (a senha do cadastro).
- **Vigências** (regra única): vigência gravada **não se edita** (campos travados, 🔒); errou → **Desativar…** (motivo obrigatório; vai para `vigenciasDesativadas`, a anterior passa a cobrir o período); vigência **usada em registros fechados** não pode ser desativada (conferido pelo `exports`: dias/turnos fechados na Produção, meses fechados no Waste, ordens concluídas no Gel; sem as bases lidas, avisa que não conferiu). Nova vigência: início escolhido em "Nova vigência a partir de" (encaixa na ordem; a anterior termina na véspera), grava `criadoPor`, `criadoEm`, `origem`. "Já existe vigência nessa data" agora orienta a desativar e criar de novo.
- **Painel de vigências**: todas (catálogos, BOM, turnos), com início, fim calculado, situação (vigente, futura, encerrada, desativada), criada por/em, origem, em uso, filtros e busca. Metas de OEE, regras de scrap e códigos de parada com vigência entram quando a Produção ler o cadastro.
- **Parâmetros e semáforo** (saíram de Segurança): fuso, unidade, setor, limite da microparada, ações padrão e **semáforo comum** (verde ≥ 100 %, amarelo ≥ 90 % da meta, editáveis) com o significado fixo das 7 cores.
- **Modo de teste**: botão "Sair do modo de teste" na faixa roxa e em Configuração; perfis e 2 usuários fictícios.

## 3. Contrato do cadastro · acréscimos (compatíveis com schemaVersion 1)

```
usuarios: [{ codigo:"<ID/matrícula>", nome, perfil:"<código do perfil>", turno:"T1"|null, especialidade, email,
             paginaInicial:"(do perfil)"|"Portal"|"Produção"|"Produção › Tela do operador"|"Waste"|"Gestão de Gel"|"Paradas"|"Equipamentos"|"Iniciativas"|"Projetos",
             ativo, origem:"autocadastro"?, primeiroAcessoEm? }]
perfis:   [{ codigo:"ADMIN|LIDER|OPER|TEC|PROC|QUAL|PCP|ALMOX|CONSULTA|TV|…", nome, paginaInicial, descricao, ativo,
             permissoes:{ <portal|oee|perdas|gel|paradas|equip|inic|projetos>: { ver, lancar, fechar, importar, exportar, excluir, configurar } } }]
parametros.semaforoVerdePct (100), parametros.semaforoAmareloPct (90)
<tipo com vigência>.vigencias[].criadoPor / criadoEm / origem      (novas a partir da 1.7)
<tipo com vigência>.vigenciasDesativadas[] = vigência + desativadaEm, desativadaPor, motivoDesativacao   (quem lê ignora; só "vigencias" vale)
```
- Perfis padrão: botão "Criar os perfis padrão" em Pessoas › Perfis (com a senha).
- `portal-base.json › config.links = [{nome, url}]` (menu Outros); cópia no navegador em `localStorage['vac.links']` para o kit v2 das outras páginas.
- `vac.sistemas` ganha `grupo:'outros'` (opcional) e `sub` (Iniciativas: "5S · OSM · KAS").

## 4. Próximo (plano § 8)

Kit do cabeçalho v2 para as outras páginas (barra com Outros e ⚙, Entrar pelo ID, permissões do perfil, semáforo do cadastro, modo demonstração padrão, busca global), depois Produção → Paradas → Equipamentos → Iniciativas (OSM primeiro, `claude/osm-arquitetura.md`) → Gestão de Gel.

## 5. Portal 1.7.3 (05/11/2026) · catálogo com preparações de aditivo

- Catálogo ganha **Tipo de item** (`tipoItem: 'tubo' | 'preparacao'`: "Tubo (produto acabado)" / "Preparação (aditivo / solução)") e **Unidade** (`unidade: 'UN' | 'L' | 'G' | 'KG'`). Coluna "Tipo" na lista; ⓘ nos campos.
- Código de 6 dígitos só é exigido para tubo; preparação usa o **código do material SAP** (o mesmo do MB51), com BOM e lista de perdas como os tubos.
- Contrato: `catalogos[].tipoItem` (padrão 'tubo' quando ausente) e `catalogos[].unidade` (padrão 'UN'). A Produção 2.2 usa `tipoItem` para separar "Preparações (aditivo)" na conciliação das ordens.

## 6. Portal 1.7.4 (05/11/2026) · cadastrar material pela CS12 a partir da Produção

- Endereço `#cs12=<material>&nome=&tipo=tubo|preparacao&un=` (botão da ficha da ordem na Produção) abre **Importar do SAP › CS12** com uma faixa "Cadastrar o material X" e o passo a passo no SAP.
- Colada a CS12 desse material, a prévia mostra **"catálogo novo"** (código = material sem NS, nome da Produção ou da Denominação da CS12, tipo e unidade vindos da Produção) e a importação cria o **catálogo e a BOM juntos** (auditoria: origem "SAP CS12 … (cadastro a partir da Produção)"). Família, PPH etc. se completam depois na ficha.
- Também sem vir da Produção: no seletor "Catálogo desta lista" da CS12 há a opção **"＋ Criar catálogo novo <código>"** (tipo pelo código: 6 dígitos = tubo, senão preparação; unidade da Qtd.base).

## 7. Portal 1.7.5 (05/11/2026) · CS12 na saída dinâmica textual

- Títulos aceitos: `Nív | Item | Obj | Texto breve objeto | Quantidade | UM | UMB` (Nív = nível, também ".1"/"..2"; Obj = componente; Quantidade = quantidade SAP; UM = unidade original; UMB = unidade básica), além do layout anterior (ID objeto, Qtd.(UMC)…).
- Linhas decorativas de hífens/travessões ignoradas; cabeçalho aceita "Material: X", "Denominação: …", "Qtd.base (L): …".
- Número SAP `2.601.000,000` → 2601000, com o texto original guardado (`quantidadeOriginalTexto`, `quantidadeSAP`).
- **Unidade nunca trocada**: ML continua ML. Com fator conhecido (ML↔L, G↔KG) grava também `qtdPorMilheiroUMB` (ex.: 1.610.000 ML = 1.610 L); sem fator, a prévia mostra "sem fator p/ UMB".
- Prévia: "N itens de nível 1 · N itens da estrutura (níveis 2+ quando houver) · N erro(s) estrutural(is)".
- Testado com o exemplo do 17132AAB: itens 0010 (8362091, 2.601.000,000 G, UMB G) e 0020 (8362310, 1.610.000,000 ML, UMB L), pai 17132AAB, 0 erros estruturais.

## 8. Portal 1.7.6 (05/11/2026)

- **Desbloqueio da edição vale para todas as abas e janelas** do navegador (antes: só na aba, em sessionStorage — a lógica era essa desde o início, não tinha sido alterada). Continua bloqueando sozinho com 30 min sem uso; "Bloquear" numa aba bloqueia todas.
- **Perfil "Edita o cadastro sem senha"** (`perfis[].semSenha`): quem entra com esse perfil fica sempre desbloqueado. **ADMIN vale por padrão** enquanto o campo não for gravado desmarcado; perfis padrão novos já vêm com `semSenha:true` no ADMIN. Atenção: a entrada é só pelo ID.
- Faixa "Cadastrar o material" mantém o código como veio do SAP (zero à esquerda preservado; a Produção 2.2.2 não tira mais).
- Depois de importar CS12 ou materiais, a tela sobe para o topo da importação com o cursor na colagem.
- Ao voltar para o Portal relê as bases das páginas e o cadastro; kit v2.1 (← Voltar).

## 9. Portal 1.7.7 (05/11/2026) · Câmbio no cadastro geral

- Tipo novo **Câmbio (moedas)** (`cambio`, em Administração › Cadastros): `{codigo:'USD', nome, ativo, vigencias:[{de, ate, cotacao}]}` — cotação = R$ por 1 unidade da moeda, com as regras de vigência de sempre (gravada não se edita; nova vigência fecha a anterior na véspera).
- Kit v2.1 ganhou `vacCambio(data, moeda='USD')` → `{cotacao, de, ate}` ou null (lê a cópia `vac.cadastros`).
- Consumidores: **Waste 1.8.3** (BRL/USD, cotação do último dia da competência) e **Gestão de Gel 1.94** (preço do gel = US$/kg × cotação do dia; a cotação do formulário de preço vem do cadastro e fica travada; dias sem câmbio no cadastro usam a cotação gravada com o preço, como antes).

## 10. Portal 1.8 (05/11/2026) · centralização das configurações (fase A)

Base: `claude/centralizacao-configuracoes.md`. Pedido do Pedro: ⓘ em todos os campos e categorias, com exemplo.

- **Turnos › Pausas e abonos** (`turnos.vigencias[].pausas[]`): `{codigo (código de parada), nome, inicio, fim, duracaoMin, dias[], desconta}`. Pausa com horário fixo (início/fim, 24 h+ depois da meia-noite) ou só duração (abono, ex.: 60 min no sábado). Dias vazio = todos os dias do turno. Regra REF/REV: na Produção só o excedente da pausa padrão conta como perda.
- **Metas** (grupo novo no menu, telas separadas):
  - `metasOee`: `{codigo, nome, linha, equipamento, familia, catalogo, vigencias:[{de, ate, oeeMetaPct, pph, metaDiaria, coberturaMinPct, divergenciaMaxPct}]}`. Vale a meta mais específica: catálogo › família › linha.
  - `metasArea`: `{codigo, nome (indicador), pagina, unidade, sentido (menor|maior), periodo, linha, vigencias:[{de, ate, valor, alerta}]}`. Ex.: WASTE-MES.
  - `metasOsm`: `{codigo, nome, publico, periodo, linha, turno, vigencias:[{de, ate, quantidade, tema}]}`. Ex.: 4 OSM por operador por mês.
- **Preços de material** (`precos`, chave = material): `vigencias:[{de, ate, preco, moeda USD|BRL, porUnidade kg|L|UN|mil UN}]`. O preço do gel passa a vir daqui (a Gestão de Gel só consulta; fase C).
- **Parâmetros:** `paradaLongaMin` (padrão 30), parâmetro único para a lista "acima do limite" da Produção e a fila técnica da Paradas.
- **Equipamentos:** `apelidos` (outros nomes, separados por ";"), o de-para do Forms.
- **Códigos de parada:** novos `duracaoManual` e `relatorio`, que completam as regras de apontamento.
- **Trazer configurações das páginas** (Resumo): lê as bases completas da Produção, Gel, Waste e Paradas (ou arquivos escolhidos) e propõe, com caixas de marcar:
  - pausas da Produção (com código);
  - pausa fixa e abono do Gel;
  - metas de OEE (uma por escopo, com vigências);
  - regras de apontamento diferentes;
  - preço do gel;
  - cotações gravadas com o preço (desmarcadas);
  - meta mensal do Waste (WASTE-MES);
  - parada longa;
  - de-para de máquinas.
  Vira operações normais com motivo "trazido das páginas (Portal 1.8)".
- **ⓘ em todos os campos** (inclusive Dias), nos cabeçalhos da tabela de pausas, no título de cada lista de cadastro e nos grupos do menu (`CAT_AJUDA`), com exemplos.
- Correção: na ficha de um item **novo** com vigência, a primeira vigência vinha travada ("gravada"); agora vem editável.
- Câmbio usa a ação "edição" como os demais.

## 11. Portal 1.8.1 (05/11/2026)

- **Turnos completos (paridade com a Produção):** `vigencias[].regraPedacoFinal` (soma o pedaço final de até N min à hora anterior) e `vigencias[].intervalos[]` (`{inicio, fim}`; vazio = gerados pela regra; personalizado precisa cobrir o turno sem lacuna). A ficha mostra as horas brutas e produtivas por dia da semana e os intervalos gerados; o botão "Copiar os da regra para editar" preenche o personalizado.
- **Parâmetros:** listas `motivosAbono`, `motivosSemProducaoProg` e `motivosSemProducaoNP`.
- **Metas de OEE = Metas e capacidades da Produção:** ganharam `observacao`, `semaforoVerdePct`/`semaforoAmareloPct` por meta, `quadro` (quadro hora a hora da Meta OEE FY27, só consulta) e a coluna PPM. O Trazer traz semáforo, observação e quadro; traz também os intervalos, a regra do pedaço final e os motivos.
- **Preparação de aditivo na BOM:** mesmo código, dois papéis. O catálogo de preparação mostra "produzida em ordem própria (BOM própria) e consumida na BOM de N catálogos". Na BOM dos tubos, o componente que é preparação ganha "preparação · BOM própria ↗". O material mostra a ligação com o catálogo, e a conferência avisa quando a unidade é diferente. No Waste não há dupla contagem: a perda de fazer a solução fica na ordem da preparação e o consumo pelo tubo fica na ordem do tubo.
- **Matriz de paradas nova:**
  - duas visões: "Todas as máquinas" (grade) e "Por máquina" (o formulário de uma máquina, por grupo, com "marcar todos/desmarcar" e "Imprimir o formulário desta máquina");
  - busca; ✓/✗ por coluna (máquina) e "todas/nenhuma" por linha;
  - legenda; linha alterada em amarelo; aviso quando o filtro "Onde se aponta" esconde tudo.
- Correção: o ⓘ dos grupos do menu ficava em outra linha.

## 12. Portal 1.8.2 (06/11/2026) · importar a Meta OEE FY27

- **Onde:** Cadastros › Importar › **Meta OEE FY27** (link direto `Portal.html#cadastros/importar/metaoee`).
- **Leitura:** escolhe a planilha inteira (`OEE-Vacutainer_v2.xlsm`); só a aba "Meta OEE FY27" é lida, com a mesma lógica da Produção:
  - quadro mensal: célula "Mês" com a família acima, horários à direita (grupo de várias horas vira linhas de 1 h) e o Total "1.043 (69,0%)" (OEE meta);
  - quadros hora a hora explícitos ("EDTA – Outubro/26" + "Horário"); quando existem, valem no lugar do resumo e são conferidos com ele;
  - PPH da aba BASE DE DADOS (bloco FY27) ou o PPH nominal do catálogo (tubo) da família;
  - milheiros viram peças pela escala PPH × minutos × OEE (aviso se não bater em 5 %);
  - família pelo código ou nome do cadastro; família fora do cadastro e células não usadas aparecem em "não reconhecidos".
- **Gravação em Metas de OEE:**
  - uma meta por família (`OEE-<família>`, ou a meta que já existe para a família, sem catálogo e sem máquina);
  - uma vigência por mês, a partir do dia 1º, com `oeeMetaPct`, `pph`, `metaDiaria`, `quadro [{start,end,target}]` (minutos, peças), `origem`, `criadoPor/Em`;
  - semáforo, cobertura e divergência herdados da vigência que cobria o mês;
  - o fim é a véspera da próxima; o último mês continua valendo até a próxima importação.
- **Prévia:** uma linha por família e mês, com situação **nova** (marcada), **igual** (ignorada) ou **alterada** (desmarcada; se marcar, a antiga vai para Desativadas com o motivo "substituída pela importação da Meta OEE FY27"). OEE meta e PPH editáveis na prévia; linha sem OEE ou sem PPH não entra. Uma operação `importação` por meta, com origem "planilha <arquivo> · aba Meta OEE FY27".
- **Ficha da meta:** o quadro hora a hora aparece como "06:00–07:00 · 34.500".
- Teste: `testes/tmeta.js` (planilha fictícia: 4 registros, reimportação igual, substituição de um mês, auditoria).

## 13. Portal 1.8.3 (06/11/2026) · números iguais aos das páginas (auditoria de integração)

Origem: auditoria externa de 05/11/2026 (A01–A10). Adotado o que corrige dado; descartado o que reescreve sem ganho (bibliotecas `shared/*.js`, contrato `schemaVersion 2`, autenticação em servidor).
- **Visão geral lê o `exports` de cada página** (regra 1 da plataforma): OEE (cartões, pendências, série por dia e ordens em produção pelo motor do OEE), Gel (saldo já descontadas as retiradas parciais, `estoque.porLocal`, pendências do Gel), Paradas (`adaptParadas`: série de minutos por mês). A soma dos dados brutos só fica para base sem `exports` ou com `exportsVersion` desconhecida, com a pílula **dados brutos**. Antes, o estoque do Gel no Portal era o kg do relatório SAP, sem as retiradas parciais.
- **Urgência**: no `exports`, `sev 1` = urgente e `sev 2` = atenção (contrato em "Portal e padrão comum" § 4). O Portal invertia (barril vencido aparecia como atenção). Convertido na entrada.
- **Waste**: o cartão diz "provisório" no mês aberto e "mês fechado" depois do fechamento; meses abertos no gráfico com "(aberto)".
- **Gravação pendente**: se uma gravação falhou e a base da pasta mudou depois (outra pessoa gravou), a sincronização não grava mais por cima: baixa a cópia local `portal-base_NAO-GRAVADO_<data>.json` e passa a usar a base da pasta. Se a pasta não mudou, grava normalmente. Uma alteração nova feita com outra pendente não descarta mais a pendente. Sincronização entra na mesma fila das gravações.
- **Versões das páginas**: aviso de `exportsVersion` desconhecida (crítico) e de `exports` mais antigo que a última gravação da base.
- **Catálogo de sistemas único** (`fontes/kit/sistemas.js`, `DEFAULT_SYSTEMS`): os mesmos nomes e a mesma ordem em todas as páginas (antes Gel, Produção e Waste não tinham o Paradas e usavam outros nomes). Paradas deixa de ser "em construção".
- Teste: `node testes/tintegra.js` (gera o `exports` real do Gel e da Produção e confere que o Portal mostra os mesmos números; simula duas pessoas gravando).
- Fica para depois: Waste publicar `pendencias`/`kpis` no `exports` (o Portal ainda monta as pendências do Waste a partir das ações da base); `eventoId` comum OEE × Paradas (A10, já previsto em `paradas-arquitetura.md`).

## 14. Portal 1.8.4 (06/11/2026) · pendências do Waste pelo exports

- Cartões "Críticas/altas sem causa" e "Ações vencidas", a lista de pendências e a "última KKBC" vêm do `exports` do Waste 1.8.8. Base do Waste sem `exports.pendencias` (versão antiga): leitura antiga, com a pílula **dados brutos**.
- Contrato: pendência com `aPartirDe` (opcional) só aparece a partir desse dia. Vale para qualquer página.
- Teste: `testes/tintegra.js` confere que cartões e pendências pelo `exports` são iguais aos da leitura antiga.

## 15. Portal 1.8.5 (06/11/2026) · resposta ao diagnóstico técnico

Registro completo das decisões em `docs/auditorias/registro-decisoes.md`.
- **F03**: o resultado de cada base vale só no dia em que foi lido (`MOD.files[id].dia`); na virada do dia a sincronização automática (1 min) reavalia `aPartirDe` sem nova gravação na página de origem.
- **F08**: `exports` com `exportsVersion` desconhecida não alimenta nenhum número (nem nos caminhos de dados brutos do OEE e do Waste); `r.ex` e `cadProp` também passam pelo teste de versão.
- **5.2**: Versões das páginas e cartões leem `databaseVersion`, `lastModifiedAt`, `lastModifiedBy` e `applicationVersion` da Produção.

## 16. Portal 1.8.6 (06/11/2026) · diagnóstico pós-merge

- **M01**: se a leitura da `portal-base.json` antes de gravar falhar, a alteração não é gravada (gravaria por cima de outra pessoa): fica pendente e a sincronização confere a base (`semMudanca` / `_NAO-GRAVADO`).
- **M03**: `readModules` conta as mudanças nos dados adaptados (`MOD.versao`); a volta para a página e a rotina de 1 min redesenham quando ela muda (inclui a virada do dia). Antes, a volta para a página só olhava a data do arquivo.

## 17. Portal 1.8.7 (06/11/2026) · base que some da pasta

- Quando uma base que estava disponível some da pasta (ou passa a dar erro), `modErro` troca os números pelo aviso **e sobe `MOD.versao`**: a tela redesenha (volta para a página ou rotina de 1 min) em vez de continuar mostrando valores antigos. O arquivo lido é esquecido, para a base reaparecer sempre reprocessada. Lacuna do M03 (1.8.6), que só subia o contador no erro de leitura.

## 18. Portal 1.8.8 (06/11/2026) · layout (vac-visual v1)

- Gráfico dos cards de módulo (`miniChart`): desenhado na largura do card, com texto de 11 px. Antes, o gráfico do relatório era encolhido e o texto ficava com cerca de 5 px. Mostra só o último valor, o maior e a primeira/última data; o resto fica na dica. Cada card ganhou título com unidade: peças, kg, R$, min. Os relatórios e a TV continuam com `barChart`.
- Padrão visual comum do kit (ver `kit-cabecalho-v2.md` › vac-visual v1).

## 19. Portal 1.8.9 (06/11/2026) · bases em 00. Bases

- Ao conectar, move `portal-base.json` e `vacutainer-cadastros.json` para `00. Bases` (kit vac-bases), com cópia em `00. Backups/Portal` e `00. Backups/Cadastros`. Lê as bases dos módulos em `00. Bases` ou, enquanto não forem movidas, na raiz.
- Versões das páginas: `00. Bases` é o lugar certo; avisa base ainda na raiz e duas cópias da mesma base.
- Pasta única (Configuração): a estrutura descrita passa a incluir `00. Bases` e `Paradas.html`.

## 20. Portal 1.8.10 (06/11/2026) · revisão c341f8e

- Kit vac-bases v2: migração para `00. Bases` segura entre estações (registro § R).
- Conexão: um erro ao ler a base (rede, permissão, JSON) não oferece mais "Criar a base nesta pasta?". A página avisa e não muda nada.
- Aba ativa com a marca de volta; pílula "Modo de teste" visível em telas pequenas.

## 21. Portal 1.8.11 (07/11/2026) · relatórios e página inicial com aba

Responde à auditoria de relatórios e painéis (registro § P).
- **PDF:**
  - o comentário e o bloco de texto continuam na página seguinte; antes, o que passava do fim da folha se perdia;
  - os cartões saem com rótulo e detalhe em até 2 linhas;
  - o gráfico sai sempre com as cores do tema claro.
- **Impressão:** em A4 paisagem, como o PDF, no tema claro, e a tabela larga quebra o texto nas células.
- **Copiar texto:** avisa "… e mais N linha(s)" quando corta a tabela.
- **Copiar para Outlook:** leva os gráficos como imagem, como a Produção. Desmarcando "gráficos como imagem no Outlook" (preferência deste navegador), o lugar do gráfico diz "gráfico no PDF".
- **Página inicial:** Perfis e Usuários oferecem página e aba (ex.: "Produção › Painel", "Gestão de Gel › Operação", "Paradas › Fila técnica"). A lista é comum no kit (`VAC_INICIAL_ALVO`). A página aberta direto também respeita a aba do perfil, na 1ª abertura da sessão; um link com `#` tem prioridade.

## Portal 1.8.12 (07/11/2026) · situação das páginas

- Em construção / em atualização, editável em Configuração do Portal › Módulos ("Situação da página" + "Nota"), gravada no `portal-base.json` e aplicada ao `vac.sistemas` de cada navegador ao abrir o Portal.
- Cartão "em construção" com as abas planejadas (bloco `vac-planejado` do HTML); página em construção sem base não gera erro, pendência nem slide de TV. Pílula "em atualização" nos cartões de Gel e Paradas. Selo na tabela de Versões.
- Detalhes: `paginas-construcao.md` § 8.

## Portal 1.8.13 (07/11/2026) · restauração com cópia garantida

Restaurar a base do Portal a partir de uma cópia: se a cópia `_antes-restaurar_` da base atual falhar (permissão, rede), o Portal avisa o motivo e só continua com "Restaurar mesmo assim?". Antes, a falha era ignorada e a base era substituída sem cópia. Registro § C, item 2.

## Portal 1.8.14 (08/11/2026) · kit da E2

Só o kit: `vacHoje()` (dia local nos leitores sem data) e `vacMetaAreaMes` (meta do mês ponderada pelos dias). Registro § U.

## Portal 1.8.15 (08/11/2026) · kit da E3 e da E4

Só o kit (`vacNumero`, `vacExportsOk`). Os campos novos do `exports` (`porOrdem`, coberturas) são aditivos na versão 1; o Portal os ignora até a ficha da ordem (E5). Registro § U.

## Portal 1.9.0 (08/11/2026) · Minha fila e Reunião diária (E10a e E10b do plano único)

- **Minha fila:**
  - ações abertas de Iniciativas e pendências de todas as páginas, por prazo;
  - filtros Minhas, Minha equipe (mesma área no cadastro) e Sem responsável;
  - só leitura; cada item abre na página dona.
- **Reunião diária:**
  - recorte por dia ou por turno, cada número com a granularidade dele;
  - pauta, decisões e fotografia dos números, guardadas em `portal-base.json › reunioes['AAAA-MM-DD|dia|T1…']`;
  - encaminhamento ao Planner por link; relatório pelo Report.
- **Cadastro de usuários:** campo novo `area`, opcional, com ⓘ.
- **Pendências das páginas:** passam a carregar `responsavel`, `apoios`, `prazo` e `id` quando a página publica (aditivo).

## Portal 1.9.1 (08/11/2026) · C1

- **Fila do cadastro:** um registro por alteração na fila durável do kit; a fila antiga `cadFila` é importada uma vez.
- **Trava da 2ª aba:** se outra aba do Portal tem alteração não gravada na pasta, esta não altera. Nada é descartado.

## Portal 1.9.2 (08/11/2026) · C2, C3 e C5

- **Troca de usuário (AT-10):** Entrar e Sair redesenham a página. Usuário trocado em outra aba também.
- **Reunião diária:**
  - fora da cobertura do Paradas, mostra "—" e "sem dado de paradas para esse dia", na tela e no relatório (AT-06);
  - a ação de um grupo é ligada a cada ordem do grupo (AT-07);
  - o link de reconsulta é `#reuniao=AAAA-MM-DD|turno`.
- **Versões › saúde dos dados (C5):**
  - coluna "Pendentes neste navegador", também no Excel;
  - resumo de outro dia em destaque;
  - período de eventos do Paradas, com "(cortada)";
  - avisos de resumo antigo, lista cortada e alterações que ainda não chegaram à pasta.


## 1.9.3 · 08/11/2026

Exclusão mútua entre abas e saúde dos dados com snapshots e reservas. Procedimento, testes e limites em [estabilizacao-nv-01-05.md](estabilizacao-nv-01-05.md).
