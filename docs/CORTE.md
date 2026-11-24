# Corte para a plataforma única

**NÃO EXECUTADO.** Preparação documental. A rodada usa apenas dados fictícios; não há autorização para testar ou gravar nas bases reais.

Antes do corte, aprovar a homologação de file:// no Chrome e Edge corporativos, SMB, perda de permissão/rede e duas estações. Comparar números com a referência atual, testar login/perfil Consulta, fila pendente e uma base mais nova em somente leitura. Registrar versão do artefato e hashes das bases da cópia usada.

Na janela de corte, siga os passos 1 a 5. O passo 6 orienta o retorno se houver divergência.

1. Responsável agenda pausa e confirma ausência de fila em todas as estações.
2. Última gravação pelas páginas atuais; fechar todas as instâncias e fazer cópia das bases e do aplicativo anterior.
3. Copiar somente `Plataforma.html` da raiz do repositório para a pasta. Preservar `00. Bases/` e `00. Backups/`. Não copiar scripts, testes ou documentação como dependências do aplicativo.
4. Abrir a plataforma, conectar a pasta, conferir totais, versões, ordens/lotes, turnos, MUV e gel com o ponto de corte. Gravar um fato de teste previamente autorizado e reler nas duas estações.
5. Com aceite do responsável, retirar os HTML antigos da pasta e guardá-los junto da cópia. Não manter versões concorrentes distribuídas.
6. Se houver divergência, parar todas as gravações. Preservar uma cópia das bases após o corte e reconciliar fatos posteriores. Restaurar aplicativo e bases do mesmo ponto; não baixar só a versão do HTML sobre bases já atualizadas.

A demonstração e o guia contextual estão dentro de `Plataforma.html`. O código antigo foi retirado da árvore ativa por pedido explícito do responsável; o ponto anterior continua recuperável no Git (ffc9ee8c9883f171e478f15e33c5e938a9cb57a0). Isso não executa o corte nem autoriza gravar em dados reais. A eventual volta exige aplicativo e bases do mesmo ponto, com reconciliação dos fatos posteriores, conforme o passo 6.

## Evidências de H01 e H02 para uma versão candidata

Use uma pasta de teste autorizada, com bases fictícias e arquivos de teste. Antes de cada rodada, registre versão, commit e SHA-256 do HTML, versões de schema, data, responsáveis, navegador e versão por estação, configuração de rede/permissões e hashes iniciais. Para cada caso, guarde passos executados, esperado, observado, capturas ou logs, hashes finais e resultado. Registre a decisão de aceite na [Issue #151](https://github.com/portelarwh/vacutainer/issues/151).

| Caso | Procedimento e resultado esperado |
|---|---|
| H01 · abertura e reconexão | Em Chrome e Edge corporativos, abra o HTML distribuído por `file://`, sem internet. Autorize a pasta de teste, leia, grave um fato fictício, feche, reabra e releia. Compare o fato, a versão e os totais nas duas aberturas. Registre quando o navegador pede autorização novamente. |
| H01 · perda de acesso | Retire a permissão ou interrompa a rede de teste durante uma operação. Confirme mensagem de erro, ausência de confirmação prematura, preservação da fila e recuperação verificável após reconectar. |
| H02 · duas estações e duas abas | Grave mudanças independentes no mesmo período, com timestamps iguais e relógios divergentes na massa de teste. As alterações compatíveis devem coexistir e o reenvio deve aplicar cada operação uma vez. |
| H02 · conflito | Nas duas estações, edite o mesmo campo e simule exclusão versus edição. Registre os dois valores, a origem e a resolução explícita. Operações com vínculos entre bases devem preservar seus invariantes. |
| H02 · falhas e recuperação | Na cópia fictícia, simule JSON parcial ou corrompido, schema incompatível, queda de rede, fila pendente e troca de pasta. Confirme bloqueio seguro ou recuperação de cada caso. Restaure snapshot válido em pasta separada e compare manifesto, registros, vínculos, totais e exports. Registre volume e tempo. |

Resultado pendente até a execução física. Use os resultados simulados como referência técnica e mantenha a gravação simultânea bloqueada para a versão candidata se houver perda de dados ou conflitos sem resolução.
