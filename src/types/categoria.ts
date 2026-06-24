// Tipos derivados do contrato OpenAPI do plus-ms-categorizacao.

// Resposta de uma categoria (schema CategoriaResponse).
export interface Categoria {
  id:             number;
  nome:           string;
  descricao?:     string;
  ativo:          boolean;
  categoriaPaiId: number | null;
  criadoEm:       string;   // date-time
  atualizadoEm:   string;   // date-time
}

// Corpo para criação / atualização completa (schema CategoriaRequest).
export interface CategoriaRequest {
  nome:            string;            // obrigatório, 2..80
  descricao?:      string;            // até 255
  ativo?:          boolean;           // default true
  categoriaPaiId?: number | null;     // null = categoria raiz
}

// Corpo para atualização parcial (schema CategoriaPatchRequest) — todos opcionais.
export type CategoriaPatchRequest = Partial<CategoriaRequest>;

// Resposta paginada (schema CategoriaPage).
export interface CategoriaPage {
  content:       Categoria[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}

// Filtros aceitos pelo endpoint de listagem.
export interface CategoriaFiltros {
  nome?:           string;
  ativo?:          boolean;
  categoriaPaiId?: number;
}

// Corpo de erro padrão da API (schema Erro).
export interface ApiErro {
  timestamp?: string;
  status?:    number;
  error?:     string;
  message?:   string;
  path?:      string;
}
