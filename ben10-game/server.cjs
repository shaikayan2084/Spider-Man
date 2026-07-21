const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);
const m = { js: 'text/javascript', css: 'text/css', html: 'text/html' };
http.createServer((q, r) => {
  let fp = path.join(dir, q.url === '/' ? 'index.html' : q.url);
  try {
    const ext = path.extname(fp).slice(1);
    r.writeHead(200, { 'Content-Type': m[ext] || 'text/plain' });
    r.end(fs.readFileSync(fp));
  } catch (e) {
    r.writeHead(404);
    r.end('404');
  }
}).listen(3005, () => console.log('http://localhost:3005'));
