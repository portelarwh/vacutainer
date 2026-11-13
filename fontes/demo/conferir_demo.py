"""Confere a Demonstracao.html pelo conteúdo (CI, 13/11/2026): cada página embutida, descompactada, tem de ser igual à página de paginas/,
e o resto do arquivo igual ao modelo. Os bytes do gzip mudam com a versão do zlib (Python 3.12 × 3.13), então o arquivo não é comparado byte a byte.
Uso: python3 fontes/demo/conferir_demo.py [Demonstracao.html]  (padrão: paginas/Demonstracao.html). Código 1 se não bater."""
from pathlib import Path
import sys, gzip, base64, json
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from gerar_demo import PAGINAS
arq = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'paginas/Demonstracao.html'
modelo = (Path(__file__).parent / 'demonstracao.html').read_text(encoding='utf-8')
antes, depois = modelo.split('@@VAC_DEMO_PAGINAS@@')
txt = arq.read_text(encoding='utf-8')
erros = []
if not (txt.startswith(antes) and txt.endswith(depois)):
    erros.append('o texto em volta das páginas não é o do modelo fontes/demo/demonstracao.html')
    dados = {}
else:
    dados = json.loads(txt[len(antes):len(txt) - len(depois)])
for k, v in PAGINAS.items():
    if k not in dados:
        erros.append(f'falta a página {v}'); continue
    if gzip.decompress(base64.b64decode(dados[k])) != (ROOT / 'paginas' / v).read_bytes():
        erros.append(f'{v} embutida na demonstração é diferente de paginas/{v}')
if set(dados) - set(PAGINAS):
    erros.append('páginas a mais na demonstração: ' + ', '.join(sorted(set(dados) - set(PAGINAS))))
if erros:
    print('Demonstracao.html não bate com as páginas: rode python3 fontes/demo/gerar_demo.py'); [print(' -', e) for e in erros]; sys.exit(1)
print('ok Demonstracao.html ·', len(PAGINAS), 'páginas iguais às de paginas/')
