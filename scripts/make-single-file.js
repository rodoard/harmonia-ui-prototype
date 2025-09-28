import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  inputDir: path.join(process.cwd(), 'build'),
  outputFile: path.join(process.cwd(), 'index.html'),
  baseHref: './',
  inlineAssets: true,
  minify: true
};

// Helper function to get MIME type from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return types[ext] || 'application/octet-stream';
}

// Helper to resolve file paths
function resolvePath(basePath, filePath) {
  // Handle absolute paths from root
  if (filePath.startsWith('/')) {
    return path.join(config.inputDir, filePath.substring(1));
  }
  // Handle relative paths
  return path.resolve(path.dirname(basePath), filePath);
}

// Read the built HTML
console.log(`Reading HTML from: ${path.join(config.inputDir, 'index.html')}`);
let html = fs.readFileSync(path.join(config.inputDir, 'index.html'), 'utf8');

// Remove base tag and update paths
html = html.replace(/<base\s+href="[^"]*"\s*\/?>/i, '');
html = html.replace(/(href|src)="\/([^"\/])/g, '$1="./$2');

// Create a map to store processed assets and their data URLs
const assetMap = new Map();

// Process all assets
async function processAssets() {
  // Process CSS files
  const cssLinks = html.match(/<link[^>]*href=["']([^"']+\.css(?:\?[^"'#]*)?)["'][^>]*>/gi) || [];
  for (const link of cssLinks) {
    const match = link.match(/href=["']([^"']+)["']/i);
    if (!match) continue;
    
    const href = match[1].split('?')[0].split('#')[0];
    const cssPath = resolvePath(path.join(config.inputDir, 'index.html'), href);
    
    if (fs.existsSync(cssPath)) {
      console.log(`Processing CSS: ${href}`);
      let css = fs.readFileSync(cssPath, 'utf8');
      
      // Process URLs in CSS
      css = await processCssUrls(css, path.dirname(cssPath));
      
      // Replace the link tag with style tag
      html = html.replace(link, `<style>${css}</style>`);
    }
  }
  
  // Process JavaScript files
  const scriptTags = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const script of scriptTags) {
    const match = script.match(/src=["']([^"']+)["']/i);
    if (!match) continue;
    
    const src = match[1].split('?')[0].split('#')[0];
    const jsPath = resolvePath(path.join(config.inputDir, 'index.html'), src);
    
    if (fs.existsSync(jsPath)) {
      console.log(`Processing JS: ${src}`);
      const js = fs.readFileSync(jsPath, 'utf8');
      
      // Inline the script
      const newScript = script.replace(/src=["'][^"']*["]/i, '')
        .replace('type="module"', '') // Remove type="module"
        .replace('></script>', `>${js}</script>`);
      
      html = html.replace(script, newScript);
    }
  }
  
  // Process images
  const imgTags = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgTags) {
    const match = img.match(/src=["']([^"']+)["']/i);
    if (!match) continue;
    
    const src = match[1].split('?')[0].split('#')[0];
    const imgPath = resolvePath(path.join(config.inputDir, 'index.html'), src);
    
    if (fs.existsSync(imgPath)) {
      console.log(`Processing image: ${src}`);
      const mimeType = getMimeType(imgPath);
      const data = fs.readFileSync(imgPath, 'base64');
      const dataUrl = `data:${mimeType};base64,${data}`;
      
      // Update the src attribute
      html = html.replace(new RegExp(`src=["']${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i'), `src="${dataUrl}"`);
    }
  }
  
  // Process background images in style attributes
  const styleAttrs = html.match(/style=["'][^"']*url\([^)]+\)[^"']*["]/gi) || [];
  for (const style of styleAttrs) {
    const urlMatch = style.match(/url\(['"]?([^)'"]+)['"]?\)/i);
    if (!urlMatch) continue;
    
    const url = urlMatch[1].split('?')[0].split('#')[0];
    const stylePath = resolvePath(config.inputDir, url);
    
    if (fs.existsSync(stylePath)) {
      console.log(`Processing background image: ${url}`);
      const mimeType = getMimeType(stylePath);
      const data = fs.readFileSync(stylePath, 'base64');
      const dataUrl = `url(data:${mimeType};base64,${data})`;
      
      // Update the style attribute
      const newStyle = style.replace(urlMatch[0], dataUrl);
      html = html.replace(style, newStyle);
    }
  }
}

// Process URLs in CSS content
async function processCssUrls(css, basePath) {
  // Process url() references
  css = css.replace(/url\(['"]?([^)'"]+)['"]?\)/gi, (match, url) => {
    // Skip data URLs and external URLs
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return match;
    }
    
    const cleanUrl = url.split('?')[0].split('#')[0];
    const assetPath = resolvePath(basePath, cleanUrl);
    
    if (fs.existsSync(assetPath)) {
      console.log(`  Processing CSS asset: ${cleanUrl}`);
      const mimeType = getMimeType(assetPath);
      const data = fs.readFileSync(assetPath, 'base64');
      return `url(data:${mimeType};base64,${data})`;
    }
    
    return match;
  });
  
  return css;
}

// Process all assets and save the result
processAssets().then(() => {
  // Remove any remaining modulepreload links
  html = html.replace(/<link[^>]*rel=["']modulepreload["'][^>]*>/gi, '');
  
  // Remove any preload links
  html = html.replace(/<link[^>]*rel=["']preload["'][^>]*>/gi, '');
  
  // Remove any module scripts that weren't inlined
  html = html.replace(/<script[^>]*type=["']module["'][^>]*><\/script>/gi, '');
  
  // Write the final HTML
  console.log(`Writing output to: ${config.outputFile}`);
  fs.writeFileSync(config.outputFile, html);
  
  console.log('Successfully created single HTML file with all assets inlined!');
  console.log(`You can now upload ${config.outputFile} to any static hosting service.`);
}).catch(error => {
  console.error('Error processing assets:', error);
  process.exit(1);
});
