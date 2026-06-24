import { useCallback, useEffect, useState } from "react";
import { categoriasApi, ApiError } from "../api/categoriasApi";
import type { Categoria } from "../types/categoria";

// Carrega TODAS as categorias (percorrendo as páginas) para montar a árvore
// hierárquica no cliente. A árvore precisa da lista completa para resolver os
// vínculos pai/filho e permitir busca incluindo ancestrais.
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const size = 100; // máximo permitido pelo contrato
      let page = 0;
      let totalPages = 1;
      let todas: Categoria[] = [];

      do {
        const result = await categoriasApi.listar({}, page, size);
        todas = todas.concat(result.content);
        totalPages = result.totalPages || 1;
        page++;
      } while (page < totalPages);

      setCategorias(todas);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar categorias.");
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categorias, loading, error, reload };
}
