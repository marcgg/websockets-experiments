var url = "http://localhost:8080"
if(document.location.host == "funfunfun-marcgg.dotcloud.com"){
  url = "funfunfun-marcgg.dotcloud.com"
}
var socket = io.connect(url);

function draw(world){
  var ctx = document.getElementById('main').getContext('2d')
  //ctx.clearRect(0,0,300,300)

  for(var el in world){
    player = world[el]
    console.log(player)
    ctx.fillStyle = player.color
    ctx.fillRect(player.x,player.y,5,5)
  }
  console.log("World redrawn")
}

$(document).ready(function(){
  $(document).keyup(function(e){
    socket.emit("move", e.keyCode, function(data){
      if (e.keyCode == 37 ||e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)
        draw(data)
    })
  })

  socket.on('connect', function () {
    socket.emit('start_game', null, function (data) {
      console.log("Game Started")
      draw(data)
    })

    socket.on('canvas_updated', function(data){
      console.log("Canvas Updated")
      draw(data)
    })
  })

})


