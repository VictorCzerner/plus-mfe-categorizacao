import { Box, IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Categoria } from "../../types/categoria";
import type { CategoriaTreeNode } from "../../utils/categoriaTree";

interface CategoriaTreeItemProps {
  node: CategoriaTreeNode;
  depth: number;
  admin: boolean;
  expandedIds: Set<number>;
  forceExpand: boolean;
  visibleIds: Set<number> | null;   // null = sem filtro (tudo visível)
  onToggle: (id: number) => void;
  onEdit: (c: Categoria) => void;
  onAddChild: (c: Categoria) => void;
  onDelete: (c: Categoria) => void;
}

export function CategoriaTreeItem(props: CategoriaTreeItemProps) {
  const {
    node, depth, admin, expandedIds, forceExpand, visibleIds,
    onToggle, onEdit, onAddChild, onDelete,
  } = props;

  const isVisible = (id: number) => visibleIds == null || visibleIds.has(id);
  const filhosVisiveis = node.children.filter(c => isVisible(c.id));
  const temFilhos = filhosVisiveis.length > 0;
  const expanded = forceExpand || expandedIds.has(node.id);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          ml: depth * 4,
          mb: 1,
          px: 2,
          py: 1.25,
          borderRadius: "12px",
          bgcolor: "#fff",
          borderLeft: `4px solid ${node.ativo ? "#6C63FF" : "#d0d0e8"}`,
          boxShadow: "0 1px 4px rgba(70,60,200,0.08)",
        }}
      >
        {depth > 0 && (
          <SubdirectoryArrowRightIcon sx={{ color: "#b9b9d0", fontSize: 18 }} />
        )}
        <MenuIcon aria-hidden sx={{ color: "#c4c4d6", fontSize: 18 }} />

        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            fontWeight: depth === 0 ? 700 : 600,
            color: "#3d3d6b",
            fontSize: depth === 0 ? "0.95rem" : "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          ({node.id}) {node.nome}
        </Box>

        {/* Badge de status */}
        <Box
          sx={{
            px: 1.2,
            py: 0.3,
            borderRadius: "8px",
            bgcolor: node.ativo ? "#22c55e" : "#e6e6ef",
            color: node.ativo ? "#fff" : "#9898b3",
            fontSize: "0.7rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {node.ativo ? "Ativo" : "Inativo"}
        </Box>

        {/* Ações (somente admin) */}
        {admin && (
          <Box sx={{ display: "flex" }}>
            <Tooltip title="Editar">
              <IconButton size="small" aria-label="Editar" onClick={() => onEdit(node)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Adicionar subcategoria">
              <IconButton size="small" aria-label="Adicionar subcategoria" onClick={() => onAddChild(node)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                aria-label="Excluir"
                onClick={() => onDelete(node)}
                sx={{ color: "#e05252" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Chevron expandir/recolher */}
        <Box sx={{ width: 32, display: "flex", justifyContent: "center" }}>
          {temFilhos && (
            <IconButton
              size="small"
              aria-label="Expandir ou recolher"
              onClick={() => onToggle(node.id)}
            >
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      {temFilhos && expanded &&
        filhosVisiveis.map(child => (
          <CategoriaTreeItem
            key={child.id}
            {...props}
            node={child}
            depth={depth + 1}
          />
        ))}
    </>
  );
}
