# Installing MCP Writer Skill Globally

## Global vs Project Skills

**Project Skills** (`.claude/skills/` in project):
- Only available when working in that specific project
- Good for project-specific workflows
- **Current status:** Your skill is here

**Global Skills** (User's home directory):
- Available in Claude Desktop from ANY directory
- Can be used across all your projects
- **What you need:** Move skill here

## Global Skills Location

Claude Desktop looks for global skills in:

### macOS
```bash
~/Library/Application Support/Claude/skills/
```

### Linux
```bash
~/.config/Claude/skills/
# or
~/.claude/skills/
```

### Windows
```powershell
%APPDATA%\Claude\skills\
# or
%USERPROFILE%\.claude\skills\
```

## Installation Methods

### Method 1: Automatic Installation (Recommended)

Run the installation script:

```bash
# From the MCP-tutorial directory
node .claude/skills/mcp-writer/install-global.js
```

This will:
1. Detect your operating system
2. Find the correct global skills directory
3. Copy the skill files
4. Update paths to work globally
5. Verify the installation

### Method 2: Manual Installation

#### Step 1: Create Global Skills Directory

**macOS/Linux:**
```bash
mkdir -p ~/.config/Claude/skills/mcp-writer
# or
mkdir -p ~/Library/Application\ Support/Claude/skills/mcp-writer
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude\skills\mcp-writer"
```

#### Step 2: Copy Skill Files

**macOS/Linux:**
```bash
# Copy all files
cp -r .claude/skills/mcp-writer/* ~/.config/Claude/skills/mcp-writer/

# Or use the full path
cp -r .claude/skills/mcp-writer/* ~/Library/Application\ Support/Claude/skills/mcp-writer/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Path ".claude\skills\mcp-writer\*" -Destination "$env:APPDATA\Claude\skills\mcp-writer\" -Recurse
```

#### Step 3: Update Path Configuration

The skill needs to find your MCP servers. Edit the global copy:

**File:** `~/.config/Claude/skills/mcp-writer/mcp-helper.js` (or Windows equivalent)

Update the `mcpPaths` in the constructor:

```javascript
constructor() {
    this.servers = new Map();

    // IMPORTANT: Update these paths to point to your MCP tutorial project
    this.mcpPaths = {
        // Replace with YOUR actual project path
        main: '/absolute/path/to/MCP-tutorial/src/mcps',
        config: '/absolute/path/to/MCP-tutorial/src/config-mcps'
    };
}
```

**Example paths:**

macOS:
```javascript
main: '/Users/yourname/Projects/MCP-tutorial/src/mcps',
config: '/Users/yourname/Projects/MCP-tutorial/src/config-mcps'
```

Windows:
```javascript
main: 'C:\\Users\\yourname\\Projects\\MCP-tutorial\\src\\mcps',
config: 'C:\\Users\\yourname\\Projects\\MCP-tutorial\\src\\config-mcps'
```

Linux:
```javascript
main: '/home/yourname/MCP-tutorial/src/mcps',
config: '/home/yourname/MCP-tutorial/src/config-mcps'
```

### Method 3: Symlink (Advanced)

Instead of copying, create a symlink so updates automatically sync:

**macOS/Linux:**
```bash
# Create symlink to project skill
ln -s "$(pwd)/.claude/skills/mcp-writer" ~/.config/Claude/skills/mcp-writer
```

**Windows (PowerShell, run as Administrator):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\Claude\skills\mcp-writer" -Target "$(Get-Location)\.claude\skills\mcp-writer"
```

⚠️ **Note:** With symlink, you still need to update the paths in `mcp-helper.js` to be absolute.

## Verifying Installation

### Check Skill is Visible

1. **Restart Claude Desktop** (if it was running)
2. **Open Claude Desktop**
3. **Type:** `/skills` or check available skills
4. **Look for:** `mcp-writer` in the list

### Test the Skill

Ask Claude:
> "Use the mcp-writer skill to discover available MCP servers"

Claude should recognize and use the skill.

### Test Discovery

From any directory in Claude Desktop:
```javascript
// Ask Claude to run this
import MCPHelper from '~/.config/Claude/skills/mcp-writer/mcp-helper.js';

const helper = new MCPHelper();
const servers = await helper.discoverServers();
console.log(`Found ${servers.length} servers`);
await helper.close();
```

## Troubleshooting

### Skill Not Found

**Problem:** Claude Desktop doesn't see the skill

**Solutions:**
1. Restart Claude Desktop
2. Check the skill is in the correct directory
3. Verify `mcp-writer.md` exists and has proper YAML frontmatter
4. Check file permissions (should be readable)

### Path Errors

**Problem:** `ENOENT: no such file or directory, scandir '/path/to/mcps'`

**Solutions:**
1. Update absolute paths in `mcp-helper.js`
2. Make sure paths point to your actual MCP-tutorial directory
3. Use forward slashes `/` even on Windows in Node.js paths
4. Verify the MCP-tutorial directory exists and has `src/mcps/`

### Skill Runs But No Servers Found

**Problem:** Discovery returns 0 servers

**Solutions:**
1. Check you're on the correct branch (MCP_Process_Servers or similar)
2. Verify `src/mcps/` and `src/config-mcps/` exist
3. Check paths in `mcp-helper.js` are absolute and correct
4. Make sure you have the MCP servers in your project

## Configuration Options

### Option 1: Per-Project Paths (Recommended)

Keep different projects separate:

```javascript
// In mcp-helper.js
constructor(projectPath = null) {
    this.servers = new Map();

    if (projectPath) {
        // Use provided project path
        this.mcpPaths = {
            main: join(projectPath, 'src/mcps'),
            config: join(projectPath, 'src/config-mcps')
        };
    } else {
        // Default to environment variable or known location
        const defaultPath = process.env.MCP_TUTORIAL_PATH ||
                          '/path/to/MCP-tutorial';
        this.mcpPaths = {
            main: join(defaultPath, 'src/mcps'),
            config: join(defaultPath, 'src/config-mcps')
        };
    }
}

// Usage:
const helper = new MCPHelper('/path/to/specific/project');
```

### Option 2: Environment Variable

Set in your shell profile:

**macOS/Linux (~/.bashrc or ~/.zshrc):**
```bash
export MCP_TUTORIAL_PATH="/Users/yourname/Projects/MCP-tutorial"
```

**Windows (System Environment Variables):**
```
Variable: MCP_TUTORIAL_PATH
Value: C:\Users\yourname\Projects\MCP-tutorial
```

Then use in code:
```javascript
const projectPath = process.env.MCP_TUTORIAL_PATH;
```

### Option 3: Config File

Create `~/.config/Claude/mcp-config.json`:

```json
{
  "projects": {
    "default": "/path/to/MCP-tutorial",
    "project2": "/path/to/another-project"
  }
}
```

## Updating the Skill

### If Installed via Copy

When the skill is updated in the project:

```bash
# Re-run installation
node .claude/skills/mcp-writer/install-global.js

# Or manually copy again
cp -r .claude/skills/mcp-writer/* ~/.config/Claude/skills/mcp-writer/
```

### If Installed via Symlink

Updates automatically sync! Just:
```bash
cd MCP-tutorial
git pull  # Get latest skill updates
# Restart Claude Desktop to reload
```

## Multi-Project Setup

If you have multiple writing projects:

```javascript
// In your global mcp-helper.js
const PROJECT_CONFIGS = {
    'shadow-realms': '/path/to/shadow-realms-project',
    'space-opera': '/path/to/space-opera-project',
    'mcp-tutorial': '/path/to/MCP-tutorial'
};

constructor(projectName = 'mcp-tutorial') {
    this.servers = new Map();

    const projectPath = PROJECT_CONFIGS[projectName];
    if (!projectPath) {
        throw new Error(`Unknown project: ${projectName}`);
    }

    this.mcpPaths = {
        main: join(projectPath, 'src/mcps'),
        config: join(projectPath, 'src/config-mcps')
    };
}

// Usage:
const helper = new MCPHelper('shadow-realms');
```

## Next Steps

1. Choose installation method (automatic script recommended)
2. Install the skill globally
3. Update paths to absolute locations
4. Restart Claude Desktop
5. Test with: "Use the mcp-writer skill to discover servers"
6. Start using it for worldbuilding!

See `install-global.js` for the automated installation script.
