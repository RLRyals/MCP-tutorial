# Series Planning Phase MCP Server

## Overview

This is a **phase-based MCP aggregation server** that combines multiple MCP servers into a single server optimized for the series planning phase. Instead of loading all 11+ MCPs in Claude Desktop, you only load this one server which internally manages 7 component servers.

## How It Works

### Architecture

This server uses **import-based aggregation**:
1. It imports multiple MCP server classes from your existing servers
2. Instantiates each server internally
3. Aggregates and prefixes their tools
4. Routes tool calls to the appropriate component server

### Benefits

- **Reduced Overhead**: One MCP connection instead of 11+
- **Phase-Focused**: Only exposes tools relevant to series planning
- **Cleaner Tool List**: Tools are organized by prefix (e.g., `author_`, `series_`, `character_`)
- **Easier Configuration**: Single entry in `claude_desktop_config.json`

## Configuration

### Claude Desktop Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "series-planning": {
      "command": "node",
      "args": [
        "c:/github/MCP-Tutorial-New/MCP-tutorial/src/config-mcps/series-planning-server/index.js"
      ],
      "env": {
        "MCP_STDIO_MODE": "true",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### For TypingMind

Use the same configuration format that TypingMind supports for MCP servers.

## Included Servers & Tools

### Full Access (All Tools)
- **Author Server** - All author management tools
- **Series Server** - All series management tools
- **Metadata Server** - All metadata tools (genres, themes, tropes)

### Filtered Access (Selected Tools Only)
- **Character Server** - Basic character creation and details only
  - `create_character`, `get_character`, `list_characters`, `update_character`, `add_character_detail`

- **World Server** - Major world building only
  - Locations: `create_location`, `get_location`, `list_locations`
  - Organizations: `create_organization`, `get_organization`, `list_organizations`
  - World Systems: `create_world_system`, `get_world_system`, `list_world_systems`

- **Plot Server** - High-level plot threads only
  - `create_plot_thread`, `get_plot_thread`, `list_plot_threads`, `update_plot_thread`

- **Relationship Server** - Core relationships only
  - `create_relationship`, `get_relationship`, `list_relationships`, `update_relationship`

## Tool Naming Convention

All tools are prefixed with their server name to avoid conflicts:

- `series_create_series`
- `character_create_character`
- `world_create_location`
- etc.

The descriptions are also prefixed to help Claude understand which domain each tool belongs to:

- `[SERIES] Create a new book series`
- `[CHARACTER] Create a new character`

## Creating Other Phase Servers

You can create similar aggregation servers for other phases:

### Book Writing Phase
```javascript
// Might include: book-server, chapter-server, scene-server, writing-server, timeline-server
```

### Editing Phase
```javascript
// Might include: story-analysis-server, writing-server, validation tools
```

### World Building Phase
```javascript
// Might include: world-server (all tools), character-server (all tools), relationship-server (all tools)
```

## Database Connection

All component servers share the same database connection initialized by `BaseMCPServer`. There's no duplication of database connections - the base server handles this efficiently.

## Testing

Test the server using the CLI runner:

```bash
cd src/config-mcps/series-planning-server
node index.js list-tools
node index.js call series_list_series
```

Or test with Claude Desktop by restarting after updating the config.

## Limitations

### Import-Based Aggregation Limitations
- **Memory**: Each component server is instantiated, which uses more memory than process-based aggregation
- **Shared State**: All servers share the same Node.js process
- **Error Handling**: An error in one component server could affect others

### Alternative: Process-Based Aggregation
For better isolation, you could create a process-based aggregator that spawns each MCP server as a child process. This would:
- Use more system resources but provide better isolation
- Require more complex IPC (Inter-Process Communication)
- Be more resilient to individual server failures

## Future Enhancements

1. **Dynamic Tool Loading**: Load tools based on configuration file
2. **Tool Caching**: Cache frequently used tool results
3. **Analytics**: Track which tools are used most in each phase
4. **Phase Detection**: Automatically switch between phase servers based on user activity
