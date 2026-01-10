// Production server for Next.js standalone build
// This file is used by iisnode on IIS
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Force production mode for standalone builds
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const dev = false; // Always false for standalone/production
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app in production mode
const app = next({ 
  dev: false, // Always production mode
  hostname,
  port,
  dir: __dirname // Use current directory (standalone folder)
});

const handle = app.getRequestHandler();

// Start the server
app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Only listen if not running under iisnode
  // iisnode will handle the server creation
  if (!process.env.IISNODE_VERSION) {
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  }
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});

