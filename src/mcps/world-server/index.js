// src/mcps/world-server/index.js
// FIXED VERSION - Modular World MCP Server with proper method binding
// Designed for AI Writing Teams to manage comprehensive fictional worlds

// Protect stdout from any pollution in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { LocationHandlers } from './handlers/location-handlers.js';
import { WorldElementHandlers } from './handlers/world-element-handlers.js';
import { OrganizationHandlers } from './handlers/organization-handlers.js';
import { WorldManagementHandlers } from './handlers/world-management-handlers.js';

class WorldMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[WORLD-SERVER] Constructor starting...');
        try {
            super('world-manager', '1.0.0');
            console.error('[WORLD-SERVER] Base constructor completed');
        } catch (error) {
            console.error('[WORLD-SERVER] Constructor failed:', error.message);
            throw error;
        }
        
        // Initialize handler modules with database connection
        this.locationHandlers = new LocationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldManagementHandlers = new WorldManagementHandlers(this.db);
        
        // FIXED: Properly bind handler methods to maintain context
        this.bindHandlerMethods();
        
        // Initialize tools after handlers are bound
        this.tools = this.getTools();
        
        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[WORLD-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools();
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[WORLD-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        // Test database connection on startup
        this.testDatabaseConnection();
    }

    // FIXED: Proper method binding to maintain context
    bindHandlerMethods() {
        // Bind location handler methods
        this.handleCreateLocation = this.locationHandlers.handleCreateLocation.bind(this.locationHandlers);
        this.handleUpdateLocation = this.locationHandlers.handleUpdateLocation.bind(this.locationHandlers);
        this.handleGetLocations = this.locationHandlers.handleGetLocations.bind(this.locationHandlers);
        this.handleTrackLocationUsage = this.locationHandlers.handleTrackLocationUsage.bind(this.locationHandlers);
        
        // Bind world element handler methods
        this.handleCreateWorldElement = this.worldElementHandlers.handleCreateWorldElement.bind(this.worldElementHandlers);
        this.handleUpdateWorldElement = this.worldElementHandlers.handleUpdateWorldElement.bind(this.worldElementHandlers);
        this.handleGetWorldElements = this.worldElementHandlers.handleGetWorldElements.bind(this.worldElementHandlers);
        this.handleTrackElementUsage = this.worldElementHandlers.handleTrackElementUsage.bind(this.worldElementHandlers);

        // Bind organization handler methods
        this.handleCreateOrganization = this.organizationHandlers.handleCreateOrganization.bind(this.organizationHandlers);
        this.handleGetOrganizations = this.organizationHandlers.handleGetOrganizations.bind(this.organizationHandlers);
        this.handleTrackOrganizationActivity = this.organizationHandlers.handleTrackOrganizationActivity.bind(this.organizationHandlers);
        this.handleUpdateOrganization = this.organizationHandlers.handleUpdateOrganization.bind(this.organizationHandlers);

        // Bind world management handler methods
        this.handleCheckWorldConsistency = this.worldManagementHandlers.handleCheckWorldConsistency.bind(this.worldManagementHandlers);
        this.handleGenerateWorldGuide = this.worldManagementHandlers.handleGenerateWorldGuide.bind(this.worldManagementHandlers);
        this.handleValidateWorldRelationships = this.worldManagementHandlers.handleValidateWorldRelationships.bind(this.worldManagementHandlers);
        this.handleAnalyzeWorldComplexity = this.worldManagementHandlers.handleAnalyzeWorldComplexity.bind(this.worldManagementHandlers);
        this.handleFindWorldGaps = this.worldManagementHandlers.handleFindWorldGaps.bind(this.worldManagementHandlers);
        this.handleGetWorldOverview = this.worldManagementHandlers.handleGetWorldOverview.bind(this.worldManagementHandlers);
        this.handleAnalyzeWorldUsage = this.worldManagementHandlers.handleAnalyzeWorldUsage.bind(this.worldManagementHandlers);
    }

    async testDatabaseConnection() {
        try {
            if (this.db) {
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[WORLD-SERVER] Database connection verified');
                } else {
                    console.error('[WORLD-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[WORLD-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // COMPLETE TOOL REGISTRATION
    // =============================================
    getTools() {
        return [
            // Location Management Tools
            ...this.locationHandlers.getLocationTools(),
            
            // World Element Management Tools  
            ...this.worldElementHandlers.getWorldElementTools(),
            
            // Organization Management Tools
            ...this.organizationHandlers.getOrganizationTools(),
            
            // World Management Tools
            ...this.worldManagementHandlers.getWorldManagementTools()
        ];
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Location Management Handlers
            'create_location': this.handleCreateLocation,
            'update_location': this.handleUpdateLocation,
            'get_locations': this.handleGetLocations,
            'track_location_usage': this.handleTrackLocationUsage,
            
            // World Element Management Handlers
            'create_world_element': this.handleCreateWorldElement,
            'update_world_element': this.handleUpdateWorldElement,
            'get_world_elements': this.handleGetWorldElements,
            'track_element_usage': this.handleTrackElementUsage,

            // Organization Management Handlers
            'create_organization': this.handleCreateOrganization,
            'get_organizations': this.handleGetOrganizations,
            'track_organization_activity': this.handleTrackOrganizationActivity,
            'update_organization': this.handleUpdateOrganization,

            // World Management Handlers
            'check_world_consistency': this.handleCheckWorldConsistency,
            'generate_world_guide': this.handleGenerateWorldGuide,
            'validate_world_relationships': this.handleValidateWorldRelationships,
            'analyze_world_complexity': this.handleAnalyzeWorldComplexity,
            'find_world_gaps': this.handleFindWorldGaps,

            // Cross-component Analysis Tools
            'get_world_overview': this.handleGetWorldOverview,
            'analyze_world_usage': this.handleAnalyzeWorldUsage
        };
        return handlers[toolName];
    }
}

export { WorldMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[WORLD-SERVER] Module loaded');
}

// Normalize paths for cross-platform compatibility (Windows and Mac)
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
// Handle Windows paths
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    // Handle Mac/Unix paths
    scriptPath = `file://${scriptPath}`;
}
// Decode the URLs to ensure proper comparison
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

// Prioritize MCP_STDIO_MODE environment variable
if (process.env.MCP_STDIO_MODE === 'true') {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[WORLD-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[WORLD-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[WORLD-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[WORLD-SERVER] Creating server instance...');
        const server = new WorldMCPServer();
        console.error('[WORLD-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[WORLD-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[WORLD-SERVER] Failed to start MCP server:', error.message);
        console.error('[WORLD-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running as CLI (direct node execution)
    console.error('[WORLD-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(WorldMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[WORLD-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    // Module was imported, not directly executed
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[WORLD-SERVER] Module imported - not starting server');
    }
}