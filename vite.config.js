import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  appType: 'mpa',
  build: {
    outDir: '../build/source',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/entries/style.js',
    },
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    },
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules', 'style'],
      },
    },
  },
  server: {
    port: 8999,
  },
});
