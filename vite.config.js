import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "./",
  appType: "mpa",
  build: {
    outDir: "../dist/browser",
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    },
    preprocessorOptions: {
      scss: {
        includePaths: ["node_modules", "style"],
      },
    },
  },
  server: {
    port: 8999,
  },
});
