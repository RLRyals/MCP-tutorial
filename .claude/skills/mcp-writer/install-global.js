#!/usr/bin/env node
// .claude/skills/mcp-writer/install-global.js
// Automated installation script for global MCP Writer Skill

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir, platform } from 'os';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
    log(`  ✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`  ⚠️  ${message}`, 'yellow');
}

function logError(message) {
    log(`  ❌ ${message}`, 'red');
}

/**
 * Detect the global skills directory for Claude Desktop
 */
function getGlobalSkillsDirectory() {
    const os = platform();
    const home = homedir();

    let possiblePaths = [];

    if (os === 'darwin') {
        // macOS
        possiblePaths = [
            join(home, 'Library', 'Application Support', 'Claude', 'skills'),
            join(home, '.config', 'Claude', 'skills'),
            join(home, '.claude', 'skills')
        ];
    } else if (os === 'win32') {
        // Windows
        const appdata = process.env.APPDATA || join(home, 'AppData', 'Roaming');
        possiblePaths = [
            join(appdata, 'Claude', 'skills'),
            join(home, '.claude', 'skills')
        ];
    } else {
        // Linux and others
        possiblePaths = [
            join(home, '.config', 'Claude', 'skills'),
            join(home, '.claude', 'skills')
        ];
    }

    // Check if any exist
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            return path;
        }
    }

    // Return the first (most standard) path
    return possiblePaths[0];
}

/**
 * Get the absolute path to the MCP tutorial project
 */
function getProjectPath() {
    // Go up from .claude/skills/mcp-writer to project root
    return resolve(__dirname, '../../..');
}

/**
 * Copy skill files to global directory
 */
function copySkillFiles(sourceDir, targetDir) {
    const filesToCopy = [
        'mcp-writer.md',
        'mcp-helper.js',
        'examples.js',
        'test-discovery.js',
        'worldbuilding-workflow.js',
        'README.md',
        'HOW_TO_USE.md',
        'INSTALL_GLOBAL.md'
    ];

    let copied = 0;
    let failed = 0;

    for (const file of filesToCopy) {
        try {
            const source = join(sourceDir, file);
            const target = join(targetDir, file);

            if (existsSync(source)) {
                copyFileSync(source, target);
                copied++;
                logSuccess(`Copied ${file}`);
            } else {
                logWarning(`Skipped ${file} (not found)`);
            }
        } catch (error) {
            logError(`Failed to copy ${file}: ${error.message}`);
            failed++;
        }
    }

    return { copied, failed };
}

/**
 * Update mcp-helper.js with absolute paths
 */
function updateHelperPaths(helperPath, projectPath) {
    try {
        let content = readFileSync(helperPath, 'utf8');

        // Find the constructor and update the paths
        const mcpsPath = join(projectPath, 'src', 'mcps').replace(/\\/g, '/');
        const configMcpsPath = join(projectPath, 'src', 'config-mcps').replace(/\\/g, '/');

        // Replace the relative paths with absolute paths
        content = content.replace(
            /this\.mcpPaths = \{[^}]+\};/,
            `this.mcpPaths = {
            main: '${mcpsPath}',
            config: '${configMcpsPath}'
        };`
        );

        writeFileSync(helperPath, content, 'utf8');
        return true;
    } catch (error) {
        logError(`Failed to update paths: ${error.message}`);
        return false;
    }
}

/**
 * Verify installation
 */
function verifyInstallation(targetDir, projectPath) {
    const checks = {
        skillDefinition: existsSync(join(targetDir, 'mcp-writer.md')),
        helper: existsSync(join(targetDir, 'mcp-helper.js')),
        mcpsDir: existsSync(join(projectPath, 'src', 'mcps')),
        configMcpsDir: existsSync(join(projectPath, 'src', 'config-mcps'))
    };

    return checks;
}

/**
 * Main installation process
 */
async function install() {
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║     MCP Writer Skill - Global Installation             ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    // Step 1: Detect directories
    logStep(1, 'Detecting directories...');

    const projectPath = getProjectPath();
    log(`  Project: ${projectPath}`);

    const globalSkillsDir = getGlobalSkillsDirectory();
    log(`  Global skills: ${globalSkillsDir}`);

    const targetDir = join(globalSkillsDir, 'mcp-writer');
    log(`  Target: ${targetDir}`);

    // Step 2: Create target directory
    logStep(2, 'Creating target directory...');

    try {
        if (!existsSync(globalSkillsDir)) {
            mkdirSync(globalSkillsDir, { recursive: true });
            logSuccess(`Created ${globalSkillsDir}`);
        } else {
            logSuccess('Global skills directory exists');
        }

        if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
            logSuccess(`Created ${targetDir}`);
        } else {
            logWarning('Target directory exists (will overwrite files)');
        }
    } catch (error) {
        logError(`Failed to create directories: ${error.message}`);
        process.exit(1);
    }

    // Step 3: Copy files
    logStep(3, 'Copying skill files...');

    const sourceDir = __dirname;
    const result = copySkillFiles(sourceDir, targetDir);

    log(`\n  ${result.copied} files copied, ${result.failed} failed`);

    if (result.copied === 0) {
        logError('No files were copied. Installation failed.');
        process.exit(1);
    }

    // Step 4: Update paths
    logStep(4, 'Configuring paths...');

    const helperPath = join(targetDir, 'mcp-helper.js');
    const pathsUpdated = updateHelperPaths(helperPath, projectPath);

    if (pathsUpdated) {
        logSuccess('Updated paths to absolute locations');
        log(`  MCP servers: ${join(projectPath, 'src', 'mcps')}`);
        log(`  Config MCPs: ${join(projectPath, 'src', 'config-mcps')}`);
    } else {
        logWarning('Failed to update paths automatically');
        logWarning(`Please manually edit: ${helperPath}`);
    }

    // Step 5: Verify
    logStep(5, 'Verifying installation...');

    const checks = verifyInstallation(targetDir, projectPath);

    if (checks.skillDefinition) {
        logSuccess('Skill definition found');
    } else {
        logError('Skill definition missing');
    }

    if (checks.helper) {
        logSuccess('Helper library found');
    } else {
        logError('Helper library missing');
    }

    if (checks.mcpsDir) {
        logSuccess('MCP servers directory found');
    } else {
        logError('MCP servers directory not found');
        logWarning('Make sure you are on the correct git branch');
    }

    if (checks.configMcpsDir) {
        logSuccess('Config MCPs directory found');
    } else {
        logError('Config MCPs directory not found');
        logWarning('Make sure you are on the correct git branch');
    }

    // Summary
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║     Installation Complete                              ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    const allChecks = Object.values(checks).every(c => c);

    if (allChecks) {
        log('\n✅ Installation successful!', 'green');
        log('\nNext steps:', 'bright');
        log('  1. Restart Claude Desktop (if running)');
        log('  2. Test with: "Use the mcp-writer skill to discover servers"');
        log('  3. Start using it for worldbuilding!\n');
    } else {
        log('\n⚠️  Installation completed with warnings', 'yellow');
        log('\nSome checks failed. Please review the output above.');
        log('You may need to manually configure paths.\n');
        log(`Edit: ${helperPath}`, 'yellow');
        log('Update the mcpPaths to point to your MCP-tutorial directory.\n');
    }

    // Display locations
    log('Installed to:', 'bright');
    log(`  ${targetDir}\n`);

    log('Project path:', 'bright');
    log(`  ${projectPath}\n`);

    log('Documentation:', 'bright');
    log(`  ${join(targetDir, 'HOW_TO_USE.md')}`);
    log(`  ${join(targetDir, 'README.md')}\n`);
}

// Run installation
install().catch(error => {
    logError(`Installation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});
