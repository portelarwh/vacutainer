# Sistemas · Linha Vacutainer (BD Curitiba)

Plataforma de páginas HTML de arquivo único que trabalham juntas numa **pasta única da rede** (File System Access API). Cada página tem a sua base JSON; o **Portal** é dono do cadastro geral. Interface e mensagens sempre em **português do Brasil**.

## Páginas (em `paginas/`, é o que vai para a pasta da rede)

| Página | Arquivo | Base | Versão | Como editar |
|---|---|---|---|---|
| Portal (cadastro geral, Administração) | `Portal.html` | `portal-base.json` + `vacutainer-cadastros.json` | 1.8.3 | direto no HTML |
| Produção (OEE, plano, ordens SAP) | `OEE-Vacutainer.html` | `oee-vacutainer-base.json` (+ `ordens-base.json`) | 2.4.2 | **NÃO editar o HTML**: editar `fontes/producao/` e rodar o build |
| Waste (perdas por ordem, KKBC) | `Perdas-Ordem.html` | `perdas-base.json` | 1.8.7 | direto no HTML |
| Gestão de Gel | `Gestão-Gel-Vacutainer.html` | `fifo-base.json` | 1.96 | direto no HTML |
| Paradas | `Paradas.html` | `paradas-base.json` | 1.0.6 | direto no HTML |

Futuras: Equipamentos/Máquinas, Manutenção, Projetos, OSM (ver `docs/paginas-novas.md`, `docs/osm-arquitetura.md`, `docs/plano-evolucao-plataforma.md`).

## Comandos

```bash
python fontes/producao/build.py        # monta paginas/OEE-Vacutainer.html a partir de OEE-base-2.0.html + ordens_servico.js + ordens_tela.js + cad_sync.js + kit_v21.js
python fontes/kit/aplicar_kit21.py     # recopia fontes/kit/kit_v21.js e o catálogo fontes/kit/sistemas.js nas outras 4 páginas (Portal, Waste, Paradas, Gel)
node testes/tpg.js                     # testes Playwright (abrem paginas/ em modo teste/exemplo; imprimem "sem erros")
node testes/tintegra.js                # Portal × exports: números iguais aos das páginas, urgência, gravação pendente com conflito
node testes/tmeta.js                   # importação da Meta OEE FY27 no Portal (precisa também do pacote npm xlsx)
```

- O build usa substituições exatas (`R(antes, depois)`) sobre a base 2.0: se um trecho não for achado exatamente 1 vez, para com `ERRO`. Mudança na Produção = nova regra `R(...)` no `build.py` ou mudança nos `.js` de `fontes/producao/`.
- Playwright e Chromium: `require('playwright')`; os testes usam `enterTest()` (Portal, Waste, Paradas) ou `Demo.enterExample()` (Produção) e bases sintéticas em `testes/bases/`. Amostras do SAP (descaracterizadas) em `testes/amostras/`. Prints vão para `testes/saida/` (fora do git).
- `testes/t181.js` tem um passo da matriz que expira (timeout) no fim: problema do teste, não da página; ajustar quando mexer na matriz.

## Regras da plataforma (não quebrar)

1. **Cada página só grava na própria base.** As outras leem só o bloco `exports` (com `exportsVersion`) — nunca a estrutura interna de outra página. O Portal mostra os números do `exports` (sem recalcular); dados brutos só sem `exports`, com a pílula "dados brutos". Pendências: `sev 1` = urgente, `sev 2` = atenção.
2. **O Portal é o único que grava `vacutainer-cadastros.json`.** Edição por operações (`criação`/`edição` com `mudancas {campo:{antes,depois}}`), fila, releitura, reaplicação, backup em `00. Backups/Cadastros/`, `rev`/`revId`. As outras páginas leem a cópia `localStorage['vac.cadastros']` (via `vacCad()`) em modo consulta, com "Editar no Portal" (`vacPortalHref('cadastros/<tipo>/<código>')`).
3. **Vigências gravadas são imutáveis**: só se desativa (vai para `vigenciasDesativadas`) e cria outra. Quem lê usa a vigência da **data do fato** (`vacVig`).
4. **Chave = código** (catálogo de 6 dígitos, `EQ01`, `FME`, `T1`, material SAP como texto — **nunca perder zero à esquerda**). Nada se apaga: `ativo:false`.
5. **Kit do cabeçalho igual em todas** (`vac-cabecalho v1/v2` + `kit_v21.js` + catálogo `sistemas.js`): não editar só numa página. Mudou o kit → `aplicar_kit21.py` + build da Produção.
6. **Mudanças cirúrgicas e aditivas**: não reescrever o que funciona; campos novos são opcionais e ignorados por quem não usa (compatível com `schemaVersion 1`). Mudar significado de campo = schemaVersion 2.
7. **ⓘ em todos os campos e categorias** de configuração, com o que é e um exemplo (`AJUDA_CAMPO`, `CAT_AJUDA` no Portal; `HELP` na Produção).
8. **Versão**: subir a versão da página a cada entrega (`PAGE.versao`, `APP_VERSION` ou `V1.xx` no `<title>`) e gravar `appVersion` na base. O Portal › Versões lê isso.
9. Importações do SAP: ficar na tela com "Importar a próxima" depois de gravar. Valores da KKBC importados em **BRL** (a prévia confere a moeda); câmbio vem do Portal (`vacCambio(data,'USD')`).
10. Uma alteração feita durante uma gravação nunca é dada como salva (grava de novo). Alteração pendente (gravação que falhou) só vai para a pasta se a base de lá não mudou; se mudou, baixa `_NAO-GRAVADO` e usa a da pasta.

## Leitores comuns do kit v2.1 (`fontes/kit/kit_v21.js`)

`vacCambio(data, moeda)` · `vacVig(vigencias, data)` · `vacParam(chave)` · `vacTurnosEm(data)` · `vacPrecoEm(material, data)` · `vacMetaArea(codigo, data)` · `vacPortalHref(hash)` · botão ← Voltar (abas entram no histórico; `vacNavAtual()` opcional) · `vacAoVoltar()` chamado ao voltar para a página (reler sem F5).

## Centralização no Portal (Portal 1.8/1.8.1)

Tipos no cadastro: `linhas, familias, catalogos, materiais (tipo, tipoSAP), bom (CS12; itens = nível 1, estrutura = níveis 2+), equipamentos (apelidos), componentes, turnos (vigências com pausas {codigo,…,desconta}, intervalos[], regraPedacoFinal), paradas (numero, pilar, classe, ondeAponta, equipamentos = matriz, guia, duracaoManual, relatorio), modosFalha, precos, metasOee, metasArea, metasOsm, cambio, parametros (paradaLongaMin, limiteMicroMin, motivosAbono, motivosSemProducaoProg/NP, acoesPadrao…)`.
Produção aplica o cadastro na base do OEE pelo `CadSync` (`fontes/producao/cad_sync.js`) quando muda a `rev`, e trava as abas de configuração com o aviso "vem do Portal". Detalhes: `docs/centralizacao-configuracoes.md`.

## Documentação (`docs/`)

- Plataforma: `arquitetura-integracao-sistemas.md`, `portal-e-padrao-comum.md`, `plano-evolucao-plataforma.md`, `centralizacao-configuracoes.md`
- Cadastro: `cadastro-base-contrato.md`, `cs12-importacao-bom.md`
- Kit: `kit-cabecalho-e-backups.md` (v1), `kit-cabecalho-v2.md` (v2/v2.1)
- Páginas: `portal-1-7.md` (Portal 1.7–1.8.3), `producao-ordens-sap.md`, `waste-v1-8.md`, `perdas-ordem-v1.md`, `paradas-arquitetura.md`, `portal-pedido-paradas.md`, `paginas-novas.md`, `osm-arquitetura.md`

Ao terminar uma entrega, atualizar o doc da página (seção nova com a versão e a data) e o `CLAUDE.md` se mudar regra, versão ou comando.

## Pendências conhecidas

- Calendário de produção no Portal.
- Gel lendo catálogos e equipamentos do Portal.
- Conferência com a pasta real (primeira abertura: ver o aviso do CadSync na Produção).
- Waste publicar `pendencias`/`kpis` no `exports` (o Portal ainda monta as pendências do Waste a partir das ações da base).
- `eventoId` comum OEE × Paradas (evita contagem dupla; ver `docs/paradas-arquitetura.md`).
