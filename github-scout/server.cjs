const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const m = { js: 'text/javascript', css: 'text/css', html: 'text/html', svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', ico: 'image/x-icon' };
http.createServer((q, r) => {
  let fp = path.join(dir, q.url === '/' ? 'index.html' : q.url);
  try {
    const ext = path.extname(fp).slice(1);
    r.writeHead(200, { 'Content-Type': m[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
    r.end(fs.readFileSync(fp));
  } catch (e) {
    r.writeHead(404); r.end('404');
  }
}).listen(3006, () => console.log('http://localhost:3006'));
