# Dual Transport MCP Setup

This document explains how the MCP servers are configured to work with both Claude Projects (stdio) and web-based tools (HTTP) like Typing Mind.

## Why Separate Transports?

- **Claude Projects**: Expects stdio transport for best compatibility and performance
- **Web Tools**: Need HTTP endpoints for browser-based communication  
- **Health Checks**: HTTP health endpoints can interfere with Claude Projects' stdio expectations
- **Flexibility**: This setup gives you the best of both worlds

## Architecture

### Entry Points

1. **`src/stdio-server.js`** - For Claude Projects
   - Uses `StdioServerTransport`
   - Combines all MCP servers into one composite server
   - No HTTP endpoints to interfere with stdio

2. **`src/http-server.js`** - For Web Tools
   - Uses `SSEServerTransport` for MCP communication
   - Provides health check endpoints
   - Individual server endpoints available
   - Runs on configurable port (default: 3001)

### Individual Servers

Each MCP server in `src/mcps/` can run in either mode:

- **`author-server.js`** - Author management
- **`series-server.js`** - Series management  
- **`book-server.js`** - Book management
- **`timeline-server.js`** - Timeline management
- **`metadata-server.js`** - Metadata management

## Usage

### For Claude Projects

**⚠️ Important: You do NOT manually start MCP servers for Claude Projects!**

Claude Desktop automatically starts and manages the MCP servers based on your configuration. You only need to:

1. **Start the database:** `.\scripts\start-database.ps1`
2. **Configure Claude Desktop** with the server paths
3. **Let Claude Desktop handle the rest**

**Claude Projects Configuration:**
```json
{
  "mcpServers": {
    "series-management": {
      "command": "node",
      "args": ["src/stdio-server.js"],
      "cwd": "/path/to/MCP-tutorial"
    }
  }
}
```

### For Web Tools (Typing Mind, etc.)

```bash
# Composite HTTP server
npm run start:http

# Individual HTTP servers 
npm run start:author:http
npm run start:series:http
npm run start:book:http
npm run start:timeline:http
npm run start:metadata:http
```

**Health Check Endpoints:**
- `http://localhost:3001/health` - Main server health
- `http://localhost:3001/tools` - List all available tools
- `http://localhost:3002/health` - Author server health
- `http://localhost:3003/health` - Series server health
- etc.

**MCP Endpoints:**
- `http://localhost:3001/composite/message` - All servers combined
- `http://localhost:3001/author-manager/message` - Author server
- `http://localhost:3001/series-manager/message` - Series server
- etc.

## Benefits

1. **Claude Projects Compatibility**: Uses stdio transport without HTTP interference
2. **Web Tool Support**: Full HTTP endpoint support with health checks
3. **Individual Server Control**: Run only the servers you need
4. **Port Configuration**: Configurable ports prevent conflicts
5. **Development Flexibility**: Easy to test and debug individual components

## Development

### Adding New MCP Servers

1. Create your server in `src/mcps/your-server.js` extending `BaseMCPServer`
2. Add CLI support at the bottom of your file
3. Export it from `src/mcps/index.js`
4. Add it to both `stdio-server.js` and `http-server.js`
5. Add npm scripts to `package.json`

### Testing

**For Claude Projects:**
- No manual testing needed - Claude Desktop manages the servers
- Just ensure your database is running and configuration is correct
- Check Claude Desktop's MCP settings if there are issues

**For Web Tools:**
```bash
# Test HTTP server
npm run start:http

# Test individual HTTP server
node src/mcps/author-server.js --http --port 3010
```

**Manual stdio testing (development only):**
```bash
# Only use these for development/debugging
node src/mcps/author-server.js --stdio
```

## Troubleshooting

### Claude Projects Issues
- **Do NOT manually start MCP servers** - Claude Desktop handles this
- Ensure your database is running (`.\scripts\start-database.ps1`)
- Verify the cwd path in your Claude Desktop MCP configuration
- Check Claude Desktop's MCP settings/logs for connection issues
- Ensure Node.js is in your system PATH

### Web Tool Issues
- Ensure the HTTP server is running (`npm run start:http`)
- Check health endpoints are accessible
- Verify CORS headers are properly set
- Check that ports aren't conflicting

### Database Connection Issues
- Ensure PostgreSQL is running (`.\scripts\start-database.ps1`)
- Check DATABASE_URL in your `.env` file
- Run migrations: `node src/shared/run-migration.js`
