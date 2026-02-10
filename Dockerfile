# Multi-stage Dockerfile for TypeRacer Pro
# Use node:22-alpine as base image

# Stage 1: Build dependencies
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies for backend
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production && npm cache clean --force

# Install dependencies for frontend
COPY client/package*.json ./client/
RUN cd client && npm ci && npm cache clean --force

# Stage 2: Backend build
FROM base AS server
WORKDIR /app

# Copy backend source code
COPY server/ ./server/

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start server
CMD ["node", "server/server.js"]

# Stage 3: Frontend build
FROM base AS client-build
WORKDIR /app

# Copy frontend source code
COPY client/ ./client/

# Build frontend
RUN cd client && npm run build

# Stage 4: Frontend production
FROM nginx:alpine AS client

# Copy built frontend
COPY --from=client-build /app/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Change ownership of nginx directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create nginx PID directory
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
