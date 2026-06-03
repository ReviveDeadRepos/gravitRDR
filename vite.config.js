import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  appType: 'mpa',
  build: {
    outDir: '../build/source',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        style: 'src/entries/style.js',
        app: 'src/entries/app.js',
      },
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
