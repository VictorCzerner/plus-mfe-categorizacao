import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import { AlertBanner } from "../components/alert-banner/alert-banner";
import { CategoriaDialog } from "../components/categoria-dialog/categoria-dialog";
import { CategoriaTreeItem } from "../components/categoria-tree-item/categoria-tree-item";
import { useCategorias } from "../hooks/useCategorias";
import { categoriasApi, ApiError } from "../api/categoriasApi";
import { isAdmin } from "../auth/session";
import {
  buildCategoriaTree,
  idsComFilhos,
  visibleIdsFor,
} from "../utils/categoriaTree";
import type { Categoria } from "../types/categoria";

interface Feedback {
  message: string;
  severity: "success" | "error";
}

export default function CategoriasPage() {
  const admin = isAdmin();

  const { categorias, loading, error, reload } = useCategorias();

  // Filtros (client-side, sobre a árvore completa).
  const [nomeInput, setNomeInput] = useState("");
  const [ativoFiltro, setAtivoFiltro] = useState<"" | "true" | "false">("");

  // Expansão dos nós.
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Diálogo de criar/editar.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [paiPadrao, setPaiPadrao] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const tree = useMemo(() => buildCategoriaTree(categorias), [categorias]);

  const termo = nomeInput.trim().toLowerCase();
  const filtroAtivo = termo !== "" || ativoFiltro !== "";

  // Ids visíveis quando há filtro (nós que casam + ancestrais); null = sem filtro.
  const visibleIds = useMemo(() => {
    if (!filtroAtivo) return null;
    return visibleIdsFor(categorias, (c) => {
      const casaNome = termo === "" || c.nome.toLowerCase().includes(termo);
      const casaStatus =
        ativoFiltro === "" || c.ativo === (ativoFiltro === "true");
      return casaNome && casaStatus;
    });
  }, [categorias, filtroAtivo, termo, ativoFiltro]);

  const toggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandirTudo = () => setExpandedIds(idsComFilhos(categorias));
  const recolherTudo = () => setExpandedIds(new Set());

  const handleNovaRaiz = () => {
    setEditando(null);
    setPaiPadrao(null);
    setDialogOpen(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setEditando(categoria);
    setPaiPadrao(null);
    setDialogOpen(true);
  };

  const handleAddChild = (pai: Categoria) => {
    setEditando(null);
    setPaiPadrao(pai.id);
    // Garante que o pai esteja expandido para o novo filho aparecer após salvar.
    setExpandedIds((prev) => new Set(prev).add(pai.id));
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditando(null);
    setPaiPadrao(null);
  };

  const handleSalvo = (mensagem: string) => {
    fecharDialog();
    setFeedback({ message: mensagem, severity: "success" });
    reload();
  };

  const handleExcluir = async (categoria: Categoria) => {
    const ok = window.confirm(
      `Remover a categoria "${categoria.nome}"? Esta ação não pode ser desfeita.`
    );
    if (!ok) return;

    try {
      await categoriasApi.remover(categoria.id);
      setFeedback({ message: "Categoria removida com sucesso.", severity: "success" });
      reload();
    } catch (err) {
      // 409: categoria com subcategorias; 403: sem permissão; 404: não encontrada.
      const message =
        err instanceof ApiError ? err.message : "Erro ao remover categoria.";
      setFeedback({ message, severity: "error" });
    }
  };

  const isVisible = (id: number) => visibleIds == null || visibleIds.has(id);
  const raizesVisiveis = tree.filter((n) => isVisible(n.id));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #7B74F5 0%, #5E56E8 100%)",
        p: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Cabeçalho */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Categorias
          </Typography>

          {admin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNovaRaiz}
              sx={{
                borderRadius: "16px",
                px: 2.5,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                "&:hover": { background: "rgba(255,255,255,0.25)" },
              }}
            >
              Nova categoria
            </Button>
          )}
        </Box>

        <Paper
          sx={{
            p: 4,
            borderRadius: "24px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <AlertBanner
            message={feedback?.message ?? null}
            severity={feedback?.severity ?? "success"}
            onClose={() => setFeedback(null)}
          />

          {/* Filtros + controles de expansão */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3, alignItems: { sm: "center" } }}
          >
            <TextField
              label="Buscar por nome"
              variant="standard"
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              sx={{ flex: 1 }}
            />

            <FormControl variant="standard" sx={{ minWidth: 140 }}>
              <InputLabel id="filtro-ativo-label">Status</InputLabel>
              <Select
                labelId="filtro-ativo-label"
                value={ativoFiltro}
                onChange={(e) => setAtivoFiltro(e.target.value as typeof ativoFiltro)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="true">Ativas</MenuItem>
                <MenuItem value="false">Inativas</MenuItem>
              </Select>
            </FormControl>

            <Button size="small" startIcon={<UnfoldMoreIcon />} onClick={expandirTudo}>
              Expandir
            </Button>
            <Button size="small" startIcon={<UnfoldLessIcon />} onClick={recolherTudo}>
              Recolher
            </Button>
          </Stack>

          {error && <AlertBanner message={error} severity="error" />}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : raizesVisiveis.length > 0 ? (
            <Box>
              {raizesVisiveis.map((node) => (
                <CategoriaTreeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  admin={admin}
                  expandedIds={expandedIds}
                  forceExpand={filtroAtivo}
                  visibleIds={visibleIds}
                  onToggle={toggle}
                  onEdit={handleEditar}
                  onAddChild={handleAddChild}
                  onDelete={handleExcluir}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 5, color: "#9898b3" }}>
              Nenhuma categoria encontrada.
            </Box>
          )}
        </Paper>
      </Container>

      {/* Montado apenas quando aberto para garantir estado de formulário limpo. */}
      {dialogOpen && (
        <CategoriaDialog
          open={dialogOpen}
          categoria={editando}
          paiPadraoId={paiPadrao}
          opcoesPai={categorias}
          onClose={fecharDialog}
          onSaved={handleSalvo}
        />
      )}
    </Box>
  );
}
