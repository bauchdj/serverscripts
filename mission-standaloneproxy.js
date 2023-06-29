var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy');

var options = {
  https: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('key-cert.pem')
  }
};

var proxy = new httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 24680
  }
});
var proxyServer = https.createServer(options.https, function(req, res) {
  proxy.web(req, res);
});

proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

console.log("listening on port 443\ntargeting port 24680 Ventoy")
proxyServer.listen(443);
