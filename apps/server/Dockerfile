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

FROM oven/bun:latest AS runner

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

ARG PORT
EXPOSE ${PORT}
CMD ["bun", "./dist/index.js"]
