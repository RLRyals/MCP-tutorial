FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy shared code
COPY src/shared ./src/shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (will be set by environment variable)
EXPOSE 3001
EXPOSE 3002
EXPOSE 3003
EXPOSE 3004
EXPOSE 3005

# Health check (using curl, which is more reliable than wget)
# Note: If this server requires authentication, update with auth header
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD sh -c 'curl -f http://127.0.0.1:${MCP_PORT}/health || exit 1'

# Start the application
CMD ["npm", "start"]