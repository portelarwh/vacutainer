// Infraestrutura de verificação. O código do produto está em Plataforma.html.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const Module = require('node:module');
const {pathToFileURL} = require('node:url');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'Plataforma.html');

function decode(text) {
  return text.replace(/\r\n?/g,'\n').replace(/&lt;\/textarea/gi, '</textarea').replace(/&amp;/g, '&');
}
function encode(text) {
  return text.replace(/&/g, '&amp;').replace(/<\/textarea/gi, '&lt;/textarea');
}
function parse(html) {
  const sources = new Map();
  const pattern = /<textarea data-vac-source="([\w/.-]+)" spellcheck="false">([\s\S]*?)<\/textarea>/g;
  for (const match of html.matchAll(pattern)) {
    if (sources.has(match[1])) throw new Error('Fonte duplicada: ' + match[1]);
    if (/^[\r\n]/.test(match[2])) throw new Error('Fonte começa com quebra de linha: '+match[1]);
    if(encode(decode(match[2]))!==match[2].replace(/\r\n?/g,'\n'))throw new Error('Codificação de texto inválida: '+match[1]+'. Use scripts/bloco.mjs para gravar o bloco.');
    sources.set(match[1], decode(match[2]));
  }
  if (!sources.size) throw new Error('Arquivo sem fontes incorporadas.');
  return sources;
}
function assemble(sources, id, chain = []) {
  if (!sources.has(id)) throw new Error('Fonte ausente: ' + id);
  if (chain.includes(id)) throw new Error('Referência circular: ' + chain.concat(id).join(' → '));
  return sources.get(id).replace(/@@vac:([\w/.-]+)@@/g, (_, ref) => assemble(sources, ref, chain.concat(id)));
}
function fromHtml(html) {
  const sources = parse(html);
  return {html, sources, text: id => {
    if (!sources.has(id)) throw new Error('Fonte ausente: ' + id);
    return sources.get(id);
  }, assemble: id => assemble(sources, id)};
}
function load(file = FILE) {return fromHtml(fs.readFileSync(file, 'utf8'));}
let cached;
const current = () => cached || (cached = load());
const registries=new WeakMap();
function registry(app=current()) {
  if(registries.has(app))return registries.get(app);
  const declaration=app.text('modulo/core/modules').match(/const modules = (\[[\s\S]*?\n\]);/);
  if(!declaration)throw new Error('Registro literal de módulos ausente do código.');
  const records=vm.runInNewContext(declaration[1],Object.create(null),{timeout:1000});
  if(!Array.isArray(records)||records.some(m=>typeof m.id!=='string'||typeof m.file!=='string')||new Set(records.map(m=>m.id)).size!==records.length)throw new Error('Registro de módulos inválido.');
  registries.set(app,records);return records;
}
const engine = name => current().assemble('motor/' + (registry().find(m=>m.file===name)?.id || name));
const manifest = () => JSON.parse(current().text('dados/manifesto'));
function library(name) {
  const target = new Module(FILE + '#' + name, module);
  target.filename = FILE; target.paths = Module._nodeModulePaths(ROOT);
  target._compile(current().text('biblioteca/' + name), FILE);
  return target.exports;
}
function model(name) {
  if (name !== 'SQDCPModelo') throw new Error('Modelo não reconhecido: ' + name);
  const code = engine('oee').match(/const SQDCPModelo = \(\(\) => \{[\s\S]*?\n\}\)\(\);/);
  if (!code) throw new Error('Modelo SQDCP ausente do motor.');
  return vm.runInNewContext(code[0] + '; SQDCPModelo');
}
function materialize(directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-modulos-ficticios-'))) {
  for (const [id, code] of current().sources) {
    if (!/^(modulo|recurso|vendor)\//.test(id)) continue;
    const output = path.join(directory, id + '.mjs');
    fs.mkdirSync(path.dirname(output), {recursive:true});
    fs.writeFileSync(output, code.replace(/(['"])vac:([\w/.-]+)\1/g, (_, quote, target) => quote + pathToFileURL(path.join(directory, target + '.mjs')).href + quote));
  }
  return directory;
}
module.exports = {ROOT, FILE, parse, assemble, load, fromHtml, current, registry, engine, manifest, library, model, materialize, encode};
Object.defineProperty(module.exports,'names',{get:()=>Object.fromEntries(registry().map(m=>[m.file,m.id]))});
