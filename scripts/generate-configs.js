#!/usr/bin/env node

// scripts/generate-configs.js - Generate MCP configuration files for Claude Desktop and Typing Mind
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load environment variables from .env file
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('No .env file found. Using template.env as reference and environment variables.');
}

// Default configuration
const config = {
    // Core paths
    MCP_TUTORIAL_PATH: process.env.MCP_TUTORIAL_PATH || process.cwd(),
    
    // Database settings
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://your_db_user:your_secure_password@localhost:5432/mcp_series',
    
    // HTTP server settings for Typing Mind
    MCP_SERVER_HOST: process.env.MCP_SERVER_HOST || 'localhost',
    MCP_SERVER_PORT: process.env.MCP_SERVER_PORT || '3500',
};

// Construct the server URL for Typing Mind
config.MCP_SERVER_URL = `http://${config.MCP_SERVER_HOST}:${config.MCP_SERVER_PORT}`;

// Auto-discover available MCP servers by scanning the mcps directory
function discoverMCPServers() {
    const mcpsDir = path.join(projectRoot, 'src', 'mcps');
    const mcpServers = [];
    
    try {
        const entries = fs.readdirSync(mcpsDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const serverPath = path.join(mcpsDir, entry.name);
                const indexPath = path.join(serverPath, 'index.js');
                
                // Check if the directory has an index.js file
                if (fs.existsSync(indexPath)) {
                    // Convert directory name to display name
                    const displayName = entry.name
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    mcpServers.push({
                        name: entry.name,
                        displayName: displayName,
                        description: `Manage ${displayName.toLowerCase()} functionality`,
                        endpoint: `/${entry.name}`
                    });
                }
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not scan MCP servers directory: ${error.message}`);
        // Return empty array - templates will still work but no servers will be listed
        return [];
    }
    
    return mcpServers.sort((a, b) => a.name.localeCompare(b.name));
}

// Get available MCP servers
const mcpServers = discoverMCPServers();

function replacePlaceholders(template, replacements) {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    return result;
}

function generateClaudeDesktopConfig() {
    const templatePath = path.join(projectRoot, 'config', 'claude-desktop.template.json');
    const outputPath = path.join(projectRoot, 'config', 'claude-desktop.json');
    
    if (!fs.existsSync(templatePath)) {
        console.error(`Template not found: ${templatePath}`);
        return false;
    }
    
    const template = fs.readFileSync(templatePath, 'utf8');
    const generated = replacePlaceholders(template, config);
    
    // Parse and pretty-print the JSON
    try {
        const parsed = JSON.parse(generated);
        const formatted = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(outputPath, formatted);
        console.log(`✅ Generated Claude Desktop config: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating Claude Desktop config: ${error.message}`);
        return false;
    }
}

function generateTypingMindConfig() {
    const templatePath = path.join(projectRoot, 'config', 'typing-mind.template.json');
    const outputPath = path.join(projectRoot, 'config', 'typing-mind.json');
    
    if (!fs.existsSync(templatePath)) {
        console.error(`Template not found: ${templatePath}`);
        return false;
    }
    
    const template = fs.readFileSync(templatePath, 'utf8');
    const generated = replacePlaceholders(template, config);
    
    // Parse and pretty-print the JSON
    try {
        const parsed = JSON.parse(generated);
        const formatted = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(outputPath, formatted);
        console.log(`✅ Generated Typing Mind config: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating Typing Mind config: ${error.message}`);
        return false;
    }
}

function generateDynamicTypingMindConfig() {
    // Generate a dynamic config based on available servers
    const dynamicConfig = {
        mcpServers: {}
    };
    
    // Add individual servers
    mcpServers.forEach(server => {
        dynamicConfig.mcpServers[`mcp-tutorial-${server.name}`] = {
            url: `${config.MCP_SERVER_URL}${server.endpoint}`,
            name: server.displayName,
            description: server.description
        };
    });
    
    // Add composite server
    dynamicConfig.mcpServers['mcp-tutorial-composite'] = {
        url: `${config.MCP_SERVER_URL}/composite/message`,
        name: 'Series Management Composite',
        description: 'All series management tools in one server'
    };
    
    const outputPath = path.join(projectRoot, 'config', 'typing-mind.json');
    const formatted = JSON.stringify(dynamicConfig, null, 2);
    fs.writeFileSync(outputPath, formatted);
    console.log(`✅ Generated dynamic Typing Mind config: ${outputPath}`);
    return true;
}

function showConfig() {
    console.log('\n📋 Current Configuration:');
    console.log('=' .repeat(50));
    for (const [key, value] of Object.entries(config)) {
        console.log(`${key.padEnd(20)}: ${value}`);
    }
    console.log('=' .repeat(50));
    
    console.log('\n🔧 Available MCP Servers:');
    mcpServers.forEach((server, index) => {
        console.log(`${index + 1}. ${server.displayName}`);
        console.log(`   Endpoint: ${server.endpoint}`);
        console.log(`   Description: ${server.description}`);
    });
    console.log();
}

function showUsage() {
    console.log(`
🔧 MCP Configuration Generator

Usage: node scripts/generate-configs.js [options]

Options:
  --claude        Generate Claude Desktop configuration only
  --typing-mind   Generate Typing Mind configuration only  
  --show-config   Show current configuration values
  --help          Show this help message

Examples:
  node scripts/generate-configs.js                    # Generate both configs
  node scripts/generate-configs.js --claude           # Generate Claude config only
  node scripts/generate-configs.js --typing-mind      # Generate Typing Mind config only
  node scripts/generate-configs.js --show-config      # Show current settings

Environment Variables:
  MCP_TUTORIAL_PATH    Path to the MCP tutorial project (default: current directory)
  NODE_ENV             Node environment (default: development)
  DATABASE_URL         PostgreSQL connection string
  MCP_SERVER_HOST      HTTP server host for Typing Mind (default: localhost)
  MCP_SERVER_PORT      HTTP server port for Typing Mind (default: 3500)

Configuration files will be generated in the config/ directory.
`);
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        showUsage();
        return;
    }
    
    if (args.includes('--show-config')) {
        showConfig();
        return;
    }
    
    console.log('🚀 MCP Configuration Generator');
    console.log('=' .repeat(50));
    
    let success = true;
    
    if (args.includes('--claude')) {
        success = generateClaudeDesktopConfig() && success;
    } else if (args.includes('--typing-mind')) {
        success = generateDynamicTypingMindConfig() && success;
    } else {
        // Generate both by default
        success = generateClaudeDesktopConfig() && success;
        success = generateDynamicTypingMindConfig() && success;
    }
    
    if (success) {
        console.log('\n🎉 Configuration generation completed successfully!');
        
        if (!args.includes('--typing-mind')) {
            console.log('\n📝 Next steps for Claude Desktop:');
            console.log('1. Ensure your database is running: .\\scripts\\start-database.ps1');
            console.log('2. Copy the content from config/claude-desktop.json');
            console.log('3. Add it to your Claude Desktop MCP settings');
            console.log('4. Restart Claude Desktop');
        }
        
        if (!args.includes('--claude')) {
            console.log('\n📝 Next steps for Typing Mind:');
            console.log('1. Start the HTTP server: npm run start:http');
            console.log('2. Import config/typing-mind.json into Typing Mind');
            console.log('3. Test the MCP connections');
        }
    } else {
        console.log('\n❌ Some configurations failed to generate. Check the errors above.');
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateClaudeDesktopConfig, generateTypingMindConfig, mcpServers, config };
