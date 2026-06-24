// Cliente HTTP do Microsserviço de Categorização (plus-ms-categorizacao).
// Cobre as 6 operações do contrato OpenAPI, injeta o JWT em todas as chamadas e
// normaliza os erros (schema Erro) numa exceção com mensagem amigável.

import { getToken, logoutRedirect } from "../auth/session";
import type {
  ApiErro,
  Categoria,
  CategoriaFiltros,
  CategoriaPage,
  CategoriaPatchRequest,
  CategoriaRequest,
} from "../types/categoria";

const API = import.meta.env.VITE_MS_CATEGORIZACAO_URL || "http://localhost:3002";

// Erro de API com status HTTP + mensagem extraída do corpo (schema Erro).
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildQuery(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API}${path}${buildQuery(options.query)}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Erro de conexão. Verifique se o servidor está rodando.");
  }

  // Token ausente/expirado: devolve o usuário ao login.
  if (res.status === 401) {
    logoutRedirect();
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  // 204 No Content (ex.: DELETE) — sem corpo para parsear.
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data as ApiErro | null)?.message || `Erro ${res.status} ao acessar a API.`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const categoriasApi = {
  // GET /categorias
  listar(filtros: CategoriaFiltros = {}, page = 0, size = 20): Promise<CategoriaPage> {
    return request<CategoriaPage>("/categorias", {
      query: {
        nome: filtros.nome,
        ativo: filtros.ativo,
        categoriaPaiId: filtros.categoriaPaiId,
        page,
        size,
      },
    });
  },

  // GET /categorias/{id}
  buscar(id: number): Promise<Categoria> {
    return request<Categoria>(`/categorias/${id}`);
  },

  // POST /categorias  (ADMIN)
  criar(body: CategoriaRequest): Promise<Categoria> {
    return request<Categoria>("/categorias", { method: "POST", body });
  },

  // PUT /categorias/{id}  (ADMIN) — substituição completa
  atualizar(id: number, body: CategoriaRequest): Promise<Categoria> {
    return request<Categoria>(`/categorias/${id}`, { method: "PUT", body });
  },

  // PATCH /categorias/{id}  (ADMIN) — atualização parcial
  atualizarParcial(id: number, body: CategoriaPatchRequest): Promise<Categoria> {
    return request<Categoria>(`/categorias/${id}`, { method: "PATCH", body });
  },

  // DELETE /categorias/{id}  (ADMIN) — 409 se houver subcategorias
  remover(id: number): Promise<void> {
    return request<void>(`/categorias/${id}`, { method: "DELETE" });
  },
};
