FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Injeta a URL do MS de categorização em tempo de build
ARG VITE_MS_CATEGORIZACAO_URL=http://localhost:3002
ENV VITE_MS_CATEGORIZACAO_URL=$VITE_MS_CATEGORIZACAO_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY --from=build /app/dist ./dist
EXPOSE 4002
CMD ["vite", "preview", "--port", "4002", "--host"]
