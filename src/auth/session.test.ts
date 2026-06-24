import { describe, it, expect, beforeEach, vi } from "vitest";
import { getToken, getRole, isAdmin, logoutRedirect } from "./session";

// Monta um JWT falso (header.payload.assinatura) com o payload informado.
function makeToken(payload: object): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

beforeEach(() => {
  localStorage.clear();
});

describe("session", () => {
  it("getToken devolve o token do localStorage ou null", () => {
    expect(getToken()).toBeNull();
    localStorage.setItem("token", "abc");
    expect(getToken()).toBe("abc");
  });

  it("getRole decodifica o claim role do JWT", () => {
    localStorage.setItem("token", makeToken({ sub: "x", role: "admin" }));
    expect(getRole()).toBe("admin");
  });

  it("getRole devolve null sem token ou com token malformado", () => {
    expect(getRole()).toBeNull();
    localStorage.setItem("token", "nao-eh-jwt");
    expect(getRole()).toBeNull();
  });

  it("isAdmin é true apenas para role admin", () => {
    localStorage.setItem("token", makeToken({ role: "admin" }));
    expect(isAdmin()).toBe(true);

    localStorage.setItem("token", makeToken({ role: "vendedor" }));
    expect(isAdmin()).toBe(false);
  });

  it("logoutRedirect limpa a sessão e redireciona para /login", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("refresh", "r");
    vi.stubGlobal("location", { href: "" });

    logoutRedirect();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh")).toBeNull();
    expect(window.location.href).toBe("/login");

    vi.unstubAllGlobals();
  });
});
