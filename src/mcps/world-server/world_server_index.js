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
            
            // Organization Management Handlers
            'create_organization': this.handleCreateOrganization,
            'get_organizations': this.handleGetOrganizations,
            
            // World Management Handlers
            'check_world_consistency': this.handleCheckWorldConsistency,
            'generate_world_guide': this.handleGenerateWorldGuide,
            
            // Cross-component Analysis Tools
            'get_world_overview': this.handleGetWorldOverview,
            'analyze_world_usage': this.handleAnalyzeWorldUsage
        };
        return handlers[toolName];
    }

    // =============================================
    // CROSS-COMPONENT ANALYSIS METHODS
    // These methods use multiple handlers together
    // =============================================
    
    async handleGetWorldOverview(args) {
        try {
            const { series_id } = args;
            
            // Get counts from each world component
            const locationCount = await this.db.query(
                'SELECT COUNT(*) as count FROM locations WHERE series_id = $1', 
                [series_id]
            );
            
            const worldElementCount = await this.db.query(
                'SELECT COUNT(*) as count FROM world_elements WHERE series_id = $1', 
                [series_id]
            );
            
            const organizationCount = await this.db.query(
                'SELECT COUNT(*) as count FROM organizations WHERE series_id = $1', 
                [series_id]
            );
            
            // Get recent additions
            const recentLocations = await this.db.query(
                'SELECT name, location_type FROM locations WHERE series_id = $1 ORDER BY created_at DESC LIMIT 3',
                [series_id]
            );
            
            const recentElements = await this.db.query(
                'SELECT name, element_type FROM world_elements WHERE series_id = $1 ORDER BY created_at DESC LIMIT 3',
                [series_id]
            );
            
            let overviewText = `World Overview for Series ${series_id}\n\n`;
            overviewText += `📍 Locations: ${locationCount.rows[0].count}\n`;
            overviewText += `🌟 World Elements: ${worldElementCount.rows[0].count}\n`;
            overviewText += `🏛️ Organizations: ${organizationCount.rows[0].count}\n\n`;
            
            if (recentLocations.rows.length > 0) {
                overviewText += `Recent Locations:\n`;
                recentLocations.rows.forEach(loc => {
                    overviewText += `  • ${loc.name} (${loc.location_type})\n`;
                });
                overviewText += '\n';
            }
            
            if (recentElements.rows.length > 0) {
                overviewText += `Recent World Elements:\n`;
                recentElements.rows.forEach(elem => {
                    overviewText += `  • ${elem.name} (${elem.element_type})\n`;
                });
            }
            
            return {
                content: [{
                    type: 'text',
                    text: overviewText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get world overview: ${error.message}`);
        }
    }

    async handleAnalyzeWorldUsage(args) {
        try {
            const { series_id, element_type, element_id } = args;
            
            // Get usage tracking data
            const usageQuery = `
                SELECT wu.*, b.title as book_title, ch.title as chapter_title, ch.chapter_number
                FROM world_element_usage wu
                LEFT JOIN books b ON wu.book_id = b.book_id
                LEFT JOIN chapters ch ON wu.chapter_id = ch.chapter_id
                WHERE wu.element_type = $1 AND wu.element_id = $2
                ORDER BY b.book_number, ch.chapter_number
            `;
            
            const usageResult = await this.db.query(usageQuery, [element_type, element_id]);
            
            if (usageResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No usage tracking found for ${element_type} ID ${element_id}`
                    }]
                };
            }
            
            let usageText = `Usage Analysis for ${element_type} ID ${element_id}\n\n`;
            usageText += `Total Appearances: ${usageResult.rows.length}\n\n`;
            
            usageResult.rows.forEach(usage => {
                usageText += `📚 ${usage.book_title || 'Unknown Book'}`;
                if (usage.chapter_title) {
                    usageText += ` - Chapter ${usage.chapter_number}: ${usage.chapter_title}`;
                }
                usageText += '\n';
                if (usage.usage_notes) {
                    usageText += `   Notes: ${usage.usage_notes}\n`;
                }
                usageText += '\n';
            });
            
            return {
                content: [{
                    type: 'text',
                    text: usageText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to analyze world usage: ${error.message}`);
        }
    }
}

export { WorldMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[WORLD-SERVER] Module loaded');
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    console.error('[WORLD-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(WorldMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[WORLD-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else if (isDirectExecution) {
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
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[WORLD-SERVER] Module imported - not starting server');
    }
}