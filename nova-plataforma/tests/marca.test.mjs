import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateBrand,contrast,checkSetup} from '../scripts/check-setup.mjs';
const reference=readFileSync('docs/BD_Dashboard_Brand_Guidelines.md','utf8'),css=readFileSync('src/design/brand.css','utf8');
test('Marca: configuração e referências locais válidas',()=>assert.equal(checkSetup().colors,10));
test('Marca: alteração silenciosa de uma cor institucional é recusada',()=>{assert.equal(validateBrand(reference,css),10);assert.throws(()=>validateBrand(reference,css.replace('#044ED7','#147C71')),/bd-blue/);assert.throws(()=>validateBrand(reference,css+'\n--bd-blue: #044ED7;'),/bd-blue/)});
test('Marca: contraste WCAG identifica as combinações inadequadas do anexo',()=>{assert.equal(contrast('#000000','#FFFFFF'),21);for(const bg of ['#FF6E00','#9199D8']){assert.ok(contrast('#060A3D',bg)>=4.5);assert.ok(contrast('#3D3E41',bg)<4.5)}assert.ok(contrast('#FF6E00','#FFFFFF')<3);assert.ok(contrast('#044ED7','#FFFFFF')>=4.5)});
