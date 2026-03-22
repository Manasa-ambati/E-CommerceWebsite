const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
 app.use(
  '/api',
 createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  secure: false,
  ws: false, // Disable WebSocket proxying to prevent conflicts
 logLevel: 'warn', // Reduce log noise
  onProxyReq: function(proxyReq, req, res) {
  console.log('Proxying request:', req.method, req.url);
  },
  onError: function(err, req, res) {
  console.error('Proxy error:', err.message);
  res.writeHead(500, {
    'Content-Type': 'application/json'
   });
  res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
 })
 );
};
