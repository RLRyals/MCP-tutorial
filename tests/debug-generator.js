// Debug script to understand what's happening with config generation
import fs from 'fs';
import path from 'path';

console.log('=== Debug Config Generation ===');

// Check if template files exist
const templateFiles = [
    'config/claude-desktop.template.json',
    'config/typing-mind.template.json'
];

templateFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ Template exists: ${file}`);
        const stats = fs.statSync(file);
        console.log(`  Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
    } else {
        console.log(`✗ Template missing: ${file}`);
    }
});

// Check if generated files exist
const generatedFiles = [
    'config/claude-desktop.json',
    'config/typing-mind.json'
];

generatedFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ Generated file exists: ${file}`);
        const stats = fs.statSync(file);
        console.log(`  Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
    } else {
        console.log(`✗ Generated file missing: ${file}`);
    }
});

// Check environment variables
console.log('\n=== Environment Variables ===');
const envVars = [
    'NODE_ENV',
    'DATABASE_URL', 
    'MCP_SERVER_HOST',
    'MCP_SERVER_PORT',
    'MCP_TUTORIAL_PATH'
];

envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        if (varName.includes('PASSWORD') || varName.includes('URL')) {
            console.log(`${varName}: ***masked***`);
        } else {
            console.log(`${varName}: ${value}`);
        }
    } else {
        console.log(`${varName}: (not set)`);
    }
});

// Check if .env file exists
if (fs.existsSync('.env')) {
    console.log('\n✓ .env file exists');
} else {
    console.log('\n✗ .env file missing');
}

// Check if node_modules exists (for dependencies)
if (fs.existsSync('node_modules')) {
    console.log('✓ node_modules exists');
} else {
    console.log('✗ node_modules missing - run npm install');
}
