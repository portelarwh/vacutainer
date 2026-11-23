// Gates de qualidade (JavaScript apenas). O aplicativo em si vive em
// Plataforma.html, que NAO e lido pelo ESLint e por contrato (CLAUDE.md) nao
// e dividido em modulos; este lint cobre scripts/, testes/ e eslint-rules/.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

import quality from "./eslint-rules/index.cjs";

const testFiles = [
  "**/*{.,-}{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
  "**/{__tests__,__mocks__,fixtures,mocks}/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
];

export default defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly", process: "readonly", require: "readonly",
        module: "readonly", __dirname: "readonly", __filename: "readonly",
        Buffer: "readonly", URL: "readonly", fetch: "readonly",
        setTimeout: "readonly", clearTimeout: "readonly",
        setInterval: "readonly", clearInterval: "readonly",
      },
    },
  },
  js.configs.recommended,
  { files: ["**/*.mjs"], languageOptions: { sourceType: "module" } },
  {
    files: ["scripts/**/*.{js,mjs,cjs}", "testes/**/*.{js,mjs,cjs}", "eslint-rules/**/*.cjs", "verify.mjs", "eslint.config.mjs"],
    plugins: { quality },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" }],
      "quality/max-lines": ["error", { max: 350 }],
      "quality/no-direct-console": ["error", { logger: "o helper de saida do projeto" }],
    },
  },
  {
    files: testFiles,
    plugins: { quality },
    rules: { "quality/max-lines": ["warn", { max: 350, includeTests: true }] },
  },
  {
    // Testes Playwright: os callbacks de page.evaluate rodam no navegador e
    // enxergam document/window e os globais do proprio Plataforma.html.
    files: ["testes/**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: { document: "readonly", window: "readonly", localStorage: "readonly", navigator: "readonly", location: "readonly", getComputedStyle: "readonly", requestAnimationFrame: "readonly" },
    },
  },
  {
    // Os callbacks de page.evaluate usam centenas de globais do proprio
    // Plataforma.html (Store, App, db, ...) que nao se declaram aqui; no-undef
    // so vale para scripts/ e para o codigo Node dos testes fora dos callbacks.
    files: ["testes/**/*.{js,cjs,mjs}", "scripts/cenario-demo.cjs", "scripts/varredura-visual.mjs"],
    rules: { "no-undef": "off" },
  },
  {
    // Scripts e testes sao CLIs: console e a saida deles; nao ha adaptador de log.
    files: ["scripts/**/*", "testes/**/*", "verify.mjs", "eslint-rules/**/*"],
    rules: { "quality/no-direct-console": "off" },
  },
  globalIgnores([
    ".claude/**", "node_modules/**", ".test-cache/**", "testes/saida/**",
    "package-lock.json", "Plataforma.html",
  ]),
]);
