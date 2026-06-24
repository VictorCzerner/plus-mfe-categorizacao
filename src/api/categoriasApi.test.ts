import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock da sessão: token fixo e logoutRedirect espionável.
vi.mock("../auth/session", () => ({
  getToken: vi.fn(() => "tok-123"),
  logoutRedirect: vi.fn(),
}));

import { categoriasApi, ApiError } from "./categoriasApi";
import { logoutRedirect } from "../auth/session";

function fetchReturning(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("categoriasApi", () => {
  it("listar monta a query só com filtros definidos e envia o Bearer", async () => {
    const fetchMock = fetchReturning(200, {
      content: [], page: 0, size: 20, totalElements: 0, totalPages: 0,
    });
    vi.stubGlobal("fetch", fetchMock);

    await categoriasApi.listar({ nome: "cami", ativo: true }, 0, 20);

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/categorias?");
    expect(url).toContain("nome=cami");
    expect(url).toContain("ativo=true");
    expect(url).toContain("page=0");
    expect(url).toContain("size=20");
    expect(url).not.toContain("categoriaPaiId");
    expect(opts.headers.Authorization).toBe("Bearer tok-123");

    vi.unstubAllGlobals();
  });

  it("criar faz POST com corpo JSON", async () => {
    const fetchMock = fetchReturning(201, { id: 1, nome: "X" });
    vi.stubGlobal("fetch", fetchMock);

    await categoriasApi.criar({ nome: "X" });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/categorias");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ nome: "X" });

    vi.unstubAllGlobals();
  });

  it("remover trata 204 sem corpo e usa DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error("sem corpo")),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(categoriasApi.remover(5)).resolves.toBeUndefined();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/categorias/5");
    expect(opts.method).toBe("DELETE");

    vi.unstubAllGlobals();
  });

  it("resposta não-ok lança ApiError com a mensagem do corpo", async () => {
    const fetchMock = fetchReturning(409, { message: "Não é possível remover categoria com subcategorias." });
    vi.stubGlobal("fetch", fetchMock);

    await expect(categoriasApi.remover(1)).rejects.toMatchObject({
      status: 409,
      message: "Não é possível remover categoria com subcategorias.",
    });

    vi.unstubAllGlobals();
  });

  it("401 dispara logoutRedirect", async () => {
    const fetchMock = fetchReturning(401, {});
    vi.stubGlobal("fetch", fetchMock);

    await expect(categoriasApi.buscar(1)).rejects.toBeInstanceOf(ApiError);
    expect(logoutRedirect).toHaveBeenCalledOnce();

    vi.unstubAllGlobals();
  });

  it("falha de rede vira ApiError com status 0", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(categoriasApi.buscar(1)).rejects.toMatchObject({ status: 0 });

    vi.unstubAllGlobals();
  });
});
