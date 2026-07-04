import fs from 'fs';

const css = fs.readFileSync('c:\\Users\\Ram Mani\\.gemini\\antigravity\\WD\\style.css', 'utf8');
const lines = css.split('\n');

console.log('Searching for hero-video in style.css...');
lines.forEach((line, index) => {
  if (line.includes('hero-video') || line.includes('hero-section')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
process.exit(0);
