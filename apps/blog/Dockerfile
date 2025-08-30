# apps/blog/Dockerfile
FROM oven/bun:latest AS build

ARG ARCJET_KEY
ARG CONTENTAGEN_API_KEY
ARG CONTENTAGEN_AGENT_ID

WORKDIR /app

# Copy dependency files first for better caching
COPY bun.lock package.json ./
COPY apps/blog/package.json ./apps/blog/
COPY packages/ui/package.json ./packages/ui/
COPY packages/brand/package.json ./packages/brand/
COPY packages/posthog/package.json ./packages/posthog/
COPY packages/environment/package.json ./packages/environment/
COPY packages/errors/package.json ./packages/errors/
COPY packages/database/package.json ./packages/database/
COPY tooling/typescript/package.json ./tooling/typescript/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV ARCJET_KEY=$ARCJET_KEY
ENV CONTENTAGEN_API_KEY=$CONTENTAGEN_API_KEY
ENV CONTENTAGEN_AGENT_ID=$CONTENTAGEN_AGENT_ID

# Build the blog
RUN bun run --filter=blog build

# Production stage
FROM nginx:alpine AS runtime

# Copy built files
COPY --from=build /app/apps/blog/dist /usr/share/nginx/html

# Expose port 80
ARG PORT=4322
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

