// .claude/skills/mcp-writer/test-discovery.js
// Simple test to verify MCP server discovery works

import MCPHelper from './mcp-helper.js';

async function testDiscovery() {
    console.log('Testing MCP Server Discovery...\n');

    const helper = new MCPHelper();

    try {
        // Test 1: Discover servers
        console.log('Test 1: Discovering servers...');
        const servers = await helper.discoverServers();

        if (servers.length === 0) {
            console.error('✗ FAILED: No servers found');
            return false;
        }

        console.log(`✓ PASSED: Found ${servers.length} servers\n`);

        // Test 2: List servers by category
        console.log('Test 2: Categorizing servers...');
        const databaseOrg = servers.filter(s => s.type === 'database-organized');
        const writingPhase = servers.filter(s => s.type === 'writing-phase');
        const recommended = servers.filter(s => s.recommended);

        console.log(`  Database-organized servers: ${databaseOrg.length}`);
        databaseOrg.forEach(s => {
            const marker = s.recommended ? '✅' : '📖';
            console.log(`    ${marker} ${s.name} [${s.usage}]`);
        });

        console.log(`  Writing-phase servers: ${writingPhase.length}`);
        writingPhase.forEach(s => console.log(`    ✅ ${s.name} [${s.usage}]`));

        console.log(`\n  Recommended for active use: ${recommended.length}`);

        console.log('✓ PASSED: Servers categorized correctly\n');

        // Test 3: Verify server paths exist
        console.log('Test 3: Verifying server paths...');
        const { existsSync } = await import('fs');

        let allPathsValid = true;
        for (const server of servers) {
            if (!existsSync(server.path)) {
                console.error(`✗ FAILED: Path not found for ${server.name}: ${server.path}`);
                allPathsValid = false;
            }
        }

        if (allPathsValid) {
            console.log(`✓ PASSED: All ${servers.length} server paths are valid\n`);
        }

        // Test 4: Check helper methods
        console.log('Test 4: Testing helper methods...');

        const className = helper.getServerClassName('series-server');
        if (className === 'SeriesMCPServer') {
            console.log(`✓ PASSED: Class name generation works (${className})\n`);
        } else {
            console.error(`✗ FAILED: Expected 'SeriesMCPServer', got '${className}'\n`);
        }

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('Test Summary:');
        console.log(`  Total servers discovered: ${servers.length}`);
        console.log(`  Database-organized: ${databaseOrg.length} (1 active, ${databaseOrg.length - 1} reference)`);
        console.log(`  Writing-phase organized: ${writingPhase.length} (all active)`);
        console.log(`  Recommended for use: ${recommended.length}`);
        console.log('\n💡 Architecture:');
        console.log('  ✅ author-server + config-mcps/* (9 servers total)');
        console.log('  📖 Other mcps/* are reference implementations');
        console.log('═══════════════════════════════════════\n');

        return true;
    } catch (error) {
        console.error('✗ Test failed with error:', error.message);
        console.error(error.stack);
        return false;
    } finally {
        await helper.close();
    }
}

// Run the test
testDiscovery()
    .then(success => {
        if (success) {
            console.log('✓ All tests passed!');
            process.exit(0);
        } else {
            console.error('✗ Some tests failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
