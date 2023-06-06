const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  ws: true, // Enable WebSocket proxying
});

// Read SSL certificate and key files
const options = {
  cert: fs.readFileSync('/path/to/certificate.crt'),
  key: fs.readFileSync('/path/to/privatekey.key'),
};

// Create an HTTPS server
const server = https.createServer(options, (req, res) => {
  const subdomain = getSubdomain(req);

  // Set the target port based on the subdomain
  let targetPort;
  switch (subdomain) {
    case 'app1':
      targetPort = 8081;
      break;
    case 'app2':
      targetPort = 8082;
      break;
    default:
      targetPort = 8080;
  }

  // Construct the target URL using the subdomain and port
  const target = `http://localhost:${targetPort}`;

  // Proxy WebSocket upgrade requests
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    proxy.ws(req, res, { target });
  } else {
    // Proxy regular HTTP requests
    proxy.web(req, res, { target });
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});

// Helper function to extract the subdomain from the request
function getSubdomain(req) {
  const host = req.headers.host;
  const parts = host.split('.');
  return parts.length > 2 ? parts[0] : '';
}
```

In this updated code, the `targetPort` is set based on the subdomain extracted from the request's `host` header. The `target` URL is then constructed using `localhost` and the corresponding `targetPort`. Requests will be proxied to the appropriate port on `localhost` based on the subdomain.

For example, if the subdomain is `app1.example.com`, requests will be forwarded to `localhost:8081`. If the subdomain is `app2.example.com`, requests will be forwarded to `localhost:8082`. For any other subdomain, requests will be forwarded to `localhost:8080`.

Make sure to replace `/path/to/certificate.crt` and `/path/to/privatekey.key` with the actual paths to your SSL certificate and key files.

With this modification, the proxy server will route requests to different ports on `localhost` based on the subdomain specified in the request's `host` header.
