#!/usr/bin/env node

// Quick script to verify that all MCP server files have been fixed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverFiles = [
    'src/mcps/author-server/index.js',
    'src/mcps/book-server/index.js', 
    'src/mcps/series-server/index.js',
    'src/mcps/timeline-server/index.js',
    'src/mcps/metadata-server/index.js'
];

console.log('🔍 Verifying MCP server fixes...');
console.log('');

let allFixed = true;

for (const serverFile of serverFiles) {
    const filePath = path.join(__dirname, serverFile);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if the file contains the MCP_STDIO_MODE check
        const hasFix = content.includes('!process.env.MCP_STDIO_MODE');
        const hasImport = content.includes("import { fileURLToPath } from 'url';");
        
        const serverName = path.basename(path.dirname(serverFile));
        
        if (hasFix && hasImport) {
            console.log(`✅ ${serverName}: Fixed correctly`);
        } else if (hasFix && !hasImport) {
            console.log(`⚠️  ${serverName}: Has MCP_STDIO_MODE check but missing import`);
            allFixed = false;
        } else {
            console.log(`❌ ${serverName}: Not fixed - missing MCP_STDIO_MODE check`);
            allFixed = false;
        }
    } catch (error) {
        console.log(`❌ ${serverFile}: Error reading file - ${error.message}`);
        allFixed = false;
    }
}

console.log('');

if (allFixed) {
    console.log('🎉 All MCP servers have been fixed!');
    console.log('');
    console.log('The fix prevents the CLI runner from executing when:');
    console.log('- MCP_STDIO_MODE environment variable is set to "true"');
    console.log('- This happens when Claude Desktop runs the servers');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart Claude Desktop to pick up the changes');
    console.log('2. Test the author-server connection');
    console.log('3. Run the debug script if issues persist: node debug-author-server.js');
} else {
    console.log('❌ Some servers still need fixing. Please check the errors above.');
}
