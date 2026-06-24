import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Mock do cliente de API (mantém uma classe ApiError compatível com instanceof).
vi.mock("../api/categoriasApi", () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return {
    ApiError,
    categoriasApi: {
      listar: vi.fn(),
      buscar: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      atualizarParcial: vi.fn(),
      remover: vi.fn(),
    },
  };
});

import CategoriasPage from "./CategoriasPage";
import { categoriasApi, ApiError } from "../api/categoriasApi";
import type { Categoria } from "../types/categoria";

const listarMock = categoriasApi.listar as unknown as ReturnType<typeof vi.fn>;

function makeToken(payload: object): string {
  return `h.${btoa(JSON.stringify(payload))}.s`;
}

function pageOf(content: Categoria[]) {
  return { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 };
}

function cat(id: number, nome: string, categoriaPaiId: number | null = null): Categoria {
  return { id, nome, descricao: "", ativo: true, categoriaPaiId, criadoEm: "", atualizadoEm: "" };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("token", makeToken({ role: "admin" }));
});

describe("CategoriasPage", () => {
  it("lista categorias e exibe o botão de admin", async () => {
    listarMock.mockResolvedValue(pageOf([cat(1, "DATAS COMEMORATIVAS")]));

    render(<CategoriasPage />);

    expect(await screen.findByText(/\(1\)\s*DATAS COMEMORATIVAS/)).toBeInTheDocument();
    expect(screen.getByText(/Nova categoria/i)).toBeInTheDocument();
  });

  it("mostra o banner de erro quando a API falha", async () => {
    listarMock.mockRejectedValue(
      new ApiError(0, "Erro de conexão. Verifique se o servidor está rodando.")
    );

    render(<CategoriasPage />);

    expect(await screen.findByText(/Erro de conexão/i)).toBeInTheDocument();
  });

  it("oculta 'Nova categoria' para usuário não-admin", async () => {
    localStorage.setItem("token", makeToken({ role: "vendedor" }));
    listarMock.mockResolvedValue(pageOf([]));

    render(<CategoriasPage />);

    await waitFor(() => expect(listarMock).toHaveBeenCalled());
    expect(screen.queryByText(/Nova categoria/i)).not.toBeInTheDocument();
  });
});
