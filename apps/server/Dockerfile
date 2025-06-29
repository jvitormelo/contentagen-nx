FROM oven/bun:latest AS build
ARG DATABASE_URL
ARG REDIS_URL
ARG RESEND_API_KEY
ARG POLAR_ACCESS_TOKEN
ARG POLAR_SUCCESS_URL
ARG OPENROUTER_API_KEY
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_TRUSTED_ORIGINS

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./

# Copy server package files
COPY /apps/server/package.json ./apps/server/package.json
COPY /tooling/typescript/package.json ./tooling/typescript/package.json
COPY /packages/brand/package.json ./packages/brand/package.json
# Install all dependencies (monorepo-aware)
RUN bun install


# Copy server source code
COPY /apps/server ./apps/server
COPY /tooling/typescript ./tooling/typescript
COPY /packages/brand ./packages/brand
ENV NODE_ENV=production

RUN bun build \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile ./dist/index.js \
  ./apps/server/src/index.ts

# Stage 2: Create a clean, production-only node_modules folder
FROM oven/bun:latest AS deps
WORKDIR /app

# Copy all package manifests and lockfile again
COPY bun.lock ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/eden/package.json ./packages/eden/
COPY packages/ui/package.json ./packages/ui/
COPY packages/brand/package.json ./packages/brand/
COPY tooling/typescript/package.json ./tooling/typescript/

# Install only production dependencies. This creates a lean, clean node_modules folder.
RUN bun install --production

FROM oven/bun:latest AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy the built application from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Also copy the final package.json to the root of the app directory.
COPY --from=deps /app/package.json ./package.json

ENV NODE_ENV=production

ARG PORT
EXPOSE ${PORT}
CMD ["bun", "./dist/index.js"]
