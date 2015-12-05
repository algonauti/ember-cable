/*jshint node:true*/
var proxyPath = '/cable';

module.exports = function(app, options) {
  var server = options.httpServer;
  var proxy = require('http-proxy').createProxyServer({
    target: 'http://localhost:3000',
    ws: true,
    changeOrigin: true
  });

  proxy.on('error', function(err, req) {
    console.error(err, req.url);
  });

  server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
  });

  app.use(proxyPath, function(req, res, next){
    req.url = proxyPath + '/' + req.url;
    proxy.web(req, res);
  });
};
