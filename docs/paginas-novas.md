# Páginas novas · Paradas, Máquinas, Manutenção e Projetos

03/11/2026 · ponto de partida para os chats das páginas novas. Vale junto com: "Arquitetura de integração", "Portal e padrão comum", "Cadastro base · contrato" e "Kit · cabeçalho comum e backups por módulo".

## 1. Identidade de cada página (fixa; as páginas se acham pelo nome)

| Página | Arquivo | Base | `PAGE.id` | `backupDir` | Título / subtítulo |
|---|---|---|---|---|---|
| Paradas | `Paradas.html` | `paradas-base.json` | `paradas` | `00. Backups/Paradas` | PARADAS · Análise de falhas e paradas de máquina |
| Máquinas | `Maquinas.html` | `maquinas-base.json` | `maquinas` | `00. Backups/Maquinas` | MÁQUINAS · Equipamentos da linha |
| Manutenção | `Manutencao.html` | `manutencao-base.json` | `manut` | `00. Backups/Manutencao` | MANUTENÇÃO · TPM e plano de manutenção |
| Projetos | `Projetos.html` | `projetos-base.json` | `projetos` | `00. Backups/Projetos` | PROJETOS · Melhorias e ações |

Nomes de arquivo sem acento (o "ã" do Gel já deu trabalho no Windows). Ordem na barra: Portal · OEE · Gel · Perdas · Paradas · Máquinas · Manutenção · Projetos · Cadastros.

## 2. Como a página entra no sistema (sem mexer nas outras)

- **Portal 1.5** já tem as quatro na lista (`DEFAULT_SYSTEMS`, marcadas "em construção"). Enquanto o HTML não está na pasta, ficam fora da barra e aparecem numa linha "Em construção" na Visão geral.
- Quando o HTML chega na pasta, o Portal grava a página como criada em `vac.sistemas`. **OEE, Gel e Perdas mostram a página nova na barra sozinhos**, porque montam a barra a partir dessa lista. Não é preciso mudar as outras páginas.
- Esconder uma página: Portal › Configuração › Módulos › "ocultar da barra e do Portal".
- No Portal, a página nova aparece com cartão, pendências e TV pelo `exports` (`kpis`, `pendencias`, opcional `serie`), sem código novo no Portal. Versões das páginas mostra versão, cabeçalho e backup dela.
- Atualização opcional nas outras páginas (próxima versão de cada uma): a lista de reserva `DEFAULT_SYSTEMS` do kit com as páginas novas (só faz diferença se a página for aberta num navegador que nunca abriu o Portal).

## 3. Toda página nova nasce com

- Núcleo comum (pasta da rede, cópia no navegador, `rev` + reaplicação, gravação em fila, backup, ajuda ⓘ, TV, relatórios), partindo do `Modelo-Pagina.html` (ou do Portal/Perdas como referência).
- Cabeçalho `vac-cabecalho v1` e backups do kit (`claude/kit-cabecalho-e-backups.md`), `PAGE.busca(q)` para o Ctrl K.
- `PAGE = { id, titulo, tituloCurto, subtitulo, versao, baseFile, backupDir, busca }` e `appVersion` gravado na base.
- **Leitura do cadastro base** (`vacutainer-cadastros.json`, contrato § 5): equipamentos, códigos de parada, turnos, catálogos… em modo consulta, com "Editar no Portal" (`Portal.html#cadastros/<tipo>/<código>`). Nenhuma página nova grava no cadastro; o que for só dela fica na base dela, preso ao código.
- Bloco `exports` (com `exportsVersion`, `kpis`, `pendencias`) para o Portal e para as outras páginas; nenhuma página lê a estrutura interna de outra.
- Links pelo endereço (ex.: `Paradas.html#equipamento=EQ01`, `#evento=…`, `#tv`).

## 4. Divisão proposta (a confirmar no chat de cada página)

- **Paradas**: registro e **análise completa das falhas e paradas de máquina** por equipamento: Pareto (tempo e ocorrências), MTBF, MTTR e disponibilidade por equipamento, tendência, recorrência, mapa por turno/hora, quebras × microparadas, ligação com catálogo/troca, causa raiz e ações. É a fonte de falhas que alimenta Máquinas e Manutenção. Publica no `exports`: indicadores por equipamento e mês, eventos recentes, principais falhas, pendências.
- **Máquinas**: ficha de cada equipamento (dados do cadastro do Portal, fotos e documentos em `Equipamentos/<código>/`), componentes críticos, histórico de falhas (de Paradas) e de manutenção (de Manutenção), indicadores por máquina.
- **Manutenção (TPM)**: plano preventivo e preditivo, ordens de serviço, pilares TPM, uso das falhas de Paradas para priorizar.
- **Projetos**: projetos e ações de melhoria (Kaizen, A3, ideias de OEE), ligados a perdas, paradas e OEE.

**Decisões em aberto para o chat de Paradas:**
1. **Fonte das paradas** e relação com as paradas lançadas no OEE (hora a hora): o OEE continua sendo a fonte do tempo de parada por código (OEE e Pareto); Paradas traz o detalhe de falha de máquina (equipamento, componente, modo de falha, ação) sem digitação em dobro. Como ligar os dois (importar do `exports.paradasEquipamento` do OEE, importar a fonte atual de paradas de máquina, ou os dois)?
2. Precisa de cadastros novos no Portal (ex.: **componentes por equipamento**, **modos de falha**)? Se sim, entram como tipos novos do cadastro base (contrato), editados só no Portal.
3. O que aproveitar do HTML de análise inicial que já existe.
