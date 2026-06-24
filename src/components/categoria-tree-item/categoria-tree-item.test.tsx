import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriaTreeItem } from "./categoria-tree-item";
import type { CategoriaTreeNode } from "../../utils/categoriaTree";

function node(
  partial: Partial<CategoriaTreeNode> & { id: number; nome: string }
): CategoriaTreeNode {
  return {
    descricao: "",
    ativo: true,
    categoriaPaiId: null,
    criadoEm: "",
    atualizadoEm: "",
    children: [],
    ...partial,
  };
}

const baseProps = {
  depth: 0,
  admin: false,
  expandedIds: new Set<number>(),
  forceExpand: false,
  visibleIds: null,
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onAddChild: vi.fn(),
  onDelete: vi.fn(),
};

describe("CategoriaTreeItem", () => {
  it("mostra (id) nome e o status", () => {
    render(<CategoriaTreeItem {...baseProps} node={node({ id: 7, nome: "Datas", ativo: true })} />);
    expect(screen.getByText(/\(7\)\s*Datas/)).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("oculta ações para não-admin e exibe para admin", () => {
    const { rerender } = render(
      <CategoriaTreeItem {...baseProps} admin={false} node={node({ id: 1, nome: "X" })} />
    );
    expect(screen.queryByLabelText("Editar")).not.toBeInTheDocument();

    rerender(<CategoriaTreeItem {...baseProps} admin={true} node={node({ id: 1, nome: "X" })} />);
    expect(screen.getByLabelText("Editar")).toBeInTheDocument();
    expect(screen.getByLabelText("Excluir")).toBeInTheDocument();
    expect(screen.getByLabelText("Adicionar subcategoria")).toBeInTheDocument();
  });

  it("renderiza filhos quando expandido e os oculta quando recolhido", () => {
    const tree = node({
      id: 1,
      nome: "Pai",
      children: [node({ id: 2, nome: "Filho", categoriaPaiId: 1 })],
    });

    const { rerender } = render(
      <CategoriaTreeItem {...baseProps} expandedIds={new Set([1])} node={tree} />
    );
    expect(screen.getByText(/Filho/)).toBeInTheDocument();

    rerender(<CategoriaTreeItem {...baseProps} expandedIds={new Set()} node={tree} />);
    expect(screen.queryByText(/Filho/)).not.toBeInTheDocument();
  });

  it("clicar no chevron chama onToggle com o id do nó", async () => {
    const onToggle = vi.fn();
    const tree = node({
      id: 1,
      nome: "Pai",
      children: [node({ id: 2, nome: "Filho", categoriaPaiId: 1 })],
    });

    render(<CategoriaTreeItem {...baseProps} onToggle={onToggle} node={tree} />);
    await userEvent.click(screen.getByLabelText("Expandir ou recolher"));

    expect(onToggle).toHaveBeenCalledWith(1);
  });
});
