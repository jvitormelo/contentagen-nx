// apps/server/Dockerfile
# Stage 1: Install all dependencies and build the application
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

# Install all dependencies (including devDependencies for build)
RUN bun install

# Copy source code
COPY . .

ENV NODE_ENV=production

# Build the server application into a single file.
RUN bun build ./apps/server/src/index.ts --outfile ./dist/index.js --target bun

# ---

# Stage 2: Create a clean, production-only node_modules folder
FROM oven/bun:latest AS dependencies

WORKDIR /app

# Copy all package manifests and lockfile again
COPY bun.lock ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY tooling/typescript/package.json ./tooling/typescript/
COPY packages/brand/package.json ./packages/brand/

# Install only production dependencies.
RUN bun install --production

# ---

# Stage 3: Create the final, small production image
FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy pruned, production-only node_modules from the 'dependencies' stage.
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the built application from the 'builder' stage
COPY --from=builder /app/dist/index.js ./dist/index.js

# Also copy the final package.json to the root of the app directory.
COPY --from=dependencies /app/package.json ./package.json

# Set and expose the port. Default to 9876 if not provided.
ARG PORT=9876
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start the server using the entrypoint from the build output
CMD ["bun", "./dist/index.js"]
