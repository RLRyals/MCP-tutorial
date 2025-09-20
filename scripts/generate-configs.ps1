# PowerShell script to generate MCP configurations
# Usage: .\scripts\generate-configs.ps1 [options]

param(
    [switch]$Claude,
    [switch]$TypingMind,
    [switch]$ShowConfig,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
🔧 MCP Configuration Generator

Usage: .\scripts\generate-configs.ps1 [options]

Options:
  -Claude        Generate Claude Desktop configuration only
  -TypingMind    Generate Typing Mind configuration only  
  -ShowConfig    Show current configuration values
  -Help          Show this help message

Examples:
  .\scripts\generate-configs.ps1                    # Generate both configs
  .\scripts\generate-configs.ps1 -Claude           # Generate Claude config only
  .\scripts\generate-configs.ps1 -TypingMind       # Generate Typing Mind config only
  .\scripts\generate-configs.ps1 -ShowConfig       # Show current settings

Environment Variables:
  MCP_TUTORIAL_PATH    Path to the MCP tutorial project (default: current directory)
  NODE_ENV             Node environment (default: development)
  DATABASE_URL         PostgreSQL connection string
  MCP_SERVER_HOST      HTTP server host for Typing Mind (default: localhost)
  MCP_SERVER_PORT      HTTP server port for Typing Mind (default: 3500)

Configuration files will be generated in the config/ directory.
"@
    exit 0
}

# Build the node command arguments
$nodeArgs = @("scripts/generate-configs.js")

if ($Claude) {
    $nodeArgs += "--claude"
}
elseif ($TypingMind) {
    $nodeArgs += "--typing-mind"
}
elseif ($ShowConfig) {
    $nodeArgs += "--show-config"
}

# Change to the project directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
Push-Location $projectDir

try {
    # Run the Node.js script
    node @nodeArgs
}
catch {
    Write-Error "Failed to run configuration generator: $_"
}
finally {
    Pop-Location
}
