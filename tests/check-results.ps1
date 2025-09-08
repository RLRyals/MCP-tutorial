# Check what the generate-configs script actually produced
Write-Host "=== Checking Config Directory ==="
if (Test-Path "config") {
    Write-Host "Config directory contents:"
    Get-ChildItem config\ | Format-Table Name, LastWriteTime, Length
    
    Write-Host "`n=== Claude Desktop Config ==="
    if (Test-Path "config\claude-desktop.json") {
        Write-Host "claude-desktop.json exists:"
        Get-Content "config\claude-desktop.json" | Write-Host
    } else {
        Write-Host "claude-desktop.json does not exist"
    }
    
    Write-Host "`n=== Typing Mind Config ==="
    if (Test-Path "config\typing-mind.json") {
        Write-Host "typing-mind.json exists:"
        Get-Content "config\typing-mind.json" | Write-Host
    } else {
        Write-Host "typing-mind.json does not exist"
    }
} else {
    Write-Host "Config directory does not exist"
}

Write-Host "`n=== Environment Check ==="
Write-Host "NODE_ENV: $env:NODE_ENV"
if ($env:DATABASE_URL) {
    $maskedUrl = $env:DATABASE_URL -replace '://[^:]+:[^@]+@', '://***:***@'
    Write-Host "DATABASE_URL: $maskedUrl"
} else {
    Write-Host "DATABASE_URL: (not set)"
}
Write-Host "MCP_SERVER_HOST: $env:MCP_SERVER_HOST"
Write-Host "MCP_SERVER_PORT: $env:MCP_SERVER_PORT"
Write-Host "MCP_TUTORIAL_PATH: $env:MCP_TUTORIAL_PATH"

Write-Host "`n=== .env file check ==="
if (Test-Path ".env") {
    Write-Host ".env file exists (content masked for security):"
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "PASSWORD|SECRET|TOKEN|KEY") {
            $_ -replace '=.*', '=***'
        } else {
            $_
        }
    } | Write-Host
} else {
    Write-Host ".env file does not exist"
}
