# IMPORTANT: Claude Desktop vs Claude Code

## ⚠️ Critical Distinction

This MCP Writer Skill is designed for **Claude Code** (CLI/VS Code), NOT **Claude Desktop** (the chat application).

## What's the Difference?

### Claude Desktop (Chat Application)
- Standalone desktop chat application
- **Cannot execute JavaScript code from filesystem**
- Connects to MCP servers via configuration file
- Config location: `~/Library/Application Support/Claude/claude_desktop_config.json`
- MCP servers run as separate processes
- Skills are prompt templates, not executable code

### Claude Code (CLI / VS Code Extension)
- Command-line tool and VS Code extension
- **CAN execute JavaScript code directly**
- Has filesystem access
- Can import and run Node.js modules
- This is what the MCP Writer Skill was built for

## The Problem

**You said:** "I don't have access to the MCP code from Claude Desktop"

**You're correct!** Claude Desktop cannot:
- ❌ Import JavaScript files from `.claude/skills/`
- ❌ Execute `import MCPHelper from './mcp-helper.js'`
- ❌ Run Node.js code that connects to MCP servers
- ❌ Access your project filesystem directly

## The Solution Depends on What You're Using

### If You're Using Claude Desktop (Chat App)

You MUST use traditional MCP configuration:

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "author-server": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-tutorial/src/mcps/author-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    },
    "series-planning": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-tutorial/src/config-mcps/series-planning-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    },
    "book-planning": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-tutorial/src/config-mcps/book-planning-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
    // ... add other config-mcps servers
  }
}
```

Then restart Claude Desktop and the MCP tools will appear in your chat.

**This is the ONLY way to use MCPs in Claude Desktop.**

### If You're Using Claude Code (CLI/VS Code)

The MCP Writer Skill works here! Claude Code can execute the JavaScript.

```bash
# In terminal with Claude Code
claude chat

# Then in chat:
"Use the mcp-writer skill to discover servers"
```

Claude Code will execute the JavaScript and connect to your MCP servers programmatically.

## Why This Matters

### Architecture Comparison

**Claude Desktop:**
```
User → Claude Desktop (chat) → claude_desktop_config.json → MCP Server Process → Database
```
- MCP servers run as separate processes
- Claude calls them via stdio/HTTP protocol
- No direct code execution

**Claude Code:**
```
User → Claude Code → Executes JavaScript → Imports MCP classes → Database
```
- Code runs in same process
- Can import and call MCP server classes directly
- Full filesystem access

## What You Should Do

### Option 1: Use Claude Desktop (Recommended for Chat Interface)

1. **Ignore the skill** - it won't work in Desktop
2. **Configure MCPs traditionally** in `claude_desktop_config.json`
3. **Use MCP tools** directly in chat
4. **For batch operations**, ask Claude Desktop to call multiple tools

**Example in Claude Desktop:**
> "I need to create 5 kingdoms. Can you call the create_location tool 5 times with these details: [paste kingdom data]"

Claude Desktop will make 5 separate MCP tool calls.

### Option 2: Use Claude Code (For Programmatic Access)

1. **Install Claude Code** CLI/VS Code extension
2. **Use the MCP Writer Skill** for efficient batch operations
3. **Get token efficiency** benefits (98.7% reduction)
4. **Execute complex workflows** programmatically

**Example in Claude Code:**
> "Use the mcp-writer skill to batch import these 5 kingdoms"

Claude Code executes JavaScript that batch imports efficiently.

## Recommendation for Your Use Case

Since you mentioned:
- "I don't have access to the MCP code from Claude Desktop"
- You want to do worldbuilding with lots of data
- Series planning with kingdoms, magic systems, etc.

### Best Approach: Traditional Claude Desktop Config

1. **Edit:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add all your active MCP servers:**
   - author-server (from src/mcps/)
   - All 8 servers from src/config-mcps/

3. **Restart Claude Desktop**

4. **In chat, ask Claude Desktop:**
   > "I need to add 5 kingdoms to my fantasy series. Here are the details: [paste data]. Please call the create_location tool for each one."

5. **Claude Desktop will:**
   - Call create_location 5 times
   - Show you each result
   - Higher token usage but it works

### Alternative: Use Both

- **Claude Desktop** for general chat and exploration
- **Claude Code** for batch operations when you have lots of data

## Summary Table

| Feature | Claude Desktop | Claude Code |
|---------|---------------|-------------|
| **Type** | Chat app | CLI / VS Code |
| **MCP Config** | JSON config file | Can use skill OR config |
| **Code Execution** | ❌ No | ✅ Yes |
| **Skill Works** | ❌ No | ✅ Yes |
| **Batch Efficiency** | Low (many tool calls) | High (code loops) |
| **Token Usage** | Higher | Much lower |
| **Setup** | Easy (config file) | More complex |
| **Your Use Case** | ✅ Use config file | ✅ If you install CLI |

## Files to Reference

Based on what you're using:

### For Claude Desktop Users:
- See: `docs/` in MCP-tutorial for config examples
- Ignore: All `.claude/skills/mcp-writer/` files
- Configure: `claude_desktop_config.json`

### For Claude Code Users:
- Use: `.claude/skills/mcp-writer/` skill
- Install: Globally for access anywhere
- Reference: HOW_TO_USE.md, INSTALL_GLOBAL.md

## Apologies

I should have clarified this distinction from the start. The skill I built is specifically for Claude Code's code execution capabilities, which Claude Desktop doesn't have.

For Claude Desktop, you need the traditional MCP server configuration approach.
