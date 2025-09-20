import fs from 'fs';

console.log('=== Template Analysis ===');

// Read the template file
const templateContent = fs.readFileSync('config/claude-desktop.template.json', 'utf8');
console.log('Template content length:', templateContent.length);
console.log('Template content (first 500 chars):');
console.log(templateContent.substring(0, 500));

console.log('\n=== Generated File Analysis ===');

// Read the generated file
const generatedContent = fs.readFileSync('config/claude-desktop.json', 'utf8');
console.log('Generated content length:', generatedContent.length);
console.log('Generated content:');
console.log(generatedContent);

console.log('\n=== Environment Analysis ===');

// Check .env file
const envContent = fs.readFileSync('.env', 'utf8');
console.log('.env file content (passwords masked):');
envContent.split('\n').forEach(line => {
    if (line.includes('PASSWORD') || line.includes('SECRET')) {
        const [key] = line.split('=');
        console.log(`${key}=***`);
    } else if (line.trim()) {
        console.log(line);
    }
});

console.log('\n=== Looking for placeholders ===');
const placeholders = templateContent.match(/\$\{[^}]+\}/g) || [];
console.log('Found placeholders:', placeholders);
