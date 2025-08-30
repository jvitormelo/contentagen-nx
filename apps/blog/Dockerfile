# apps/blog/Dockerfile
FROM oven/bun:latest AS build

ARG ARCJET_KEY
ARG CONTENTAGEN_API_KEY
ARG CONTENTAGEN_AGENT_ID

WORKDIR /app

# Copy everything needed for the build
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV ARCJET_KEY=$ARCJET_KEY
ENV CONTENTAGEN_API_KEY=$CONTENTAGEN_API_KEY
ENV CONTENTAGEN_AGENT_ID=$CONTENTAGEN_AGENT_ID

# Install dependencies and build
RUN bun install
RUN bun run --filter=blog build

# Production stage
FROM nginx:alpine AS runtime

# Copy built files
COPY --from=build /app/apps/blog/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

