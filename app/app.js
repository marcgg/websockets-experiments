/* Express quick setup */

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

/* Basic Routes */
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/client.js', function (req, res) {
  res.sendfile(__dirname + '/public/client.js');
});


/* Game Engine */
var world = {}
var MOVEMENT = 4

io.sockets.on('connection', function (socket) {
  socket.on('start_game', function (name, fn) {
    console.log("--> Socket " + socket.id + " joined the game")
    world[socket.id] = {
      id: socket.id,
      x: 0,
      y: 0,
      color: "rgb("+Math.floor(Math.random()*250)+", "+Math.floor(Math.random()*250)+", "+Math.floor(Math.random()*250)+")"
    }
    fn(world);
  });

  socket.on("move", function (name, fn) {
    console.log("--> Socket " + socket.id + " moved of "+ name)
    console.log(name)
    if(name == 37){
      world[socket.id].x -= MOVEMENT
    }else if(name == 38){
      world[socket.id].y -= MOVEMENT
    }else if(name == 39){
      world[socket.id].x += MOVEMENT
    }else if(name == 40){
      world[socket.id].y += MOVEMENT
    }
    socket.broadcast.emit('canvas_updated', world)
    fn(world);
  });
});
