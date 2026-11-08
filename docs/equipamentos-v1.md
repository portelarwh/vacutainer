# Equipamentos 1.0 · ficha, ordens de serviço, TAGs e AM/TPM

A página Equipamentos deixou de ser "em construção" na **1.0.0** (08/11/2026, etapa E11 do plano único). Ela saiu do gerador e agora se edita direto em `paginas/Equipamentos.html`.

**Abas:** Equipamentos (lista e ficha) · Ordens de serviço · TAGs · Padrões AM/TPM · Configuração.

## De onde vem cada coisa

| Parte | Fonte | Quem grava |
|---|---|---|
| Equipamentos, nomes e apelidos | cadastro do Portal (`vacCad().equipamentos`) | Portal |
| Falhas por período, MTBF/MTTR por mês, componentes que mais quebram | `exports` do Paradas (`eventos`, `porEquipamentoMes`, `porComponente`), lido sem gravar | Paradas |
| OS, TAGs, anomalias, padrões AM/TPM | `equipamentos-base.json` em `00. Bases` | esta página |

A ficha diz com todas as letras que as falhas são **histórico** do que foi apontado, não o estado atual da máquina. Estado em tempo real só virá com o MES (E12).

## Base `equipamentos-base.json`

```
{ schema:'vac-equipamentos', schemaVersion:1, rev, revId, revBy, revAt, appVersion,
  os:[{ id:'OS-AAAAMMDD-XXXX', equipamento, titulo, descricao, tipo, status, prioridade, responsavel, programadaPara,
        sapNota, origem:{ tipo:'paradas'|'anomalia'|'manual', ref, resumo, link }, criadaEm, criadaPor, concluidaEm,
        apontamentos:[{id,em,por,txt}] }],
  tags:[{ codigo, equipamento, proposito, ativo, vigencias:[{ id, de, nomeMes, tipo, unidade, criadaEm, criadaPor }], vigenciasDesativadas:[…] }],
  anomalias:[{ id, equipamento, descricao, em, por, os }],
  padroes:[{ id, equipamento, tipo:'limpeza'|'inspecao'|'lubrificacao'|'centerline', ponto, periodicidade, faixa, habilitacao, referencia, ativo }],
  eventos:[…histórico das OS…], auditoria:[…], exports:{…} }
```

**OS:**
- **Situação** (aprovada nos esboços): `aberta` · `programada` · `em execução` · `concluída` · `cancelada`.
- **Tipo:** corretiva, preventiva, anomalia (AM/TPM) ou melhoria.
- **Nota/OS SAP PM:** campo opcional, guardado como texto.

**OS a partir de um evento do Paradas:**
- o Paradas abre `Equipamentos.html#novaOS=<JSON>` (botão "+ Abrir OS" no evento);
- a OS guarda **só a referência** do evento (`origem.ref`), um resumo de uma linha e o link para voltar; não copia os dados do evento;
- se já existe OS aberta para o mesmo evento, o formulário avisa.

**TAG (TAG-01, TAG-04):**
- propósito, nome no MES, tipo e unidade, com vigência a partir de uma data;
- vigência gravada não muda (regra 3): uma mudança é uma vigência nova, e a antiga continua valendo para as datas dela;
- para corrigir, a vigência é desativada (vai para `vigenciasDesativadas`, com o motivo) e outra é criada;
- quem ler o MES (E12) usa `vacVig` com a data do fato.

**AM/TPM (TPM-01, TPM-02, TPM-06):**
- a estrutura do ponto existe, mas nenhum conteúdo é inventado; os padrões técnicos chegam na E13;
- a anomalia encontrada na rotina é registrada no equipamento e vira OS ligada.

A gravação é igual à de Iniciativas (`docs/iniciativas-planner.md`):
- operações em fila;
- releitura antes de gravar;
- `revId` conferido;
- operações confirmadas reconferidas na leitura seguinte;
- backup diário em `00. Backups/Equipamentos`.

## exports (`exportsVersion` 1)

| Campo | Conteúdo |
|---|---|
| `os` | abertas e as mexidas nos últimos 365 dias (sem os apontamentos) |
| `porEvento` | `{ idDoEvento: [{id, status, titulo}] }`. O Paradas mostra a OS no evento por aqui |
| `tags` | código, equipamento, propósito e a vigência de hoje (tipo, nome no MES, unidade, desde) |
| `pendencias` | OS atrasada (`sev 1`), OS sem responsável e anomalia sem OS (`sev 2`), com `responsavel`, `prazo` e `link` |
| `kpis` | OS abertas, anomalias sem OS, TAGs, pontos AM/TPM |

## Rotas

| Rota | O que abre |
|---|---|
| `#aba=equip\|os\|tags\|am\|config` | a aba |
| `#eq=<código>` | a ficha do equipamento (a busca Ctrl K das outras páginas usa esta rota) |
| `#os=<id>` | o detalhe da OS |
| `#novaOS=<JSON>` | o formulário de nova OS, preenchido |
| `#teste` | dados fictícios, sem gravar nada |

## Teste

`node testes/tequip.js` cobre:
- ficha;
- base em `00. Bases`;
- OS a partir do evento (sem cópia, com aviso de duplicada);
- situação e histórico;
- TAG com vigência pela data do fato e desativação com motivo;
- anomalia que vira OS;
- exports;
- Paradas mostrando a OS e "+ Abrir OS";
- Ctrl K levando à ficha;
- tema escuro e 390 px.

## 1.0.1 (08/11/2026) · revisão do Codex no PR #15

- O `exports` é gerado de novo quando é de outro dia (ao gravar ou ao abrir a página com a pasta).
- A OS programada publica a pendência de atraso com `aPartirDe` = dia seguinte à data programada.
- A anomalia é gravada antes do formulário da OS: cancelar a OS não perde a anomalia.

## 1.0.2 (08/11/2026) · C1

Mesmas proteções de Iniciativas 1.0.2: fila durável, base que some, confirmação para criar a base, formato, link de origem seguro (`#novaOS=` descarta link inseguro) e regravação em 24 h.

