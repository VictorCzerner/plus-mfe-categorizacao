import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import type { CategoriaRequest } from "../types/categoria";

export interface CategoriaFormValues {
  nome:           string;
  descricao:      string;
  ativo:          boolean;
  categoriaPaiId: number | null;
}

type TextField = "nome" | "descricao";

interface FieldErrors {
  nome?:      string;
  descricao?: string;
}

interface UseCategoriaFormOptions {
  initial?: Partial<CategoriaFormValues>;
  onSubmit: (values: CategoriaRequest) => Promise<void>;
}

// Validações alinhadas ao schema CategoriaRequest do OpenAPI.
function validateNome(v: string) {
  const nome = v.trim();
  if (!nome) return "O nome é obrigatório.";
  if (nome.length < 2) return "Mínimo 2 caracteres.";
  if (nome.length > 80) return "Máximo 80 caracteres.";
}
function validateDescricao(v: string) {
  if (v.length > 255) return "Máximo 255 caracteres.";
}

const EMPTY: CategoriaFormValues = {
  nome: "",
  descricao: "",
  ativo: true,
  categoriaPaiId: null,
};

export function useCategoriaForm({ initial, onSubmit }: UseCategoriaFormOptions) {
  const [values, setValues] = useState<CategoriaFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<TextField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: TextField) => (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValues(prev => ({ ...prev, [field]: val }));
      if (touched[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: field === "nome" ? validateNome(val) : validateDescricao(val),
        }));
      }
    },
    [touched]
  );

  const handleBlur = useCallback(
    (field: TextField) => () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      setErrors(prev => ({
        ...prev,
        [field]: field === "nome"
          ? validateNome(values[field])
          : validateDescricao(values[field]),
      }));
    },
    [values]
  );

  // Setter genérico para campos não-textuais (ativo, categoriaPaiId).
  const setField = useCallback(
    <K extends keyof CategoriaFormValues>(field: K, value: CategoriaFormValues[K]) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const nomeErr = validateNome(values.nome);
      const descricaoErr = validateDescricao(values.descricao);
      if (nomeErr || descricaoErr) {
        setErrors({ nome: nomeErr, descricao: descricaoErr });
        setTouched({ nome: true, descricao: true });
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmit({
          nome: values.nome.trim(),
          descricao: values.descricao.trim() || undefined,
          ativo: values.ativo,
          categoriaPaiId: values.categoriaPaiId,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, setField, handleSubmit };
}
