# MCP Tutorial Distribution Package

## What's Included

- mcp-tutorial-image.tar - Docker image with all MCP servers (~250MB)
- docker-compose.mcp.yml - Service configuration
- mcp-config.json - MCP Connector config (for Typing Mind users)
- .env.example - Environment template
- student-install.ps1 - Windows installer
- student-install.sh - Mac/Linux installer

## Quick Start

### Windows (PowerShell)
```powershell
.\student-install.ps1
```

### Mac/Linux (Bash)
```bash
chmod +x student-install.sh
./student-install.sh
```

## Manual Installation

1. Load the image:
   ```
   docker load -i mcp-tutorial-image.tar
   ```

2. Copy .env.example to .env:
   ```
   cp .env.example .env
   ```

3. Start services:
   ```
   docker compose -f docker-compose.mcp.yml up -d
   ```

4. Configure Claude Desktop - see full documentation

## Requirements

- Docker Desktop 4.42+
- Claude Desktop (or Typing Mind)

## Support

See the complete setup guide in the full documentation or contact your instructor.
