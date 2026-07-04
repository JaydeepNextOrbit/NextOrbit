import fs from 'fs';

const js = fs.readFileSync('c:\\Users\\Ram Mani\\.gemini\\antigravity\\WD\\main.js', 'utf8');
const lines = js.split('\n');

console.log('Searching for tick in main.js...');
lines.forEach((line, index) => {
  if (line.includes('tick')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
process.exit(0);
