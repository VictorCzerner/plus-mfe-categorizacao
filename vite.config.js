import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_categorizacao",
      filename: "remoteEntry.js",
      // Componentes expostos para o Shell consumir
      exposes: {
        "./CategoriasPage": "./src/pages/CategoriasPage",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 4002,
    host: true,
  },
  preview: {
    port: 4002,
    host: true,
  },
});
