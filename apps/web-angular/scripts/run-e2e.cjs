const { createServer } = require('node:http');
const { createReadStream, existsSync, statSync } = require('node:fs');
const { extname, join, normalize } = require('node:path');
const { spawn } = require('node:child_process');

const root = join(__dirname, '..', 'dist', 'web', 'browser');
const host = '127.0.0.1';
const port = 4201;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const requested = normalize(join(root, pathname));
  if (!requested.startsWith(root)) return join(root, 'index.html');
  if (existsSync(requested) && statSync(requested).isFile()) return requested;
  return join(root, 'index.html');
}

const server = createServer((req, res) => {
  const file = resolvePath(req.url || '/');
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  const command = process.execPath;
  const child = spawn(command, [join(__dirname, '..', 'node_modules', '@playwright', 'test', 'cli.js'), 'test'], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, PLAYWRIGHT_BASE_URL: `http://${host}:${port}` },
    stdio: 'inherit'
  });

  child.on('exit', code => {
    server.close(() => process.exit(code ?? 1));
  });
});
