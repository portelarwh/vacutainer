# Gera o resumo Markdown da análise comum a partir da mesma tabela de consolidar.py. Uso: python3 gerar-md.py <pasta-de-saida>
import sys, collections, os
sys.path.insert(0, os.path.dirname(__file__))
import consolidar as c
R = c.R; AUD, MAIN = c.AUD, c.MAIN
saida = sys.argv[1]
def esc(s): return str(s).replace('|', '\\|').replace('\n', ' ')
por = {x[0]: x for x in R}
cont = collections.Counter(x[7] for x in R); quem = collections.Counter(x[4] for x in R)
bexc = [x for x in R if x[4] == 'B' and x[6]]
resp = collections.Counter(x[8].split(' (')[0].split(' nesta')[0].split(';')[0] for x in bexc)
abertas = [x for x in R if x[18] in ('Correção Crítica', 'Correção Importante', 'Melhoria', 'Evolução') and not x[19].startswith('Corrigido') and not x[19].startswith('Substituída')]
feitas = [x for x in R if x[19].startswith('Corrigido') or x[19].startswith('Parcial')]
L = []
w = L.append
w('# Análise comum das duas auditorias do Vacutainer (26/11/2026)\n')
w('Etapa de comparação e prova, seguindo a seção 6 do [roteiro](2026-11-26-roteiro-auditoria.md). Preserva as duas auditorias originais, o código do produto e a `main`. Tabela completa: [analise-comum.csv](2026-11-26-analise-comum.csv). Perguntas: [analise-comum-perguntas.md](2026-11-26-analise-comum-perguntas.md). Scripts de prova: `scripts/auditoria/comum/`.\n')
w('## 1. SHAs analisados e onde reproduzi\n')
w('| Lado | Revisão | Versão | SHA-256 de Plataforma.html |\n|---|---|---|---|')
w('| A (agente de desenvolvimento) | `e22cb92` | 1.8.71 | o mesmo conteúdo de `a9d28b5` (a diferença entre os dois commits é só documentação e scripts: `git diff --name-only e22cb92 a9d28b5` não lista `Plataforma.html`) |')
w('| B (contraparte) | `a9d28b5` | 1.8.71 | `e3e6f70bd4a2…cef6ea` (conferido: o arquivo do worktree tem o mesmo hash que a B declarou) |')
w('| Main atual | `4046d24` | 1.8.72 | `e4805ef4ef4e…f40d` (PR #164: mensagem de permissão, celular, modelo de acesso) |')
w('\nCada prova rodou nos dois SHAs (`a9d28b5` e `4046d24`), em worktrees separados e com as bases fictícias que o próprio SHA gera. As correções do PR #165 (1.8.73: fuso, paradas simultâneas, dado impossível) **ainda não estão na main**: onde cito "corrigido no PR #165", o teste novo falha em `4046d24` e passa na branch do PR.\n')
w('## 2. Como ler as provas\n')
w('- **Execução** = rodei no Chromium com Playwright, dados fictícios (demonstração ou pasta OPFS). **Leitura** = li o código no SHA indicado, sem executar a falha. **Estática** = busca no arquivo.')
w('- **Tudo o que rodou é local: Chromium com OPFS.** Nenhuma prova desta etapa vale como homologação em SMB ou com duas estações. Nos casos B01 a B04 (persistência) a concorrência é simulada de forma determinística, trocando o arquivo na janela entre a leitura e a gravação ou negando uma leitura; prova que o código não protege aquela janela, não que ela ocorra com frequência na rede.')
w('- "Reproduz em" diz se o defeito aparece naquele SHA. "Não verificado" quer dizer que não tentei, não que não existe.\n')
w('## 3. Placar\n')
w(f'- **{len(R)} linhas comuns** cobrindo os 37 IDs da A e os 44 IDs da B (cobertura conferida por script: nenhum ID ficou de fora).')
w(f'- Classificação: **{cont["Convergente"]} Convergentes**, **{cont["Só um viu"]} Só um viu** ({quem["B"] - 1} só da B e {quem["A"]} só da A), **{cont["Divergente"]} Divergentes**.')
w(f'- Respostas aos {len(bexc)} achados que só a B viu: ' + '; '.join(f'{k}: {v}' for k, v in resp.most_common()) + '.')
w('- A B afirmou 7 críticos; **os 7 se confirmam**, mas proponho **rebaixar 2 para Alta** (C11 e C13) pelas razões da seção 5.\n')
w('## 4. Os sete críticos da contraparte\n')
w('| ID B | Linha comum | Veredito | Prova | Gravidade B → consolidada |\n|---|---|---|---|---|')
for bid, cid in [('A01', 'C01'), ('B01', 'C10'), ('B02', 'C11'), ('B03', 'C12'), ('B04', 'C13'), ('F01', 'C29'), ('F03', 'C31')]:
    x = por[cid]; w(f'| {bid} | {cid} | Confirmado nos dois SHAs | `{(__import__("re").search(r"comum/(\w+\.cjs)", x[9]) or [None, "ver CSV"])[1]}` ({x[12]}) | {x[14]} → {x[15]} |')
w('\nObservações:')
w('- **F03** é a correção mais barata e de maior retorno (um `if` no modelo "Lista de paradas").')
w('- **A01 (B)** exige decisão (pergunta P2): a distinção ausência/zero atravessa Visão da linha, relatórios e exports.')
w('- **B01 (B)** tem causa única e localizada: `fsReadBase` trata qualquer erro de abertura como "arquivo ausente".\n')
w('## 5. Divergências\n')
w('### Resolvidas com prova\n')
w('| Linha | Divergência | Resolução |\n|---|---|---|')
res = [
    ('C03', 'Scrap negativo: A Baixa, B Alta', 'Média. O `Actions` aceita (o teste do PR #165 falha na main); não provei que o campo da tela aceite o sinal. O número publicado fica errado em silêncio.'),
    ('C04', 'Paradas duplicadas ou maiores que o turno: A Média (A02 Alta), B Alta', 'Média. A tela (`validateEvent`) já barra parada fora do turno e sobreposta; só chega por importação ou dado externo. A B provou o motor, não o formulário. A Alta da A02 estava exagerada e foi corrigida no relatório A.'),
    ('C05', 'A A05: "0 NaN/Infinity em 700+ cenários". B: Infinity/NaN com `Number.MAX_VALUE`', 'Os dois estão certos no que testaram (magnitudes industriais × extremo de ponto flutuante). Reproduzido nos dois SHAs. Baixa: fora da escala real e já barrado no lançamento pelo limite do PR #165.'),
    ('C17', 'A C01: a auditoria guarda nome e ID. B C01: Waste e Administração não guardam o ID', 'A B tem razão: entradas `{t,u,a,d}` sem ID no Waste e na Administração (execução, `c01.cjs`). A afirmação da A vale só para a Produção. Média.'),
    ('C29', 'A A06: tela e Excel reconciliam. B F01: 0,5 vira 50,0% no Excel', 'A B tem razão para valores não inteiros entre -1,5 e 1,5; a A06 só comparou números maiores. Crítica.'),
    ('C11', 'Gravidade de B02 (B): Crítica', 'Mecanismo confirmado, proponho **Alta**: a rota de conexão checa o formato (`vacFormatoBase`); só o `sync` de pendência não checa, e exige pendência, mesma revisão e base de outro schema. **Aguarda aceitação da B.**'),
    ('C13', 'Gravidade de B04 (B): Crítica', 'Confirmado, proponho **Alta**: exige a ação deliberada de restaurar. Fere os contratos 3 e 10. **Aguarda aceitação da B.**'),
]
for cid, d, t in res: w(f'| {cid} | {esc(d)} | {esc(t)} |')
w('\n### Pendentes\n')
w('| Linha | Divergência | O que falta |\n|---|---|---|')
for cid, d, t in [
    ('C21', 'Modelo de acesso: A Média/Baixa, B Alta (suspeita)', 'Resposta do responsável à pergunta P1; não há o que provar por execução.'),
    ('C34', 'Tempo de abertura: A 0,5 a 0,9 s, B 1,1 a 3,2 s', 'Baseline em estação alvo (máquina e carga das duas medições diferem).'),
    ('C16 / C37', 'SMB, duas estações e abertura em rede: ninguém provou', 'Homologação física (pasta de rede real, duas estações, desconexão durante a gravação).'),
    ('C11, C13', 'Gravidade proposta Alta contra Crítica da B', 'Aceite ou contraprova da B.'),
]: w(f'| {cid} | {esc(d)} | {esc(t)} |')
w('\n## 6. Respostas aos achados que só a contraparte viu\n')
w('| ID B | Linha | Resposta | Método | Prova resumida |\n|---|---|---|---|---|')
for x in sorted(bexc, key=lambda y: y[6]):
    w(f'| {esc(x[6])} | {x[0]} | {esc(x[8])} | {esc(x[12])} | {esc(x[9][:260])} |')
w('\nNenhum dos achados exclusivos da B foi respondido como "não reproduzo" por completo. Duas respostas parciais: **C36 (G03)**, tendência confirmada e magnitude 4 vezes menor nesta máquina; **C05 (A04)**, reproduzido, mas Baixa.')
w('Cobertura por teste existente: só **C41 (H02)** tem teste anterior (`permissoes-paridade.cjs`), e ele **comprova a paridade**, não a correção de um defeito, porque ali não há defeito, só risco de manutenção.\n')
w('## 7. Achados que só o agente de desenvolvimento viu\n')
w('Aguardam o reexame da contraparte ("confirmo / não reproduzo / já coberto"): C06 (fuso), C07 (intervalo invertido), C19, C23, C33, C47, C48, C49, C59. Para C06 e C47 já existe teste (`fuso-planta.cjs`, `celular-lancamento.cjs`) que falha sem a correção.\n')
w('## 8. Correções que faço à própria auditoria A\n')
w('1. **A02 não era Alta**: a tela já barra parada fora do turno e sobreposta; só chega por importação. Reclassificada para Média (já corrigido no relatório A).')
w('2. **A05/A06 foram afirmadas de forma ampla demais**: "tela e Excel reconciliam" não vale para valores decimais pequenos (C29), nem "sem NaN/Infinity" para magnitudes extremas (C05), e a "ausência" nunca foi exercitada (C01).')
w('3. **C01 (auditoria "com ID")** vale só para a Produção (C17).')
w('4. **A10 (intervalo invertido)** foi listado como feito na linha `AUDITORIA-26-11` de `PENDENCIAS.md`, mas o PR #165 **não o trata**. O texto será corrigido no PR #165 e a linha C07 fica aberta.\n')
w('## 9. Roadmap único\n')
w('Ordem: classe (Correção Crítica, Importante, Melhoria, Evolução) e, dentro dela, gravidade × benefício ÷ esforço (Crítica 4, Alta 3, Média 2, Baixa 1; Alto 3, Médio 2, Baixo 1; P 1, M 2, G 3). Itens já corrigidos ou em PR estão na seção 9.1.\n')
n = 0
for cl in ['Correção Crítica', 'Correção Importante', 'Melhoria', 'Evolução']:
    Ls = sorted([x for x in abertas if x[18] == cl], key=lambda x: -c.escore(x))
    w(f'### {cl} ({len(Ls)})\n'); w('| # | Linha | Item | Grav. | Esf. | Ben. | Quem viu | Situação |\n|---|---|---|---|---|---|---|---|')
    for x in Ls:
        n += 1; w(f'| {n} | {x[0]} | {esc(x[2][:95])} | {x[15]} | {x[16]} | {x[17]} | {x[4]} | {esc(x[19][:60])} |')
    w('')
w('### 9.1 Já corrigidos ou em PR\n')
w('| Linha | Item | Onde está a correção |\n|---|---|---|')
for x in feitas: w(f'| {x[0]} | {esc(x[2][:100])} | {esc(x[19])} |')
w('\nAinda sem correção e **sem item no roadmap acima**: nenhum. Pontos fortes confirmados pelos dois lados: C09, C22, C45, C55.\n')
w('## 10. Veredito comum\n')
w('Concordo com a B no essencial: a plataforma serve para **demonstração e consulta assistida**, e não deve liberar **gravação operacional compartilhada, restauração de backup nem relatórios oficiais** antes de corrigir os 5 itens de Correção Crítica (C31, C01, C10, C29, C12) e de decidir os pontos de negócio abertos. A diferença para a B está só em duas gravidades (C11 e C13). A parte de cálculo do motor (D×P×Q, soma dos turnos, reprocesso) se sustenta nos dois lados.\n')
w('## 11. O que continua sem prova\n')
w('SMB e duas estações; desconexão física durante a gravação; frequência real das janelas de C10, C11 e C12 em rede; abertura do arquivo de 7,3 MB em rede; PDF e CSV de Waste, Paradas e importações; Outlook corporativo e impressão; leitor de tela; jornadas por toque no celular (C51 a C53); parsers FY27 (C42); anexos (C24); retenção de listeners (C35).')
open(os.path.join(saida, '2026-11-26-analise-comum.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('ok', n, 'itens no roadmap')
