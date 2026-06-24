import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Config separada da vite.config.js de propósito: aqui NÃO carregamos o plugin de
// Module Federation (que atrapalha o ambiente de testes). Só precisamos do React + jsdom.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
