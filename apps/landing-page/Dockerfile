FROM oven/bun:latest AS builder
WORKDIR /app

# Copy all package manifests and lockfile first for dependency caching
COPY bun.lockb ./
COPY package.json ./
COPY apps/landing-page/package.json ./apps/landing-page/
COPY packages/eden/package.json ./packages/eden/
COPY packages/ui/package.json ./packages/ui/
COPY packages/brand/package.json ./packages/brand/
COPY tooling/typescript/package.json ./tooling/typescript/

# Install all dependencies (including devDependencies needed for build)
RUN bun install

# Copy the rest of the source code
# Make sure you have a .dockerignore file to exclude local node_modules
COPY . .

# Build the landing page
ENV NODE_ENV=production
# Using the build script from the landing-page's package.json
RUN bun run --filter=landing-page build

# Reinstall dependencies, but only for production to prune devDependencies
# This creates a lean node_modules folder for the final image.
RUN bun install --production

# Stage 2: Create the final, lean production image
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the pruned, production-only node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application from the builder stage
COPY --from=builder /app/apps/landing-page/dist ./dist

# Set and expose the port. Default to 4321 if not provided.
ARG PORT
ENV PORT=${PORT:-4321}
EXPOSE ${PORT}

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
