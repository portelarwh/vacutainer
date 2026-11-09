"""Gera a demonstração offline das oito páginas. Rodar após os builds do kit/Produção/modelo."""
from pathlib import Path
import gzip,base64,json
ROOT=Path(__file__).resolve().parents[2]
PAGINAS={'portal':'Portal.html','oee':'OEE-Vacutainer.html','perdas':'Perdas-Ordem.html','gel':'Gestão-Gel-Vacutainer.html','paradas':'Paradas.html','equip':'Equipamentos.html','inic':'Iniciativas.html','projetos':'Projetos.html'}
def gerar():
    dados={k:base64.b64encode(gzip.compress((ROOT/'paginas'/v).read_bytes(),mtime=0)).decode() for k,v in PAGINAS.items()}
    modelo=(Path(__file__).parent/'demonstracao.html').read_text()
    assert modelo.count('@@VAC_DEMO_PAGINAS@@')==1
    saida=ROOT/'paginas/Demonstracao.html'
    saida.write_text(modelo.replace('@@VAC_DEMO_PAGINAS@@',json.dumps(dados,separators=(',',':'))),encoding='utf-8',newline='\n')
    print('ok Demonstracao.html · 8 páginas ·',saida.stat().st_size,'bytes')
if __name__=='__main__':gerar()
