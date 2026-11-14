import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('item 5: abas e comandos vêm do contrato do motor',()=>{const s=readFileSync('src/App.tsx','utf8');assert.ok(!s.includes('current.tabs.map'));assert.match(s,/statuses\[current.id\].*tabs/);assert.match(s,/comando\(/);assert.match(s,/info\?\.versao/)});
