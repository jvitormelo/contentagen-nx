FROM oven/bun AS build

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./
# Copy server package files
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/src ./apps/server/src

WORKDIR /app/apps/server

RUN bun install

ENV NODE_ENV=production

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

CMD ["./server"]

EXPOSE 3000
