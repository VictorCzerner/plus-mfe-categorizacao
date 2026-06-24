import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./styles";
import CategoriasPage from "./pages/CategoriasPage";

// Entry point apenas para desenvolvimento standalone (sem o shell).
// Em produção, o shell consome o módulo ./CategoriasPage via Module Federation.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CategoriasPage />
    </ThemeProvider>
  </React.StrictMode>
);
