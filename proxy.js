const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const proxy_port = 443;
const options = {
	key: fs.readFileSync("/etc/letsencrypt/live/f.talkofchrist.org/privkey.pem"),
	cert: fs.readFileSync("/etc/letsencrypt/live/f.talkofchrist.org/fullchain.pem")
};

var proxy = httpProxy.createServer({
	ws: true,
/*
	target: {
		host: 'localhost',
		port: 8096
	},
	ssl: {
		key: fs.readFileSync(key_path),
		cert: fs.readFileSync(cert_path)
	}
*/
})

proxy.on('error', function (err) {
	console.log(err);
});

const target = function(req) {
	const host = req.headers.host.split(":")[0];
	if( host === "jf.talkofchrist.org" ) {
		return { target: "http://127.0.0.1:8096" };
	}
	else if( host === "f.talkofchrist.org" ) {
		return { target: "http://127.0.0.1:8080" };
	}
	else if( host === "drop.talkofchrist.org" ) {
		return { target: "http://127.0.0.1:3030" };
	}
	else if( host === "call.talkofchrist.org" | host === "meet.talkofchrist.org" ) {
		return { target: "http://127.0.0.1:3000" };
	}
	else {
		return
	}
};

//var server = http.createServer(function(req, res) { // HTTP server
var server = https.createServer(options, function (req, res) { // HTTPS server
	var t = target(req);
	t ? proxy.web(req, res, t) : res.end(); //null target return blank page
});

server.on('upgrade', function (req, socket, head) {
	//console.log("upgrade request:", req.url);
	proxy.ws(req, socket, head, target(req));
});

console.log(`Listening on port: ${proxy_port}`)
server.listen(proxy_port);
//proxy.listen(proxy_port); //could call proxy.listen but httpProxy.createServer() only takes objects as parameters
