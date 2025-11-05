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

## MCP Server Architecture

This project has two types of MCP servers:

### 🔷 Database-Organized MCPs (`src/mcps/`)
These servers are organized by **database structure** (series, books, characters, plots, etc.).

⚠️ **Note:** Only **author-server** from this directory is actively used. The other servers here serve as reference implementations. Using them alongside config-mcps would cause duplication.

**Available (Reference Only - Except Author):**
- **author-server** ✅ **ACTIVELY USED** - Manage author profiles and metadata
- series-server, book-server, character-server, plot-server (reference only)
- world-server, timeline-server, trope-server, relationship-server (reference only)
- writing-server, metadata-server, story-analysis-server (reference only)

### 🔶 Writing Phase MCPs (`src/config-mcps/`)
These servers **reorganize the database tools by writing phases** and workflow. These are the primary servers to use for writing workflows.

✅ **ACTIVELY USED - These are the main servers for your writing workflow:**
- **series-planning-server** - Series planning and structure
- **book-planning-server** - Book structure and planning
- **chapter-planning-server** - Chapter organization and flow
- **character-planning-server** - Character development through writing phases
- **scene-server** - Scene management across the writing process
- **review-server** - Review and feedback workflows
- **core-continuity-server** - Continuity tracking throughout writing
- **reporting-server** - Analytics and reporting on writing progress

### 💡 Which Servers to Use?

**For actual writing workflows, use:**
- ✅ `author-server` (from `src/mcps/`)
- ✅ All 8 servers in `src/config-mcps/` (organized by writing phases)

**Avoid using both:**
- ❌ Don't mix `src/mcps/*` and `src/config-mcps/*` (except author) - causes duplication
- The config-mcps already include the functionality from mcps, just reorganized by workflow

## How to Use This Skill

### Method 1: Direct Code Execution (Recommended)

Write JavaScript code that imports and calls MCP server classes directly:

```javascript
// Import a writing phase MCP server
import { SeriesPlanningServer } from './src/config-mcps/series-planning-server/index.js';

// Create an instance
const server = new SeriesPlanningServer();

// Get available tools
const tools = server.getTools();
console.log('Available tools:', tools.map(t => t.name));

// Call a tool handler directly
const handler = server.getToolHandler('plan_series_structure');
const result = await handler({ title: 'My New Series', genre: 'Fantasy' });
console.log('Series plan:', result);

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

// Connect to a writing phase server
await helper.connectToServer('series-planning-server');

// Call a tool
const seriesPlans = await helper.callTool('series-planning-server', 'list_series_plans', {});
console.log('Series plans:', seriesPlans);

// Batch operations with author-server
const results = await helper.batchCall('author-server', [
  { tool: 'list_authors', args: {} },
  { tool: 'get_author', args: { author_id: 1 } }
]);

// Cleanup
await helper.close();
```

## Usage Examples

### Example 1: Manage Authors

```javascript
import { AuthorMCPServer } from './src/mcps/author-server/index.js';

const server = new AuthorMCPServer();
const handler = server.getToolHandler('list_authors');
const authors = await handler({});

console.log(`Found ${authors.length} authors:`);
authors.forEach(a => {
  console.log(`- ${a.name} (ID: ${a.author_id})`);
});

await server.db.close();
```

### Example 2: Plan a New Series

```javascript
import { SeriesPlanningServer } from './src/config-mcps/series-planning-server/index.js';

const server = new SeriesPlanningServer();
const handler = server.getToolHandler('create_series_plan');

const seriesPlan = await handler({
  title: 'The Shadow Chronicles',
  genre: 'Fantasy',
  planned_books: 3,
  target_audience: 'Young Adult'
});

console.log('Created series plan:', seriesPlan);
await server.db.close();
```

### Example 3: Multi-Phase Writing Workflow

```javascript
import { SeriesPlanningServer } from './src/config-mcps/series-planning-server/index.js';
import { CharacterPlanningServer } from './src/config-mcps/character-planning-server/index.js';
import { BookPlanningServer } from './src/config-mcps/book-planning-server/index.js';

// Initialize writing phase servers
const seriesServer = new SeriesPlanningServer();
const charServer = new CharacterPlanningServer();
const bookServer = new BookPlanningServer();

// Plan the series
const series = await seriesServer.getToolHandler('get_series_plan')({ series_id: 1 });
console.log('Working on series:', series.title);

// Plan characters for this phase
const charPlans = await charServer.getToolHandler('list_character_plans')({ series_id: 1 });
console.log(`Found ${charPlans.length} character plans`);

// Plan books in the series
const bookPlans = await bookServer.getToolHandler('list_book_plans')({ series_id: 1 });
console.log(`Found ${bookPlans.length} book plans`);

// Cleanup
await Promise.all([
  seriesServer.db.close(),
  charServer.db.close(),
  bookServer.db.close()
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
