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
var MAX_X = 384
var MAX_Y = 384
var HAS_TARGET = false
var TIMER_MULTIPLE = 14
var INVINCIBLE_FRAMES = 3
var targets = []

function setTarget(player){
  if(player == null) return false
  player.target = 1
  player.invincible = INVINCIBLE_FRAMES
}

io.sockets.on('connection', function (socket) {
  socket.on("speak", function (messages, fn) {
    world[socket.id].name = messages[0]
    socket.broadcast.emit('chat_updated', "<span style='color:"+world[socket.id].color + "'>" + messages[0] + "</span>: " + messages[1])
    io.sockets.emit('players_updated', { world: world })
  })

  socket.on("change_name", function (name, fn){
    world[socket.id].name = name
    io.sockets.emit('players_updated', { world: world })
  })

  socket.on('disconnect', function(data) {
    if(world[socket.id] > 0) HAS_TARGET = false
    delete world[socket.id]
    var index = targets.indexOf(socket.id)
    targets.splice(index,1)
    setTarget(targets[0])
    socket.broadcast.emit('players_updated', { world: world })
  });

  socket.on('start_game', function (name, fn) {
    console.log("--> Socket " + socket.id + " joined the game")
    targets.push(socket.id)
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
      target_level = 1
    }
    world[socket.id] = {
      id: socket.id,
      x: 0, y: 0,
      score: 0,
      target: target_level, invincible: INVINCIBLE_FRAMES,
      name: "Player " + socket.id,
      color: "rgb("+Math.floor(Math.random()*220)+", "+Math.floor(Math.random()*220)+", "+Math.floor(Math.random()*220)+")"
    }
    socket.broadcast.emit('players_updated', { world: world })
    fn({ world: world, you: socket.id });
  });

  socket.on("move", function (direction, fn) {
    targetScored = false
    console.log("--> Socket " + socket.id + " moved of "+ direction)
    local = world[socket.id]

    //-> MOVING
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

    //-> TARGET MANAGEMENT
    if(local.target > 0){
      local.target++
      if(local.target %30 == 0){
        targetScored = true
        local.score++
      }
    }

    if(local.invincible > 0){
      local.invincible--
    }

    //-> COLISIONS
    var hit = null
    if(local.target == 0){
      var target = null
      for(var el in world){
        player = world[el]
        if(player.target > 0){
          target = player
          break
        }
      }
      if(target == null) return false
      console.log("target.invincible:"+target.invincible)
      if(target.invincible == 0 && isHit(local, target)){
        hit = local.id
        local.score++
        target.target = 0
        target.invincible = 0
        local.target = 1
        local.invincible = INVINCIBLE_FRAMES
      }
    }else{
      // YOU ARE THE TARGET
      if(local.invincible == 0){
        for(var el in world){
          player = world[el]
          if(player.id != local.id){
            if(isHit(local, player)){
              hit = player.id
              player.score++
              local.target = 0
              local.invincible = 0
              player.target = 1
              player.invincible = INVINCIBLE_FRAMES
            }
          }
        }
      }
    }

    socket.broadcast.emit('canvas_updated', { world: world, hit: hit, targetScored: targetScored })
    fn({ world: world, hit: hit, targetScored: targetScored });
  });
});

function isHit(first, second){
  return ( first.x == second.x && first.y == second.y ) || ( first.x == second.x && first.y == second.y + MOVEMENT ) ||
  ( first.x == second.x && first.y == second.y - MOVEMENT ) || ( first.x == second.x + MOVEMENT && first.y == second.y ) ||
  ( first.x == second.x - MOVEMENT && first.y == second.y )
}
