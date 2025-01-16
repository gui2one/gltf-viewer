/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './index.html',
      name: 'GltfViewer'
    //   fileName: (format) => `gltf-viewer.${format}.js`,
    },
    outDir: './dist/gui2one/gltf-viewer/',
    copyPublicDir: true,
  },
  root: './',
  base: '/gui2one/gltf-viewer/',
});