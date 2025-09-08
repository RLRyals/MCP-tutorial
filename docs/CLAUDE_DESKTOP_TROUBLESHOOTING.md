# Claude Desktop MCP Server Troubleshooting

## Problem: Server Disconnecting Unexpectedly

### Symptoms
- MCP servers start successfully but disconnect immediately
- Error logs show "Server transport closed unexpectedly" 
- Process exits early with messages about process exiting

### Root Cause
The CLI runner logic in each MCP server file was being triggered when Claude Desktop ran the servers. This happened because:

1. Claude Desktop runs each server with `node path/to/server/index.js`
2. The condition `import.meta.url === \`file://${process.argv[1]}\`` was evaluating to true
3. This caused the CLI runner to execute, which conflicted with Claude Desktop's MCP stdio management
4. The result was the server process exiting unexpectedly

### Solution Applied
Modified all MCP server files to check for `MCP_STDIO_MODE` environment variable:

**Before:**
```javascript
if (import.meta.url === `file://${process.argv[1]}`) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(AuthorMCPServer);
    await runner.run();
}
```

**After:**
```javascript
import { fileURLToPath } from 'url';
if (import.meta.url === `file://${process.argv[1]}` && !process.env.MCP_STDIO_MODE) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(AuthorMCPServer);
    await runner.run();
}
```

### Files Modified
- `src/mcps/author-server/index.js`
- `src/mcps/book-server/index.js`  
- `src/mcps/series-server/index.js`
- `src/mcps/timeline-server/index.js`
- `src/mcps/metadata-server/index.js`

### How It Works
1. Claude Desktop sets `MCP_STDIO_MODE=true` in the environment for each server
2. When this environment variable is present, the CLI runner is skipped
3. The server class is exported normally and can be used by Claude Desktop
4. Manual CLI usage (without MCP_STDIO_MODE) still works for testing

### Verification Steps

1. **Check the fixes were applied:**
   ```bash
   node verify-mcp-fixes.js
   ```

2. **Test database connection:**
   ```bash
   node debug-author-server.js
   ```

3. **Test MCP stdio mode:**
   ```bash
   node test-author-server-stdio.js
   ```

4. **Restart Claude Desktop** to pick up the changes

### Additional Troubleshooting

#### Database Connection Issues
If servers still fail after the CLI fix, check:

1. **Database is running:**
   ```powershell
   .\scripts\start-database.ps1
   ```

2. **Database credentials match:**
   - Check `claude-desktop.json` DATABASE_URL
   - Verify database user/password exist
   - Test connection with debug script

3. **Database schema exists:**
   ```bash
   node src/shared/run-migration.js 001_create_core_schema.sql
   ```

#### Environment Variable Issues
- Ensure `claude-desktop.json` has correct `cwd` path
- Verify `DATABASE_URL` format is correct
- Check that `NODE_ENV` is set to `development`

#### Path Issues on Windows
- Use forward slashes in paths: `C:/github/MCP-tutorial/...`
- Ensure `cwd` points to project root directory
- Verify Node.js is in system PATH

### Success Indicators
When working properly, you should see:
- Servers connect successfully in Claude Desktop logs
- No "Server transport closed unexpectedly" errors  
- Ability to call MCP tools from Claude Desktop
- Database queries execute successfully

### Getting Help
If issues persist:
1. Run `node debug-author-server.js` and share output
2. Check Claude Desktop logs for specific error messages  
3. Verify database is accessible outside of MCP context
4. Test individual servers with `node src/mcps/author-server/index.js --http`
