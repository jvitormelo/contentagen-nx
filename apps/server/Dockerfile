FROM oven/bun:latest AS build

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./

# Copy server package files
COPY apps/server/package.json ./apps/server/package.json

# Install all dependencies (monorepo-aware)
RUN bun install


# Copy server source code
COPY apps/server/src ./apps/server/src

WORKDIR /app/apps/server


ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_TRUSTED_ORIGINS

# Build the server binary
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/apps/server/server server

ENV NODE_ENV=production

ARG PORT=9876
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["./server"]
