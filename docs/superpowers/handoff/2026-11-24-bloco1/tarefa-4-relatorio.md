# Task 4 · Administração por assunto + permissão por assunto

## Mudanças (motor/portal)
- `ADM_ASSUNTOS` (8 assuntos, ordem e ids do brief), `admAssuntoDe(sec)`, `ADM_ROT` (rótulos) e `cadSide(sec)` reescrita: Resumo no topo, depois um grupo por assunto com os mesmos botões `data-sec`. Ajudas `CAT_AJUDA['grupo:<nome>']` dos 8 grupos substituem as 5 antigas.
- `Cad.nivelAssunto(perfil,id)` e `Cad.podeEditarAssunto(id,silent)` (exige `podeEditar` + nível 'editar'; sem pessoa logada com senha, vale só `podeEditar`). Regra de transição marcada `/* ADM-CENTRAL: transição até o importador */` (Processos: todos; PCP: planta+turnos; Almoxarifado: gel; demais: 'editar' em todos se `podeEditar(true)`, senão 'ver'). Perfil com `assuntos` gravado: o que está gravado vale (ausente = 'ver').
- Telas passam a usar o assunto: lista (`+ Novo`, perfis padrão), `Ficha.pode()` (mostrar/recarregar/salvar/inativar/reativar/substituir/fotos/docs e os timers), criação por rota, Matriz e Lote de paradas (paradas), Câmbio (produto). Segurança, Parâmetros, Importações, Configuração etc. seguem `Cad.podeEditar()`.
- Ficha do perfil: seção "Edição por assunto" (um select por assunto, Só ver / Pode editar); `prep` materializa os níveis derivados ao abrir perfil antigo; novo perfil nasce com tudo 'ver'.

## Mapeamento sec -> assunto
- planta: linhas, calendario
- produto: familias, catalogos, materiais, bom, cambio, precos
- gel: (nenhuma tela hoje; mostra "Em construção.")
- equipamentos: equipamentos, componentes, modosFalha
- turnos: turnos, metasOee, metasArea, metasOsm
- paradas: paradas, matriz
- pessoas: usuarios, perfis
- sistema: vigencias, parametros, programas, novidades, apps, importar, config, versoes, auditoria, backups, seguranca
- `inicio` (Resumo) fica acima dos grupos, fora dos assuntos.

## TDD
RED: `node testes/plataforma/adm-assuntos.cjs` -> `frame.waitForFunction: Timeout 30000ms exceeded` (ADM_ASSUNTOS inexistente).
GREEN: 5 "ok" (menu, permissão, transição, ficha do perfil, sem erro JS). Também verdes: cfg-adm, permissoes-paridade, cad-consulta, par-lote, novidades, `npm run test:unit` (fail 0), `npm run build`, eslint do teste.

## Arquivos
Plataforma.html (bloco motor/portal + metadados), scripts/testar-plataforma.mjs, testes/plataforma/adm-assuntos.cjs.

## Concerns
- Gel não tem tela de cadastro ainda (preços/câmbio ficaram em Produto, conforme a decisão 4 do inventário); o teste de "gel edita, turnos não" usa `podeEditarAssunto` e `+ Novo` em Produto/Turnos.
- Regra de transição por texto: nome ou código contém "processos"/"pcp"/"almoxarifado" (sem acento, sem diferença de caixa).
- `testes/t18.js` e `testes/tportalfonte.js` já falhavam antes (precisam de `__modulos__`), fora da suíte.
- Sem entrada em Novidades (sem mudança de versão).

## Correção 1 (revisão: bypass de permissão)
- `Cad.ops` agora confere o assunto de cada operação (`admAssuntosOp(op)`; `admAssuntoDe(op)` aceita sec ou op): tipo = tela; `parametros` com campo `gel`/`gel.*` -> gel, demais -> sistema; seguranca, carga/restauração (`*`) e sem tela -> sistema. Recusa tudo (nada grava, toast com o nome do assunto, retorna false) se algum assunto não for 'editar' no perfil da pessoa logada. Sem pessoa/perfil, vale só `podeEditar`. Operações com `origem` login/autocadastro (conta própria) ficam fora da conferência.
- Pontos de entrada: importadores SAP (produto), componentes e equipamentos-mês (equipamentos), metas (turnos), ativar/zerar senha de usuário (pessoas), `pgOk` (gel), `sGerOk/sSemOk/ppOk` (sistema) passam a usar `podeEditarAssunto`. "Trazer das páginas" e "Trazer configurações" mantêm `podeEditar` e dependem da recusa central (lote com assunto negado é recusado inteiro). A renderização de `cadParametros` segue `podeEditar` para o Gel poder editar com Sistema = ver.
- Teste (passo 5 de adm-assuntos): perfil com produto 'ver': op em materiais recusada e base intacta; op em paradas grava; perfil com gel 'ver': op `parametros.gel` recusada, op de Sistema grava. Usuários de teste fixos por perfil (3003..3007).
- Comandos: adm-assuntos (6 ok), cfg-adm, permissoes-paridade, par-lote, cad-consulta, novidades: ok; `npm run test:unit`: pass 61 / fail 0; eslint ok.
