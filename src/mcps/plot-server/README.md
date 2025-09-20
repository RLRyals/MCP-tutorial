# Plot Management MCP Server

A modular MCP server for comprehensive plot management following the architecture outlined in the [Plot Server Modular Implementation Guide](../../../docs/plot-server-modular-guide.md).

## Architecture

This server follows the modular design pattern with separate handlers for different functionality:

### Core Components

- **`index.js`** - Main MCP server that combines all handler modules
- **`handlers/plot-thread-handlers.js`** - Core plot thread CRUD operations  
- **`handlers/story-analysis-handlers.js`** - Dramatica-inspired story analysis
- **`handlers/genre-extensions.js`** - Dynamic genre-specific tools
- **`schemas/plot-tools-schema.js`** - Centralized tool definitions
- **`utils/plot-validators.js`** - Input validation helpers

### Handler Integration

The main server uses `Object.assign()` to mix handler methods into the server class, providing a clean separation of concerns while maintaining a single MCP endpoint for Claude Desktop.

## Database Requirements  

Requires migration **004_plot_structure_and_universal_framework.sql** for full functionality.

### Core Tables Used
- `plot_threads` - Story arcs, subplots, character arcs
- `story_analysis` - Dramatica-inspired analysis
- `genres` - Genre lookup table  
- `plot_thread_relationships` - Thread connections
- Genre-specific tables (detective_cases, romance_arcs, etc.)

## Available Tools

### Plot Thread Management
- `create_plot_thread` - Create new plot threads
- `update_plot_thread` - Update thread status and details  
- `get_plot_threads` - Query threads with filtering
- `link_plot_threads` - Create thread relationships
- `resolve_plot_thread` - Mark threads as resolved

### Story Analysis (Dramatica-Inspired)
- `analyze_story_dynamics` - Track story appreciations
- `track_character_throughlines` - Character development arcs
- `identify_story_appreciations` - Organic story element tracking
- `map_problem_solutions` - Problem/solution dynamics

### Genre Extensions
All genre tools are always available to support multi-genre novels:

**Mystery Tools:**
- `create_case` - Start mystery cases
- `add_evidence` - Track evidence  
- `track_clues` - Manage clues and red herrings

**Romance Tools:**
- `create_relationship_arc` - Romance progression
- `track_romantic_tension` - Tension level changes

**Fantasy Tools:**
- `define_magic_system` - Magic system rules
- `track_power_progression` - Character power growth

*Note: All tools work together - use mystery + romance tools for romantic suspense, fantasy + mystery for paranormal investigation, etc.*

### Lookup System
- `get_available_options` - Query genres, tropes, templates

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plot-server": {
      "command": "node",
      "args": ["src/mcps/plot-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
  }
}
```

## Design Principles

### Anti-Rigid Structure
- No predetermined story beats or percentages
- Focus on story function over form  
- Organic story development tracking
- Flexible story appreciations

### Graceful Degradation
- Falls back to basic functionality if tables don't exist
- Stores complex data in `story_analysis` notes when specialized tables unavailable
- Progressive enhancement as schema evolves

### Genre Flexibility
- Dynamic tool loading based on series genre
- Extensible genre modules
- Base tools work across all genres

## Usage Examples

### Basic Plot Thread
```
Create a plot thread for series 1 with title "Main Mystery Arc" and type "series_arc"
```

### Story Analysis
```  
Analyze story dynamics for book 3 with story concern "understanding" and main character problem "self-doubt"
```

### Mystery Tools (when series genre is mystery)
```
Create a case for plot thread 5 named "The Locked Room Murder" 
```

## Testing

Each component can be tested independently. The modular design allows for incremental development and testing.

## Extension Points

- Add new genre handlers in `handlers/genre-extensions.js`
- Extend story analysis with custom appreciations
- Add new plot thread types via schema updates
- Create additional validation rules

This architecture supports both tutorial learning (understanding modular MCP design) and production use (comprehensive plot management for AI writing teams).
