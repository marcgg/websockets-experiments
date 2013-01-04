/* Express quick setup */

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

/* mongodb setup */
/*var mongo = require('mongodb');
var host = process.env['DOTCLOUD_DB_MONGODB_HOST'] || 'localhost';
var port = process.env['DOTCLOUD_DB_MONGODB_PORT'] ||  27017;
port = parseInt(port);
var user = process.env['DOTCLOUD_DB_MONGODB_LOGIN'] || undefined;
var pass = process.env['DOTCLOUD_DB_MONGODB_PASSWORD'] || undefined;
var mongoServer = new mongo.Server(host, port, {});
var db = new mongo.Db("test", mongoServer, {auto_reconnect:true});
*/

server.listen(8080);

/* Basic Routes */
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/client.js', function (req, res) {
  res.sendfile(__dirname + '/public/client.js');
});


/*
db.open(function(err){
    if(err) console.log(err);

    if(user && pass) {
        db.authenticate(user, pass, function(err) {
            app.listen(8080);
        });
    }
    else {
        app.listen(8080);
    }
});*/
