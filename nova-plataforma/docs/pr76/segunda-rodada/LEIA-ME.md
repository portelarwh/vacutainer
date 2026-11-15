# Melhorias N1–N6 · 15/11/2026

Somente dados fictícios e OPFS. Sem corte, merge ou alteração de formato das bases. N7 fica para depois do merge e em outro branch.

## N1 · Conta própria

A regressão em `tests/conta.cjs` falhou no artefato anterior: o Consulta fechava o login sem a senha existir no arquivo. A correção usa a transação e o backup existentes do Portal, com autorização temporária no contrato do kit. Só admite senha do próprio usuário, autocadastro Consulta e a criação exata do perfil padrão Consulta quando ausente. Não libera turnos, outras contas, outros arquivos ou base de versão futura.

Além do caminho, valida o conteúdo completo contra a reaplicação das operações pela função original do Portal, incluindo auditoria. Confirma a gravação por releitura; erro não exibe sucesso e a autorização termina em finally. Testes conferem backup, releitura após recarregar, autocadastro sem perfil prévio, fila misturada, adulteração do documento e versão futura.

## N2 · Permissão compartilhada

`fontes/kit/permissoes.mjs` é a única regra. O build a incorpora nos scripts clássicos e a casca importa esse mesmo módulo ESM. Os antigos corpos de vacPode foram substituídos por delegação; o mapeamento linha → equip também é único. A camada de acesso ainda exige sessão válida.

A regressão falhou com perfil sem permissões no código anterior. A tabela cobre ausência de permissões, módulo ausente, ação ausente, false e true. O teste no navegador compara 315 combinações com vacPode e vacPagina.pode do motor.
