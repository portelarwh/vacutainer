# Relatório de estado técnico · Vacutainer (atualização)

Data: 26/11/2026 · Repositório: `portelarwh/vacutainer` · Main: `c325f7a` (plataforma 1.8.70, Administração 1.9.89, Produção 2.6.50)
Substitui o relatório de 25/11/2026 (`2026-11-25-relatorio-pendencias.md`), cujas pendências 5.1 a 5.3 foram resolvidas. Nenhum dado real: tudo foi testado com dados fictícios.
Destino: revisão técnica independente (contraparte).

## 1. Resumo
- **Base limpa**, **Produção sem cópia dos cadastros** e **configurações da Produção na Administração** estão na main. Produção só lê.
- **Carga por tabela** (⇩ Modelo / ⇧ Importar planilha) em 10 tabelas do cadastro, com prévia e validação da ficha.
- **Itens do contrato 7 autorizados** (26/11/2026): mapa de tags da Linha do tempo no cadastro, descrição e vigência dos códigos de parada, padrões do Waste só como sugestão, logo único.
- **Primeiro uso** (achado de hoje): numa pasta nova ninguém conseguia criar o cadastro; agora a tela de entrada cria o cadastro inicial com o primeiro administrador. É uma **exceção ao contrato 4**, registrada em `CLAUDE.md` e a parte que mais merece revisão.
- **Ainda não homologado** em pasta de rede real nem com duas estações (H01/H02). Todos os testes de pasta usam OPFS em memória.

## 2. PRs e main
| PR | Conteúdo | Estado |
|---|---|---|
| #157 | Bloco 3: Produção sem cópia dos cadastros (1.8.66) | mergeado |
| #158 | Bloco 3b: parâmetros da Produção na Administração (1.8.67) | mergeado `3f82d0f` |
| #159 | Carga por tabela e abono na Administração (1.8.68) | mergeado `0a57dfc` |
| #160 | Contrato 7 autorizado + logo único (1.8.69) | mergeado `42fdb1a` |
| #161 | Primeiro uso: cadastro inicial com o 1º administrador (1.8.70) | mergeado `c325f7a` |
| #155 | Migrador pontual (reserva) | fechado sem merge |
CI de cada um: jobs `regras` 1–4 e `plataforma` verdes no commit mergeado. Codex revisou cada PR; os achados foram corrigidos com teste.

## 3. O que mudou desde 25/11 (por área)
- **Parâmetros** (`parametros.producao` e `parametros`): modo da Performance, perda de velocidade, cobertura/divergência, pendências, servidor, hora extra, dias do plano, Problemas de QN, abono padrão, unidade/setor/fuso e planta do SAP. `ProdCad.montar` os deriva; a Produção recusa gravá-los (`PARAM_ADM`) e o arquivo não leva cópia. Faltando no cadastro, vale o padrão do cálculo (mesmos valores de antes).
- **Carga por tabela** (`CargaTab`): célula vazia não apaga; código fora da planilha não muda; catálogo/turno novo nasce com uma vigência; item existente não muda vigência (contrato 2); campos travados (`tag`, `equipamento` do mapa de tags) não mudam depois de gravados; código MES conferido contra o estado resultante do lote.
- **Tags da Linha do tempo**: `CAD_T.tagsMapa` com vigência; `db.timeline.tagMap` derivado (id `tm_<código>_<de>`); arquivo da Produção não o guarda. As TAGs de Equipamentos (TPM) **não** foram tocadas: ainda são duas listas.
- **Paradas**: `descricao`, `vigenciaDe`, `vigenciaAte` opcionais (sem eles, 2025-01-01 e sem fim). Classificação não mudou.
- **Waste**: base nova sem tipos de item e sem causas; sugestão por botão.
- **Gel**: ritmo (meta, nominal, dias, velocidade máxima, meta de OEE) e indicador de scrap em `parametros.gel`; o Gel lê do cadastro, com o padrão do cálculo no que faltar. Preço próprio do Gel (`S.config.prices`) desativado: vale Administração (Preços e Câmbio).
- **Logo**: envio só na Administração; grava `Logo.png` na pasta; a base decide antes de apagar ou gravar.
- **Cadastro novo sem textos de local** (unidade e setor vazios; fuso do navegador).
- **Primeiro uso**: formulário do 1º administrador; ver 4.

## 4. Primeiro uso: a exceção do contrato 4 (revisar com rigor)
- Problema: a gravação exigia sessão; a sessão mora no cadastro; numa pasta sem cadastro nada gravava (a guarda devolvia `NotFoundError`).
- Solução: `cadCriarInicial` grava uma operação `carga` com `origem: 'bootstrap'`. A guarda do quadro (bloco `modulo/core/runtime`) libera só `00. Bases` e `vacutainer-cadastros.json` enquanto `vacPagina.filaBootstrap()` for verdadeira: pasta sem cadastro (`Cad.fonte === 'nenhum'`, `!Cad.base`), fila com exatamente uma carga bootstrap, um usuário ADMIN com hash de senha, nenhuma outra tabela, perfis iguais aos padrão. O `createWritable` só abre arquivo existente **vazio**; `validarDocumentoInicial` compara o documento com a operação. Um envio por vez (trava em andamento).
- Prova: `testes/plataforma/primeiro-uso.cjs` (inclui: sem sessão e com cadastro criado nada grava; três envios seguidos; senha fraca recusada).
- Perguntas ao revisor: (a) corrida entre duas estações criando o cadastro ao mesmo tempo; (b) o que `showDirectoryPicker` e a permissão do navegador permitem fora do iframe; (c) se `filaBootstrap` pode ser satisfeita por um cadastro apagado de propósito (a pasta perde o arquivo) — nesse caso quem tem a pasta já pode tudo.

## 5. Pendências (do meu lado e do responsável)
Do agente: (1) TAGs de Equipamentos e do TPM seguem em base própria; (2) regras de estoque do Gel (modo da fila, kg por cm, altura, vencimentos) ainda na página; (3) carga por tabela só na Administração (as páginas têm as importações próprias, listadas em `docs/PRIMEIRO-USO.md`); (4) apagar a branch `claude/carga-tabela-abono`.
Do responsável: teste em pasta de rede real e duas estações (H01/H02); planilhas reais nos modelos; conferências de uso real em `PENDENCIAS.md`.

## 6. Testes
`npm run lint` limpo; `npm run test:unit` 79; `npm test` 69 suítes; `npm run test:plataforma` 89 suítes (rodadas também em paralelo local). Novos desde 25/11: `prod-numeros`, `prodcad-*`, `prod-config-adm`, `carga-tabela`, `logo-unico`, `padroes-embutidos`, `primeiro-uso`, `gel-ritmo`. `prod-numeros` prova que OEE, A, P, Q, paradas e agregados ficaram iguais aos de antes da troca de origem.

## 7. O que não foi provado
SMB/duas estações; permissão de escrita do navegador em pasta de rede real; desempenho com cadastro grande; navegador diferente de Chromium; carga de planilhas reais (só planilhas fictícias lidas de volta).
