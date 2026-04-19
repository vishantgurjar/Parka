const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('parkee-city-backend.vercel.app')) {
        content = content.replace(/parkee-city-backend\.vercel\.app/g, 'parka-backend.vercel.app');
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}
replaceInDir('c:/Users/VISHANT PANWAR/OneDrive/Desktop/pro/website/frontend/src');
