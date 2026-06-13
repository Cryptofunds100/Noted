// Minimal static file server for the Noted PWA preview.
// Uses an absolute ROOT and never calls process.cwd(), so it runs under the
// preview sandbox where getcwd() is denied (Python's http.server can't).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/myles/Documents/Claude/Projects/Noted/app';
const PORT = 8743;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/Noted.html';
  // Prevent path traversal.
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + urlPath);
      return;
    }
    const type = TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    // Dev preview: never cache, so edits show on reload.
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store, max-age=0' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Noted preview server on http://localhost:' + PORT));
