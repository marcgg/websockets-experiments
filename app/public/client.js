var url = "http://localhost:8080"
if(document.location.host == "funfunfun-marcgg.dotcloud.com"){
  url = "funfunfun-marcgg.dotcloud.com"
}
var socket = io.connect(url);

function draw(world){
  var ctx = document.getElementById('main').getContext('2d')
  ctx.clearRect(0,0,400,400)

  for(var el in world){
    player = world[el]
    ctx.fillStyle = player.color
    ctx.fillRect(player.x,player.y,20,20)
  }
  console.log("World redrawn")
}

function refreshConnected(world){
  var $connected = $("#connected")
  $("#connected span").remove()
  for(var el in world){
    player = world[el]
    $connected.append("<span style='color:" + player.color + "'>" + player.name + "</span>")
  }
}

$(document).ready(function(){
  $(document).keyup(function(e){
    socket.emit("move", e.keyCode, function(data){
      if (e.keyCode == 37 ||e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)
        draw(data)
    })
  })

  $("#chat").keyup(function(e) {
    if(e.keyCode == 13){
      socket.emit("speak", [$("#name").val(), $("#chat").val()])
      $("#speakers").prepend("<div>Me: " + $("#chat").val() + "</div>")
      $("#chat").val("")
    }
  })

  socket.on('connect', function () {
    socket.emit('start_game', null, function (data) {
      console.log("Game Started")
      draw(data)
      refreshConnected(data)
    })

    socket.on("players_updated", function(data){
      console.log("players_updated")
      console.log(data)
      refreshConnected(data)
    })

    socket.on('canvas_updated', function(data){
      console.log("Canvas Updated")
      draw(data)
    })

    socket.on('chat_updated', function(data){
      $("#speakers").prepend("<div>" + data + "</div>")
    })
  })

})


