const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');

const proxyPort = 443;
const targetHost = '127.0.0.1';

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  ws: true, // Enable WebSocket proxying
});

proxy.on('error', (err, req, res) => { // Error event listener
  console.error('Proxy error:', err);
  res.statusCode = 500;
  res.end('Something went wrong.');
});

const options = { // Read SSL certificate and key files
  cert: fs.readFileSync('/etc/letsencrypt/live/f.talkofchrist.org/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/f.talkofchrist.org/privkey.pem'),
  // cert: fs.readFileSync('talkofchrist-key-cert/talkofchrist.org_ssl_certificate.cer'),
  // key: fs.readFileSync('talkofchrist-key-cert/_.talkofchrist.org_private_key.key'),
};

const getTargetPort = (req) => { // Gets port based on subdomain
  if (!req.headers.host) {
    console.log(JSON.stringify(req.headers));
    return null;
  }
  const subdomain = req.headers.host.split('.')[0];
  switch (subdomain) {
    case 'jf':
      return 8096;
    case 'f':
      return 8080;
    case 'drop':
      return 3030;
    case 'share':
      return 3001;
    case 'call':
    case 'meet':
      return 3000;
    default:
      return null;
  }
}

const setHeaderRemoteAddress = (req) => { // Set the client's IP address in the X-Forwarded-For header
  req.headers['x-forwarded-for'] = req.connection.remoteAddress;
}

// Create an HTTPS server
const server = https.createServer(options, (req, res) => {
  const targetPort = getTargetPort(req);
  if (targetPort === null) { // If targetPort is null, refuse the connection
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  };
  setHeaderRemoteAddress(req);
  proxy.web(req, res, { target: `http://${targetHost}:${targetPort}` });
});

server.on('upgrade', (req, socket, head) => { // Websocket upgrade event listener
  const targetPort = getTargetPort(req);
  setHeaderRemoteAddress(req);
  proxy.ws(req, socket, head, { target: `ws://${targetHost}:${targetPort}` });
});

server.listen(proxyPort, () => { // Start the server
  console.log(`Proxy server listening on port ${proxyPort}`);
});
