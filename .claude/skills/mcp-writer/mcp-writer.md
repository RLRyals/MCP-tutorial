---
name: mcp-writer
description: Interact with MCP writing tool servers through code execution for efficient token usage
tags: [mcp, writing, database, code-execution]
version: 1.0.0
---

# MCP Writer Skill

This skill enables Claude to interact with MCP (Model Context Protocol) writing tool servers through **code execution** rather than direct tool calls, following Anthropic's recommended approach for efficient token usage.

## Overview

Instead of connecting MCPs directly in Claude Desktop or Typing Mind config files, this skill allows you to:
- **Programmatically discover** available MCP servers
- **Execute code** to call MCP tools as functions
- **Filter and transform** data before results reach the model
- **Save intermediate results** and develop reusable functions
- **Reduce token usage** by up to 98.7% (150K → 2K tokens)

## Available MCP Servers

### Core Writing MCPs (`src/mcps/`)
- **author-server** - Manage author profiles and metadata
- **series-server** - Organize book series and collections
- **book-server** - Track individual books and volumes
- **character-server** - Character profiles, attributes, knowledge
- **plot-server** - Plot structures and story arcs
- **world-server** - Worldbuilding and setting management
- **timeline-server** - Event timelines and chronology
- **trope-server** - Literary tropes and patterns
- **relationship-server** - Character relationships
- **writing-server** - Writing sessions and productivity
- **metadata-server** - Flexible metadata storage
- **story-analysis-server** - Story analysis tools

### Configuration MCPs (`src/config-mcps/`)
- **series-planning-server** - Series planning tools
- **book-planning-server** - Book structure planning
- **chapter-planning-server** - Chapter organization
- **character-planning-server** - Character development planning
- **scene-server** - Scene management
- **review-server** - Review and feedback tools
- **core-continuity-server** - Continuity tracking
- **reporting-server** - Analytics and reporting

## How to Use This Skill

### Method 1: Direct Code Execution (Recommended)

Write JavaScript code that imports and calls MCP server classes directly:

```javascript
// Import the MCP server
import { SeriesMCPServer } from './src/mcps/series-server/index.js';

// Create an instance
const server = new SeriesMCPServer();

// Get available tools
const tools = server.getTools();
console.log('Available tools:', tools.map(t => t.name));

// Call a tool handler directly
const handler = server.getToolHandler('list_series');
const result = await handler({ limit: 10 });
console.log('Series:', result);

// Clean up
await server.db.close();
```

### Method 2: MCP Client Connection

For more complex scenarios, connect as an MCP client:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Start an MCP server as a subprocess
const transport = new StdioClientTransport({
  command: 'node',
  args: ['src/mcps/series-server/index.js'],
  env: { ...process.env, MCP_STDIO_MODE: 'true' }
});

const client = new Client({
  name: 'skill-client',
  version: '1.0.0'
}, { capabilities: {} });

await client.connect(transport);

// List available tools
const { tools } = await client.listTools();
console.log('Tools:', tools);

// Call a tool
const result = await client.callTool({
  name: 'list_series',
  arguments: { limit: 10 }
});

console.log('Result:', result);

// Cleanup
await client.close();
```

### Method 3: Helper Script (Simplified)

Use the provided helper script for common operations:

```javascript
import { MCPHelper } from './.claude/skills/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();

// Discover all available MCP servers
const servers = await helper.discoverServers();
console.log('Available servers:', servers);

// Connect to a specific server
await helper.connectToServer('series-server');

// Call a tool
const series = await helper.callTool('series-server', 'list_series', { limit: 10 });
console.log('Series:', series);

// Batch operations
const results = await helper.batchCall('series-server', [
  { tool: 'list_series', args: {} },
  { tool: 'get_series', args: { series_id: 1 } }
]);

// Cleanup
await helper.close();
```

## Usage Examples

### Example 1: List All Series

```javascript
import { SeriesMCPServer } from './src/mcps/series-server/index.js';

const server = new SeriesMCPServer();
const handler = server.getToolHandler('list_series');
const series = await handler({});

console.log(`Found ${series.length} series:`);
series.forEach(s => {
  console.log(`- ${s.title} (ID: ${s.series_id})`);
});

await server.db.close();
```

### Example 2: Create a New Character

```javascript
import { CharacterMCPServer } from './src/mcps/character-server/index.js';

const server = new CharacterMCPServer();
const handler = server.getToolHandler('create_character');

const newCharacter = await handler({
  series_id: 1,
  name: 'Elena Nightshade',
  role: 'protagonist',
  description: 'A skilled mage with a mysterious past'
});

console.log('Created character:', newCharacter);
await server.db.close();
```

### Example 3: Multi-Server Workflow

```javascript
import { SeriesMCPServer } from './src/mcps/series-server/index.js';
import { CharacterMCPServer } from './src/mcps/character-server/index.js';
import { PlotMCPServer } from './src/mcps/plot-server/index.js';

// Initialize servers
const seriesServer = new SeriesMCPServer();
const charServer = new CharacterMCPServer();
const plotServer = new PlotMCPServer();

// Get series
const series = await seriesServer.getToolHandler('get_series')({ series_id: 1 });
console.log('Working with series:', series.title);

// Get characters in series
const characters = await charServer.getToolHandler('list_characters')({ series_id: 1 });
console.log(`Found ${characters.length} characters`);

// Get plot arcs
const plots = await plotServer.getToolHandler('list_plot_arcs')({ series_id: 1 });
console.log(`Found ${plots.length} plot arcs`);

// Cleanup
await Promise.all([
  seriesServer.db.close(),
  charServer.db.close(),
  plotServer.db.close()
]);
```

## Best Practices

1. **Always close database connections** when done: `await server.db.close()`
2. **Use try/catch blocks** for error handling
3. **Filter data in code** before returning to reduce token usage
4. **Save intermediate results** to files for reuse
5. **Batch operations** when possible to reduce overhead
6. **Use the helper script** for common operations

## Environment Setup

Ensure the database is running and `.env` file is configured:

```bash
# Start database
./scripts/start-database.ps1

# Verify connection
node -e "import('./src/shared/database.js').then(({DatabaseManager}) => { const db = new DatabaseManager(); db.healthCheck().then(console.log).finally(() => db.close()); });"
```

## Benefits Over Traditional MCP Configuration

| Traditional MCP | Code Execution with Skill |
|----------------|---------------------------|
| High token usage (150K+) | Low token usage (2K) |
| All tools loaded | Load only needed tools |
| No data filtering | Filter before results |
| No intermediate saves | Save to files |
| Config file required | No config needed |
| Limited control | Full programmatic control |

## When to Use This Skill

✅ **Use this skill when:**
- Working with multiple MCP servers simultaneously
- Need to filter or transform MCP results
- Want to reduce token usage significantly
- Building complex workflows across servers
- Need to save intermediate results
- Want programmatic control over MCP interactions

❌ **Use traditional MCP config when:**
- Only need 1-2 simple tools occasionally
- Don't need data transformation
- Prefer GUI-based tool selection
- Token usage is not a concern

## References

- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Claude Skills Documentation](https://docs.claude.com/skills)
