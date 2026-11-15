import {readFileSync} from 'node:fs';
import {verify} from './verificar.mjs';
import {checkSetup} from './check-setup.mjs';
import helpers from './html.cjs';
const before=readFileSync(helpers.FILE);checkSetup();const a=verify();checkSetup();const b=verify();
if(!before.equals(readFileSync(helpers.FILE))||a.sha256!==b.sha256)throw new Error('Verificação modificou o HTML canônico.');
console.log('Duas verificações idênticas; HTML pronto para uso, sem compilação ou fontes externas. SHA-256 '+b.sha256);
