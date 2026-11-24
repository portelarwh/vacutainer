"""Empacota um candidato local de instalação em pasta nova."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
LICENSES = (
    "LEIA-ME.md",
    "LICENSE-Lucide.txt",
    "LICENSE-React.txt",
    "LICENSE-ReactDOM.txt",
    "LICENSE-SheetJS.txt",
    "LICENSE-Zod.txt",
    "LICENSE-jspdf-autotable.txt",
    "LICENSE-jspdf.txt",
)
INSTALLATION = """# Inspeção local do pacote candidato

1. Confira os hashes em SHA256SUMS.txt na pasta de ativos do candidato.
2. Extraia este ZIP em pasta de teste vazia, fora da instalação existente.
3. Abra Plataforma.html em Chrome ou Edge por file://. Para explorar com
   dados fictícios, abra o Modo demonstração.
4. Registre o resultado. Mantenha as bases, backups e ativos da instalação
   atual em seus caminhos de origem.

Compatibilidade de bases, migração e atualização ainda dependem de aceite.
Este pacote é destinado à inspeção em pasta de teste.
"""


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def write_zip(path, entries):
    # ZipInfo evita o horário local que writestr aplica a um nome simples.
    with ZipFile(path, "x") as archive:
        for name, data in sorted(entries.items()):
            entry = ZipInfo(name)
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data)


def package_candidate(result, revision, output):
    verified = json.loads(result.read_text(encoding="utf-8"))
    version = verified.get("versao") if isinstance(verified, dict) else None
    if not isinstance(version, str) or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
        raise ValueError("A validação em Chromium deve registrar a versão no formato X.Y.Z.")
    actual_revision = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
    if actual_revision != revision:
        raise ValueError("O commit informado precisa ser o HEAD deste checkout.")

    # Lê o HTML do commit declarado, preservando o vínculo do pacote com o Git.
    html = subprocess.check_output(["git", "show", f"{actual_revision}:Plataforma.html"], cwd=ROOT)
    if html != (ROOT / "Plataforma.html").read_bytes():
        raise ValueError("O HTML em disco diverge do HTML do commit.")
    if verified.get("sha256") != sha256(html):
        raise ValueError("O hash do HTML validado em Chromium diverge do commit.")
    if output.exists():
        raise ValueError("O diretório de saída precisa estar livre.")

    with TemporaryDirectory(dir=output.parent, prefix=".vacutainer-") as temp:
        directory = Path(temp) / "pacote"
        directory.mkdir()
        (directory / "Plataforma.html").write_bytes(html)

        licenses = directory / "licencas.zip"
        write_zip(licenses, {
            f"licencas/{name}": subprocess.check_output(
                ["git", "show", f"{actual_revision}:docs/licencas/{name}"], cwd=ROOT
            ) for name in LICENSES
        })
        complete = f"Vacutainer-v{version}-Completo.zip"
        write_zip(directory / complete, {
            "Plataforma.html": html,
            "INSTALACAO.md": INSTALLATION.encode("utf-8"),
            "licencas.zip": licenses.read_bytes(),
        })
        (directory / "CHANGELOG.md").write_text(
            f"# Vacutainer {version} — candidato\n\n"
            f"Commit: `{revision}`. Pacote para inspeção offline em pasta nova.\n\n"
            "Atualização, migração, restauração e uso na rede dependem de aceite.\n",
            encoding="utf-8",
        )

        destinations = {
            "Plataforma.html": "Plataforma.html em pasta de teste vazia",
            complete: "pasta de teste vazia",
            "CHANGELOG.md": "consulta",
            "licencas.zip": "consulta",
        }
        files = []
        for name, destination in sorted(destinations.items()):
            data = (directory / name).read_bytes()
            files.append({
                "arquivo": name, "bytes": len(data), "sha256": sha256(data),
                "destino": destination,
            })
        manifest = directory / "manifesto-release.json"
        manifest.write_text(json.dumps({
            "formato": 1,
            "versao": version,
            "commit": revision,
            "classificacao": "CANDIDATO",
            "compatibilidade": {
                "publicacaoAutorizada": False,
                "schemaAprovado": None,
                "versoesDeOrigemAprovadas": [],
            },
            "recursosExternos": "Bases e ativos autorizados são fornecidos no ambiente de teste.",
            "arquivos": files,
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        sums = [f"{entry['sha256']}  {entry['arquivo']}\n" for entry in files]
        sums.append(f"{sha256(manifest.read_bytes())}  {manifest.name}\n")
        (directory / "SHA256SUMS.txt").write_text("".join(sums), encoding="utf-8")
        directory.rename(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("result", type=Path, help="Arquivo JSON da validação em Chromium")
    parser.add_argument("revision", help="Commit do checkout")
    parser.add_argument("output", type=Path, help="Diretório de saída ainda inexistente")
    parser.add_argument("--candidato", action="store_true", required=True)
    args = parser.parse_args()
    try:
        package_candidate(args.result, args.revision, args.output.resolve())
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"Empacotamento interrompido: {error}\n")


if __name__ == "__main__":
    main()
