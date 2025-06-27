# apps/server/Dockerfile
FROM oven/bun:latest AS build
ARG DATABASE_URL
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

# Bun build command (minify flags removed as per previous suggestion)
RUN bun build \
  --compile \
  --target bun \
  --outfile server \
  ./apps/server/src/index.ts

# --- Stage 2: Create the final production image
# Changed the base image from gcr.io/distroless/base to oven/bun:latest
FROM oven/bun:latest AS runner 

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

ARG PORT
EXPOSE ${PORT}

# The compiled Bun binary is directly executable
CMD ["./server"]
