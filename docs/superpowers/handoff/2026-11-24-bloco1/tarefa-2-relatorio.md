# Task 2 - vacCad único em comum/bases

## O que mudou
- `Plataforma.html` › `comum/bases`: nova `function vacCad()` (mesmo corpo das cópias), antes de `vacPessoa`.
- Removidas as 9 cópias idênticas (motor/portal, oee, perdas, gel, paradas, equip, inic, linha, projetos). Todas eram declarações de função de nível superior, não métodos de objeto.
- Novo `testes/plataforma/vaccad.test.mjs` (2 testes).
- Chamadas `typeof vacCad === 'function' ? vacCad() : null` mantidas (diff focado).

## TDD
- RED: `node --test testes/plataforma/vaccad.test.mjs` -> `# pass 0 / # fail 2` (vacCad ausente de comum/bases).
- GREEN após a edição + `npm run -s atualizar:metadados` ("HTML único verificado: 9 módulos, 48 blocos") -> `# pass 2 / # fail 0`.
- `node testes/plataforma/cad-consulta.cjs` e `turno-vigente.cjs`: todos "ok", sem erro de JavaScript.
- `npm run -s test:unit`: 57 testes, 57 pass, 0 fail.

## Verificação de carga
comum/bases é incluído em cada um dos 9 módulos, antes de comum/interface e do motor (marcadores @@vac:comum/bases@@ em 9 páginas), então vacCad já existe quando os motores usam.

## Concerns
Nenhum. Edição feita com Python (`&` -> `&amp;` na linha buscada).
