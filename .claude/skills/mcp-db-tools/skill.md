---
name: mcp-db-tools
description: Direct database access tools for MCP writing system using executable scripts
tags: [database, postgres, mcp, writing, authors, books]
version: 1.0.0
---

# MCP Database Tools Skill

This skill provides direct access to the MCP writing system database through executable Node.js scripts. Instead of connecting to MCP servers as separate processes, Claude can execute scripts that directly query the Postgres database.

## Why This Approach?

Following Anthropic's code execution pattern for MCP:

✅ **No context bloat** - Only load what you need
✅ **Data filtering** - Process results in code before showing user
✅ **Token efficient** - 98.7% reduction vs loading all tool definitions
✅ **Composable** - Chain multiple operations in one script
✅ **Simple** - Direct database access, no protocol overhead

## Prerequisites

- Postgres Docker container running (see project README)
- Database initialized with schema
- `.env` file configured at project root

## Available Scripts

All scripts are in `.claude/skills/mcp-db-tools/scripts/`

### Setup

First time only, install dependencies:

```bash
cd .claude/skills/mcp-db-tools/scripts
npm install
```

### Test Connection

```bash
node .claude/skills/mcp-db-tools/scripts/db-connection.js
```

### List Authors

**Simple format (default):**
```bash
node .claude/skills/mcp-db-tools/scripts/list-authors.js
```

**Table format:**
```bash
node .claude/skills/mcp-db-tools/scripts/list-authors.js --table
```

**JSON format:**
```bash
node .claude/skills/mcp-db-tools/scripts/list-authors.js --json
```

**Limit results:**
```bash
node .claude/skills/mcp-db-tools/scripts/list-authors.js --limit 5
```

## How to Use This Skill

### Pattern 1: Execute Existing Scripts

When user asks: "List all authors"

You respond:
```bash
node .claude/skills/mcp-db-tools/scripts/list-authors.js --simple
```

### Pattern 2: Write Custom Queries

When user asks: "Show me authors who wrote fantasy books"

You can:
1. Import the db-connection module
2. Write a custom script with specific SQL
3. Execute it
4. Show filtered results

Example:
```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

const sql = `
    SELECT DISTINCT a.name, a.author_id
    FROM authors a
    JOIN series s ON a.author_id = s.author_id
    WHERE s.genre ILIKE '%fantasy%'
`;

const authors = await query(sql);
console.log(`Found ${authors.length} fantasy authors:`);
authors.forEach(a => console.log(`- ${a.name}`));
```

### Pattern 3: Batch Operations

For bulk worldbuilding imports:

```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

// User provides array of kingdoms
const kingdoms = [
    { name: 'Eldoria', culture: 'Warrior', population: 2000000 },
    { name: 'Arcanum', culture: 'Mage', population: 500000 }
    // ... more
];

// Insert all in one transaction
for (const kingdom of kingdoms) {
    await query(
        'INSERT INTO locations (series_id, name, culture, population) VALUES ($1, $2, $3, $4)',
        [1, kingdom.name, kingdom.culture, kingdom.population]
    );
}

console.log(`Created ${kingdoms.length} kingdoms`);
```

## Database Schema Reference

### Authors Table
- `author_id` (serial primary key)
- `name` (text, required)
- `pseudonym` (text, optional)
- `bio` (text, optional)
- `website` (text, optional)
- `created_at` (timestamp)

### Series Table
- `series_id` (serial primary key)
- `author_id` (integer, foreign key)
- `title` (text, required)
- `genre` (text, optional)
- `status` (text, optional)
- `description` (text, optional)

More tables: books, characters, plot_arcs, locations, timelines, etc.

## Best Practices

1. **Filter in code, not in model context**
   - Query database
   - Process/filter results in JavaScript
   - Return only relevant summary to user

2. **Use prepared statements**
   - Always use `$1, $2` placeholders
   - Pass parameters as array
   - Prevents SQL injection

3. **Handle errors gracefully**
   - Wrap queries in try/catch
   - Return meaningful error messages
   - Don't expose database internals to user

4. **Close connections**
   - Connection pool handles this automatically
   - Each script creates and closes its own pool

5. **Format output appropriately**
   - JSON for data exchange
   - Table for human-readable
   - Simple for lists

## Example: Complete Workflow

**User request:**
"Show me all fantasy authors and their series, but only if they have more than 2 books in the series"

**Claude response:**

```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

const sql = `
    SELECT
        a.name AS author_name,
        s.title AS series_title,
        COUNT(b.book_id) AS book_count
    FROM authors a
    JOIN series s ON a.author_id = s.author_id
    JOIN books b ON s.series_id = b.series_id
    WHERE s.genre ILIKE '%fantasy%'
    GROUP BY a.author_id, a.name, s.series_id, s.title
    HAVING COUNT(b.book_id) > 2
    ORDER BY book_count DESC
`;

const results = await query(sql);

console.log(`Found ${results.length} fantasy series with 3+ books:\n`);

for (const row of results) {
    console.log(`📚 ${row.author_name}: ${row.series_title} (${row.book_count} books)`);
}
```

Claude executes this script, processes the results, and shows:
```
Found 3 fantasy series with 3+ books:

📚 Brandon Sanderson: The Stormlight Archive (4 books)
📚 Patrick Rothfuss: The Kingkiller Chronicle (3 books)
📚 N.K. Jemisin: The Broken Earth (3 books)
```

**Tokens used:** ~2,000 instead of 150,000 ✅

## Common Tasks

### Create an Author
```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

const result = await query(
    'INSERT INTO authors (name, pseudonym, bio) VALUES ($1, $2, $3) RETURNING *',
    ['Jane Smith', 'J.S. Author', 'Award-winning fantasy writer']
);

console.log('Created author:', result[0]);
```

### Update a Series
```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

await query(
    'UPDATE series SET status = $1 WHERE series_id = $2',
    ['completed', 1]
);

console.log('Series status updated');
```

### Get Series with Characters
```javascript
import { query } from '.claude/skills/mcp-db-tools/scripts/db-connection.js';

const series = await query('SELECT * FROM series WHERE series_id = $1', [1]);
const characters = await query('SELECT * FROM characters WHERE series_id = $1', [1]);

console.log(`Series: ${series[0].title}`);
console.log(`Characters: ${characters.length}`);
characters.forEach(c => console.log(`  - ${c.name} (${c.role})`));
```

## Extending This Skill

Add more scripts for common operations:

- `create-author.js` - Create new author
- `list-series.js` - List series with filters
- `worldbuilding-import.js` - Batch import kingdoms, locations, etc.
- `character-roster.js` - Import multiple characters
- `export-data.js` - Export series data to JSON

Each script follows the same pattern:
1. Import db-connection
2. Define function with parameters
3. Execute SQL
4. Format output
5. Handle errors
6. Export for reuse

## Connection Configuration

Database connection is configured via `.env` at project root:

```
DATABASE_URL=postgresql://mcp_user:your_secure_password@localhost:5432/mcp_series
```

The scripts automatically load this configuration.

## Troubleshooting

**"Cannot find module 'pg'"**
- Run: `cd .claude/skills/mcp-db-tools/scripts && npm install`

**"Connection refused"**
- Start database: `./scripts/start-database.ps1`
- Check Docker is running

**"relation does not exist"**
- Run migrations: `node src/shared/run-migration.js 001_create_core_schema.sql`

**"No results"**
- Database might be empty
- Add sample data first

## Summary

This skill provides lightweight, efficient database access for the MCP writing system:

- ✅ Execute scripts directly via `node`
- ✅ Filter data in code before showing user
- ✅ Token efficient (98.7% savings)
- ✅ Composable operations
- ✅ No MCP protocol overhead
- ✅ Perfect for local Docker database
- ✅ Easy to extend with new scripts

Start with `list-authors.js` and build from there!
