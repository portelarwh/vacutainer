# Pendências · Sistemas da Linha Vacutainer

Atualizado em 12/11/2026. Serve para retomar o trabalho em outro chat: leia este arquivo, o `CLAUDE.md` e o `docs/auditorias/registro-decisoes.md`. Item recusado no registro só volta com fato novo.

## 1. Onde paramos

Versões no `main`, todas com os PRs mesclados até o #59:

| Página | Versão | Última entrega |
|---|---|---|
| Portal | 1.9.27 | Lê o MUV e o target do Waste |
| Produção (`OEE-Vacutainer.html`) | 2.4.59 | Todos os gráficos hora a hora com a lógica do Apontamento |
| Waste (`Perdas-Ordem.html`) | 1.11.0 | MUV oficial e target MUV por linha |
| Paradas | 1.2.0 | Refatoração UX/UI completa |
| Gestão de Gel | 2.28 | — |
| Equipamentos | 1.0.10 | — |
| Iniciativas | 1.1.7 | — |
| Projetos | 0.1.10 | Em construção |

Últimas entregas desta rodada (11 e 12/11/2026):
- **Produção 2.4.52–2.4.59:**
  - hora a hora 24 h;
  - Caixas do MES pelo dia de trabalho;
  - Lançamento no layout novo;
  - nenhum ⓘ (a explicação fica no título);
  - SQDCP – Gestão Diária com Modo Reunião;
  - todos os gráficos hora a hora com as horas fora do turno.
- **Waste 1.9.0–1.11.0:** grade da controladoria, MUV oficial, target MUV por linha, filtros Linha e Semana.
- **Paradas 1.1.0–1.2.0:** Visão geral em faixas, Pareto, Equipamentos, Recorrência, Eventos, Fila técnica, Validação, Ações, ficha e celular.
- **Ferramenta:** `ferramentas/Comparar-importacao.html`.
- **Testes:** as comparações de versão passaram a ser numéricas (`verN`).

## 2. Implantar na pasta da rede

Copiar para a raiz da pasta, guardando antes a versão anterior renomeada:
- `Portal.html`
- `OEE-Vacutainer.html`
- `Perdas-Ordem.html`
- `Paradas.html`
- `Demonstracao.html` (é gerado de novo a cada entrega)

As bases em `00. Bases/` e a pasta `lib/` não mudam. Abrir cada página com Ctrl+F5 e conferir a versão no cabeçalho.

Ajustes de cadastro no Portal depois de copiar:
- **Target por linha:** cadastrar em Metas da área o `WASTE-MUV-<linha>` de cada linha, com o campo Linha, R$ ou US$, mês ou ano. Depois **desativar a `WASTE-MES`**, que deixa de valer quando existe algum `WASTE-MUV`.
- **Meta mensal:** se a meta do Waste foi definida sobre o desvio total, revisar o valor, porque agora ela é comparada com o MUV.

No Waste:
- **Reimportar as ordens no formato antigo:** a lista está na aba Importar. Até lá, o MUV delas aparece como "aprox.".

## 3. Homologação na pasta real

Checklist interativo (artefato): https://claude.ai/artifact/CBHNMp4M15v3n4N32ZCYV8

Grupos abertos desta rodada:

| Grupo | O que conferir |
|---|---|
| H24, H54, H55 | Hora a hora 24 h e por turno |
| L56 | Lançamento novo e explicação no título |
| HHT | Gráficos hora a hora com 04:00/05:00 antes das 06:00 |
| SQL | SQDCP – Gestão Diária e Modo Reunião na TV |
| WGR | KKBC em grade |
| MUV | MUV oficial |
| TGT | Target por linha |
| PUX-01 a PUX-10 | Paradas |

Também de antes:
- **Primeira abertura:** aviso do CadSync na Produção.
- **Gravação simultânea:** duas abas e duas estações gravando ao mesmo tempo (C1, etapa H).
- **Ambiente:** uso sem internet, Chrome e Edge, acentos nos caminhos.
- **Densidade:** observar as telas com operador e liderança.
- **Gel (Fase 4):** Trazer configurações › parâmetros do gel, data de corte, Registrar scrap num turno, Resumo do dia no Gel.
- **Outlook:** cópia com imagens no Outlook da empresa (desktop e web).

## 4. Pendências de funcionalidade

**Sem bloqueio, prontas para fazer:**
- **Calendário de produção no Portal.**
- **`eventoId` comum entre Produção e Paradas:** evita contagem dupla quando o OEE publicar `paradasEventos` (`docs/paradas-arquitetura.md`, registro F07/A10).
- **Falha do backup diário em Portal › Versões:** as páginas não registram a falha na pasta (registro § V, C5).
- **Dependência do Waste na base da Produção:** ele ainda lê a base para ordens além dos 24 meses de `exports.porOrdem` e lotes além dos 150 dias de `exports.lotes` (registro § U, E4).
- **Padrão das outras páginas:** levar o padrão de layout do Paradas 1.2.0 (faixas, filtros ativos, tabela com cabeçalho e coluna fixos, "Mais filtros" no celular) para Gel, Equipamentos e Iniciativas, se o usuário pedir.
- **Cor de "atenção" no SQDCP:** a cor âmbar só entra quando houver uma regra de alerta por indicador.

**Esperando decisão ou material do usuário:**
- **R-02, identificador da pessoa:** o responsável é guardado pelo nome; falta decidir o que fazer com nomes digitados à mão (registro § V).
- **Telas por perfil (E10c):** Resumo/Detalhado, o que fica em "Mais", passagem de turno, alerta de ritmo. Falta validar as jornadas com operador e liderança.
- **OSM (E7):** falta a amostra da planilha.
- **Importação por pasta (E9):** falta decidir a estação coletora.
- **MES (E12):** faltam amostras e regras.
- **AM/TPM e 5S (E13):** faltam os padrões.
- **Projetos (E15):** falta o escopo.
- **XLSX local (E3b):** falta o arquivo.
- **`paginas/lib/xlsx.full.min.js` (SheetJS 0.20.3):** subir o arquivo que está na pasta da linha. Sem ele, o teste do Excel fica "NÃO VERIFICADO".

## 5. Testes e manutenção

**Testes instáveis ou de ambiente:**
- **`testes/tnv.js`:** falha neste ambiente de desenvolvimento com 8 `SecurityError` no armazenamento de arquivos do navegador (OPFS). Falha igual no `main` sem nenhuma mudança, então não é da página. Conferir num Chrome normal.
- **`testes/tz.js`:** às vezes falha e passa ao rodar de novo.
- **`testes/tintegra.js` › "ação que vence amanhã":** falha entre 21h e 0h de Brasília (fuso do teste).
- **`testes/t181.js`:** expira no fim (passo da matriz).

**Testes com referência gravada antes da mudança:**
- **Lista:** `tvisaogeral`, `twaste_vg`, `tparadas_vg`, `tparadas_ux`, `tgel_vg`, `tportal_vg` e `tsqdcp_layout`.
- **`--gravar`:** só antes de mudar a tela.
- **`tvisaogeral`:** tem `--atualizar-grafico` para trocar um gráfico só.

**Manutenção (registro § C):**
- **Waste:** índice por ordem para comentários e ações, quando o Painel passar de 300 ms ou de 2 mil comentários.
- **Funções grandes** (`computeDayRaw`, `CadSync.aplicar`, `openConfig` do Gel, `parseMetaFY27`, `cadValidarItem`): começar a próxima mudança por um teste que fixe o comportamento.
- **Meta FY27:** a leitura está duplicada (Produção e Portal).
- **Backup diário do Portal:** ignora falha; falta decidir o aviso.
- **URLs de download sem revogação:** no Paradas, na Produção e no Portal.
- **Geradores de PDF:** são três (Portal/Waste, Produção, Gel); unificar no kit se precisar.
- **`package.json`/CI:** ainda não existe.

**Layout:** faltam exemplos visuais dos componentes (cards, pílulas, abas) nos dois temas (registro § L).

## 6. Como retomar em outro chat

> Leia `PENDENCIAS.md`, `CLAUDE.md` e `docs/auditorias/registro-decisoes.md` do repositório portelarwh/vacutainer. Continue pela seção 4 (sem bloqueio) ou pela homologação da seção 3. Siga as regras do `CLAUDE.md`:
> - a Produção é editada em `fontes/producao/` e montada com o `build.py`;
> - rodar `gerar_demo.py` por último;
> - gravar a referência dos números antes de mudar uma tela;
> - subir a versão a cada entrega;
> - abrir PR ao final;
> - atualizar o checklist de homologação.

Ao resolver um item, tirar daqui e do `CLAUDE.md` (Pendências conhecidas) e marcar no registro.
