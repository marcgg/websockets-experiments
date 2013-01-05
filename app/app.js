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
var MOVEMENT = 16
var MAX_X = 380
var MAX_Y = 380
var HAS_TARGET = false

function decideTarget(){
  if(!HAS_TARGET){
    console.log("------> DECIDING TARGET")
    var keys = Object.keys(world);
    if(keys.length == 0) return false
    world[keys[Math.floor(keys.length * Math.random())]].target = 40
  }
}

io.sockets.on('connection', function (socket) {
  socket.on("speak", function (messages, fn) {
    world[socket.id].name = messages[0]
    socket.broadcast.emit('chat_updated', "<span style='color:"+world[socket.id].color + "'>" + messages[0] + "</span>: " + messages[1])
    io.sockets.emit('players_updated', world)
  })

  socket.on('disconnect', function(data) {
    console.log("--> Socket " + socket.id + " left the game")
    if(world[socket.id] > 0) HAS_TARGET = false
    delete world[socket.id]
    decideTarget()
    socket.broadcast.emit('players_updated', world)
  });

  socket.on('start_game', function (name, fn) {
    console.log("--> Socket " + socket.id + " joined the game")
    already_target = false
    for(var el in world){
      console.log(el)
      player = world[el]
      if(player.target > 0){
        already_target = true
        break
      }
    }

    if(already_target){
      target_level = 0
    }else{
      target_level = 30
    }
    world[socket.id] = {
      id: socket.id,
      x: 0, y: 0,
      score: 100,
      target: target_level, last_target: false,
      name: "Player " + socket.id,
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

    if(local.target > 0){
      local.target -= 1
      if(local.target == 0){
        HAS_TARGET = false
        decideTarget()
      }
    }

    if(local.target == 0){
      var target = null
      for(var el in world){
        player = world[el]
        if(player.target > 0){
          target = player
          break
        }
      }
      if(
        ( local.x == target.x || local.x == (target.x + MOVEMENT) || local.x == (target.x - MOVEMENT) )
        && (local.y == target.y || local.y == (target.y + MOVEMENT) || local.y == (target.y - MOVEMENT) )
      ){
        local.score++
        target.score--
      }
    }else{
      for(var el in world){
        console.log(el)
        player = world[el]
        if(player.target == 0){
          if(
            ( local.x == player.x || local.x == (player.x + MOVEMENT) || local.x == (player.x - MOVEMENT) )
            && (local.y == player.y || local.y == (player.y + MOVEMENT) || local.y == (player.y - MOVEMENT) )
          ){
            player.score++
            local.score--
          }
        }
      }
    }

    socket.broadcast.emit('canvas_updated', world)
    fn(world);
  });
});
