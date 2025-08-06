FROM oven/bun:latest AS builder
ARG DATABASE_URL
ARG REDIS_URL
ARG RESEND_API_KEY
ARG POLAR_ACCESS_TOKEN
ARG POLAR_SUCCESS_URL
ARG OPENROUTER_API_KEY
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_TRUSTED_ORIGINS

WORKDIR /app

# Copy all package manifests and the lockfile first.
COPY bun.lock ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY tooling/typescript/package.json ./tooling/typescript/
COPY packages/brand/package.json ./packages/brand/
COPY packages/posthog/package.json ./packages/posthog/
COPY packages/environment/package.json ./packages/environment/
COPY packages/tasks/package.json ./packages/tasks/
COPY packages/files/package.json ./packages/files/
COPY packages/api/package.json ./packages/api/
COPY packages/authentication/package.json ./packages/authentication/
COPY packages/database/package.json ./packages/database/
COPY packages/payment/package.json ./packages/payment/
COPY packages/transactional/package.json ./packages/transactional/
COPY packages/prompts/package.json ./packages/prompts/
COPY packages/errors/package.json ./packages/errors/
COPY packages/chroma-db/package.json ./packages/chroma-db/
COPY packages/openrouter/package.json ./packages/openrouter/
COPY packages/posthog/package.json ./packages/posthog/
COPY packages/environment/package.json ./packages/environment/
COPY packages/tasks/package.json ./packages/tasks/
COPY packages/files/package.json ./packages/files/
COPY packages/api/package.json ./packages/api/
COPY packages/authentication/package.json ./packages/authentication/
COPY packages/database/package.json ./packages/database/
COPY packages/payment/package.json ./packages/payment/
COPY packages/transactional/package.json ./packages/transactional/
COPY packages/arcjet/package.json ./packages/arcjet/
COPY packages/prompts ./packages/prompts
COPY packages/errors ./packages/errors
COPY packages/chroma-db ./packages/chroma-db
COPY packages/openrouter ./packages/openrouter

# Install all dependencies (monorepo-aware)
RUN bun install


ENV NODE_ENV=production
RUN bun build \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  ./apps/server/src/index.ts

# ---

# Stage 2: Create a clean, production-only node_modules folder
FROM oven/bun:latest AS deps
WORKDIR /app

# Copy all package manifests and lockfile again
COPY bun.lock ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY tooling/typescript/package.json ./tooling/typescript/
COPY packages/brand/package.json ./packages/brand/
COPY packages/posthog/package.json ./packages/posthog/
COPY packages/environment/package.json ./packages/environment/
COPY packages/tasks/package.json ./packages/tasks/
COPY packages/files/package.json ./packages/files/
COPY packages/api/package.json ./packages/api/
COPY packages/authentication/package.json ./packages/authentication/
COPY packages/database/package.json ./packages/database/
COPY packages/payment/package.json ./packages/payment/
COPY packages/transactional/package.json ./packages/transactional/
COPY packages/prompts/package.json ./packages/prompts/
COPY packages/errors/package.json ./packages/errors/
COPY packages/chroma-db/package.json ./packages/chroma-db/
COPY packages/openrouter/package.json ./packages/openrouter/
COPY packages/posthog/package.json ./packages/posthog/
COPY packages/environment/package.json ./packages/environment/
COPY packages/tasks/package.json ./packages/tasks/
COPY packages/files/package.json ./packages/files/
COPY packages/api/package.json ./packages/api/
COPY packages/authentication/package.json ./packages/authentication/
COPY packages/database/package.json ./packages/database/
COPY packages/payment/package.json ./packages/payment/
COPY packages/transactional/package.json ./packages/transactional/
COPY packages/arcjet/package.json ./packages/arcjet/
COPY packages/prompts ./packages/prompts
COPY packages/errors ./packages/errors
COPY packages/chroma-db ./packages/chroma-db
COPY packages/openrouter ./packages/openrouter

# Install only production dependencies.
RUN bun install 

# ---

# Stage 3: Create the final, small production image
FROM gcr.io/distroless/base
WORKDIR /app

COPY --from=builder /app/server server

ENV NODE_ENV=production


ARG PORT
EXPOSE ${PORT}
CMD ["./server"]
