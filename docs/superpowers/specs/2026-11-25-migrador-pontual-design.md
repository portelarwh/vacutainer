# Migrador pontual da base limpa — desenho

**Data:** 25/11/2026 · **Branch:** `feat/migrador-pontual` (a partir de `941b30e`, PR #149) · **Decisão:** D02 do Plano Mestre 2.2. O responsável aceitou em 25/11/2026 preservar todos os itens da revisão da #149. Cada exceção vai para ele antes do corte.

## Por que existe

A #149 retira do caminho normal toda leitura de formato antigo. Bases e vínculos gravados pela main (`91744b5`) que dependiam dessa leitura passam a ficar só para consulta ou sem vínculo. Os dados continuam nos arquivos. O migrador os leva **uma vez** ao formato atual, com prévia, relatório de exceções, backup e confirmação. Depois do corte aceito, ele sai do código (contrato 10, Plano Mestre 6.3).

## Objetivos e limites

- **Preservar** cada item aceito: pauta e configuração da Administração, pessoas só com nome, gel solto nos catálogos, IDs antigos de local do Gel e ações antigas do Waste.
- **Nunca adivinhar.** Só resolve o que é inequívoco. Todo o resto vira exceção, com o caminho no arquivo e os candidatos. Nada é descartado em silêncio.
- **Repetível.** Uma segunda execução depois da primeira encontra zero alterações (idempotente).
- **Sem fórmula nova** (contrato 7). As conversões repetem exatamente as regras da main (citadas abaixo).
- **Cada arquivo é gravado pelo seu dono** (contrato 1), com o protocolo de gravação de sempre (contrato 3): releitura, comparação com a prévia, backup, gravação e releitura de verificação.
- **Fora do escopo:**
  - filas antigas do navegador: só diagnóstico na estação, sem importar;
  - campos de auditoria `por`/`user`, que não têm campo de ID;
  - `productionDays[].responsibleId` da Produção, que nada lê;
  - `resp` de texto livre (Waste e Paradas);
  - homologação SMB (H01/H02).

## Abordagem escolhida

1. **Escolhida: um bloco `ferramenta/migracao` dentro do `Plataforma.html`, aberto só por Saúde dos dados › "Migração pontual (uso único)".** Reaproveita `vacRaiz`, `vacFormatoBase`, backup, Web Locks e `vacLogin` sem duplicar código (D01: um HTML). Fica fora do caminho normal: nenhum motor o chama. O teste `base-limpa.test.mjs` continua proibindo leitura antiga nos motores e isenta só esse bloco. Sai em um commit próprio depois do corte.
2. **Descartada: um HTML separado.** Duplicaria a persistência, ou exigiria extrair o código comum antes do corte de fonte.
3. **Descartada: conversão ao abrir cada motor.** É exatamente a compatibilidade permanente que a base limpa retirou.

## Estrutura

- **Núcleo puro:** `vacMigracao.planejar(arqs, escolhas) → { itens, alteracoes: {<arquivo>: {hashAntes, depois, itens[]}}, excecoes[] }` (assíncrona; `arqs` é `{arquivo: conteúdo}` e o cadastro vem de `arqs['vacutainer-cadastros.json']`). Não toca a pasta e é testável em Node com dados fictícios.
- **Aplicação:** `vacMigracao.aplicar(pasta, plano, {escolhas, sessao, confirmacao, janela, registro?})`, com `retomar(pasta)` e `restaurar(pasta, registro, arquivos, {sessao, confirmacao, janela})`. Exige sessão de quem edita todos os assuntos da Administração, a confirmação digitada, todas as exceções decididas e a confirmação da janela (a ferramenta não impede outros gravadores; as travas só coordenam as abas de um navegador). Antes de gravar qualquer arquivo, relê todos e faz todos os backups. Grava na ordem cadastro → Iniciativas → Equipamentos → Linha 360° → Paradas → Waste → Gel → Produção → Administração (o Waste só recebe IDs de pessoa; as ações dele são copiadas para as Iniciativas sem mudar o Waste). Para cada arquivo:
  1. relê o arquivo;
  2. compara o hash com o da prévia; se mudou, pula o arquivo e manda refazer a prévia;
  3. faz backup em `00. Backups/Migracao/<módulo>/antes-da-migracao-<data>.json` (fora da pasta de backup do módulo, que a retenção `backupDias` limpa);
  4. grava;
  5. relê e confere.
- **Registro:**
  - `00. Backups/Migracao/registro-<data-hora>.json`, com plano, escolhas, hashes antes e depois, e resultado por arquivo;
  - uma entrada na auditoria de cada base alterada.
- **Tela:**
  - conectar a pasta;
  - prévia: contagens por item e por arquivo;
  - tabela de exceções, cada uma com caminho, valor e candidatos, e escolha "Pessoa X", "Sem responsável" ou "Deixar como está";
  - baixar o relatório (CSV);
  - "Aplicar";
  - resultado.
  
  Sem sessão: só a prévia.

## Itens

| Item | Arquivo e dono | Regra (da main) | Exceção quando |
|---|---|---|---|
| M1 Base da Administração | `portal-base.json` (Administração) | Valida `schema==='portal-base'` (ou ausente), `config` objeto, `reunioes` objeto ou ausente, `audit` lista. Acrescenta `schemaVersion:1`. Não mexe em mais nada. | Estrutura inválida, ou `schemaVersion` já diferente de 1 |
| M2 Pessoas | Iniciativas (`acoes[].responsavel/responsavelId`, `apoios/apoiosIds`, `criadaPor/criadaPorId`, `eventos[].de/deId` e `para/paraId`, incluindo `AC-W-*` e `AC-R-*`); Equipamentos (`os[].responsavel/responsavelId`, `criadaPor/criadaPorId`, `apontamentos[].por/porId`); Linha 360° (`postos[].pessoas/pessoasIds`, `formularios[].resp/respId`, `conf/confId`, `emissor/emissorId`, `desvio.resp/respId`, `exec.por/porId`, `concluidoPor/…Id`, `confirmadoPor/…Id`, `canceladoPor/…Id`, `devolucoes[].por/porId`, `fotos[].por/porId`, `tiradaPor/…Id`, `feitos[].por/porId`); Paradas (`tecnico{}.tecnico/tecnicoId`); Waste (`comments[].user/userId` e `hist`, `alteradoPor/…Id`, `excluidoPor/…Id`, `exclusoes[].por/porId`) | Só preenche o ID **vazio**. Usa o ID se o texto já for um `usuarios[].codigo`; senão, o único usuário cujo nome normalizado (sem acento, espaços colapsados, minúsculas; inativos contam) é igual. Nunca troca um ID já gravado. | Nome com mais de um usuário (os candidatos aparecem) ou nenhum |
| M2b Técnico do Forms (Paradas) | `paradas-base.json` `eventos[].tecnicoForms` sem entrada em `tecnico{}` | Cria `tecnico{<evento>}` = `{tecnico:<nome do cadastro>, tecnicoId, por:'migração', porId:''}`. Isso equivale ao que a main resolvia na leitura (`idTec`). | Igual ao M2 |
| M3 Gel solto no catálogo | `vacutainer-cadastros.json` `catalogos[].gel` (Administração) | Se `vig` está vazio e há `gTubo`/`bomG`/`bomKg`: cria uma vigência `{from:'2000-01-01', gTubo, bomKg, bomBase, tol}`, com tol e bom como a main (vigList/bomVals): com bomKg, `bomKg`, `bomBase‖10000` e `tol??6`; senão, com bomG, `bomG·(bomPct‖106)/100·10`, `10000` e `(bomPct‖106)−100`; sem os dois, `bomKg:null`, `bomBase‖10000` e `tol??6`. Tira os campos soltos. Vigências com `bomG` sem `bomKg` são convertidas pela mesma conta. Grava como operação do cadastro (rev +1, auditoria). | Valores não numéricos |
| M4 Locais antigos do Gel | `fifo-base.json` `prodlog[dia].turns[t].eq[]` (Gel) e `oee-vacutainer-base.json` `productionDays[].shifts[].gelScrap.eq[]` (Produção) | Procura em `gel.locais` do cadastro, nesta ordem: ① `id===d` e mesmo equipamento; ② `legado` com `{e,d}`; ③ mesmo equipamento e `legado.d===d`. Reescreve `e:'eq-<equipamento>'` e `d:<id do local>`. | Nenhum local encontrado. O registro fica como está e o local aparece "sem local". |
| M5 Ações antigas do Waste | Lê `perdas-base.json` `actions[]` e grava `iniciativas-base.json` `acoes[]` (Iniciativas) | Igual a `MigWaste.converter`: `id:'AC-W-'+id`, mapas de status e eficácia, `origem.ref:'waste\|'+id`, `legado{…}`, evento de criação e uma entrada em `importacoes`. Pula se já existe (`MigWaste.ja`). Responsável pela regra do M2. | Responsável ambíguo (a ação entra sem ID e com a exceção) |
| M6 Filas antigas (diagnóstico) | Navegador da estação | Lista as chaves não vazias `inic.fila`/`.conf`, `equip.fila`/`.conf`, `linha.fila`/`.conf` e `paradas.fila`, além de `fifo-fs › fsPending` e `vac-portal › cadFila`. | Qualquer chave não vazia: o roteiro manda abrir a versão atual da main naquela estação para enviar a fila **antes** do corte |

## Fora do caminho normal, mas consertado nesta frente

- O botão `#mwTrazer` do Iniciativas (`MigWaste`) continua aparecendo e falha na #149. Ele sai na Task 5, porque o M5 o substitui.

## Testes (dados fictícios)

- **Node (`testes/plataforma/migracao.test.mjs`).** Para cada item: um caso resolvido, um ambíguo, um sem correspondência e um com ID já gravado (fica intacto). Segunda execução com zero alterações. Totais e contagens antes e depois: nenhum registro some e nenhum duplica.
- **Playwright (`migracao.cjs`), com uma pasta OPFS montada no formato da main:**
  - prévia com exceções;
  - aplicar com sessão ADMIN;
  - backups criados;
  - cada motor abre a base sem "versão anterior";
  - Reunião diária com a mesma pauta;
  - Minha fila com os itens da pessoa;
  - gel do catálogo com o mesmo teórico de antes (o `gel-numeros` da main como referência);
  - arquivo alterado entre a prévia e a aplicação é pulado;
  - segunda execução sem alterações;
  - sem sessão, só a prévia.
- `tudo.js`, `test:unit` e `test:plataforma` completos.

## Gate antes do corte real (não automatizado aqui)

- Autorização, janela de manutenção, backup integral verificado, prévia revisada e exceções decididas pelo responsável.
- Clientes antigos fechados e o M6 executado em cada estação.
- Plano de rollback: restaurar os backups `antes-da-migracao-*`. Gravações feitas depois do corte exigem conciliação.
- H01/H02 na pasta de homologação.

## Deixado ao implementador

Nomes internos, layout da tela (padrão visual da plataforma), formato do CSV e divisão em commits.
