# auto-configure-claude.ps1
# Automatically configures Claude Desktop for MCP Tutorial

param(
    [switch]$TypingMind,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Auto-Configure Claude Desktop for MCP Tutorial

USAGE:
    .\auto-configure-claude.ps1 [-TypingMind]

OPTIONS:
    -TypingMind    Show Typing Mind configuration instead
    -Help          Show this help

EXAMPLES:
    # Configure Claude Desktop
    .\auto-configure-claude.ps1

    # Show Typing Mind instructions
    .\auto-configure-claude.ps1 -TypingMind
"@
    exit 0
}

$ErrorActionPreference = "Stop"

if ($TypingMind) {
    Write-Host @"

=== Typing Mind Configuration ===

1. Start MCP servers in HTTP mode:
   docker compose -f docker-compose.typing-mind.yml up -d

2. In Typing Mind, go to Settings → MCP Servers

3. Add each server:

   Author Manager:     http://localhost:3501
   Series Manager:     http://localhost:3502
   Book Manager:       http://localhost:3503
   Character Manager:  http://localhost:3504
   Timeline Manager:   http://localhost:3505
   Metadata Manager:   http://localhost:3506
   Trope Manager:      http://localhost:3507
   Plot Manager:       http://localhost:3508
   Relationship Mgr:   http://localhost:3509
   Story Analysis:     http://localhost:3510
   World Builder:      http://localhost:3511
   Writing Manager:    http://localhost:3512

4. Test: Ask "List all authors"

"@
    exit 0
}

Write-Host "`n=== Claude Desktop Auto-Configuration ===`n" -ForegroundColor Cyan

# Detect Claude config location
$claudeConfigPath = ""
if ($IsWindows -or $env:OS -match "Windows") {
    $claudeConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
} elseif ($IsMacOS -or $env:HOME) {
    $claudeConfigPath = "$env:HOME/Library/Application Support/Claude/claude_desktop_config.json"
}

if (-not $claudeConfigPath) {
    Write-Host "Could not detect Claude Desktop config location" -ForegroundColor Red
    exit 1
}

Write-Host "Claude config location: $claudeConfigPath" -ForegroundColor Gray

# Check if Claude Desktop is installed
$claudeDir = Split-Path $claudeConfigPath -Parent
if (-not (Test-Path $claudeDir)) {
    Write-Host "`nClaude Desktop not found!" -ForegroundColor Yellow
    Write-Host "Please install Claude Desktop first: https://claude.ai/download" -ForegroundColor White
    exit 1
}

# Backup existing config
if (Test-Path $claudeConfigPath) {
    $backupPath = "${claudeConfigPath}.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $claudeConfigPath $backupPath
    Write-Host "`nBacked up existing config to:" -ForegroundColor Green
    Write-Host "  $backupPath" -ForegroundColor Gray
}

# Generate config
$config = @{
    mcpServers = @{
        "author-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-author", "node", "src/mcps/author-server/index.js")
        }
        "series-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-series", "node", "src/mcps/series-server/index.js")
        }
        "book-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-book", "node", "src/mcps/book-server/index.js")
        }
        "character-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-character", "node", "src/mcps/character-server/index.js")
        }
        "timeline-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-timeline", "node", "src/mcps/timeline-server/index.js")
        }
        "metadata-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-metadata", "node", "src/mcps/metadata-server/index.js")
        }
        "trope-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-trope", "node", "src/mcps/trope-server/index.js")
        }
        "plot-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-plot", "node", "src/mcps/plot-server/index.js")
        }
        "relationship-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-relationship", "node", "src/mcps/relationship-server/index.js")
        }
        "story-analysis" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-story-analysis", "node", "src/mcps/story-analysis-server/index.js")
        }
        "world-builder" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-world", "node", "src/mcps/world-server/index.js")
        }
        "writing-manager" = @{
            command = "docker"
            args = @("exec", "-i", "mcp-tutorial-writing", "node", "src/mcps/writing-server/index.js")
        }
    }
}

# Save config
$config | ConvertTo-Json -Depth 10 | Out-File $claudeConfigPath -Encoding UTF8

Write-Host "`nConfiguration saved!" -ForegroundColor Green

# Show what was configured
Write-Host "`nConfigured 12 MCP servers:" -ForegroundColor Cyan
$config.mcpServers.Keys | ForEach-Object {
    Write-Host "  ✓ $_" -ForegroundColor White
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Ensure Docker containers are running:" -ForegroundColor White
Write-Host "   docker compose -f docker-compose.mcp.yml ps" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Completely quit Claude Desktop:" -ForegroundColor White
Write-Host "   (Right-click tray icon → Quit)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart Claude Desktop" -ForegroundColor White
Write-Host ""
Write-Host "4. Look for 🔨 tool icon" -ForegroundColor White
Write-Host ""
Write-Host "5. Test: Ask 'Can you list all authors?'" -ForegroundColor White
Write-Host ""

Write-Host "Done! 🎉`n" -ForegroundColor Green
