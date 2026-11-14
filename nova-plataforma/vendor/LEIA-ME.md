# Bibliotecas redistribuídas

- **SheetJS Community Edition 0.20.3**: `../../paginas/lib/xlsx.full.min.js`, obtido da distribuição oficial `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`. SHA-256: `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41`. Licença Apache 2.0 em `../../paginas/lib/LICENSE-SheetJS.txt`.
- **jsPDF 2.5.2** e **AutoTable 3.8.2**: incorporados da árvore atual do repositório; licenças MIT nos arquivos correspondentes desta pasta. O código comprimido compartilhado fica no pacote gerado.
- React, React DOM, Vite, TypeScript e demais dependências de desenvolvimento têm suas versões fixadas em `package-lock.json`; os avisos presentes nos bundles são preservados pelo build.

Nenhuma biblioteca é buscada na internet quando o usuário abre o HTML final.
