FROM oven/bun:latest AS build
ARG VITE_SERVER_URL

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./

# Copy server package files
COPY /apps/landing-page/package.json ./apps/landing-page/package.json
COPY /packages/eden/package.json ./packages/eden/package.json
COPY /packages/ui/package.json ./packages/ui/package.json
COPY /packages/brand/package.json ./packages/brand/package.json
COPY /tooling/typescript/package.json ./tooling/typescript/package.json
# Install all dependencies (monorepo-aware)
RUN bun install


# Copy server source code
COPY /apps/server ./apps/server
COPY /packages/eden/package.json ./packages/eden
COPY /packages/ui/package.json ./packages/ui
COPY /packages/brand/package.json ./packages/brand
COPY /tooling/typescript/package.json ./tooling/typescript


ENV NODE_ENV=production

RUN bunx --bun astro build

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/landing-page server

ENV NODE_ENV=production

ARG PORT

CMD ["bunx --run",  "astro"]
EXPOSE ${PORT}
