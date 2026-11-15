import {defineConfig} from 'vite';import {viteSingleFile} from 'vite-plugin-singlefile';
export default defineConfig({base:'./',plugins:[viteSingleFile()],build:{target:'es2022',assetsInlineLimit:Infinity,cssCodeSplit:false,rollupOptions:{output:{inlineDynamicImports:true}}},server:{host:'0.0.0.0'}});
