# Etapa de compilación (build stage)
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo archivos de dependencias primero (mejor cache)
COPY package*.json ./

RUN apk update && apk upgrade --no-cache
RUN npm ci

# Copiar el resto del proyecto
COPY . .

# Compilar NestJS a /dist
RUN npm run build

# ----------------------------------------------------
# Etapa final (runtime stage)
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencia y reinstalar solo prod
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar node_modules compilados desde el builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar solo el build final
COPY --from=builder /app/dist ./dist

# Crear usuario no root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Ejecutar la app NestJS compilada
CMD ["node", "dist/main.js"]
