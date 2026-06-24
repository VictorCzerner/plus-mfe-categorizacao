import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
} from "@mui/material";

import { UnderlineField } from "../underline-field/underline-field";
import { AlertBanner } from "../alert-banner/alert-banner";
import { useCategoriaForm } from "../../hooks/useCategoriaForm";
import { categoriasApi, ApiError } from "../../api/categoriasApi";
import type { Categoria, CategoriaRequest } from "../../types/categoria";

interface CategoriaDialogProps {
  open: boolean;
  // Categoria em edição; ausente = modo criação.
  categoria?: Categoria | null;
  // Pai pré-selecionado ao criar subcategoria via "+" (ignorado na edição).
  paiPadraoId?: number | null;
  // Opções de categoria pai (lista já carregada na página).
  opcoesPai: Categoria[];
  onClose: () => void;
  onSaved: (mensagem: string) => void;
}

export function CategoriaDialog({
  open, categoria, paiPadraoId, opcoesPai, onClose, onSaved,
}: CategoriaDialogProps) {
  const isEdit = Boolean(categoria);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSave = async (body: CategoriaRequest) => {
    setServerError(null);
    try {
      if (isEdit && categoria) {
        await categoriasApi.atualizar(categoria.id, body);
        onSaved("Categoria atualizada com sucesso.");
      } else {
        await categoriasApi.criar(body);
        onSaved("Categoria criada com sucesso.");
      }
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Erro ao salvar categoria."
      );
    }
  };

  const {
    values, errors, touched, isSubmitting,
    handleChange, handleBlur, setField, handleSubmit,
  } = useCategoriaForm({
    initial: categoria
      ? {
          nome: categoria.nome,
          descricao: categoria.descricao ?? "",
          ativo: categoria.ativo,
          categoriaPaiId: categoria.categoriaPaiId,
        }
      : { categoriaPaiId: paiPadraoId ?? null },
    onSubmit: handleSave,
  });

  // Uma categoria não pode ser pai de si mesma.
  const opcoes = opcoesPai.filter(c => c.id !== categoria?.id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#4a42c8" }}>
        {isEdit ? "Editar categoria" : "Nova categoria"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <AlertBanner
            message={serverError}
            severity="error"
            onClose={() => setServerError(null)}
          />

          <Stack spacing={3} sx={{ mt: 1 }}>
            <UnderlineField
              id="nome"
              label="Nome"
              value={values.nome}
              onChange={handleChange("nome")}
              onBlur={handleBlur("nome")}
              error={Boolean(touched.nome && errors.nome)}
              helperText={errors.nome}
              autoFocus
            />

            <UnderlineField
              id="descricao"
              label="Descrição"
              value={values.descricao}
              onChange={handleChange("descricao")}
              onBlur={handleBlur("descricao")}
              error={Boolean(touched.descricao && errors.descricao)}
              helperText={errors.descricao}
              multiline
            />

            <FormControl fullWidth variant="standard">
              <InputLabel id="categoria-pai-label">Categoria pai (opcional)</InputLabel>
              <Select
                labelId="categoria-pai-label"
                value={values.categoriaPaiId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setField("categoriaPaiId", v === "" ? null : Number(v));
                }}
              >
                <MenuItem value="">
                  <em>Nenhuma (categoria raiz)</em>
                </MenuItem>
                {opcoes.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={values.ativo}
                  onChange={(e) => setField("ativo", e.target.checked)}
                />
              }
              label={values.ativo ? "Ativa" : "Inativa"}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting && (
              <CircularProgress size={16} color="inherit" sx={{ mr: 1.25 }} />
            )}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
