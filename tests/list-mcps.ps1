# List all MCP servers that should be configured
Write-Host "=== Available MCP Servers ==="

if (Test-Path "src\mcps") {
    $mcpDirs = Get-ChildItem "src\mcps" -Directory
    Write-Host "Found $($mcpDirs.Count) MCP server directories:"
    
    foreach ($dir in $mcpDirs) {
        Write-Host "  - $($dir.Name)"
        $indexFile = Join-Path $dir.FullName "index.js"
        if (Test-Path $indexFile) {
            Write-Host "    ✓ index.js exists"
        } else {
            Write-Host "    ✗ index.js missing"
        }
    }
} else {
    Write-Host "src\mcps directory not found"
}

Write-Host ""
Write-Host "=== Package.json Scripts ==="
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    if ($package.scripts) {
        Write-Host "Available scripts:"
        $package.scripts.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value)"
        }
    }
}