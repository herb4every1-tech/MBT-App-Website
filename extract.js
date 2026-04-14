import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('landing_page_source.md', 'utf-8');
const fileRegex = /## File: `([^`]+)`\n\n```[a-z]*\n([\s\S]*?)\n```/g;

let match;
while ((match = fileRegex.exec(content)) !== null) {
  const filePath = match[1];
  const fileContent = match[2];
  
  // Skip LoginPage.tsx as requested by the user
  if (filePath === 'src/pages/LoginPage.tsx') {
    console.log(`Skipping ${filePath}`);
    continue;
  }
  
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, fileContent);
  console.log(`Created ${filePath}`);
}
