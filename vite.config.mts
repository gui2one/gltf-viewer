/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'GltfViewer',
    },
    outDir: './dist/gui2one/gltf-viewer/',
    copyPublicDir: true,
    cssCodeSplit: true,
    cssMinify: true,
  },
  
  root: './',
  base: '/gui2one/gltf-viewer/',
});