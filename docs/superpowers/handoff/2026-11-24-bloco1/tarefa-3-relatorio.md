# Task 3 - vacCad.lista/item/vigente/param

Mudanças: métodos em comum/bases logo após `vacCad()`. `vacVig` e `vacParam` removidos de comum/interface (vacParam não tinha chamadores). Chamadores de vacVig trocados por `vacCad.vigente` em comum/interface (vacTurnosEm, vacPrecoEm, vacMetaArea, metas mensais), motor/paradas, motor/equip e testes/tvigencias.js. `typeof vacCad === 'function' ? vacCad() : null` simplificado para `vacCad()` só em comum/bases e comum/interface. vacHoje chamado de forma lazy.
RED: `node --test testes/plataforma/vaccad.test.mjs` -> pass 2, fail 4 (vigente/item/lista/param). GREEN: pass 6 (após corrigir dois erros do próprio teste: lista sem data inclui turno C; comparação de arrays entre realms do vm).
Também: test:unit 61 ok; tudo.js tcalendario passou; turno-vigente e parametros-semaforo ok.
Preocupação: param com valor que tem `vigencias` devolve o objeto vigente (não o valor interno); backupDias no topo continua igual.
