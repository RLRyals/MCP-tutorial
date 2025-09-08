import fs from 'fs';

console.log('=== Examining generate-configs.js ===');

const generatorContent = fs.readFileSync('scripts/generate-configs.js', 'utf8');
console.log('Generator script content length:', generatorContent.length);
console.log('Generator script content:');
console.log(generatorContent);
