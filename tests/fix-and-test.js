#!/usr/bin/env node
// fix-and-test.js - Regenerate configuration and test MCP server
import { generateClaudeDesktopConfig } from '../scripts/generate-configs.js';

console.error('🔧 Regenerating Claude Desktop configuration with MCP_STDIO_MODE...');

try {
    const success = generateClaudeDesktopConfig();
    if (success) {
        console.error('✅ Configuration regenerated successfully');
        console.error('\n📋 Next steps:');
        console.error('1. Restart Claude Desktop');
        console.error('2. Test MCP tools (e.g., "List all authors")');
        console.error('3. The JSON parsing errors should now be resolved');
        console.error('\nNote: The MCP_STDIO_MODE environment variable will completely suppress stdout pollution');
    } else {
        console.error('❌ Failed to regenerate configuration');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error during configuration generation:', error.message);
    process.exit(1);
}
