# How to Use the MCP Writer Skill

## Automatic Skill Discovery

**Good news:** You don't need to import anything! Skills are **automatically discovered** by Claude.

### How It Works

1. **Claude scans** `.claude/skills/` directory at startup
2. **Finds skill files** (markdown files with YAML frontmatter)
3. **Reads metadata** from the frontmatter (name, description, tags)
4. **Makes skill available** for use automatically

### Your Skill Location

```
.claude/skills/mcp-writer/
├── mcp-writer.md          ← Skill definition (auto-discovered)
├── mcp-helper.js          ← Helper library
├── examples.js            ← Usage examples
├── test-discovery.js      ← Test suite
└── README.md              ← Documentation
```

## How Claude Decides to Use the Skill

Claude will consider using this skill when:

1. **Task matches description:** "Interact with MCP writing tool servers through code execution"
2. **Tags match context:** `[mcp, writing, database, code-execution]`
3. **User explicitly mentions:** "Use the mcp-writer skill to..."
4. **Task involves:** Database operations, MCP servers, batch operations, or complex workflows

### Explicit Invocation

If Claude doesn't automatically use the skill, you can explicitly invoke it:

```
# In Claude Desktop/Code:
"Use the mcp-writer skill to create a new series in the database"

"Can you use the mcp-writer skill to batch import these characters?"

"Let's use the MCP writer skill to set up this worldbuilding data"
```

## Skill Invocation Flow

```
User Request
    ↓
Claude reads skill description
    ↓
Matches task to skill capabilities
    ↓
Invokes skill (loads mcp-writer.md)
    ↓
Claude writes code using mcp-helper.js
    ↓
Code executes and interacts with MCP servers
    ↓
Results filtered/transformed
    ↓
Returns concise results to user
```

## When to Use This Skill

### ✅ Perfect Use Cases

1. **Series Planning with Worldbuilding** (Your Use Case!)
   - Import lots of world details during planning phase
   - Batch create locations, cultures, magic systems
   - Link world elements to series/books/characters

2. **Bulk Character Creation**
   - Create multiple characters with relationships
   - Import character rosters from notes
   - Set up character arcs across series

3. **Complex Multi-Server Workflows**
   - Create series → Create books → Create characters → Link relationships
   - All in one coordinated workflow

4. **Data Transformation**
   - Import from other formats (JSON, CSV, notes)
   - Filter and validate before database insert
   - Clean up and normalize data

5. **Token-Efficient Operations**
   - When you need to do many database operations
   - Filter large result sets before showing them
   - Loop through data with programmatic control

### ❌ When NOT to Use

- Simple single operations ("create one author")
- Just reading/viewing data with no transformation
- When traditional MCP tool calls are sufficient

## Example Usage in Claude Desktop

### Scenario 1: Simple Query

**User:** "Show me all my series"

**Claude might:**
- Use traditional MCP if configured
- OR use the skill if it needs to filter/transform results

### Scenario 2: Complex Worldbuilding (Your Use Case!)

**User:** "I'm planning a fantasy series called 'The Shadow Realms'. I need to add:
- 5 major kingdoms with their cultures
- A magic system with 7 schools of magic
- 15 key locations
- 3 major religions
- Historical timeline spanning 1000 years

Can you help me set all this up?"

**Claude will:**
1. Recognize this matches the skill's purpose
2. Load the mcp-writer skill
3. Use mcp-helper.js to write code that:
   - Connects to series-planning-server
   - Creates the series plan
   - Batches all worldbuilding data
   - Links everything together
   - Validates data before commit
4. Show you a summary of what was created

### Scenario 3: Batch Import

**User:** "Here's my character roster (paste 20 characters). Import them all with the mcp-writer skill"

**Claude will:**
1. Parse your character data
2. Write code to batch create characters
3. Use error handling to report any issues
4. Give you a summary: "Created 18 characters, 2 had errors..."

## Skill vs Traditional MCP Config

### Traditional MCP (Claude Desktop Config)

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "series-planning": {
      "command": "node",
      "args": ["src/config-mcps/series-planning-server/index.js"]
    }
  }
}
```

**How it works:**
- Tools appear in Claude's tool list
- Claude calls tools one at a time
- High token usage (all tool definitions loaded)
- No filtering or transformation
- Simple operations only

### MCP Writer Skill (Code Execution)

**How it works:**
- Claude writes JavaScript code
- Code imports and calls servers programmatically
- Filters/transforms data before showing you
- Batch operations efficient
- Complex workflows possible
- 98.7% less tokens used

## Practical Example: Your Worldbuilding Scenario

Let's say you're in Claude Desktop and say:

> "I'm starting a new fantasy series. I need to capture a lot of worldbuilding during the series planning phase - about 20 locations, 7 magic schools, 5 kingdoms, and 3 religions. Help me set this up efficiently."

**What Claude Does:**

1. **Recognizes this matches the skill** (bulk data, planning phase, database operations)

2. **Loads the mcp-writer skill** and its capabilities

3. **Writes code like this:**

```javascript
import MCPHelper from './.claude/skills/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();

// Create workflow for worldbuilding
const workflow = {
  steps: [
    // Step 1: Create series plan
    {
      server: 'series-planning-server',
      tool: 'create_series_plan',
      args: {
        title: 'The Shadow Realms',
        genre: 'Fantasy',
        planned_books: 5
      },
      save: 'series'
    },
    // Step 2: Batch create kingdoms
    {
      server: 'world-planning-server',
      tool: 'batch_create_locations',
      args: {
        series_id: '${series.series_id}',
        locations: [
          { name: 'Kingdom of Eldoria', type: 'kingdom', ... },
          // ... 4 more kingdoms
        ]
      },
      save: 'kingdoms'
    },
    // Step 3: Create magic system
    {
      server: 'world-planning-server',
      tool: 'create_magic_system',
      args: {
        series_id: '${series.series_id}',
        schools: [
          { name: 'School of Fire', description: '...' },
          // ... 6 more schools
        ]
      },
      save: 'magic'
    }
    // ... more steps
  ]
};

const result = await helper.executeWorkflow(workflow);

// Filter results - only show summary
console.log('Created:');
console.log(`- Series: ${result.context.series.title}`);
console.log(`- Kingdoms: ${result.context.kingdoms.length}`);
console.log(`- Magic Schools: ${result.context.magic.schools.length}`);

await helper.close();
```

4. **Shows you:**

```
✅ Successfully created worldbuilding structure:

Series: The Shadow Realms
- 5 Kingdoms created
- 7 Magic Schools defined
- 20 Locations added
- 3 Religions established
- Timeline framework set up

All data validated and committed to database.
Series plan ID: 1
Ready to start character and plot development!
```

## Benefits for Your Use Case

### Without Skill (Traditional MCP):
- 😰 Call 50+ separate tools one at a time
- 😰 High token usage showing all intermediate results
- 😰 No batch operations or error handling
- 😰 Must manually track IDs and relationships
- 😰 Takes many prompts back and forth

### With Skill (Code Execution):
- ✅ One workflow handles everything
- ✅ Minimal token usage (just summary shown)
- ✅ Automatic error handling and validation
- ✅ IDs tracked programmatically
- ✅ Done in one operation

## Next Steps

1. **Try it:** Just ask Claude to use the mcp-writer skill for your next task
2. **Be specific:** Describe the worldbuilding data you want to add
3. **Review:** Claude will show you a summary of what was created
4. **Iterate:** Adjust and add more as your world develops

See `worldbuilding-workflow.js` for a complete practical example!
