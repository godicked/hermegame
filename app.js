var express  = require('express');
var app = express(),
    server = require('http').createServer(app);
	app.use("/public", express.static(__dirname + '/public'));
// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8080);