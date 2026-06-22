# =============================================================================
# Ventana-Work Frontend — Dockerfile (Multi-stage)
# =============================================================================
# Utiliza el modo 'standalone' de Next.js para crear una imagen ligera,
# copiando solo los archivos necesarios para producción.
# =============================================================================

# --- Stage 1: Dependencias ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./
# Instalar dependencias exactas
RUN npm ci

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
# Aceptar variables públicas en tiempo de build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Construir la aplicación
RUN npm run build

# --- Stage 3: Runner (Producción) ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar directorio public si se necesita (ej. favicon)
COPY --from=builder /app/public ./public

# Configurar permisos
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar output del build standalone
# NOTA: Asegúrate de tener `output: "standalone"` en next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto
EXPOSE 3000

ENV PORT=3000
# Al usar standalone, server.js se genera automáticamente
CMD ["node", "server.js"]
