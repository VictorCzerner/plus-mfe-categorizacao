import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCategoriaForm } from "./useCategoriaForm";

const changeEvent = (value: string) => ({ target: { value } }) as never;
const submitEvent = () => ({ preventDefault: () => {} }) as never;

describe("useCategoriaForm", () => {
  it("começa com os valores padrão", () => {
    const { result } = renderHook(() => useCategoriaForm({ onSubmit: vi.fn() }));
    expect(result.current.values).toEqual({
      nome: "", descricao: "", ativo: true, categoriaPaiId: null,
    });
  });

  it("não submete com nome vazio e marca erro", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useCategoriaForm({ onSubmit }));

    await act(async () => { await result.current.handleSubmit(submitEvent()); });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.nome).toBeTruthy();
  });

  it("valida o tamanho mínimo do nome", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useCategoriaForm({ onSubmit }));

    act(() => { result.current.handleChange("nome")(changeEvent("A")); });
    await act(async () => { await result.current.handleSubmit(submitEvent()); });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.nome).toMatch(/2/);
  });

  it("submete valores válidos com descricao undefined quando vazia", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCategoriaForm({ onSubmit }));

    act(() => { result.current.handleChange("nome")(changeEvent("  Camisetas  ")); });
    await act(async () => { await result.current.handleSubmit(submitEvent()); });

    expect(onSubmit).toHaveBeenCalledWith({
      nome: "Camisetas",
      descricao: undefined,
      ativo: true,
      categoriaPaiId: null,
    });
  });

  it("setField atualiza ativo e categoriaPaiId", () => {
    const { result } = renderHook(() => useCategoriaForm({ onSubmit: vi.fn() }));

    act(() => { result.current.setField("ativo", false); });
    act(() => { result.current.setField("categoriaPaiId", 7); });

    expect(result.current.values.ativo).toBe(false);
    expect(result.current.values.categoriaPaiId).toBe(7);
  });
});
