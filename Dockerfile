FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY src/ ./src/

# Add labels for Docker MCP Toolkit discoverability
LABEL com.docker.mcp.server="true"
LABEL com.docker.mcp.version="1.0.0"
LABEL com.docker.mcp.description="MCP Tutorial - AI Writing Tools for Authors"
LABEL com.docker.mcp.transport="stdio"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R mcp:nodejs /app

# Switch to non-root user
USER mcp

# Environment variable to specify which MCP server to run
# Options: author, series, book, character, timeline, metadata, trope, plot, relationship, story-analysis, world, writing
ENV MCP_SERVER=author

# Set MCP stdio mode
ENV MCP_STDIO_MODE=true

# Default command - runs the specified MCP server in stdio mode
# Docker MCP Toolkit will override this with the specific server
CMD node src/mcps/${MCP_SERVER}-server/index.js