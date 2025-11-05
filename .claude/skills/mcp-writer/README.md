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

### Main Writing Tools (12 servers)

Located in `src/mcps/`:

- **author-server** - Author profiles and management
- **book-server** - Book tracking and metadata
- **character-server** - Character profiles and development
- **metadata-server** - Flexible metadata storage
- **plot-server** - Plot arcs and story structure
- **relationship-server** - Character relationships
- **series-server** - Series management
- **story-analysis-server** - Story analysis tools
- **timeline-server** - Timeline and chronology
- **trope-server** - Literary tropes and patterns
- **world-server** - Worldbuilding and settings
- **writing-server** - Writing sessions and productivity

### Configuration Tools (8 servers)

Located in `src/config-mcps/`:

- **book-planning-server** - Book structure planning
- **chapter-planning-server** - Chapter organization
- **charater-planning-server** - Character planning
- **core-continuity-server** - Continuity tracking
- **reporting-server** - Analytics and reports
- **review-server** - Review and feedback
- **scene-server** - Scene management
- **series-planning-server** - Series planning

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
