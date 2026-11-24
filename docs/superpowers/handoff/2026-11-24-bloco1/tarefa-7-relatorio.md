# Tarefa 7 · Importar das bases atuais (uso único)

## O que mudou (motor/portal, Plataforma.html)
- `ImportarV1` (um só objeto, marcado `/* ADM-CENTRAL: importador de uso único — sai na etapa 8 */`): `plano(cad, gelBase)`, `aplicar(D,o,L)`, `abrir()`, `desenhar(P)`, `permitida(o)`.
- `admNivelTransicao(p,id,pode)`: a regra transitória (Processos / PCP / Almoxarifado / demais) extraída de `Cad.nivelAssunto`, que agora a chama com `podeEditar`; o importador a chama com `pode = () => true`.
- Operação única `acao:'importação v1'` (tipo `'*'`, assunto Sistema), tratada em `aplicarOp`, então vale na fila durável, na releitura e na regravação sobre a pasta. Se o cadastro já é v2, ela não faz nada.
- Trava em `Cad.ops`: com `schemaVersion < 2` só passam a importação, login/autocadastro, segurança, desbloqueio, carga e restauração. O resto recusa com mensagem, sem gravar nem enfileirar.
- Faixa `#cadV1` "Cadastro no formato antigo" em `cadBarra` (com botão que abre a prévia). Tela `importarV1` em Sistema › Importar das bases atuais, visível no menu só no formato 1. A tela Gel no formato 1 aponta para ela.
- Fonte dos dados: cadastro primeiro (`parametros.gel.formatos`, `equipamentos[].gel.descs/tara`); só se faltar, a base do Gel lida pelo `TrazCfg.ler()` (mesmo leitor de "Trazer configurações"; só em modo pasta) com `config.fmts` / `config.equips`.

## Mapeamento antigo → novo (como implementado)
| Antigo | Novo |
|---|---|
| `formatos[].from` | `gel.formatos[].de` (`ate:null`) |
| `tara` | `embalagemG` |
| `taraP` | `folhaPurgaG` |
| `sobra` | `sobraBarrilKg` (vazio fica null) |
| `f[N].tubo / gel / adit / tr` | `tubos[N].tuboG / gelG / aditivoG / tampaRolhaG` |
| (novo) | `motivo:'importação do formato 1'`, `por`, `em` |
| `equipamentos[].gel.descs[]` (`local, comp, cat, mots`) | `gel.locais[]`: `id:'L-0001'…`, `equipamento` = código do equipamento, `local`, `comp`, `categoria`=`cat`, `motivos`=`mots`, `ordem` 1..n, `ativo:true` |
| `equipamentos[].gel.tara` | `embalagemG` de CADA local desse equipamento (vazio → null, nunca 0; texto "80,5" → 80,5) |
| Gel `config.equips[].portal / tara / descs` | idem; descarte de equipamento sem `portal` correspondente é pulado com o aviso `local sem equipamento correspondente: <local>` |
| perfis sem `assuntos` | `assuntos` de todos os assuntos pela regra de transição |
| `schemaVersion` | 2; removidos `parametros.gel.formatos`, `equipamentos[].gel.descs` e `.tara` (`gel` vazio some) |

Campo de formato vazio vira 0 com aviso na prévia (nunca em silêncio); formato sem data ou repetido é descartado com aviso.
Auditoria (motivo `importação do formato 1`): schemaVersion, formatos, locais e perfis (assuntos).

## TDD
- RED: `adm-importar.cjs` falhou esperando `#cadV1` (faixa inexistente).
- GREEN: `adm-importar` passa (faixa e trava, prévia 1 formato / 14 locais / 10 perfis, importação, tara por local, auditoria, depois da importação sem faixa e grava, repetir não muda, fonte alternativa do Gel com o aviso de SALA GEL, sem erro de JS).
- Ajustes em `adm-assuntos.cjs`: `importarV1` entra na lista de telas; o botão do menu só existe no formato 1.
- Registrado em `scripts/testar-plataforma.mjs`.

## Testes
adm-importar, adm-gel, adm-assuntos, cad-consulta, cfg-adm, permissoes-paridade: ok. `npm run test:unit`: 0 falhas. `npm run test:plataforma`: passou (exit 0).

## Preocupações
1. Regra de transição "demais perfis": no momento da importação todo perfil sem Processos/PCP/Almoxarifado no nome (inclusive CONSULTA, TV, OPER) fica com `editar` em tudo, igual ao comportamento de hoje (a edição é por senha/trava, não por perfil). Isso preserva o acesso, mas o responsável deve restringir em Pessoas e acesso › Perfis. A prévia avisa disso.
2. A trava de v1 deixa passar segurança (senha inicial), desbloqueio, carga, restauração e login/autocadastro, para a importação não ficar inalcançável. Se quiser trava absoluta, é só reduzir `ImportarV1.permitida`.
3. A leitura de `fifo-base.json` só ocorre em modo pasta e se o cadastro não tiver as cópias; se a leitura falhar, a prévia avisa.
4. Aviso "cadastro do gel não importado" em Produção/Gel fica para a Tarefa 8, como combinado.
5. Não mexi em versão/Novidades.

## Correção da rodada 1 (revisão)
- Crítico: `admPerfilEdita(p)` = `semSenha===true`, ou ADMIN com `semSenha` ausente, ou `permissoes.portal.configurar/lancar`. `admNivelTransicao(p,id)` (regra de execução e do importador) usa só isso; não depende mais de `Cad.podeEditar`. Resultado: CONSULTA, TV, OPER, LIDER, QUAL e TEC ficam `ver` em todos os assuntos; ADMIN edita tudo; Processos/PCP/Almoxarifado continuam pelo nome. Testes: adm-importar afirma isso; adm-assuntos cobre configurar, semSenha e perfil sem poder.
- Importante: campo vazio/inválido (tara, folha, tubos) e bloco do Tubo 75 ausente viram `null` com aviso "não cadastrado"; nada vira 0. `vacCad.gel.composicao` já devolve null com peso nulo; a tela Gel mostra "–" (`fmtQ`/`cel`) e o editor exige o preenchimento ao salvar nova vigência. Teste novo com formato de campos vazios.
- Testes: adm-importar, adm-assuntos, adm-gel, permissoes-paridade, cfg-adm, test:unit (67 ok) e test:plataforma completo passam.
