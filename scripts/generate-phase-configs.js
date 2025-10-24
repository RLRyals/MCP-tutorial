#!/usr/bin/env node

// scripts/generate-phase-configs.js - Generate MCP configuration for writing phase tools
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load environment variables from .env file
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath }, { silent: true });
} else {
    console.warn('No .env file found. Using environment variables.');
}

// Default configuration
const config = {
    // Core paths
    MCP_TUTORIAL_PATH: process.env.MCP_TUTORIAL_PATH || process.cwd(),

    // Environment settings
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Genre-specific index files (future feature)
    GENRE: process.env.GENRE || null, // e.g., 'romance', 'mystery', etc.
};

// Auto-discover available MCP servers in config-mcps directory
function discoverPhaseServers() {
    const configMcpsDir = path.join(projectRoot, 'src', 'config-mcps');
    const phaseServers = [];

    // Optional servers from the regular mcps directory
    const optionalMcpsServers = ['author-server'];
    const includeOptional = process.env.INCLUDE_OPTIONAL_SERVERS === 'true';

    try {
        // Scan config-mcps directory
        if (fs.existsSync(configMcpsDir)) {
            const entries = fs.readdirSync(configMcpsDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const serverPath = path.join(configMcpsDir, entry.name);

                    // Determine which index file to use
                    let indexFileName = 'index.js';

                    // Future: Check for genre-specific index files
                    if (config.GENRE) {
                        const genreIndexFile = `index-${config.GENRE}.js`;
                        const genreIndexPath = path.join(serverPath, genreIndexFile);
                        if (fs.existsSync(genreIndexPath)) {
                            indexFileName = genreIndexFile;
                        } else {
                            console.warn(`⚠️  Genre-specific file ${genreIndexFile} not found for ${entry.name}, using default index.js`);
                        }
                    }

                    const indexPath = path.join(serverPath, indexFileName);

                    // Check if index file exists
                    if (fs.existsSync(indexPath)) {
                        // Convert directory name to display name
                        const displayName = entry.name
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());

                        phaseServers.push({
                            name: entry.name,
                            displayName: displayName,
                            description: `Manage ${displayName.toLowerCase()} functionality`,
                            path: indexPath,
                            source: 'config-mcps'
                        });
                    }
                }
            }
        }

        // Add optional servers from regular mcps directory if requested
        if (includeOptional) {
            const mcpsDir = path.join(projectRoot, 'src', 'mcps');

            for (const serverName of optionalMcpsServers) {
                const serverPath = path.join(mcpsDir, serverName);

                if (fs.existsSync(serverPath)) {
                    const indexPath = path.join(serverPath, 'index.js');

                    if (fs.existsSync(indexPath)) {
                        const displayName = serverName
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());

                        phaseServers.push({
                            name: serverName,
                            displayName: displayName,
                            description: `Manage ${displayName.toLowerCase()} functionality`,
                            path: indexPath,
                            source: 'mcps'
                        });

                        console.log(`✨ Including optional server: ${serverName}`);
                    }
                }
            }
        } else {
            console.log(`⏭️  Skipping optional servers (set INCLUDE_OPTIONAL_SERVERS=true to include: ${optionalMcpsServers.join(', ')})`);
        }

    } catch (error) {
        console.warn(`Warning: Could not scan phase servers directory: ${error.message}`);
        return [];
    }

    return phaseServers.sort((a, b) => a.name.localeCompare(b.name));
}

// Get available phase servers
const phaseServers = discoverPhaseServers();

function generateClaudeDesktopPhaseConfig() {
    const outputPath = path.join(projectRoot, 'config', 'claude-desktop-phase.json');

    try {
        // Start with an empty config structure
        const dynamicConfig = {
            mcpServers: {}
        };

        // Add each discovered phase server to the config
        phaseServers.forEach(server => {
            // Platform-specific path handling
            let scriptPath;

            // For Mac/Linux, use absolute path with forward slashes
            if (process.platform === 'darwin' || process.platform === 'linux') {
                scriptPath = path.resolve(server.path);
            } else {
                // For Windows, normalize with forward slashes
                scriptPath = server.path.replace(/\\/g, '/');
            }

            // Determine correct node command path
            let nodeCommand = 'node';

            // On macOS, check if we need to use full node path
            if (process.platform === 'darwin' && process.env.NODE_PATH) {
                nodeCommand = process.env.NODE_PATH;
            }

            // Add server configuration
            dynamicConfig.mcpServers[server.name] = {
                command: nodeCommand,
                args: [scriptPath],
                env: {
                    NODE_ENV: config.NODE_ENV,
                    MCP_STDIO_MODE: 'true'
                }
            };
        });

        // Write the formatted config
        const formatted = JSON.stringify(dynamicConfig, null, 2);
        fs.writeFileSync(outputPath, formatted);
        console.log(`✅ Generated Claude Desktop phase config: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating Claude Desktop phase config: ${error.message}`);
        return false;
    }
}

function showConfig() {
    console.log('\n📋 Current Configuration:');
    console.log('='.repeat(50));
    for (const [key, value] of Object.entries(config)) {
        console.log(`${key.padEnd(20)}: ${value || 'not set'}`);
    }
    console.log('='.repeat(50));

    console.log('\n🔧 Available Phase Servers:');
    phaseServers.forEach((server, index) => {
        console.log(`${index + 1}. ${server.displayName} (${server.source})`);
        console.log(`   Path: ${server.path}`);
    });
    console.log();
}

function showUsage() {
    console.log(`
🔧 MCP Phase Configuration Generator

Usage: node scripts/generate-phase-configs.js [options]

Options:
  --show-config   Show current configuration values
  --copy          Generate config and copy to Claude Desktop config location
  --help          Show this help message

Examples:
  node scripts/generate-phase-configs.js                 # Generate phase config
  node scripts/generate-phase-configs.js --copy          # Generate and copy to Claude Desktop
  node scripts/generate-phase-configs.js --show-config   # Show current settings

Environment Variables:
  MCP_TUTORIAL_PATH          Path to the MCP tutorial project (default: current directory)
  NODE_ENV                   Node environment (default: development)
  GENRE                      Genre-specific index file (e.g., 'romance', 'mystery') - future feature
  INCLUDE_OPTIONAL_SERVERS   Include optional servers from mcps/ like author-server (default: false)

Configuration file will be generated at: config/claude-desktop-phase.json
`);
}

function copyToClaudeDesktop() {
    const sourcePath = path.join(projectRoot, 'config', 'claude-desktop-phase.json');

    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source file not found: ${sourcePath}`);
        return false;
    }

    try {
        let destPath;

        if (process.platform === 'darwin') {
            // macOS
            destPath = path.join(process.env.HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        } else if (process.platform === 'win32') {
            // Windows
            destPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
        } else {
            console.error('❌ Unsupported platform for automatic copy');
            return false;
        }

        console.log(`\n📋 Copying to Claude Desktop config location...`);
        console.log(`   Source: ${sourcePath}`);
        console.log(`   Dest:   ${destPath}`);

        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy the file
        fs.copyFileSync(sourcePath, destPath);

        console.log('✅ Successfully copied to Claude Desktop config location');
        console.log('⚠️  Please restart Claude Desktop for changes to take effect');
        return true;
    } catch (error) {
        console.error(`❌ Error copying to Claude Desktop: ${error.message}`);
        return false;
    }
}

function showCopyInstructions() {
    const sourcePath = path.join(projectRoot, 'config', 'claude-desktop-phase.json');

    console.log('\n📝 Manual copy instructions:');
    console.log('='.repeat(50));

    if (process.platform === 'darwin') {
        // macOS
        const destPath = '~/Library/Application\\ Support/Claude/claude_desktop_config.json';
        console.log('macOS:');
        console.log(`  cp "${sourcePath}" ${destPath}`);
    } else if (process.platform === 'win32') {
        // Windows
        console.log('Windows (PowerShell):');
        console.log(`  Copy-Item "${sourcePath}" "$env:APPDATA\\Claude\\claude_desktop_config.json"`);
    } else {
        console.log('Linux:');
        console.log(`  cp "${sourcePath}" ~/.config/Claude/claude_desktop_config.json`);
    }

    console.log('='.repeat(50));
    console.log('\n⚠️  After copying, restart Claude Desktop for changes to take effect');
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

    console.log('🚀 MCP Phase Configuration Generator');
    console.log('='.repeat(50));

    // Debug: Show current config values
    console.log(`📂 Project Path: ${config.MCP_TUTORIAL_PATH}`);
    console.log(`🌐 Environment: ${config.NODE_ENV}`);
    if (config.GENRE) {
        console.log(`📚 Genre: ${config.GENRE}`);
    }
    console.log('='.repeat(50));

    const success = generateClaudeDesktopPhaseConfig();

    if (success) {
        console.log('\n🎉 Phase configuration generation completed successfully!');

        if (args.includes('--copy')) {
            copyToClaudeDesktop();
        } else {
            showCopyInstructions();
        }
    } else {
        console.log('\n❌ Configuration generation failed. Check the errors above.');
        process.exit(1);
    }
}

// Run if called directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    main();
}

export { generateClaudeDesktopPhaseConfig, phaseServers, config };
