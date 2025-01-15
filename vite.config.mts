/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './index.html',
      name: 'GltfViewer'
    //   fileName: (format) => `gltf-viewer.${format}.js`,
    },
    outDir: './dist',
    copyPublicDir: true,
    // rollupOptions: {
    //   // Externalize dependencies to reduce bundle size
    //   external: ['three'],
    //   output: {
    //     globals: {
    //       three: 'THREE',
    //     },
    //   },
    // },
  },
  root: './',
});