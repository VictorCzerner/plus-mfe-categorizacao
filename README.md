# plus-mfe-categorizacao

# README Microfrontend de Categorização - Projeto Plus Gestão

Expõe a tela de gerenciamento de categorias de produtos via **Module Federation** para ser
consumida pelo `plus-shell`. Construído com React, TypeScript, Material UI (MUI) e Vite.

Consome o Microsserviço de Categorização (`plus-ms-categorizacao`) e usa o token JWT emitido pelo
`plus-ms-auth` (lido de `localStorage`) para autenticar as requisições.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite 5**
- **Material UI (MUI)** — Design System e Componentização
- `@originjs/vite-plugin-federation` — Module Federation
- `@vitejs/plugin-react`

## Module Federation

Este microfrontend atua como **remote** e expõe o seguinte módulo para o Host (Shell):

| Propriedade | Valor |
|---|---|
| Nome | `mfe_categorizacao` |
| Entry point | `http://localhost:4002/assets/remoteEntry.js` |
| Expõe (`./CategoriasPage`) | `src/pages/CategoriasPage.tsx` |
| Shared | `react`, `react-dom` |

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou utilize a injeção via Docker/Vite).

| Variável | Descrição | Valor Padrão |
|---|---|---|
| `VITE_MS_CATEGORIZACAO_URL` | URL do microsserviço de categorização (`plus-ms-categorizacao`) | `http://localhost:3002` |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento na porta 4002 |
| `npm run build` | Gera o bundle de produção na pasta `dist/` |
| `npm run preview` | Serve o build gerado simulando o ambiente de produção na porta 4002 |

## Desenvolvimento Local (sem Docker)

```bash
# Instala todas as dependências do projeto
npm install

# Inicia o servidor de desenvolvimento
npm run dev
```

> A página exige um token JWT válido em `localStorage["token"]` (obtido via login no `plus-mfe-auth`)
> e o `plus-ms-categorizacao` rodando em `http://localhost:3002`.

## Testes

```bash
npm test          # roda a suíte uma vez (Vitest)
npm run test:watch
```

## CI/CD (GitHub Actions)

| Workflow | Gatilho | O que faz |
|---|---|---|
| `.github/workflows/ci.yml` | push / pull request na `main` | `npm ci` → **testes unitários** (`npm test`) → **build** (`npm run build`) → publica o `dist/` como artifact |
| `.github/workflows/release.yml` | push de tag `v*.*.*` | testa, builda, alinha a versão com a tag e **publica o pacote no NPM** |

### Pré-requisitos para o release no NPM

1. **Secret `NPM_TOKEN`**: em *Settings → Secrets and variables → Actions* do repositório, crie `NPM_TOKEN` com um **Automation token** gerado em npmjs.com.
2. **Nome do pacote**: se `plus-mfe-categorizacao` já existir no NPM, troque o `name` no `package.json` por um escopado (ex.: `@seu-usuario/plus-mfe-categorizacao`). O `publishConfig.access` já está como `public`.

### Publicando uma versão

```bash
git tag v1.0.0
git push origin v1.0.0   # dispara o workflow Release → npm publish
```

O pacote publicado contém apenas a pasta `dist/` (campo `files`). Como microfrontend (remote de
Module Federation), o `remoteEntry.js` publicado pode ser consumido por CDN, por exemplo:
`https://unpkg.com/plus-mfe-categorizacao@1.0.0/dist/assets/remoteEntry.js` — basta apontar a
variável `MFE_CATEGORIZACAO_URL` do `plus-shell` para essa URL.
