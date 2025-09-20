# Test script to diagnose issues
Write-Host "Current directory: $(Get-Location)"
Write-Host "Node.js version:"
try {
    node --version
} catch {
    Write-Host "Node.js not found in PATH"
}

Write-Host "Project structure:"
Get-ChildItem -Name

Write-Host "Scripts directory:"
Get-ChildItem scripts\ -Name

Write-Host "Config directory:"
if (Test-Path "config") {
    Get-ChildItem config\ -Name
} else {
    Write-Host "Config directory does not exist"
}
