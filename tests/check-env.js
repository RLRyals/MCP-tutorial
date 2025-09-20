#!/usr/bin/env node
// check-env.js - Check environment configuration

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('=== Environment Check ===\n');

// Check if .env file exists
const envPath = '.env';
if (fs.existsSync(envPath)) {
    console.log('✓ .env file exists');
    const envContents = fs.readFileSync(envPath, 'utf8');
    console.log('\n📄 .env file contents:');
    console.log(envContents);
} else {
    console.log('❌ .env file missing');
    console.log('📄 Checking template.env:');
    if (fs.existsSync('template.env')) {
        const templateContents = fs.readFileSync('template.env', 'utf8');
        console.log(templateContents);
    }
}

console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 30) + '...');
}
console.log('MCP_SERVER_MODE:', process.env.MCP_SERVER_MODE || 'undefined');

console.log('\n=== Docker Check ===');
console.log('docker-compose.yml exists:', fs.existsSync('docker-compose.yml'));

console.log('\n=== Package.json Check ===');
if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✓ Package.json exists');
    console.log('Dependencies include:');
    const deps = pkg.dependencies || {};
    console.log('  - @modelcontextprotocol/sdk:', deps['@modelcontextprotocol/sdk'] || 'MISSING');
    console.log('  - pg:', deps['pg'] || 'MISSING');
    console.log('  - dotenv:', deps['dotenv'] || 'MISSING');
    console.log('  - express:', deps['express'] || 'MISSING');
    console.log('  - helmet:', deps['helmet'] || 'MISSING');
    console.log('  - cors:', deps['cors'] || 'MISSING');
}

console.log('\n=== Migration Files Check ===');
if (fs.existsSync('migrations')) {
    const migrations = fs.readdirSync('migrations');
    console.log('Available migrations:', migrations.length);
    migrations.forEach(file => console.log(`  - ${file}`));
} else {
    console.log('❌ migrations directory missing');
}
