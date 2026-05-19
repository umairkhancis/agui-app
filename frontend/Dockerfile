# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY src/ ./src/
COPY public/ ./public/
COPY next.config.ts tsconfig.json postcss.config.mjs showcase.json ./

ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build --webpack

# Stage 2: Production runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Set AGENT_URL at runtime to point to your deployed backend:
# docker run -e AGENT_URL=https://your-backend.example.com -p 3000:3000 agui-frontend
CMD ["node", "server.js"]
