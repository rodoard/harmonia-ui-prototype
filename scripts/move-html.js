const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.join(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const outputPath = path.join(process.cwd(), 'index.html');

// Check if the built file exists
if (fs.existsSync(indexHtmlPath)) {
  // Read the built HTML
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Make any final adjustments to the HTML if needed
  // For example, update any paths that might be incorrect
  html = html.replace(/\/assets\//g, 'assets/');
  
  // Write the final index.html to the root
  fs.writeFileSync(outputPath, html);
  
  console.log('Single HTML file created at:', outputPath);
} else {
  console.error('Build failed: index.html not found in dist directory');
  process.exit(1);
}
