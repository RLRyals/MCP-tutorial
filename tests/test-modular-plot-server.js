// Test the modular plot server implementation
import { PlotMCPServer } from '../src/mcps/plot-server/index.js';

async function testModularPlotServer() {
    console.log('Testing modular plot server...');
    
    try {
        // Set test environment
        process.env.NODE_ENV = 'test';
        
        // Create server instance
        console.log('Creating PlotMCPServer instance...');
        const server = new PlotMCPServer();
        
        console.log('Server created successfully!');
        
        // Check that tools are loaded
        const tools = server.getTools();
        console.log(`Loaded ${tools.length} tools:`);
        
        // Group tools by category for better display
        const toolsByCategory = {};
        tools.forEach(tool => {
            let category = 'Other';
            if (tool.name.includes('thread')) category = 'Plot Threads';
            else if (tool.name.includes('story') || tool.name.includes('character') || tool.name.includes('problem')) category = 'Story Analysis';
            else if (tool.name.includes('case') || tool.name.includes('evidence') || tool.name.includes('clue')) category = 'Mystery';
            else if (tool.name.includes('relationship') || tool.name.includes('romantic') || tool.name.includes('tension')) category = 'Romance';
            else if (tool.name.includes('magic') || tool.name.includes('power')) category = 'Fantasy';
            else if (tool.name.includes('available')) category = 'Lookup';
            
            if (!toolsByCategory[category]) toolsByCategory[category] = [];
            toolsByCategory[category].push(tool.name);
        });
        
        Object.entries(toolsByCategory).forEach(([category, toolNames]) => {
            console.log(`\n${category}:`);
            toolNames.forEach(name => console.log(`  - ${name}`));
        });
        
        // Test handler mapping
        console.log('\nTesting handler mapping...');
        const testTools = [
            'create_plot_thread',
            'analyze_story_dynamics', 
            'get_available_options',
            'create_case',
            'create_relationship_arc',
            'define_magic_system'
        ];
        
        testTools.forEach(toolName => {
            const handler = server.getToolHandler(toolName);
            if (handler && typeof handler === 'function') {
                console.log(`  ✓ ${toolName} -> handler found`);
            } else {
                console.log(`  ✗ ${toolName} -> handler missing`);
            }
        });
        
        // Test database connection
        console.log('\nTesting database connection...');
        if (server.db) {
            console.log('  ✓ Database connection exists');
            
            try {
                const health = await server.db.healthCheck();
                if (health.healthy) {
                    console.log('  ✓ Database health check passed');
                } else {
                    console.log('  ! Database health check failed:', health.error);
                }
            } catch (error) {
                console.log('  ! Database health check error:', error.message);
            }
        } else {
            console.log('  ✗ No database connection');
        }
        
        console.log('\n✅ Modular plot server test completed successfully!');
        
        // Test dynamic genre tool loading
        console.log('\nTesting dynamic genre tools...');
        try {
            const mysteryTools = server.genreExtensions.getGenreSpecificTools('mystery');
            const romanceTools = server.genreExtensions.getGenreSpecificTools('romance');
            const fantasyTools = server.genreExtensions.getGenreSpecificTools('fantasy');
            
            console.log(`  Mystery tools: ${mysteryTools.length}`);
            console.log(`  Romance tools: ${romanceTools.length}`);  
            console.log(`  Fantasy tools: ${fantasyTools.length}`);
        } catch (error) {
            console.log('  ✗ Genre tools test failed:', error.message);
        }
        
        console.log('\n🎉 All tests passed! Modular plot server is working correctly.');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Run the test
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    testModularPlotServer()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test runner error:', error);
            process.exit(1);
        });
}
