Trabalho 2 de ES2

Grupo: 05

# Manual de UI — Como usar a tela de Categorias (Projeto Plus Gestão)

Guia prático de uso do microfrontend de **categorização de produtos**. Explica como acessar a tela,
navegar pela árvore de categorias e executar as operações do dia a dia (criar, editar, ativar/
desativar e excluir).

---

## 1. Como acessar

1. Faça **login** no sistema pelo Shell (`http://localhost:3000`) com seu e-mail e senha.
2. No **Dashboard**, clique em **"Gerenciar categorias →"** (ou acesse direto `/categorias`).

> É preciso estar logado. Se a sessão expirar, você é levado de volta à tela de login
> automaticamente.

---

## 2. Visão geral da tela

Ao abrir, você vê:

- **Título "Categorias"** e, no canto superior direito, o botão **"Nova categoria"** (apenas para
  administradores).
- **Barra de filtros:** campo **Buscar por nome**, seletor **Status** e os botões **Expandir** /
  **Recolher**.
- **A árvore de categorias**, onde **cada linha é uma categoria**:
  - `(id) Nome` da categoria;
  - selo **Ativo** (verde) ou **Inativo** (cinza);
  - ícones de ação (somente administradores);
  - uma **seta (⌄/⌃)** à direita **somente quando a categoria possui subcategorias**.

---

## 3. Navegando pela árvore

- **Abrir/fechar uma categoria:** clique na **seta (⌄/⌃)** à direita da linha. Subcategorias
  aparecem logo abaixo, **indentadas** e marcadas com **↳**.
- **Expandir tudo / Recolher tudo:** use os botões **Expandir** e **Recolher** na barra de filtros.
- A tela começa com a árvore **recolhida** (mostrando só as categorias principais).

---

## 4. Buscando e filtrando

- **Buscar por nome:** digite parte do nome. A árvore mostra as categorias que casam **junto com as
  categorias-pai** (para você ver o caminho) e se expande automaticamente.
- **Status:** escolha **Todas**, **Ativas** ou **Inativas**.
- Para voltar à visão completa, limpe a busca e deixe o status em **Todas**.

---

## 5. O que cada perfil pode fazer

| Perfil | Permissões |
|---|---|
| **Administrador** | Ver a árvore **e** criar, editar, adicionar subcategoria e excluir. |
| **Vendedor** | Apenas **visualizar** a árvore (sem botões de ação). |

---

## 6. Criar uma categoria

### 6.1 Categoria principal (raiz)
1. Clique em **"Nova categoria"** (canto superior direito).
2. Preencha o formulário:
   - **Nome** (obrigatório, de 2 a 80 caracteres);
   - **Descrição** (opcional, até 255 caracteres);
   - **Categoria pai** — deixe em **"Nenhuma (categoria raiz)"**;
   - **Ativo** — já vem ligado.
3. Clique em **Criar**.

### 6.2 Subcategoria
1. Na categoria que será a "mãe", clique no ícone **+** (**Adicionar subcategoria**).
2. O campo **Categoria pai** já vem preenchido com ela. Preencha o resto e clique em **Criar**.
3. A categoria-mãe se expande para mostrar a nova subcategoria.

> Dica: você também pode definir/trocar a categoria pai manualmente pelo seletor no formulário.

---

## 7. Editar uma categoria

1. Clique no ícone de **lápis** (**Editar**) na linha da categoria.
2. Altere o que precisar — inclusive **mover** a categoria escolhendo outra **Categoria pai**.
3. Clique em **Salvar**.

---

## 8. Ativar ou desativar

- Use o interruptor **Ativo** no formulário de criar/editar.
- Desativar **não apaga** a categoria — ela apenas fica marcada como **Inativo** (selo cinza). Útil
  para tirar de uso sem perder o histórico.

---

## 9. Excluir uma categoria

1. Clique no ícone de **lixeira** (**Excluir**) na linha.
2. **Confirme** na janela que aparece (a ação não pode ser desfeita).

> ⚠️ **Não é possível excluir uma categoria que tem subcategorias.** Nesse caso o sistema avisa
> *"Não é possível remover categoria com subcategorias."* — exclua ou mova as subcategorias antes.

---

## 10. Mensagens que você pode ver

| Situação | O que aparece |
|---|---|
| Operação concluída | Faixa verde de sucesso no topo do card. |
| Campo inválido | Aviso em vermelho abaixo do campo (ex.: "O nome é obrigatório.", "Máximo 80 caracteres."). |
| Servidor indisponível | "Erro de conexão. Verifique se o servidor está rodando." |
| Nome repetido / categoria com filhos | Faixa vermelha com a mensagem do sistema (conflito). |
| Ação sem permissão | Bloqueada para quem não é administrador. |
| Sessão expirada | Você é redirecionado para a tela de login. |

---

## 11. Observações

- O ícone de **"puxador" (≡)** à esquerda é apenas visual — **não** há arrastar-e-soltar para
  reordenar.
- A hierarquia é livre: uma categoria pode ter subcategorias, que por sua vez podem ter as suas.
