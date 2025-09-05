@echo off
REM Batch script to generate MCP configurations
REM Usage: .\scripts\generate-configs.bat [options]

setlocal enabledelayedexpansion

REM Change to the project directory  
cd /d "%~dp0\.."

REM Parse command line arguments
set "ARGS="
set "HELP_REQUESTED=false"

:parse_args
if "%1"=="" goto end_parse_args
if /i "%1"=="--help" (
    set "HELP_REQUESTED=true"
    goto end_parse_args
)
if /i "%1"=="-help" (
    set "HELP_REQUESTED=true" 
    goto end_parse_args
)
if /i "%1"=="help" (
    set "HELP_REQUESTED=true"
    goto end_parse_args
)
set "ARGS=!ARGS! %1"
shift
goto parse_args

:end_parse_args

if "%HELP_REQUESTED%"=="true" (
    echo.
    echo 🔧 MCP Configuration Generator
    echo.
    echo Usage: .\scripts\generate-configs.bat [options]
    echo.
    echo Options:
    echo   --claude        Generate Claude Desktop configuration only
    echo   --typing-mind   Generate Typing Mind configuration only
    echo   --show-config   Show current configuration values  
    echo   --help          Show this help message
    echo.
    echo Examples:
    echo   .\scripts\generate-configs.bat                    # Generate both configs
    echo   .\scripts\generate-configs.bat --claude           # Generate Claude config only
    echo   .\scripts\generate-configs.bat --typing-mind      # Generate Typing Mind config only
    echo   .\scripts\generate-configs.bat --show-config      # Show current settings
    echo.
    echo Environment Variables:
    echo   MCP_TUTORIAL_PATH    Path to the MCP tutorial project ^(default: current directory^)
    echo   NODE_ENV             Node environment ^(default: development^)
    echo   DATABASE_URL         PostgreSQL connection string
    echo   MCP_SERVER_HOST      HTTP server host for Typing Mind ^(default: localhost^)
    echo   MCP_SERVER_PORT      HTTP server port for Typing Mind ^(default: 3500^)
    echo.
    echo Configuration files will be generated in the config/ directory.
    echo.
    goto end
)

REM Run the Node.js script
echo 🚀 Running MCP Configuration Generator...
node scripts/generate-configs.js %ARGS%

if !errorlevel! neq 0 (
    echo.
    echo ❌ Configuration generation failed. Check the errors above.
    exit /b 1
) else (
    echo.
    echo ✅ Configuration generation completed successfully!
)

:end
endlocal
