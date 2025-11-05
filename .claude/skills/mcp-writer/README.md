# MCP Writer Skill

A Claude Code skill for interacting with MCP (Model Context Protocol) servers through **code execution** instead of traditional configuration files.

## What This Skill Does

This skill enables you to:

✅ **Programmatically connect** to MCP servers without editing config files
✅ **Reduce token usage** by up to 98.7% compared to traditional MCP tool calls
✅ **Filter and transform data** before it reaches the model
✅ **Execute complex workflows** across multiple MCP servers
✅ **Save intermediate results** for reuse
✅ **Discover available tools** at runtime

## Why Use This Approach?

| Traditional MCP Config | Code Execution with Skills |
|------------------------|----------------------------|
| High token usage | 98.7% less tokens |
| All tools loaded | Load only what you need |
| No data filtering | Filter in code first |
| Config file required | Zero configuration |
| Limited workflows | Full programmatic control |

## Installation

The skill is already installed in this project at:
```
.claude/skills/mcp-writer/
```

## Quick Start

### Test the Skill

```bash
# Test server discovery
node .claude/skills/mcp-writer/test-discovery.js

# Run example demonstrations
node .claude/skills/mcp-writer/examples.js
```

### Use in Claude Code

When working with Claude Code, you can use this skill to interact with your MCP servers:

```javascript
import MCPHelper from './.claude/skills/mcp-writer/mcp-helper.js';

// Discover what's available
const helper = new MCPHelper();
const servers = await helper.discoverServers();
console.log('Available:', servers.map(s => s.name));

// Call a tool
const series = await helper.callTool('series-server', 'list_series', {});
console.log('Series:', series);

await helper.close();
```

## Available MCP Servers

### 🎯 Recommended Servers (For Active Use)

**Use these for your writing workflows:**

✅ **Author Management** (`src/mcps/`):
- **author-server** - Author profiles and management

✅ **Writing Phase Servers** (`src/config-mcps/`):
- **series-planning-server** - Series planning and structure
- **book-planning-server** - Book structure planning
- **chapter-planning-server** - Chapter organization
- **charater-planning-server** - Character development planning
- **scene-server** - Scene management across writing phases
- **review-server** - Review and feedback workflows
- **core-continuity-server** - Continuity tracking throughout writing
- **reporting-server** - Analytics and reporting on progress

### 📚 Reference Implementation (Database-Organized)

Located in `src/mcps/` - These are organized by **database structure**:

⚠️ **Note:** These servers (except author-server) are reference implementations. The **config-mcps reorganize these tools by writing phases** instead of database structure. Using both would cause duplication.

- series-server, book-server, character-server (reference only)
- plot-server, world-server, timeline-server (reference only)
- trope-server, relationship-server, writing-server (reference only)
- metadata-server, story-analysis-server (reference only)

### 💡 Architecture Explained

- **Database-organized** (`src/mcps/*`): Tools grouped by data tables (series, books, characters, etc.)
- **Writing-phase organized** (`src/config-mcps/*`): Same tools regrouped by workflow phases (planning, drafting, reviewing, etc.)

**Why two organizations?**
- Some users prefer database structure for technical work
- Most writers prefer workflow phases that match their creative process
- The config-mcps provide a writer-friendly interface to the same underlying functionality

## Usage Examples

### Example 1: List All Series

```javascript
import { listAllSeries } from './.claude/skills/mcp-writer/mcp-helper.js';

const series = await listAllSeries();
console.log(`Found ${series.length} series`);
```

### Example 2: Get Complete Series Information

```javascript
import { getSeriesFullDetails } from './.claude/skills/mcp-writer/mcp-helper.js';

const details = await getSeriesFullDetails(1);
console.log('Series:', details.series.title);
console.log('Characters:', details.characters.length);
console.log('Books:', details.books.length);
```

### Example 3: Multi-Server Workflow

```javascript
import MCPHelper from './.claude/skills/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();

const workflow = {
  steps: [
    {
      server: 'series-server',
      tool: 'get_series',
      args: { series_id: 1 },
      save: 'series'
    },
    {
      server: 'character-server',
      tool: 'list_characters',
      args: { series_id: 1 },
      save: 'characters'
    }
  ]
};

const result = await helper.executeWorkflow(workflow);
console.log('Workflow results:', result.context);

await helper.close();
```

### Example 4: Batch Operations

```javascript
import MCPHelper from './.claude/skills/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();

const results = await helper.batchCall('series-server', [
  { tool: 'list_series', args: {} },
  { tool: 'get_series', args: { series_id: 1 } },
  { tool: 'get_series', args: { series_id: 2 } }
]);

console.log('Batch results:', results);

await helper.close();
```

## Files in This Skill

- **mcp-writer.md** - Main skill definition with full documentation
- **mcp-helper.js** - JavaScript helper library for MCP interactions
- **examples.js** - Comprehensive usage examples
- **test-discovery.js** - Test suite for server discovery
- **README.md** - This file

## Benefits

### For Users
- No need to edit `claude_desktop_config.json`
- Works with any Claude client (Desktop, Code, API)
- Portable across projects

### For Developers
- Full programmatic control over MCP interactions
- Ability to filter and transform data
- Support for complex multi-server workflows
- Intermediate result caching

### For AI Models
- Dramatic token usage reduction (98.7% savings)
- Only load tools when needed
- Pre-filtered, relevant data only

## Requirements

- Node.js 18+ (ESM support)
- PostgreSQL database (for data operations)
- Docker (for database setup)
- The MCP tutorial project dependencies

## Setup Database (Optional)

If you want to test with actual data:

```bash
# Copy environment template
cp template.env .env

# Edit .env with your credentials

# Start database
./scripts/start-database.ps1

# Run migrations
node src/shared/run-migration.js 001_create_core_schema.sql
```

## Testing Without Database

The skill can discover and list available tools without a database connection:

```bash
node .claude/skills/mcp-writer/test-discovery.js
```

## Learn More

- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Claude Skills Guide](https://docs.claude.com/skills)

## Support

For issues or questions:
1. Check the examples in `examples.js`
2. Review the main documentation in `mcp-writer.md`
3. Open an issue in the repository

## License

MIT License - Same as the parent MCP Tutorial project
