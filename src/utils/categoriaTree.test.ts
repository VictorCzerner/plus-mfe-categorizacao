import { describe, it, expect } from "vitest";
import { buildCategoriaTree, visibleIdsFor, idsComFilhos } from "./categoriaTree";
import type { Categoria } from "../types/categoria";

function cat(
  id: number,
  nome: string,
  categoriaPaiId: number | null = null,
  ativo = true
): Categoria {
  return { id, nome, descricao: "", ativo, categoriaPaiId, criadoEm: "", atualizadoEm: "" };
}

describe("buildCategoriaTree", () => {
  it("agrupa filhos sob seus pais e mantém as raízes no topo", () => {
    const cats = [cat(1, "Raiz A"), cat(2, "Filho A1", 1), cat(3, "Raiz B"), cat(4, "Neto", 2)];
    const tree = buildCategoriaTree(cats);

    expect(tree.map(n => n.id)).toEqual([1, 3]);
    expect(tree[0].children.map(c => c.id)).toEqual([2]);
    expect(tree[0].children[0].children.map(c => c.id)).toEqual([4]);
  });

  it("trata nó com pai inexistente como raiz", () => {
    const tree = buildCategoriaTree([cat(2, "Órfão", 99)]);
    expect(tree.map(n => n.id)).toEqual([2]);
  });

  it("lista vazia produz árvore vazia", () => {
    expect(buildCategoriaTree([])).toEqual([]);
  });
});

describe("visibleIdsFor", () => {
  const cats = [cat(1, "Raiz"), cat(2, "Filho", 1), cat(3, "Neto", 2), cat(4, "Outra")];

  it("inclui o nó que casa e todos os ancestrais", () => {
    const ids = visibleIdsFor(cats, c => c.nome === "Neto");
    expect([...ids].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it("sem casamento devolve conjunto vazio", () => {
    expect(visibleIdsFor(cats, () => false).size).toBe(0);
  });
});

describe("idsComFilhos", () => {
  it("retorna ids que aparecem como pai de algum nó", () => {
    const cats = [cat(1, "Raiz"), cat(2, "Filho", 1), cat(3, "Neto", 2)];
    expect([...idsComFilhos(cats)].sort((a, b) => a - b)).toEqual([1, 2]);
  });
});
