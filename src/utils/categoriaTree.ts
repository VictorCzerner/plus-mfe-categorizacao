import type { Categoria } from "../types/categoria";

// Categoria com seus filhos diretos — nó da árvore montada no cliente.
export interface CategoriaTreeNode extends Categoria {
  children: CategoriaTreeNode[];
}

// Monta a árvore a partir da lista plana usando categoriaPaiId.
// Nós cujo pai não está na lista (ou é null) viram raízes. Preserva a ordem recebida.
export function buildCategoriaTree(categorias: Categoria[]): CategoriaTreeNode[] {
  const byId = new Map<number, CategoriaTreeNode>();
  categorias.forEach(c => byId.set(c.id, { ...c, children: [] }));

  const roots: CategoriaTreeNode[] = [];
  for (const c of categorias) {
    const node = byId.get(c.id)!;
    const paiId = c.categoriaPaiId;
    if (paiId != null && byId.has(paiId)) {
      byId.get(paiId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// Conjunto de ids que devem aparecer ao filtrar: os que casam com o predicado
// MAIS toda a cadeia de ancestrais (para não "órfãos" um filho cujo pai não casa).
export function visibleIdsFor(
  categorias: Categoria[],
  matches: (c: Categoria) => boolean
): Set<number> {
  const byId = new Map<number, Categoria>();
  categorias.forEach(c => byId.set(c.id, c));

  const visible = new Set<number>();
  for (const c of categorias) {
    if (!matches(c)) continue;
    let atual: Categoria | undefined = c;
    while (atual && !visible.has(atual.id)) {
      visible.add(atual.id);
      atual = atual.categoriaPaiId != null ? byId.get(atual.categoriaPaiId) : undefined;
    }
  }
  return visible;
}

// Ids de categorias que possuem ao menos um filho (úteis para "expandir tudo").
export function idsComFilhos(categorias: Categoria[]): Set<number> {
  const ids = new Set<number>();
  for (const c of categorias) {
    if (c.categoriaPaiId != null) ids.add(c.categoriaPaiId);
  }
  return ids;
}
