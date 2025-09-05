# MCP Configuration Generator

This document explains how to use the configuration generator to create MCP configurations for both Claude Desktop and Typing Mind.

## Overview

The configuration generator creates properly formatted configuration files for:

- **Claude Desktop**: Uses stdio transport for direct integration
- **Typing Mind**: Uses HTTP endpoints for web-based integration

## Quick Start

1. **Setup your environment:**
   ```powershell
   # Copy and customize the environment template
   Copy-Item template.env .env
   # Edit .env with your actual database credentials
   ```

2. **Generate configurations:**
   ```powershell
   # Generate both Claude Desktop and Typing Mind configs
   .\scripts\generate-configs.ps1
   
   # Or use Node.js directly
   node scripts/generate-configs.js
   ```

3. **Use the configurations:**
   - **Claude Desktop**: Copy content from `config/claude-desktop.json` to your Claude Desktop MCP settings
   - **Typing Mind**: Import `config/typing-mind.json` into Typing Mind's MCP configuration

## Configuration Templates

### Claude Desktop Template
Location: `config/claude-desktop.template.json`

This template creates a single composite MCP server entry that includes all available tools. Uses stdio transport for optimal performance with Claude Desktop.

### Typing Mind Template  
Location: `config/typing-mind.template.json`

This template creates individual HTTP endpoints for each MCP server, plus a composite endpoint. Allows you to use individual servers or all together.

## Environment Variables

Configure these in your `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_TUTORIAL_PATH` | current directory | Absolute path to your MCP tutorial project |
| `NODE_ENV` | `development` | Node.js environment |
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `MCP_SERVER_HOST` | `localhost` | HTTP server host for Typing Mind |
| `MCP_SERVER_PORT` | `3500` | HTTP server port for Typing Mind |

## Usage Examples

### Generate Both Configurations
```powershell
# PowerShell
.\scripts\generate-configs.ps1

# Node.js
node scripts/generate-configs.js
```

### Generate Specific Configuration
```powershell
# Claude Desktop only
.\scripts\generate-configs.ps1 -Claude
node scripts/generate-configs.js --claude

# Typing Mind only  
.\scripts\generate-configs.ps1 -TypingMind
node scripts/generate-configs.js --typing-mind
```

### Show Current Settings
```powershell
# PowerShell
.\scripts\generate-configs.ps1 -ShowConfig

# Node.js
node scripts/generate-configs.js --show-config
```

### Help
```powershell
# PowerShell
.\scripts\generate-configs.ps1 -Help

# Node.js
node scripts/generate-configs.js --help
```

## Generated Files

### `config/claude-desktop.json`
Contains the complete MCP server configuration for Claude Desktop:
- Uses stdio transport
- Points to the composite server (`src/stdio-server.js`)
- Includes all environment variables
- Ready to copy into Claude Desktop MCP settings

### `config/typing-mind.json`
Contains HTTP endpoint configurations for Typing Mind:
- Individual server endpoints for granular control
- Composite endpoint for all tools together
- Health check endpoints available
- Ready to import into Typing Mind

## Advanced Usage

### Adding New MCP Servers

When you add new MCP servers in future branches:

1. **Add the server to the mcpServers array** in `scripts/generate-configs.js`:
   ```javascript
   const mcpServers = [
       // ... existing servers ...
       {
           name: 'your-new-server',
           displayName: 'Your New Server',
           description: 'Description of your new server',
           endpoint: '/your-new-server/message'
       }
   ];
   ```

2. **Update the templates** if you need custom configurations

3. **Regenerate configurations**:
   ```powershell
   .\scripts\generate-configs.ps1
   ```

### Custom Configuration Paths

You can specify custom template or output paths by modifying the script paths in `generate-configs.js`.

## Troubleshooting

### Common Issues

**"Template not found" error:**
- Ensure you're running the script from the project root directory
- Check that the template files exist in `config/`

**Invalid JSON error:**  
- Check your environment variables for special characters
- Ensure your `DATABASE_URL` is properly formatted

**Path issues on Windows:**
- Use absolute paths with forward slashes or double backslashes
- The script handles path conversion automatically

**Database connection issues:**
- Ensure PostgreSQL is running: `.\scripts\start-database.ps1`
- Verify your `DATABASE_URL` matches your database configuration

### Testing Configurations

**Claude Desktop:**
1. Start your database: `.\scripts\start-database.ps1`
2. Add the generated config to Claude Desktop
3. Restart Claude Desktop
4. Test with a simple query

**Typing Mind:**
1. Start the HTTP server: `npm run start:http` or `node src/http-server.js`
2. Import the generated config into Typing Mind
3. Test the health endpoints: `http://localhost:3500/health`
4. Test MCP communication through Typing Mind

### Validation

The configuration generator includes basic validation:
- JSON syntax checking
- Template placeholder replacement verification  
- File existence checking

For more detailed validation, you can manually test the configurations with the respective tools.

## Integration with CI/CD

You can integrate the configuration generator into your development workflow:

```powershell
# In your setup script
.\scripts\generate-configs.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Configuration generation failed"
    exit 1
}
```

This ensures configurations are always up-to-date with your current environment and available MCP servers.
