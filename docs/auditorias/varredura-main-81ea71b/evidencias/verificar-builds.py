from pathlib import Path
import hashlib,json,subprocess,shutil,tempfile
OUT=Path(__file__).resolve().parent
manifest=json.loads((OUT/'manifesto-inicial.json').read_text())
src=Path('/workspace/vacutainer-atual-81ea71b')
copy=Path(tempfile.mkdtemp(prefix='vac-build-check-81ea71b-'))
for f in manifest['arquivos']:
 p=copy/f;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src/f,p)
results=[]
for script in ['fontes/kit/aplicar_kit21.py','fontes/producao/build.py','fontes/modelo/gerar_paginas.py']:
 r=subprocess.run(['python',script],cwd=copy,capture_output=True,text=True)
 (OUT/(Path(script).stem+'.log')).write_text(r.stdout+r.stderr)
 changes=[f for f,h in manifest['arquivos'].items() if not (copy/f).exists() or hashlib.sha256((copy/f).read_bytes()).hexdigest()!=h]
 results.append({'comando':'python '+script,'exit_code':r.returncode,'arquivos_originais_alterados':changes})
report={'commit':manifest['commit'],'arquivos_comparados':len(manifest['arquivos']),'resultados':results,'originais_intactos':all((src/f).exists() and hashlib.sha256((src/f).read_bytes()).hexdigest()==h for f,h in manifest['arquivos'].items())}
(OUT/'builds.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
