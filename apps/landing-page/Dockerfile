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
COPY /apps/landing-page ./apps/landing-page
COPY /packages/eden ./packages/eden
COPY /packages/ui ./packages/ui
COPY /packages/brand ./packages/brand
COPY /tooling/typescript ./tooling/typescript


ENV NODE_ENV=production

WORKDIR /app/apps/landing-page
RUN bunx --bun astro build

FROM node:lts-alpine AS runner

WORKDIR /app
COPY --from=build /app/apps/landing-page/dist ./dist

ENV NODE_ENV=production

ARG PORT

ENV PORT=${PORT}
ENV HOST=0.0.0.0
CMD ["node", "./dist/server/entry.mjs"]

EXPOSE ${PORT}
