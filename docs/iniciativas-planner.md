# Iniciativas · Ações (Planner) e KAS

A página Iniciativas deixou de ser "em construção" na **1.0.0** (08/11/2026, etapas E6 e E8 do plano único). Ela saiu do gerador (`fontes/modelo/gerar_paginas.py`) e agora se edita direto em `paginas/Iniciativas.html`.

- **Abas:** Ações · KAS · OSM · 5S · Configuração.
- **OSM (E7):** entra quando houver uma amostra da planilha da plataforma oficial.
- **5S (E13):** entra com o motor de checklist de AM/TPM.

Enquanto OSM e 5S não chegam, ações com essas origens podem ser criadas à mão.

## Base `iniciativas-base.json`

Fica em `00. Bases` (está na lista `VAC_BASES` do kit) e só esta página grava nela (regra 1). Backup diário e "Backup agora" ficam em `00. Backups/Iniciativas`.

```
{ schema:'vac-iniciativas', schemaVersion:1, rev, revId, revBy, revAt, appVersion,
  acoes:[{ id:'AC-AAAAMMDD-XXXX', titulo, descricao, status, prioridade, responsavel, apoios:[],
           prazo, prazoOriginal, criadaEm, criadaPor, concluidaEm, atualizadaEm,
           origem:{ tipo, ref, resumo, link, foto:{…} }, vinculos:[{ tipo, cod }],
           checklist:[{id,txt,feito}], comentarios:[{id,em,por,txt}], evidencias:[{id,em,por,url,txt}] }],
  eventos:[{ id, acao, tipo:'criação'|'status'|'responsável'|'prazo'|'prioridade'|'edição', de, para, resp, motivo, em, por }],
  kas:[{ id:'KAS-AAAA-XXXX', titulo, status, dono, area, problema, proposta, baseline, meta, resultado }],
  auditoria:[…], exports:{…} }
```

**Situação** (aprovada nos esboços): `a fazer` · `em andamento` · `aguardando` · `concluída` · `cancelada` (escondida no quadro).

**Origem:** `manual`, `oee`, `paradas`, `waste`, `gel`, `ficha`, `reuniao`, `kas`, `osm`, `5s`.

**Vínculos:** `ordem`, `lote`, `equipamento`, `codigo` (de parada), `catalogo`, `evento`. Códigos sempre como texto (regra 4).

## Gravação

Segue o padrão do Paradas: cada mudança vira uma operação, guardada na fila deste navegador (`inic.fila`).

| Operação | O que faz |
|---|---|
| `nova` | cria a ação e o evento de criação |
| `campos` | muda campos de uma ação (`ac`) e grava o evento do histórico |
| `item` | inclui ou substitui um item de checklist, comentário ou evidência |
| `kas` | inclui ou substitui um KAS |

Ao gravar:
1. relê a base da pasta;
2. reaplica as operações pendentes;
3. grava;
4. relê e confere o `revId`. Se outra estação gravou junto, repete.

Duas estações mudando **campos diferentes** da mesma ação mantêm as duas mudanças. Se mudam o **mesmo campo**, fica a última gravação, e as duas aparecem no histórico.

Erro de leitura não é "base ausente" (`vacNaoAchou`): sem ler a base, a página não grava, e a alteração fica pendente com o botão "Gravar de novo" (regra 10).

## Tempos (PLA-03, PLA-05)

Os tempos saem do histórico, por intervalo:
- tempo em cada situação;
- tempo com cada responsável, contado só enquanto a ação está aberta.

Cobrem transferência, espera e reabertura. São dias corridos, rotulados assim. Dias úteis, SLA e regras de prioridade (PLA-04, PLA-07) ficam para quando houver decisão.

## Telas

- **Quadro:**
  - colunas A fazer, Em andamento, Aguardando e Concluída (últimos 14 dias ou todas);
  - para mudar a situação, arrastar o cartão ou usar os botões do detalhe.
- **Lista:** tabela ordenada pelo prazo.
- **Por responsável:** grupos por pessoa, com "(sem responsável)" por último.
- **Minhas:** ações em que a pessoa que entrou é responsável ou apoio.
- **Detalhe:**
  - ações: Em andamento, Aguardando, Concluir, Transferir (com motivo), Adiar prazo (motivo obrigatório; o prazo original fica guardado), Editar, Cancelar e Reabrir;
  - origem com a fotografia e o link de reconsulta;
  - vínculos (a ordem abre a ficha comum);
  - checklist, tempos, comentários, evidências (link) e histórico.
- **Nova ação:**
  - mostra as ações abertas ligadas ao mesmo equipamento, código, ordem ou referência de origem, para não duplicar sem aviso (E8);
  - chega também por `#nova=<JSON>`, vindo de outras páginas (ver abaixo).

**Rotas:**

| Rota | O que abre |
|---|---|
| `#aba=acoes\|kas\|osm\|s5\|config` | a aba |
| `#acao=<id>` | o detalhe da ação |
| `#ordem=<n>` | a lista filtrada pela ordem (usada pela ficha) |
| `#nova=<JSON>` | o formulário de nova ação, preenchido |
| `#teste` | dados fictícios, sem gravar nada |

## exports (`exportsVersion` 1)

| Campo | Conteúdo |
|---|---|
| `acoes` | abertas e as mexidas nos últimos 365 dias: id, título, situação, prioridade, responsável, apoios, prazos, se está atrasada, origem resumida, vínculos e checklist feito/total |
| `kas` | id, título, situação, dono, área e número de ações |
| `pendencias` | `sev 1` = vencida; `sev 2` = vence em breve (`aPartirDe` 2 dias antes) ou sem responsável. Cada uma com `responsavel`, `apoios`, `prazo`, `origem` e `link: 'acao=<id>'`, para a Minha fila do Portal |
| `kpis` | Ações abertas, Vencem em 7 dias, Concluídas no mês, Sem responsável |

A ficha da ordem (kit) lê `acoes` e mostra "Ações ligadas".

## Teste

`node testes/tplanner.js` cobre:
- quadro e tempos do exemplo;
- transferência, espera e reabertura;
- criação da base em `00. Bases`;
- exports;
- ficha;
- duas estações gravando juntas;
- erro de leitura;
- `#nova=` com aviso de ação parecida;
- KAS;
- tema escuro e 390 px.

## 1.0.1 (08/11/2026) · revisão do Codex no PR #15

O `exports` é gerado de novo quando é de outro dia (ao gravar ou ao abrir a página com a pasta). Antes, sem alteração, ficava o resumo do dia em que foi gravado.

## 1.0.2 (08/11/2026) · C1

- **Fila durável:** as alterações pendentes ficam na fila durável do kit, sem perda entre abas; a fila antiga do `localStorage` é importada uma vez.
- **Base que some:** se a base conhecida some, nada é gravado; a barra mostra "Recriar a base" e "Escolher outra pasta".
- **Pasta sem a base:** só é criada depois de confirmar.
- **Formato:** base de formato desconhecido fica só para leitura.
- **Links:** links de origem e de evidência só com endereço seguro.
- **Regravação:** as confirmadas e sobrescritas voltam em até 24 h.
- Teste: `tpendencias.js`.

## 1.0.3 (08/11/2026) · C2

- **Virada do dia:** ao voltar para a aba, se o resumo (`exports`) é de outro dia, a página grava de novo (AT-04).
- **`#ordem=<n>`:** filtra pelo vínculo de ordem, com a mesma regra da ficha: sem os zeros à esquerda, só para comparar (AT-12).
  - A ordem citada só na descrição não entra, nem uma ordem parecida.
  - Uma pílula "Ordem … ✕" tira o filtro.


## 1.0.4 · 08/11/2026

Isolamento por pasta e reserva por operação, com cópia de recuperação. Procedimento, testes e limites em [estabilizacao-nv-01-05.md](estabilizacao-nv-01-05.md).
