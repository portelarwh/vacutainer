import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('A3/A4: módulo usa uma rolagem e o filtro próprio do motor',()=>{const app=readFileSync('src/App.tsx','utf8'),css=readFileSync('src/core/runtime.ts','utf8');assert.match(app,/\{!current&&filters\}/);assert.match(css,/ResizeObserver/);assert.match(css,/height:/)});
