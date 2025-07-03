const fs = require('fs');
const path = require('path');

// publicディレクトリを.next/standaloneにコピー
const publicDir = path.join(__dirname, '../public');
const standalonePublicDir = path.join(__dirname, '../.next/standalone/public');

if (fs.existsSync(publicDir) && !fs.existsSync(standalonePublicDir)) {
  fs.cpSync(publicDir, standalonePublicDir, { recursive: true });
  console.log('✅ Copied public directory to standalone build');
}

// .next/staticを.next/standalone/.next/にコピー
const staticDir = path.join(__dirname, '../.next/static');
const standaloneStaticDir = path.join(__dirname, '../.next/standalone/.next/static');

if (fs.existsSync(staticDir) && !fs.existsSync(standaloneStaticDir)) {
  fs.mkdirSync(path.dirname(standaloneStaticDir), { recursive: true });
  fs.cpSync(staticDir, standaloneStaticDir, { recursive: true });
  console.log('✅ Copied static directory to standalone build');
}
