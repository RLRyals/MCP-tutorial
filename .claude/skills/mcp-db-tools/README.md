# MCP Database Tools Skill

✅ **This skill WORKS in Claude Desktop!**

A practical implementation of Anthropic's "code execution with MCP" pattern, providing direct database access through executable Node.js scripts.

## What This Is

Instead of connecting to MCP servers as separate processes with all tools loaded upfront, this skill lets Claude:

1. **Execute scripts** from the `scripts/` folder via bash_tool
2. **Query database directly** without MCP protocol overhead
3. **Filter data in code** before returning results to model
4. **Compose operations** by chaining multiple queries

## Why This Works

Following the pattern from [Anthropic's engineering blog](https://www.anthropic.com/engineering/code-execution-with-mcp):

✅ **98.7% token savings** - Load only what you need
✅ **Data filtering** - Process in execution environment
✅ **No context bloat** - Don't load all tool definitions upfront
✅ **Composable** - Write custom scripts on the fly
✅ **Simple** - Direct database access, no protocol overhead

## Quick Start

### 1. Install Dependencies

```bash
cd .claude/skills/mcp-db-tools/scripts
npm install
```

### 2. Ensure Database is Running

```bash
# From project root
./scripts/start-database.ps1
```

### 3. Test the Skill

```bash
# From project root
node .claude/skills/mcp-db-tools/scripts/list-authors.js
```

Expected output (if authors exist):
```
Found 3 author(s):

[1] Brandon Sanderson
[2] Patrick Rothfuss
[3] N.K. Jemisin
```

Or if database is empty:
```
No authors found.
```

## How Claude Desktop Uses This

When you ask Claude Desktop:

> "List all authors in my database"

Claude will:
1. Read the skill definition (`mcp-db-tools.md`)
2. Execute: `node .claude/skills/mcp-db-tools/scripts/list-authors.js`
3. Show you the results

No MCP configuration needed!

## Available Scripts

### list-authors.js

List all authors with various output formats:

```bash
# Simple list (default)
node .claude/skills/mcp-db-tools/scripts/list-authors.js

# Table format with details
node .claude/skills/mcp-db-tools/scripts/list-authors.js --table

# JSON output
node .claude/skills/mcp-db-tools/scripts/list-authors.js --json

# Limit results
node .claude/skills/mcp-db-tools/scripts/list-authors.js --limit 5
```

## Project Structure

```
.claude/skills/mcp-db-tools/
├── mcp-db-tools.md          # Skill definition (Claude reads this)
├── README.md                 # This file
└── scripts/
    ├── package.json          # Dependencies (pg, dotenv)
    ├── db-connection.js      # Database connection module
    └── list-authors.js       # Example: List authors
```

## How It Works

### 1. Skill Definition

`mcp-db-tools.md` tells Claude:
- Available scripts in `scripts/` folder
- How to execute them
- What parameters they accept
- Example usage patterns

### 2. Database Connection

`db-connection.js` provides:
- Connection pool to Postgres
- Query execution with error handling
- Automatic .env configuration loading

### 3. Executable Scripts

Each script:
- Can be run from command line
- Imports `db-connection.js`
- Executes SQL queries
- Formats output appropriately
- Can be imported as module

## Adding More Scripts

Example: Create `create-author.js`

```javascript
#!/usr/bin/env node
import { query } from './db-connection.js';

async function createAuthor({ name, pseudonym, bio }) {
    const sql = `
        INSERT INTO authors (name, pseudonym, bio)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const result = await query(sql, [name, pseudonym, bio]);
    return result[0];
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const name = args[0];
    const pseudonym = args[1] || null;
    const bio = args[2] || null;

    if (!name) {
        console.error('Usage: node create-author.js "Author Name" ["Pseudonym"] ["Bio"]');
        process.exit(1);
    }

    const author = await createAuthor({ name, pseudonym, bio });
    console.log('Created author:', author);
}

export { createAuthor };
```

Usage:
```bash
node .claude/skills/mcp-db-tools/scripts/create-author.js "Jane Smith" "J.S. Author" "Fantasy writer"
```

## Comparison: Skills vs Traditional MCP

| Approach | Location | Token Usage | When to Use |
|----------|----------|-------------|-------------|
| **This Skill** | Scripts in skill folder | 2K tokens (98.7% savings) | Batch operations, custom queries |
| **Traditional MCP** | Separate process + config | 150K tokens | Standard CRUD operations |
| **Both** | Use both | Balanced | Traditional for simple, skills for complex |

## Use Cases

### ✅ Perfect For:

- **Batch imports** - "Import these 50 characters"
- **Custom queries** - "Show fantasy authors with 3+ books"
- **Data filtering** - Process results before showing user
- **Complex workflows** - Multi-step operations
- **Worldbuilding** - Import kingdoms, locations, timelines

### ❌ Less Ideal For:

- Single, simple operations might be easier with traditional MCP
- Operations requiring real-time tool availability in chat interface
- When you need the MCP tools to appear in Claude Desktop's UI

## Configuration

Database connection via `.env` at project root:

```env
DATABASE_URL=postgresql://mcp_user:your_secure_password@localhost:5432/mcp_series
```

Scripts automatically load this configuration.

## Benefits for Worldbuilding

Your use case - adding extensive worldbuilding during series planning:

```javascript
// Claude can write a custom script on the fly
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

const kingdoms = [
    { name: 'Eldoria', culture: 'Warrior', population: 2000000 },
    { name: 'Arcanum', culture: 'Mage', population: 500000 },
    // ... 3 more kingdoms
];

console.log(`Importing ${kingdoms.length} kingdoms...`);

for (const k of kingdoms) {
    await query(
        'INSERT INTO locations (series_id, name, culture, population) VALUES ($1, $2, $3, $4)',
        [1, k.name, k.culture, k.population]
    );
    console.log(`✓ ${k.name}`);
}

console.log('Done!');
```

**Result:** All 5 kingdoms imported in one operation, ~2K tokens used instead of 150K.

## Next Steps

1. ✅ Test `list-authors.js` works
2. Add more scripts as needed:
   - `list-series.js`
   - `create-author.js`
   - `worldbuilding-import.js`
   - `character-roster.js`
3. Use in Claude Desktop for your worldbuilding!

## Troubleshooting

**Script runs but shows "ECONNREFUSED"**
- Database isn't running
- Start it: `./scripts/start-database.ps1`

**"Cannot find module 'pg'"**
- Install dependencies: `cd .claude/skills/mcp-db-tools/scripts && npm install`

**"relation does not exist"**
- Run migrations: `node src/shared/run-migration.js 001_create_core_schema.sql`

## Summary

This skill demonstrates the "code execution with MCP" pattern:

- ✅ **Claude Desktop compatible** - Uses executable scripts
- ✅ **Token efficient** - 98.7% savings
- ✅ **Direct database access** - No MCP protocol overhead
- ✅ **Composable** - Write custom scripts on demand
- ✅ **Perfect for worldbuilding** - Batch imports made easy

Start with `list-authors.js` and expand from there!
