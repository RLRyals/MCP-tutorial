# Story Analysis Server (Optional)

This is an **OPTIONAL** MCP server that provides story analysis tools inspired by narrative theory principles. It has been separated from the main plot-server to allow users to enable or disable it as needed.

## What This Server Provides

The Story Analysis Server offers tools for analyzing narrative structure:

- **Story Dynamics Analysis**: Analyze overall story concerns, outcomes, and judgments
- **Character Throughlines**: Track character development arcs and transformations
- **Story Appreciations**: Identify and track story elements that emerge organically
- **Problem-Solution Mapping**: Map how problems and solutions interact at different story levels

## Why It's Optional

This server has been made optional because some users may prefer not to use structured narrative analysis in their writing process. By keeping it separate, you can:

- Use only the tools you find helpful
- Avoid seeing tools you don't want to use
- Customize your MCP setup to match your writing style

## How to Enable This Server

### Option 1: Use the config generator with environment variable (RECOMMENDED)

Run the config generator with the optional servers flag:

```bash
# For Windows PowerShell:
$env:INCLUDE_OPTIONAL_SERVERS="true"
node scripts/generate-configs.js --claude

# For Windows CMD:
set INCLUDE_OPTIONAL_SERVERS=true
node scripts/generate-configs.js --claude

# For macOS/Linux:
INCLUDE_OPTIONAL_SERVERS=true node scripts/generate-configs.js --claude
```

This will automatically include the story-analysis-server in your generated configuration file at `config/claude-desktop.json`. Then copy that configuration to your Claude Desktop settings.

### Option 2: Manually add to your Claude Desktop configuration

To manually enable the story-analysis-server, edit your Claude Desktop configuration file:

**For macOS/Linux:**
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**For Windows:**
Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add the following entry to the `mcpServers` section:

```json
{
  "mcpServers": {
    "story-analysis": {
      "command": "node",
      "args": [
        "/path/to/your/MCP-tutorial/src/mcps/story-analysis-server/index.js"
      ],
      "env": {
        "MCP_STDIO_MODE": "true",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "your_database_name",
        "DB_USER": "your_username",
        "DB_PASSWORD": "your_password"
      }
    }
  }
}
```

**Important**: Replace `/path/to/your/` and the database credentials with your actual values.

## How to Disable This Server

Simply do NOT add the story-analysis server entry to your configuration file, or comment it out if you've previously added it.

## Running Standalone for Testing

You can test the server independently:

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=your_database_name
export DB_USER=your_username
export DB_PASSWORD=your_password

# Run the server
node src/mcps/story-analysis-server/index.js
```

## Available Tools

Once enabled, the server provides these tools through Claude:

1. **analyze_story_dynamics** - Analyze story structure using narrative elements
2. **track_character_throughlines** - Track character development paths
3. **identify_story_appreciations** - Identify story elements that emerge naturally
4. **map_problem_solutions** - Map problem/solution dynamics in your story

**Note:** To view available lookup options (story_concerns, story_outcomes, story_judgments), use the **metadata-server's get_available_options** tool.

## Database Requirements

This server requires the same database schema as the plot-server. Make sure you've run the appropriate migrations:

- `002_initial_schema.sql` - Base database schema
- `004_plot_structure_and_universal_framework.sql` - Plot and story analysis tables

## Notes

- This server shares the same database as other MCP servers in this project
- The tools use flexible, optional parameters - use only what makes sense for your story
- All analysis is stored in your local database and never leaves your machine
- You can enable/disable this server at any time by editing your configuration
