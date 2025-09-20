// Test to read package.json
import fs from 'fs';
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('Available scripts:', packageJson.scripts);
console.log('Dependencies:', packageJson.dependencies);
