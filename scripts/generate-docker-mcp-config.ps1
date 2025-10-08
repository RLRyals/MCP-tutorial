# generate-docker-mcp-config.ps1
# Generates Claude Desktop configuration for Docker-based MCP servers

param(
    [switch]$AllServers,
    [string[]]$Servers,
    [switch]$ShowConfig,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Generate Claude Desktop Config for Docker MCP Servers

This script generates the claude_desktop_config.json configuration
for running MCP servers via Docker containers.

USAGE:
    .\scripts\generate-docker-mcp-config.ps1 [OPTIONS]

OPTIONS:
    -AllServers         Include all 12 MCP servers
    -Servers <list>     Include specific servers (comma-separated)
    -ShowConfig         Display config without saving
    -Help               Show this help message

EXAMPLES:
    # Generate config with all servers
    .\scripts\generate-docker-mcp-config.ps1 -AllServers

    # Generate config with specific servers
    .\scripts\generate-docker-mcp-config.ps1 -Servers author,series,book

    # Just show what the config would look like
    .\scripts\generate-docker-mcp-config.ps1 -AllServers -ShowConfig

AVAILABLE SERVERS:
    author, series, book, character, timeline, metadata,
    trope, plot, relationship, story-analysis, world, writing

"@
    exit 0
}

$ErrorActionPreference = "Stop"

# Available MCP servers
$availableServers = @{
    'author' = @{
        name = 'author-manager'
        container = 'mcp-tutorial-author'
        description = 'Author management tools'
    }
    'series' = @{
        name = 'series-manager'
        container = 'mcp-tutorial-series'
        description = 'Book series management'
    }
    'book' = @{
        name = 'book-manager'
        container = 'mcp-tutorial-book'
        description = 'Book and chapter management'
    }
    'character' = @{
        name = 'character-manager'
        container = 'mcp-tutorial-character'
        description = 'Character tracking and development'
    }
    'timeline' = @{
        name = 'timeline-manager'
        container = 'mcp-tutorial-timeline'
        description = 'Story timeline management'
    }
    'metadata' = @{
        name = 'metadata-manager'
        container = 'mcp-tutorial-metadata'
        description = 'Metadata and lookup management'
    }
    'trope' = @{
        name = 'trope-manager'
        container = 'mcp-tutorial-trope'
        description = 'Literary trope tracking'
    }
    'plot' = @{
        name = 'plot-manager'
        container = 'mcp-tutorial-plot'
        description = 'Plot structure and threads'
    }
    'relationship' = @{
        name = 'relationship-manager'
        container = 'mcp-tutorial-relationship'
        description = 'Character relationship tracking'
    }
    'story-analysis' = @{
        name = 'story-analysis'
        container = 'mcp-tutorial-story-analysis'
        description = 'Story analysis tools'
    }
    'world' = @{
        name = 'world-builder'
        container = 'mcp-tutorial-world'
        description = 'World building management'
    }
    'writing' = @{
        name = 'writing-manager'
        container = 'mcp-tutorial-writing'
        description = 'Writing session management'
    }
}

# Determine which servers to include
$serversToInclude = @()

if ($AllServers) {
    $serversToInclude = $availableServers.Keys
} elseif ($Servers) {
    foreach ($server in $Servers) {
        $server = $server.Trim().ToLower()
        if ($availableServers.ContainsKey($server)) {
            $serversToInclude += $server
        } else {
            Write-Warning "Unknown server: $server (skipping)"
        }
    }
} else {
    # Default: core servers
    $serversToInclude = @('author', 'series', 'book', 'character')
    Write-Host "No servers specified. Including default set: $($serversToInclude -join ', ')" -ForegroundColor Cyan
    Write-Host "Use -AllServers to include all, or -Servers to specify which ones`n" -ForegroundColor Cyan
}

if ($serversToInclude.Count -eq 0) {
    Write-Error "No servers selected. Use -AllServers or -Servers <list>"
    exit 1
}

# Build the configuration object
$mcpServers = @{}

foreach ($serverKey in $serversToInclude) {
    $serverInfo = $availableServers[$serverKey]
    $mcpServers[$serverInfo.name] = @{
        command = "docker"
        args = @(
            "exec",
            "-i",
            $serverInfo.container,
            "node",
            "src/mcps/$serverKey-server/index.js"
        )
    }
}

$config = @{
    mcpServers = $mcpServers
} | ConvertTo-Json -Depth 10

# Display configuration
Write-Host "`nGenerated Claude Desktop Configuration:" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Including $($serversToInclude.Count) MCP servers:" -ForegroundColor Cyan
foreach ($serverKey in $serversToInclude) {
    $info = $availableServers[$serverKey]
    Write-Host "  ✓ $($info.name)" -ForegroundColor White -NoNewline
    Write-Host " - $($info.description)" -ForegroundColor Gray
}
Write-Host ""

# Show the JSON
Write-Host $config -ForegroundColor Gray

if ($ShowConfig) {
    Write-Host "`n(Display only mode - not saving)" -ForegroundColor Yellow
    exit 0
}

# Save to file
$outputFile = "claude_desktop_config.docker.json"
$config | Out-File $outputFile -Encoding UTF8

Write-Host "`n✓ Configuration saved to: $outputFile" -ForegroundColor Green

# Detect Claude Desktop config location
$claudeConfigPath = ""
if ($IsWindows -or $env:OS -match "Windows") {
    $claudeConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
} elseif ($IsMacOS -or $env:HOME) {
    $claudeConfigPath = "$env:HOME/Library/Application Support/Claude/claude_desktop_config.json"
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure Docker containers are running:" -ForegroundColor White
Write-Host "   docker-compose -f docker-compose.mcp.yml ps" -ForegroundColor Gray

if ($claudeConfigPath) {
    Write-Host "`n2. Copy to your Claude Desktop config location:" -ForegroundColor White
    Write-Host "   $claudeConfigPath" -ForegroundColor Gray

    Write-Host "`n3. Or merge with existing config if you have other MCP servers" -ForegroundColor White

    # Offer to copy automatically
    $response = Read-Host "`nCopy to Claude Desktop config now? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        try {
            $claudeDir = Split-Path $claudeConfigPath -Parent
            if (!(Test-Path $claudeDir)) {
                New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
            }

            # Backup existing config
            if (Test-Path $claudeConfigPath) {
                $backupPath = "$claudeConfigPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
                Copy-Item $claudeConfigPath $backupPath
                Write-Host "✓ Backed up existing config to: $backupPath" -ForegroundColor Green
            }

            Copy-Item $outputFile $claudeConfigPath -Force
            Write-Host "✓ Configuration copied successfully!" -ForegroundColor Green
            Write-Host "`n⚠ IMPORTANT: Completely quit and restart Claude Desktop" -ForegroundColor Yellow
        } catch {
            Write-Error "Failed to copy config: $_"
        }
    }
} else {
    Write-Host "`n2. Copy this config to your Claude Desktop location" -ForegroundColor White
}

Write-Host "`n4. Restart Claude Desktop (quit completely, don't just close)" -ForegroundColor White
Write-Host "5. Look for the 🔨 tool icon in Claude Desktop" -ForegroundColor White

Write-Host "`nDone! 🚀`n" -ForegroundColor Green
