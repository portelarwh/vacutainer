# Roteiro do corte: migração pontual da base limpa

Uso único. A ferramenta fica em **Saúde dos dados › Ferramentas locais › Migração pontual (uso único)**. Ela leva os dados da main ao formato da base limpa. Sai da plataforma depois do corte aceito. Desenho: `docs/superpowers/specs/2026-11-25-migrador-pontual-design.md`.

Nada disto foi homologado em SMB. H01 e H02 (PENDENCIAS.md) seguem pendentes. Faça primeiro um ensaio numa cópia da pasta. A cópia do ensaio também precisa ser **conectada na plataforma** (mesmo navegador), senão a ferramenta não acha o escopo e não grava. Registre a duração do ensaio (do clique em Aplicar ao "Concluído") e o tamanho do registro em `00. Backups/Migracao`: serve de estimativa para a janela real.

## O que a ferramenta exige

- Um navegador onde a pasta **já foi conectada na plataforma** (mesmo perfil do navegador). Sem isso ela não acha o escopo da pasta e não grava.
- Login de quem **edita todos os assuntos da Administração**. Quem tem um assunto só em "ver" não consegue aplicar.
- Web Locks só coordenam abas do **mesmo navegador** e só a Administração e o Waste os usam. A ferramenta **não vê outras estações**. A Produção não avisa abas abertas: feche todas.

## Antes do corte

- [ ] **Janela combinada.** Todos os demais gravadores parados: outras estações, outras abas, celulares que importam turno. Fechar todas as abas da Produção.
- [ ] **Backup integral verificado** da pasta inteira, aberto e conferido (copiar, abrir um arquivo, comparar tamanhos). Guarde fora da pasta.
- [ ] **Vigência de perdas teóricas do gel** cadastrada em Administração › Gel, com a data mais antiga necessária. A main usava valores fixos; sem vigência a plataforma não mostra teórico.
- [ ] **M6 em cada estação.** A tela lista as filas antigas do navegador em que roda; ela só enxerga o navegador atual. Em cada estação, abra a versão atual (main) e deixe a fila ser enviada. O histórico de importação da main sozinho não prova que a estação passou por ela. Registre uma linha por estação:

| Estação | Navegador/perfil | Data e hora | Quem | Filas encontradas | Enviadas (sim/não) |
|---|---|---|---|---|---|
| | | | | | |

## Corte

1. Conecte a pasta na plataforma e entre com a conta que edita a Administração.
2. Abra a ferramenta e leia a prévia (contagens por item e por arquivo).
3. Decida **toda exceção** (pessoa, "Sem responsável" ou "Deixar como está"). A gravação recusa com exceção pendente. As exceções são decisão do responsável. Exceção **sem opção** ("Sem opção: corrija a causa") não tem decisão: a gravação fica bloqueada até a causa ser corrigida no arquivo (ou o módulo ser aberto uma vez) e a prévia ser refeita.
4. Baixe o relatório CSV e guarde-o junto do backup. Evidência: nome do arquivo e quem decidiu.
5. Confirme a janela, digite **MIGRAR** e aplique. Cada arquivo é relido, tem backup e é conferido depois.
6. **Interrompeu?** Use **Retomar** (continua sem duplicar) ou **Restaurar** (digite **RESTAURAR**; volta os arquivos pelos backups). Nunca refaça a prévia por cima de um registro incompleto.
7. Registro em **concluído parcial** ou arquivo **não tocado**: a migração não gravou aquele arquivo porque outra pessoa o mudou depois da prévia. Refaça a prévia desse arquivo (depois de fechar o registro) e aplique de novo; não restaure por cima.

Os backups da migração ficam em `00. Backups/Migracao/<módulo>/antes-da-migracao-<data>.json`. A retenção do contrato 9 não os apaga. Copie para fora antes de qualquer limpeza. O registro fica em `00. Backups/Migracao/registro-<data-hora>.json`.

## Depois do corte

- [ ] **Conferir M5** (botão **Conferir M5** na ferramenta, só leitura; usa `conferirM5`) antes de qualquer limpeza no Waste. As ações originais continuam no Waste; as cópias vão para as Iniciativas. Ação com pessoa sem decisão não é criada e aparece em "faltam" (a tela explica isso); "divergentes" lista título, status, prazo ou responsável diferentes.
- [ ] **Abrir cada módulo uma vez.** Os exports só se atualizam na próxima gravação de cada módulo; até lá, os módulos que leem o export veem o formato antigo.
- [ ] Conferir Reunião diária, Minha fila e o teórico do gel (comparar com o valor anotado antes).
- [ ] Se houve **restauração**: ela baixa a revisão das bases. Estações com fila guardada podem reenviar. Conferir antes de liberar as estações.
- [ ] **Gravações feitas depois do corte** exigem conciliação à mão se for preciso reverter: restaurar volta o arquivo ao estado de antes e perde o que foi gravado depois.

## Evidências do corte

| Item | Evidência (arquivo, data, quem) |
|---|---|
| Backup integral | |
| Vigência do gel | |
| M6 por estação (tabela acima) | |
| Relatório CSV e decisões | |
| Registro da aplicação | |
| Conferência M5 | |
| Cada módulo aberto uma vez | |
| Cópia dos backups da migração fora da pasta | |
