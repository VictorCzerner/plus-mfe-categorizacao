Trabalho 2 de ES2

Grupo: 05

# Documento de Decisão de Arquitetura do Microfrontend de Categorização — Projeto Plus Gestão

## 1. STATUS: Aceito

## 2. CONTEXTO

O **Plus** é um sistema distribuído de gestão de estoque de vestuário, composto por um **Shell**
(host de Module Federation) que consome **microfrontends remotos**, e por **microsserviços**
independentes no backend. O domínio de **categorização de produtos** ganhou um novo microsserviço
(`plus-ms-categorias`, Spring Boot, porta 3002), que expõe um CRUD de categorias **hierárquicas**
(subcategorias via `categoriaPaiId`), protegido por **JWT** emitido pelo `plus-ms-auth` e por
**RBAC** (leitura para qualquer autenticado, escrita apenas para ADMIN).

Faltava a interface desse domínio. Este ADR documenta as decisões de arquitetura do
**`plus-mfe-categorizacao`** — o microfrontend que consome aquele microsserviço e oferece o
gerenciamento de categorias em **visualização de árvore**.

## 3. DECISÃO ARQUITETURAL

Foi adotado um microfrontend **remoto** (Module Federation), **espelhando deliberadamente a
estrutura do `plus-mfe-auth`** para manter coerência técnica e visual no ecossistema. As decisões
específicas:

### 3.1. Remote independente espelhando o `plus-mfe-auth`

O `plus-mfe-categorizacao` é um **remote** (React 18 + TypeScript + MUI + Vite) que expõe módulos
para o Shell via `@originjs/vite-plugin-federation`, com `react`/`react-dom` declarados como
`shared`. A estrutura de pastas, o tema MUI (`styles.ts`), os componentes reutilizáveis
(`UnderlineField`, `AlertBanner`) e o padrão de chamada à API (`fetch` + `Authorization: Bearer`
lido do `localStorage`, redirecionando ao `/login` em `401`) foram **reaproveitados do
`plus-mfe-auth`**.

**Por quê:** consistência de contratos e de experiência, deploy isolado do domínio de categorias
sem recompilar o Shell, e curva de manutenção menor para quem já conhece o `mfe-auth`.

### 3.2. Expor um único módulo (`./CategoriasPage`) com diálogo (modal)

Em vez de expor várias páginas (lista, formulário de criação, formulário de edição) como módulos
separados, expomos **um único** módulo `./CategoriasPage`. A criação e a edição acontecem em um
**`Dialog`** (modal) dentro da própria página, e a exclusão é inline.

**Por quê:** simplifica a ligação no Shell (uma única rota `/categorias` e um único `lazy import`),
mantém o usuário no contexto da árvore ao criar/editar, e concentra a coesão do domínio em um lugar.
**Trade-off:** a página acumula responsabilidades (listar + filtrar + CRUD), mitigado extraindo
hooks (`useCategorias`, `useCategoriaForm`), o diálogo e o item de árvore em componentes próprios.

### 3.3. Visualização em árvore montada no cliente

A tela apresenta as categorias como uma **árvore hierárquica** (inspirada em uma referência visual
de gerenciador de categorias): raízes no topo, subcategorias **indentadas** com seta `↳`, com
**expandir/recolher** por nó e indicadores de status. A árvore é **montada no cliente** a partir da
lista plana (`buildCategoriaTree` em `utils/categoriaTree.ts`), carregando **todas** as categorias
(paginando até esgotar) em vez de usar o filtro `categoriaPaiId` do contrato a cada nível.

**Por quê:** o filtro `categoriaPaiId` retorna apenas os filhos **diretos** — montar a árvore sob
demanda exigiria N chamadas para árvores profundas. Carregando tudo de uma vez conseguimos
**expandir/recolher instantâneo** (sem round-trip) e **busca que preserva os ancestrais**
(`visibleIdsFor`), de modo que um filho que casa com o termo aparece junto de toda a sua cadeia de
pais. **Trade-off:** carrega a base inteira de categorias no cliente; adequado à escala do domínio
(dezenas/centenas), mas exigiria carregamento lazy para volumes muito grandes.

### 3.4. RBAC no cliente via decodificação do JWT

A UI adapta-se ao perfil (`auth/session.ts`): o `role` é lido **decodificando o payload do JWT**
localmente, sem chamar o `plus-ms-auth`. Para ADMIN, exibem-se as ações de escrita (Nova categoria,
Editar, Adicionar subcategoria, Excluir); para VENDEDOR, a árvore é **somente leitura**.

**Por quê:** evita acoplar o MFE de categorias ao microsserviço de autenticação e elimina um
round-trip a `/auth/me`. O controle no cliente é **apenas de UX** — o backend continua validando as
permissões e respondendo `403` quando necessário.

### 3.5. Cliente de API centralizado e tratamento dos erros do contrato

As chamadas ao microsserviço ficam em `api/categoriasApi.ts`, que cobre as operações do OpenAPI
(listar, buscar, criar, atualizar, remover), injeta o `Bearer`, e **normaliza os erros** do schema
`Erro` (exibindo `message`). São tratados explicitamente: `401` (sessão expirada → logout), `403`
(sem permissão), `404` (não encontrado) e `409` (conflito — ex.: excluir categoria com
subcategorias, nome duplicado).

**Por quê:** o CRUD tem cinco operações com semântica de erro relevante; centralizar evita repetição
do `fetch` inline e padroniza as mensagens vindas do backend.

### 3.6. Reuso do design system do `plus-mfe-auth`

O tema MUI e os componentes visuais foram **copiados** do `mfe-auth` (e o `BackgroundBlobs`, antes
duplicado inline lá, foi **extraído** para um componente reutilizável aqui).

**Por quê:** o ADR do projeto define que todos os MFEs compartilhem o mesmo tema para o usuário não
perceber a transição entre microfrontends. **Trade-off:** há **duplicação** entre repositórios (não
há um pacote de design system compartilhado); aceitável diante do objetivo de independência/deploy
isolado, mas é uma dívida técnica candidata a virar uma biblioteca compartilhada no futuro.

### 3.7. Decisões de escopo (o que ficou de fora, de propósito)

- **Edição via `PUT`, não `PATCH`:** o contrato declara `PATCH`, mas o controller do MS ainda não o
  implementa; a edição usa `PUT` (que existe). O método parcial fica **latente** no cliente,
  alinhado ao contrato, para quando for implementado.
- **Sem badge "sem produtos":** a associação produto↔categoria é responsabilidade do **MS de
  produtos**; o contrato de categorização não expõe essa informação.
- **Sem drag-and-drop de reordenação:** não há endpoint de reordenação no contrato; o ícone de
  "puxador" (`≡`) é **decorativo**, apenas para fidelidade visual.

### 3.8. Qualidade e entrega contínua

- **Testes:** **Vitest + Testing Library + jsdom** cobrindo utilitários da árvore, sessão/JWT,
  cliente de API (com `fetch` mockado), o hook de formulário e os componentes (RBAC, expandir/
  recolher, erro de conexão).
- **CI/CD (GitHub Actions):** `ci.yml` roda **testes + build** a cada push/PR; `release.yml`
  **publica o pacote no NPM** ao criar uma tag `v*.*.*`. Como o pacote é um remote de Module
  Federation, o `remoteEntry.js` publicado pode ser servido por **CDN** (ex.: unpkg) e consumido
  pelo Shell apenas apontando `MFE_CATEGORIZACAO_URL`.

### 3.9. Integração com o restante da stack

- **CORS** foi habilitado no `plus-ms-categorias` (`SecurityConfig`), pois o navegador bloqueia as
  chamadas cross-origin do Shell (`:3000`/`:4002`) para o MS (`:3002`).
- O MS valida o JWT com o **mesmo segredo** do `plus-ms-auth` (`JWT_SECRET`), então o token do login
  funciona diretamente nas chamadas de categorias.

## 4. FLUXO GERAL

O navegador acessa o **Shell** (`:3000`), que carrega via Module Federation o `remoteEntry.js` do
**`plus-mfe-categorizacao`** (`:4002`) e injeta a `CategoriasPage` na rota `/categorias` (protegida
por token). A página decodifica o `role` do JWT (RBAC de UI), carrega todas as categorias pelo
`categoriasApi` (com `Authorization: Bearer`) e **monta a árvore no cliente**. As operações de
escrita (criar/editar via `Dialog`, excluir inline) chamam o **`plus-ms-categorias`** (`:3002`), que
valida o JWT, aplica o RBAC (`hasRole('ADMIN')`) e persiste no **PostgreSQL** próprio do serviço.
Erros do backend (ex.: `409` ao excluir categoria com filhos) são exibidos com a `message` original.

## 5. TECNOLOGIAS ADOTADAS

- React 18 + TypeScript
- Vite 5 + `@originjs/vite-plugin-federation` (Module Federation — remote)
- Material UI (MUI) — design system compartilhado com os demais MFEs
- Vitest + Testing Library (testes)
- GitHub Actions (CI/CD) + NPM (publicação do remote)

## 6. TRADE-OFFS

### 6.1. VANTAGENS

- **Consistência e independência:** mesma base visual/técnica do `mfe-auth`, com deploy isolado do
  domínio de categorias sem impacto no Shell.
- **Experiência de árvore fluida:** expandir/recolher e busca com ancestrais sem round-trips, graças
  à montagem da hierarquia no cliente.
- **Versionamento como produto:** publicado no NPM e consumível por CDN, com testes e build
  automatizados garantindo a qualidade de cada release.
- **Baixo acoplamento:** RBAC de UI por decodificação local do JWT, sem depender do `mfe-auth`/MS de
  auth em tempo de execução.

### 6.2. DESVANTAGENS / RISCOS

- **Duplicação do design system** entre repositórios (tema e componentes copiados) — dívida que
  pediria um pacote compartilhado.
- **Carga total de categorias no cliente** — simples e rápido na escala atual, mas exigirá
  carregamento lazy caso o volume cresça muito.
- **Governança da versão do React** — como `react`/`react-dom` são `shared` no Module Federation,
  divergência de versões entre Shell e remotes pode quebrar o carregamento dinâmico.
- **CORS e latência de rede** — cada interação é um salto cross-origin; o CORS do MS precisa
  acompanhar as origens dos frontends.
