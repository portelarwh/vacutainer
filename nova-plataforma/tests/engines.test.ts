import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import manifest from '../src/generated/manifest.json';
import packed from '../src/generated/engines.json';
test('item 1: motores incorporados são os nove HTML da árvore atual, sem snapshot antigo',()=>{
 assert.equal(manifest.files.length,9);
 for(const f of manifest.files)assert.equal(gunzipSync(Buffer.from((packed as any)[f.id],'base64')).toString(),readFileSync('../'+f.path,'utf8'),f.path);
 assert.notEqual(manifest.revision,'0769376e794506a33d1d847ede67b73ea013b59e');
 assert.match(execFileSync('git',['show','--format=%H','--no-patch',manifest.revision],{encoding:'utf8'}),new RegExp(manifest.revision));
});
