# Melhorias N1–N6 · 15/11/2026

Somente dados fictícios e OPFS. Sem corte, merge ou alteração de formato das bases. N7 fica para depois do merge e em outro branch.

## N1 · Conta própria

A regressão em `tests/conta.cjs` falhou no artefato anterior: o Consulta fechava o login sem a senha existir no arquivo. A correção usa a transação e o backup existentes do Portal, com autorização temporária no contrato do kit. Só admite senha do próprio usuário, autocadastro Consulta e a criação exata do perfil padrão Consulta quando ausente. Não libera turnos, outras contas, outros arquivos ou base de versão futura.

Além do caminho, valida o conteúdo completo contra a reaplicação das operações pela função original do Portal, incluindo auditoria. Confirma a gravação por releitura; erro não exibe sucesso e a autorização termina em finally. Testes conferem backup, releitura após recarregar, autocadastro sem perfil prévio, fila misturada, adulteração do documento e versão futura.

## N2 · Permissão compartilhada

`fontes/kit/permissoes.mjs` é a única regra. O build a incorpora nos scripts clássicos e a casca importa esse mesmo módulo ESM. Os antigos corpos de vacPode foram substituídos por delegação; o mapeamento linha → equip também é único. A camada de acesso ainda exige sessão válida.

A regressão falhou com perfil sem permissões no código anterior. A tabela cobre ausência de permissões, módulo ausente, ação ausente, false e true. O teste no navegador compara 315 combinações com vacPode e vacPagina.pode do motor.

## N3 · Guias separados

Os três arquivos operacionais foram restaurados byte a byte de 7c3f064. O guia novo está em `fontes/guia/guia_plataforma.html` e é gerado por `gerar_guia_plataforma.js` em `nova-plataforma/dist/Instalacao-Plataforma.html`, com duas capturas reais do Playwright usando cenário fictício e o procedimento de retorno ao ponto de corte.

As capturas têm relógio e viewport fixos e são versionadas. O build normal só compõe o HTML a partir dessas imagens; `--capturar` atualiza as imagens explicitamente. Isso evita mudanças de PNG por ambiente no CI. O teste confere o guia antigo por SHA-256, os prints incorporados e as instruções de retorno.

## N4 · Bases preenchidas e comparação integral

As oito fixtures passam pelos adaptadores `vacDemo.registrar` atuais, com o cenário fictício versionado. Linha 360° ganhou apenas um vínculo demonstrativo de ponto/equipamento; nenhum padrão MES/TPM foi inventado. Produção aplica o cadastro pelo CadSync original antes da extração e usa a serialização oficial. O gerador anterior falha no novo critério de preenchimento do Waste.

`test:pasta` compara a base inteira na conexão e após uma alteração real por módulo. A referência contém explicitamente o campo alterado; os exports são calculados pelo motor atual sobre essa referência ANTES da escrita. Os históricos anteriores precisam permanecer idênticos; a única auditoria acrescentada tem tipo, autor e identificador conferidos. Metadados específicos de cada motor são previstos explicitamente. A normalização só ignora os controles documentados na raiz e exports.geradoEm, preservando campos homônimos dentro dos históricos. Também continuam os testes de sessão ausente, oito bases futuras e descarte na troca de pasta.

## N5 · Proveniência e build reproduzível

O manifesto não carrega mais HEAD como revisão dos motores. Registra `sourceRevision` do último commit de fontes/paginas e `enginesSha256`, SHA-256 dos bytes de engines.json + NUL + libraries.json. A demonstração gerada não conta como fonte suja. Saúde dos dados e guia auxiliar exibem revisão e hash.

A compressão usa fflate 0.8.2 fixado no lockfile, em vez de depender da versão do zlib do Node. Isso permite ao CI comparar src/generated/ e dist/ com o commit. `test:reprodutibilidade` recompila duas vezes e compara todos os artefatos, incluindo o guia; também roda no CI. Os 37 testes unitários passaram nesta etapa. Os artefatos serão recompilados novamente após o último commit de fontes para registrar a proveniência final sem circularidade de HEAD.
