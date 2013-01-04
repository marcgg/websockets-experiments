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

app.get('/boostrap.css', function (req, res) {
  res.sendfile(__dirname + '/public/boostrap.css');
});



/* Game Engine */
var world = {}
var MOVEMENT = 20
var MAX_X = 380
var MAX_Y = 380

io.sockets.on('connection', function (socket) {
  socket.on("speak", function (messages, fn) {
    world[socket.id].name = messages[0]
    socket.broadcast.emit('chat_updated', "<span style='color:"+world[socket.id].color + "'>" + messages[0] + "</span>: " + messages[1])
    io.sockets.emit('players_updated', world)
  })

  socket.on('disconnect', function(data) {
    console.log("--> Socket " + socket.id + " left the game")
    delete world[socket.id]
    socket.broadcast.emit('players_updated', world)
  });

  socket.on('start_game', function (name, fn) {
    console.log("--> Socket " + socket.id + " joined the game")
    world[socket.id] = {
      id: socket.id,
      x: 0,
      y: 0,
      name: "Player",
      color: "rgb("+Math.floor(Math.random()*250)+", "+Math.floor(Math.random()*250)+", "+Math.floor(Math.random()*250)+")"
    }
    socket.broadcast.emit('players_updated', world)
    fn(world);
  });

  socket.on("move", function (direction, fn) {
    console.log("--> Socket " + socket.id + " moved of "+ direction)
    local = world[socket.id]
    if(direction == 37){
      local.x -= MOVEMENT
    }else if(direction == 38){
      local.y -= MOVEMENT
    }else if(direction == 39){
      local.x += MOVEMENT
    }else if(direction == 40){
      local.y += MOVEMENT
    }
    if(local.x > MAX_X) local.x = MAX_X
    if(local.y > MAX_Y) local.y = MAX_Y
    if(local.y < 0) local.y = 0
    if(local.x < 0) local.x = 0

    socket.broadcast.emit('canvas_updated', world)
    fn(world);
  });
});
