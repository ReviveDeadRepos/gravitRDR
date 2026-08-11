import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
  root: "src",
  base: "./",
  appType: "mpa",
  build: {
    outDir: "../dist/browser",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./src/index.html", import.meta.url)),
        desktop: fileURLToPath(new URL("./src/desktop.html", import.meta.url)),
      },
    },
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
