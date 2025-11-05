// .claude/skills/mcp-writer/examples.js
// Example usage patterns for the MCP Writer Skill

import MCPHelper, { listAllSeries, getSeriesFullDetails, createNewSeries } from './mcp-helper.js';

/**
 * Example 1: Basic Discovery and Connection
 */
export async function example1_discovery() {
    console.log('=== Example 1: Discover Available MCP Servers ===\n');

    const helper = new MCPHelper();

    try {
        // Discover all available servers
        const servers = await helper.discoverServers();

        console.log(`Found ${servers.length} MCP servers:\n`);

        // Group by type
        const mainServers = servers.filter(s => s.type === 'main');
        const configServers = servers.filter(s => s.type === 'config');

        console.log('Main Writing Tools:');
        mainServers.forEach(s => console.log(`  - ${s.name}`));

        console.log('\nConfiguration Tools:');
        configServers.forEach(s => console.log(`  - ${s.name}`));

        return servers;
    } finally {
        await helper.close();
    }
}

/**
 * Example 2: List Tools for a Specific Server
 */
export async function example2_listTools() {
    console.log('\n=== Example 2: List Tools for Series Server ===\n');

    const helper = new MCPHelper();

    try {
        const tools = await helper.listTools('series-server');

        console.log(`Series Server has ${tools.length} tools:\n`);

        tools.forEach(tool => {
            console.log(`  ${tool.name}`);
            console.log(`    Description: ${tool.description}`);
            console.log(`    Parameters: ${JSON.stringify(tool.inputSchema.properties || {}, null, 2)}`);
            console.log('');
        });

        return tools;
    } finally {
        await helper.close();
    }
}

/**
 * Example 3: Simple Tool Call - List Series
 */
export async function example3_listSeries() {
    console.log('\n=== Example 3: List All Series ===\n');

    const helper = new MCPHelper();

    try {
        const series = await helper.callTool('series-server', 'list_series', {});

        console.log(`Found ${series.length} series:\n`);

        series.forEach(s => {
            console.log(`  [${s.series_id}] ${s.title}`);
            if (s.genre) console.log(`      Genre: ${s.genre}`);
            if (s.status) console.log(`      Status: ${s.status}`);
            console.log('');
        });

        return series;
    } finally {
        await helper.close();
    }
}

/**
 * Example 4: Get Detailed Information
 */
export async function example4_getSeriesDetails(seriesId = 1) {
    console.log(`\n=== Example 4: Get Details for Series ${seriesId} ===\n`);

    const helper = new MCPHelper();

    try {
        const series = await helper.callTool('series-server', 'get_series', { series_id: seriesId });

        console.log('Series Information:');
        console.log(`  Title: ${series.title}`);
        console.log(`  Author ID: ${series.author_id}`);
        console.log(`  Genre: ${series.genre || 'Not set'}`);
        console.log(`  Status: ${series.status || 'Not set'}`);
        console.log(`  Description: ${series.description || 'No description'}`);

        return series;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    } finally {
        await helper.close();
    }
}

/**
 * Example 5: Batch Operations
 */
export async function example5_batchOperations() {
    console.log('\n=== Example 5: Batch Tool Calls ===\n');

    const helper = new MCPHelper();

    try {
        const calls = [
            { tool: 'list_series', args: {} },
            { tool: 'get_series', args: { series_id: 1 } },
            { tool: 'get_series', args: { series_id: 999 } } // This will fail
        ];

        const results = await helper.batchCall('series-server', calls);

        console.log('Batch Results:\n');

        results.forEach((result, idx) => {
            console.log(`  Call ${idx + 1} (${calls[idx].tool}):`);
            if (result.success) {
                console.log(`    ✓ Success`);
                console.log(`    Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
            } else {
                console.log(`    ✗ Failed: ${result.error}`);
            }
            console.log('');
        });

        return results;
    } finally {
        await helper.close();
    }
}

/**
 * Example 6: Multi-Server Workflow
 */
export async function example6_workflow(seriesId = 1) {
    console.log(`\n=== Example 6: Multi-Server Workflow for Series ${seriesId} ===\n`);

    const helper = new MCPHelper();

    try {
        const workflow = {
            steps: [
                {
                    server: 'series-server',
                    tool: 'get_series',
                    args: { series_id: seriesId },
                    save: 'series'
                },
                {
                    server: 'character-server',
                    tool: 'list_characters',
                    args: { series_id: seriesId },
                    save: 'characters',
                    optional: true
                },
                {
                    server: 'book-server',
                    tool: 'list_books',
                    args: { series_id: seriesId },
                    save: 'books',
                    optional: true
                }
            ]
        };

        const result = await helper.executeWorkflow(workflow);

        console.log('Workflow Results:\n');

        if (result.success) {
            console.log('✓ Workflow completed successfully\n');

            console.log(`Series: ${result.context.series?.title || 'Unknown'}`);
            console.log(`Characters: ${result.context.characters?.length || 0}`);
            console.log(`Books: ${result.context.books?.length || 0}`);
        } else {
            console.log('✗ Workflow had errors\n');

            result.results.forEach((step, idx) => {
                console.log(`  Step ${idx + 1}: ${step.success ? '✓' : '✗'}`);
                if (!step.success) {
                    console.log(`    Error: ${step.error}`);
                }
            });
        }

        return result;
    } finally {
        await helper.close();
    }
}

/**
 * Example 7: Using Quick Helper Functions
 */
export async function example7_quickHelpers() {
    console.log('\n=== Example 7: Quick Helper Functions ===\n');

    try {
        // List all series using quick function
        console.log('Using listAllSeries():');
        const series = await listAllSeries();
        console.log(`  Found ${series.length} series\n`);

        // Get full details for first series
        if (series.length > 0) {
            console.log(`Using getSeriesFullDetails(${series[0].series_id}):`);
            const details = await getSeriesFullDetails(series[0].series_id);

            console.log(`  Series: ${details.series?.title}`);
            console.log(`  Characters: ${details.characters?.length || 0}`);
            console.log(`  Books: ${details.books?.length || 0}`);
            console.log(`  Plots: ${details.plots?.length || 0}`);
        }

        return { series };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

/**
 * Example 8: Connection Summary
 */
export async function example8_connectionSummary() {
    console.log('\n=== Example 8: Connection Summary ===\n');

    const helper = new MCPHelper();

    try {
        // Connect to multiple servers
        await helper.connectToServer('series-server');
        await helper.connectToServer('character-server');
        await helper.connectToServer('book-server');

        // Get summary
        const summary = helper.getConnectionSummary();

        console.log(`Connected to ${summary.connected} servers:\n`);

        summary.servers.forEach(server => {
            console.log(`  ${server.name} (${server.type})`);
            console.log(`    Tools: ${server.toolCount}`);
            console.log(`    Available: ${server.tools.join(', ')}`);
            console.log('');
        });

        return summary;
    } finally {
        await helper.close();
    }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     MCP Writer Skill - Example Demonstrations          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
        await example1_discovery();
        await example2_listTools();
        await example3_listSeries();

        // These examples may fail if no data exists yet
        try {
            await example4_getSeriesDetails(1);
        } catch (e) {
            console.log('Note: Series details example skipped (no data yet)');
        }

        await example5_batchOperations();

        try {
            await example6_workflow(1);
        } catch (e) {
            console.log('Note: Workflow example skipped (no data yet)');
        }

        await example7_quickHelpers();
        await example8_connectionSummary();

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║     All examples completed!                            ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('\nFatal error running examples:', error.message);
        console.error(error.stack);
    }
}

// If run directly, execute all examples
if (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url.replace(/\/{3,}/g, '///') === `file:///${process.argv[1]}`.replace(/\/{3,}/g, '///')) {
    runAllExamples().catch(console.error);
}
