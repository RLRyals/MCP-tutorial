import fs from 'fs';

console.log('=== Checking Generator Status ===');

// Check if the generator script exists and what it contains
if (fs.existsSync('scripts/generate-configs.js')) {
    const generatorContent = fs.readFileSync('scripts/generate-configs.js', 'utf8');
    console.log('Generator script length:', generatorContent.length);
    console.log('Generator script (first 1000 chars):');
    console.log(generatorContent.substring(0, 1000));
    console.log('...');
} else {
    console.log('❌ scripts/generate-configs.js does not exist');
}

console.log('\n=== Re-running Generation Test ===');

// Let's also re-check the current generated file
const currentGenerated = fs.readFileSync('config/claude-desktop.json', 'utf8');
console.log('Current generated file length:', currentGenerated.length);
console.log('Current generated content:');
console.log(currentGenerated);
