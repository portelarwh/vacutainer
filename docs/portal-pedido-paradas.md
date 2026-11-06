# Pedido para o Portal · cadastro e formulários para a página Paradas

03/11/2026 · vem do chat do Paradas (Paradas v1.0.1). Complementa "Cadastro base · contrato" (`claude/cadastro-base-contrato.md`) e "Paradas · arquitetura e v1.0" (`claude/paradas-arquitetura.md` §§ 3, 8, 9). Tudo compatível com `schemaVersion 1` (só campos e tipos novos; quem não usa ignora).

## 1. Códigos de parada: campos novos

Acrescentar em `paradas[]` (ficha, lista, Excel, importação e conferência):

| Campo | Formato | Uso |
|---|---|---|
| `numero` | texto de 3 dígitos, único, imutável depois de criado | o operador escolhe pelo número; a centena é o grupo (0 Outros · 1 Utilização · 2 Planejado/engenharia · 3 Partida · 4 Organização · 5 Setup · 6 Consumíveis · 7 Parou sem trocar peça · 8 Quebra · 9 Perdas sem parada) |
| `pilar` | `U` · `D` · `P` · `Q` · `P ou D` | Utilização, Disponibilidade, Performance, Qualidade |
| `classe` | `fixa` · `porDuracao` · `calculada` · `emPecas` | `porDuracao`: abaixo de `parametros.limiteMicroMin` = microparada (P); a partir dele = parada operacional (D) |
| `ondeAponta` | `Máquina` · `Linha` · `Linha + máquina` · `Liderança` · `Manutenção` | decide em qual formulário/seção do Forms o código aparece |
| `equipamentos` | `null` (todos) ou lista de códigos de equipamento | **matriz código × equipamento** (§ 3) |
| `exigeTrocaPeca` | booleano | grupo 8 (quebra) |
| `temporario` | booleano | OUT e NDI: comentário e revisão obrigatórios |
| `guia` | `{ descricao, exemplo, regra }` | texto do Guia (Paradas), do ⓘ do OEE e do formulário |

Validações: `numero` único e com 3 dígitos; centena coerente com a categoria; `equipamentos` só com códigos existentes; `classe` e `ondeAponta` dentro das listas.

## 2. Carga do catálogo proposto (Cadastros › Trazer das páginas)

Ler `paradas-base.json › exports.cadastros` (o Paradas publica a cada gravação):

```
exports.cadastros = { atualizadoEm, origem,
  paradas:[{ codigo, numero, nome, categoria, subcategoria, pilar, classe, ondeAponta, equipamentos, afetaD, afetaP, afetaQ, pareto,
             exigeTrocaPeca, exigeObservacao, temporario, guia:{descricao,exemplo,regra}, situacaoProposta }],   // 91 códigos
  inativar:[{ codigo:'FQL', substituidoPor:'QAG', texto:'QAG + QMT…QVI' }, LIM, MIC, MPL],
  modosFalha:[{ codigo:'MF01', nome:'Desgaste', ativo:true }, …],    // 20
  acoesPadrao:['Trocou peça','Reparou peça','Ajustou',…],
  limiteMicroMin:10,
  equipamentosVistos:[{ nome:'Tullip A', equipamento:'EQ01'|null }] }   // nomes do histórico do Forms
```

Regras da carga (com prévia e escolha item a item, auditoria `importação` origem "Paradas"):
- **Código que já existe** (os 23 atuais): completa os campos novos (`numero`, `pilar`, `classe`, `ondeAponta`, `equipamentos`, `guia`…). Nome, categoria, subcategoria e cor do cadastro **só mudam se o usuário marcar** na prévia. **Não mexer em `planejada`, `descontaPlanejado`, `afetaD/P/Q` dos códigos existentes** (REF, REV e RTB estão em decisão; mudar isso altera o OEE histórico).
- **Código novo** (68): cria com os campos acima; `planejada` = grupo 1, 2, 3 ou 5; `descontaPlanejado` = só grupo 1.
- **inativar**: FQL, LIM, MIC, MPL ficam `ativo:false` com `substituidoPor` (o contrato já prevê); nada se apaga, o histórico do OEE continua achando.
- Conferir os códigos duplicados que o guia original tinha (já resolvidos na proposta): força maior = FMJ (não FMAJ), comunicação = FRC (não FCO), causas de refugo com Q (QMT…QVI).

## 3. Matriz código × equipamento

- Tela nova em Cadastros (ou aba na ficha do equipamento): grade código × equipamento com checkbox, filtro por grupo, total de códigos por máquina. Grava em `paradas[].equipamentos` (`null` quando marcado em todos).
- Só os códigos com `ondeAponta` contendo "Máquina". Os de Linha/Liderança vão no formulário da LINHA.
- Carga: `exports.cadastros.paradas[].equipamentos` do Paradas (rascunho que o Pedro confere lá em Formulários).
- Quando a matriz estiver no cadastro, o Paradas passa a usar ela e trava a edição local.

## 4. Tipos novos

**componentes** (por equipamento; base do MTBF por componente, de Máquinas e de Manutenção)
```
{ codigo:"EQ02-C07", equipamento:"EQ02", nome:"Rolo de pressão da herma", sistema:"mecânico|elétrico|pneumático|hidráulico|automação|visão|ferramental|outro",
  criticidade:"A|B|C", materialSAP:null, ativo:true }
```
- Código = `<equipamento>-C<nn>`, imutável. Lista dentro da ficha do equipamento e lista geral com filtro.
- Importação colada (equipamento, nome, sistema, criticidade). Mais tarde: carga dos componentes que os técnicos digitarem no Paradas (`exports.porComponente`).

**modosFalha** (lista global curta)
```
{ codigo:"MF01", nome:"Desgaste", ativo:true }
```
- Carga dos 20 de `exports.cadastros.modosFalha`.

**parametros**: `limiteMicroMin: 10` (com ⓘ: revisão out/2024 do OEE Definition and Guidelines; o Performance Code de set/2023 diz 5 — confirmar no documento vigente) e `acoesPadrao: [...]`.

## 5. Equipamentos

- Conferir/criar os 13 da linha com código e `posicao`: Tullip A, Tullip B, Packout, Metro, Cap Placer, Gel dispensor, 3 Hours Delay, Tray Loader, Silica spray coater, EDTA spray coater, Evacuator, Kallfas, Label Printer (`equipamentosVistos` traz os nomes do histórico).
- Um equipamento `LINHA` com `tipo:"linha"` (linha inteira: troca de lote, falta de material, reunião…).
- "3 Hours Delay" é equipamento; o código 3HD continua sendo o tempo de partida até a 1ª produção boa (a confirmar).

## 6. Formulários de apontamento no Portal

- Botão na ficha do equipamento e em Cadastros: **"Imprimir formulário"** → abre `Paradas.html#formulario=<código>` (o Paradas já monta e imprime o A4 só com os códigos da máquina; um código só, sem duplicar a lógica no Portal).
- "Imprimir todos" → `Paradas.html#aba=forms`.

## 7. Paradas na Visão geral, Pendências e TV

- `Paradas.html` na pasta → o Portal marca como criada em `vac.sistemas` (já previsto no 1.5). Cartão pelo `exports` (`kpis`, `pendencias`, `serie`), sem código novo.
- Conferir no quadro Versões: Paradas `1.0.1`, cabeçalho v1, backups em `00. Backups/Paradas/`.
- Pendência do Portal: "N códigos do catálogo proposto ainda não cadastrados" (quando o `exports.cadastros` do Paradas tiver código que o cadastro não tem).

## 8. Pronto quando

- [ ] Ficha de código mostra e edita número, pilar, classe, onde se aponta, matriz e guia.
- [ ] Trazer das páginas cria os 68 códigos novos, completa os 23 e inativa FQL/LIM/MIC/MPL sem mexer em desconto/planejada dos existentes.
- [ ] Matriz gravada; o Paradas mostra "a matriz vem do cadastro" em Formulários.
- [ ] Componentes e modos de falha cadastrados; a ficha da parada no Paradas sugere os componentes da máquina.
- [ ] `parametros.limiteMicroMin` e `acoesPadrao` gravados.
- [ ] Equipamentos com código; o Paradas não mostra mais máquinas "provisórias".
- [ ] Atualizar o "Cadastro base · contrato" (§ 3.2 paradas, componentes, modosFalha, parametros).
