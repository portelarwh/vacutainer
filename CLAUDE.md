# Vacutainer · produto e código únicos

Leia primeiro [AGENTS.md](AGENTS.md) e [COMECE-AQUI](docs/COMECE-AQUI.md). As mesmas regras se aplicam a Codex, Claude e demais agentes.

## Fonte e uso

**Plataforma.html é a única fonte e o único executável do aplicativo.** Abra-o em Chrome/Edge. O código completo está em blocos nomeados dentro dele; não se busca página antiga, biblioteca, API ou servidor. Fontes e logos comerciais opcionais continuam na pasta externa Marca/, conforme [MARCA](docs/MARCA.md); sem eles há fallback local.

O arquivo não é gerado de outro HTML ou de uma árvore TypeScript. JavaScript ES2022, React 19.1.0 e Zod 3.24.2 estão incorporados. `npm run build` verifica o arquivo pronto, não o reconstrói de fontes antigas. Sem node_modules, o produto continua abrindo. Node 22 e Playwright 1.63.0 são necessários somente para verificar/testar.

## Mapa dentro do arquivo

| ID data-vac-source | Responsabilidade |
|---|---|
| modulo/App | Layout, consultas, navegação e relatório comum. |
| modulo/components/* | Componentes compartilhados, abas e módulo interno. |
| modulo/core/* | Leitura de exports, permissões, isolamento por pasta e integração. |
| css/brand; css/style | Identidade BD e layout da plataforma. |
| comum/visual; css/kit; comum/interface | Estilos, cabeçalho, componentes e contrato vacPagina compartilhados. |
| comum/bases | Persistência, filas, adaptação do cenário e utilitários comuns. |
| motor/portal | Administração e cadastro geral; base portal-base.json. Na plataforma 1.3.0 as telas de acompanhamento dele aparecem como abas da casca: Visão geral, Pendências e ações e Reunião diária na Visão da linha; Relatórios e Importação nas páginas Relatórios e formulários e Importações. Administração mostra só cadastros e configuração. |
| motor/oee | Produção, OEE, SAP, turnos, scrap, gel, SQDCP e Timeline Operacional (aba Linha do tempo: `Timeline`, `TLV`, `Cfg.tags`; bloco aditivo `db.timeline`; ver docs/timeline-operacional.md); bases oee-vacutainer-base.json e ordens-base.json. |
| motor/perdas; motor/gel; motor/paradas | Waste/MUV, estoque e consumo de gel, paradas. |
| motor/equip; motor/inic; motor/linha | Equipamentos/OS, Iniciativas/Ações, Linha 360° (com os Formulários A4, aba `form`, bloco aditivo `formularios`; ver docs/CONTRATO-MOTORES.md › FORM-01; planta de `IMAGENS/PLANTA_BAIXA.SVG`, banco de imagens `vacImagens` e fotos na planta, bloco aditivo `fotos`; ver docs/IMAGENS.md). |
| motor/projetos | Escopo ainda em construção. |
| biblioteca/*; vendor/* | SheetJS, jsPDF, AutoTable, React/ReactDOM e Zod incorporados; preservar licenças. |
| ferramenta/* | Verificar pasta e comparar importação, acessíveis em Saúde dos dados. |
| dados/manifesto; dados/cenario | Versões/hashes do código e cenário exclusivamente fictício. |

Fora do HTML único, só a pasta [CELULAR](CELULAR/LEIAME.md): app de celular "Meu Turno" (arquivo único `CELULAR/index.html`), independente da plataforma e sem acesso às bases; teste `npm run test:celular`. O mesmo arquivo está no bloco `celular/meu-turno`, que a Administração usa para gerar o app com o cadastro: ao mudar `CELULAR/index.html`, rode `node scripts/bloco.mjs celular/meu-turno CELULAR/index.html` (o teste `mt-celular` confere). O app de manutenção `CELULAR/manutencao.html` segue a mesma regra com o bloco `celular/manutencao` (teste `man-celular`). A leitura do QR dos apps usa `vacQR` (comum/interface) com `biblioteca/jsqr` (Apache 2.0).

## Contratos que não podem mudar incidentalmente

1. Portal é o único dono de vacutainer-cadastros.json. Cada motor só grava suas bases; outros leem exports com versão compatível. Ausência ou erro nunca vira zero. Casca não recalcula OEE nem faz média simples de taxas.
2. Vigências gravadas são imutáveis; desativação seguida de nova vigência. Leitura pela data do fato. Códigos e ordens como texto; normalizações SAP existentes permanecem.
3. Gravação exige releitura, backup, aplicação da fila e confirmação. Erro não é arquivo ausente. Preservar filas duráveis, reservas por pasta, Web Locks, auditoria e recuperação.
4. Sessão vacLogin e travas vacTravas são mantidas. Sem sessão, consulta; senha/autocadastro usa somente a transação restrita de conta própria. Base mais nova que o motor impede escrita.
5. Sev 1 é urgente e sev 2 atenção, inclusive no Portal e relatórios. Rastreabilidade por ordem/lote/equipamento segue relações existentes, sem presumir unicidade global.
6. Layout não altera números, unidades, filtros, IDs, eventos, metas ou períodos. SQDCP permanece uma A4 paisagem e verde/vermelho conforme resultado versus meta.
7. Não modificar fórmulas, interpretação de madrugada/turnos, classificação de paradas, OSM/MES/AM/TPM/Projetos ou estruturas de base sem autorização explícita.
8. Pessoa = ID do cadastro (`usuarios[].codigo`); o nome é informativo e pode mudar no Portal. Quem grava guarda o ID ao lado do nome (`responsavelId`, `apoiosIds`, `responsibleId`, `userId`), quem mostra usa o nome atual e quem compara usa o ID, pelo `vacPessoa` (comum/bases). Registro sem ID não é ligado a ninguém pelo nome. Nome digitado ambíguo ou não cadastrado fica para confirmação, sem associação automática à fila. O campo Sem responsável mantém esses itens visíveis.
9. Backup diário: o resultado vai para `vacBackupRegistro` (comum/bases), em `00. Backups/<módulo>/registro-backup-<id>.log` e no navegador. Cada perfil escreve seu arquivo; Web Locks e fila serializam as abas. Sem Web Locks há arquivo por instância. O Portal lê todos os logs `registro-backup-<id>.log`, sem sobrescrevê-los. Falha sem acesso à pasta fica marcada como só local. Só um sucesso posterior à falha comprova recuperação; empate de horário mantém o aviso. Os chamadores aguardam o registro, que trata a indisponibilidade do log sem ocultar a falha do backup. Retenção opcional (`parametros.backupDias`, Administração › Parâmetros, mínimo 7 dias): depois de um backup que deu certo, `vacBackupRegistro` apaga da pasta do próprio módulo os `.json` mais velhos que o prazo, mantendo os 10 mais recentes; sem prazo, nada é apagado; `.log` nunca.
10. Base limpa (24/11/2026): o caminho normal não traz compatibilidade com base, cadastro ou export de versão anterior; versão diferente bloqueia a gravação. Base sem `schemaVersion` ou com versão menor abre só para consulta com "Base de versão anterior. Comece uma base nova nesta pasta."; export de outro motor em versão anterior não é usado ("Dados de <página> em versão anterior"); base nova já nasce com `schemaVersion`. O bloqueio já vale para o cadastro (`vacutainer-cadastros.json`, versão 2), Administração (`portal-base.json`), Produção (`oee-vacutainer-base.json`), Paradas, Equipamentos, Iniciativas, Linha 360°, Ordens da Produção (`ordens-base.json`), Waste (`perdas-base.json`) e Gestão de Gel (`fifo-base.json`); nesses três a base de versão anterior não é lida nem gravada, e a cópia de versão anterior é recusada na restauração (teste `base-limpa-motores`). O projeto começa de base limpa (decisão do responsável, 25/11/2026): não há migração de dados. Bases gravadas antes disso (a main não gravava `schemaVersion` no Waste nem no Gel) só abrem para consulta; use uma pasta nova. Exceção prevista (D02, Plano Mestre 6.3), não incorporada: um migrador pontual de uso único, fora do caminho normal, ficou como PR de reserva (#155, com o carimbo M1b do Waste e do Gel) para o caso de se querer aproveitar dados antigos. Lista do que saiu: [BASE-LIMPA](docs/BASE-LIMPA.md); o teste `base-limpa.test.mjs` (lista `PROIBIDO`) impede a volta ao caminho normal.

## Comandos na raiz

```sh
npm ci
npx playwright install chromium
npm run build
npm run test:unit
npm test
npm run test:plataforma
npm run test:reprodutibilidade
```

`node scripts/cenario-demo.cjs --gravar` refaz o cenário da demonstração (dados/cenario) com o formato e os exports do código atual; rodar depois de mudar exports ou formato de base. Os testes rodam sem internet: pedido externo reprova (testes/http-local.cjs).

A cada versão nova da plataforma, acrescente a entrada em **Administração › Novidades** (`NOVIDADES` em motor/portal; frases curtas: novo, melhoria ou correção); o teste `novidades` exige que a versão da plataforma seja a primeira.

`npm run atualizar:metadados` valida e atualiza hashes após mudanças no código incorporado. `npm run dev` serve o próprio arquivo apenas para desenvolvimento. Não recriar build.py, aplicar_kit21.py ou um empacotador que dependa de páginas separadas. A regressão preserva as suítes operacionais de `testes/tudo.js` (70 em 24/11/2026) e os testes de integração da plataforma; testes de geradores removidos foram substituídos pela validação do HTML canônico.

Aparência de página: skill [padrao-visual](.claude/skills/padrao-visual/SKILL.md), com `node scripts/varredura-visual.mjs --modulo "<Módulo>" --aba <id>`; só visual, sem fórmula.

Resultados e exclusões: [CONSOLIDACAO](docs/CONSOLIDACAO.md). Pendências únicas: [PENDENCIAS](PENDENCIAS.md). O histórico anterior foi retirado da árvore ativa, sem apagar o histórico Git.
