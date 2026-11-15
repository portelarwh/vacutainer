import helpers from './html.cjs';
import path from 'node:path';
helpers.materialize(path.join(helpers.ROOT,'.test-cache'));
console.log('Módulos de teste extraídos do HTML único; nenhum arquivo operacional foi criado.');
