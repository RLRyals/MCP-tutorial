# MCP Writer Skill - Quick Start Guide

## TL;DR

```bash
# Install globally
node .claude/skills/mcp-writer/install-global.js

# Restart Claude Desktop

# Use it
# In Claude Desktop, just say:
"Use the mcp-writer skill to help me set up worldbuilding"
```

## What Is This?

A Claude Code **skill** that lets you interact with MCP servers through code execution instead of configuration files.

**Perfect for:** Batch importing worldbuilding data during series planning.

## Installation

### Automatic (Recommended)

```bash
cd /path/to/MCP-tutorial
node .claude/skills/mcp-writer/install-global.js
```

This installs the skill globally so Claude Desktop can use it from anywhere.

### Manual

See [INSTALL_GLOBAL.md](INSTALL_GLOBAL.md) for detailed instructions.

## Usage

### In Claude Desktop

Just ask Claude to use the skill:

> "Use the mcp-writer skill to help me plan my fantasy series. I need to add 5 kingdoms, a magic system with 7 schools, 3 religions, and 20 major locations."

Claude will:
1. Recognize this matches the skill
2. Load the skill
3. Write code to batch import everything
4. Show you a summary

### What You Can Do

✅ **Batch import worldbuilding:**
- Kingdoms, nations, territories
- Magic systems and schools
- Religions and belief systems
- Major locations and landmarks
- Historical timelines

✅ **Complex workflows:**
- Create series → Create books → Create characters
- Link relationships across entities
- Coordinate multiple MCP servers

✅ **Token-efficient operations:**
- Import 100 items as easily as 1
- Filter results before showing them
- Programmatic data transformation

## Example

**You say:**
> "I'm planning 'The Shadow Realms' series. Help me import this worldbuilding:
> - Kingdom of Eldoria (warrior culture, 2M population)
> - Mage Republic of Arcanum (island nation, ruled by archmages)
> - Shadowlands (tribal, mysterious shadow-walkers)
> - Magic: 7 schools (Lumomancy, Umbramancy, Pyromancy, etc.)
> - 3 religions competing for influence"

**Claude does:**
```javascript
// Behind the scenes
import MCPHelper from 'skill/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();

// Create series
const series = await helper.callTool('series-planning-server',
  'create_series_plan', {
    title: 'The Shadow Realms'
  }
);

// Batch import kingdoms
for (const kingdom of kingdoms) {
  await helper.callTool('world-planning-server',
    'create_location', {
      series_id: series.series_id,
      name: kingdom.name,
      culture: kingdom.culture,
      population: kingdom.population
    }
  );
}

// Import magic system
await helper.callTool('world-planning-server',
  'create_magic_system', {
    series_id: series.series_id,
    schools: magicSchools
  }
);

// Import religions
// ...

await helper.close();
```

**You get:**
```
✅ Successfully created worldbuilding:

Series: The Shadow Realms (ID: 1)
- 3 Kingdoms created
- Magic system: 7 schools
- 3 Religions established

All data validated and in database.
Ready for character development!
```

## Why Use This?

| Traditional MCP | This Skill |
|----------------|------------|
| 50+ separate tool calls | 1 workflow |
| 150,000 tokens | 2,000 tokens |
| Manual error handling | Automatic validation |
| Many back-and-forth prompts | One operation |

## Key Features

- 🔍 **Auto-discovered** - No configuration needed
- ⚡ **98.7% token savings** - Dramatic efficiency
- 🔄 **Batch operations** - Import many at once
- ✅ **Data validation** - Catches errors early
- 🔗 **Multi-server** - Coordinates complex workflows
- 📊 **Progress reporting** - See what's happening

## Files

- `mcp-writer.md` - Skill definition (Claude reads this)
- `mcp-helper.js` - JavaScript library
- `worldbuilding-workflow.js` - Complete example
- `HOW_TO_USE.md` - Detailed usage guide
- `INSTALL_GLOBAL.md` - Installation instructions
- `README.md` - Full documentation

## Troubleshooting

### "Skill not found"
1. Restart Claude Desktop
2. Verify installed to correct location
3. Check file permissions

### "No servers found"
1. Check you're on correct git branch
2. Verify `src/mcps/` exists in project
3. Update paths in `mcp-helper.js` to absolute

### "Path errors"
1. Edit global `mcp-helper.js`
2. Set absolute paths to your MCP-tutorial directory
3. Use forward slashes `/` even on Windows

## Learn More

- **How it works:** [HOW_TO_USE.md](HOW_TO_USE.md)
- **Install guide:** [INSTALL_GLOBAL.md](INSTALL_GLOBAL.md)
- **Full docs:** [README.md](README.md)
- **Complete example:** [worldbuilding-workflow.js](worldbuilding-workflow.js)

## Support

Questions? Check the documentation files above or open an issue in the repository.

Happy worldbuilding! 🌍✨
