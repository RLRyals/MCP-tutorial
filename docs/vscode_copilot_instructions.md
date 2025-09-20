# MCP Server Troubleshooting Instructions for VS Code + GitHub Copilot

## Project Overview
Building AI-assisted novel writing system with MCP (Model Context Protocol) servers that connect to PostgreSQL database. Need to support both Claude Desktop (stdio) and TypingMind (HTTP) integration.

## Current Issues
1. `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'helmet'` - missing dependencies
2. MCP server failing to start due to import errors
3. Base server class not properly handling tool registration
4. Need dual-mode support (stdio for Claude Desktop, HTTP for TypingMind)

## Project Structure
```
C:/github/MCP-tutorial/
├── src/
│   ├── shared/
│   │   ├── base-server.js     # Base MCP server class
│   │   └── database.js        # Database connection manager
│   ├── mcps/
│   │   └── author-server/
│   │       └── index.js       # Author MCP server implementation
│   └── http-server.js         # HTTP server for TypingMind
├── scripts/
│   └── test-db.js            # Database testing script
├── package.json
└── .env
```

## Required Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "dotenv": "^16.0.0",
    "pg": "^8.11.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "concurrently": "^8.2.0"
  }
}
```

## Database Configuration
- PostgreSQL running in Docker container
- Connection: `postgresql://writer:writepass@localhost:5432/writing_db`
- Required table: `authors` with columns: id, name, bio, birth_year, nationality, created_at, updated_at

## MCP Server Requirements

### Base Server Class (`src/shared/base-server.js`)
- Must extend and provide base functionality for all MCP servers
- Handle both stdio (Claude Desktop) and HTTP modes
- Provide tool registration and handler methods
- Include database connection management
- Support graceful shutdown and error handling

### Author Server (`src/mcps/author-server/index.js`)
- Extend BaseMCPServer
- Implement tools: list_authors, get_author, create_author, update_author
- Each tool needs proper input schema and handler method
- Handle PostgreSQL CRUD operations

### Database Manager (`src/shared/database.js`)
- PostgreSQL connection pool management
- Query execution with error handling
- Health check functionality
- Graceful connection cleanup

### HTTP Server (`src/http-server.js`)
- Express.js server for TypingMind integration
- REST API endpoints for all MCP tools
- CORS and security middleware
- Error handling and response formatting

## Expected Behavior
1. **Claude Desktop Mode**: Server runs via stdio transport, communicates through stdin/stdout
2. **TypingMind Mode**: HTTP server provides REST API endpoints
3. **Tool Execution**: All tools should return properly formatted MCP responses
4. **Database Operations**: CRUD operations on authors table with proper error handling

## Common Patterns

### MCP Tool Definition
```javascript
{
  name: 'tool_name',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param_name: { type: 'string', description: 'Parameter description' }
    },
    required: ['param_name']
  }
}
```

### MCP Response Format
```javascript
{
  content: [
    {
      type: 'text',
      text: 'Response text or JSON.stringify(data, null, 2)'
    }
  ]
}
```

### Tool Handler Method
```javascript
async handleToolName(args) {
  try {
    this.validateRequired(args, ['required_field']);
    const result = await this.db.query('SELECT * FROM table WHERE id = $1', [args.id]);
    return this.formatSuccess(result.rows);
  } catch (error) {
    throw new Error(`Failed to execute tool: ${error.message}`);
  }
}
```

## Configuration Files

### Claude Desktop Config (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "author-manager": {
      "command": "node",
      "args": ["C:/github/MCP-tutorial/src/mcps/author-server/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://writer:writepass@localhost:5432/writing_db",
        "NODE_ENV": "production",
        "MCP_SERVER_MODE": "true"
      }
    }
  }
}
```

### Environment Variables (`.env`)
```
DATABASE_URL=postgresql://writer:writepass@localhost:5432/writing_db
NODE_ENV=development
MCP_SERVER_MODE=true
PORT=3001
```

## Testing Commands
```bash
# Install dependencies
npm install

# Test database connection
npm run test:db

# Start MCP server (Claude Desktop)
npm start

# Start HTTP server (TypingMind)
npm run start:http

# Start both modes
npm run start:both
```

## Error Handling Requirements
- All database operations must have try/catch blocks
- MCP tools should return proper error responses
- Server should handle graceful shutdown
- Database connections should be properly closed
- HTTP endpoints should return consistent JSON responses

## Security Requirements
- Use helmet for HTTP server security headers
- CORS configuration for TypingMind integration
- Database connection pooling with proper limits
- Environment variable validation
- SQL injection prevention with parameterized queries

## GitHub Copilot Tasks

Please help with:

1. **Fix Missing Dependencies**: Update package.json and install all required packages
2. **Create Database Manager**: Implement PostgreSQL connection manager with health checks
3. **Fix Base Server Class**: Proper MCP server initialization and tool registration
4. **Fix Author Server**: Implement all CRUD operations with proper MCP response formats
5. **Create HTTP Server**: Express.js server for TypingMind integration
6. **Add Error Handling**: Comprehensive error handling throughout all components
7. **Create Test Scripts**: Database testing and server validation scripts
8. **Add Documentation**: Inline comments and JSDoc for all functions

## Expected File Outputs

Each file should be production-ready with:
- Proper error handling
- Type validation
- Security best practices
- Clear documentation
- Consistent code style
- MCP protocol compliance

## Success Criteria
- [ ] All dependencies installed without errors
- [ ] Database connection established successfully
- [ ] MCP server starts and responds to tool calls
- [ ] HTTP server provides working REST API
- [ ] All CRUD operations work correctly
- [ ] Both Claude Desktop and TypingMind integration functional
- [ ] Proper error handling and logging
- [ ] Clean shutdown without memory leaks

Focus on creating robust, production-ready code that follows MCP protocol specifications and integrates seamlessly with both Claude Desktop and TypingMind platforms.