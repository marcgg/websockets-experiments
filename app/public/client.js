var url = "http://localhost:8080"
var isProd = false
if(document.location.host == "funfunfun-marcgg.dotcloud.com"){
  url = "funfunfun-marcgg.dotcloud.com"
  isProd = true
}
var socket = io.connect(url);

function draw(info){
  var world = info.world
  var hit = info.hit
  console.log("HIT:" + hit)
  var ctx = document.getElementById('main').getContext('2d')
  ctx.clearRect(0,0,400,400)

  for(var el in world){
    player = world[el]
    ctx.fillStyle = player.color
    ctx.fillRect(player.x,player.y,16,16)
    if(player.target == 0){
      ctx.clearRect(player.x+1,player.y+1,14,14);
    }else{
      ctx.clearRect(player.x+1,player.y+1, 14 - Math.floor(player.target/4), 14 - Math.floor(player.target/4));
    }
    $player = $("#" + player.id)
    $player.find(".target").html(player.target)
    $player.find(".score").html(player.score)
    $player.find(".x").html(player.x)
    $player.find(".y").html(player.y)
  }
  console.log("World redrawn")
  console.log(world)
}

var refreshingMutex = false

function refreshConnected(info){
  var world = info.world
  if(refreshingMutex) return false
  refreshingMutex = true
  var $connected = $("#connected")
  $("#connected").html("")
  for(var el in world){
    player = world[el]
    html =  "<tr id='" + player.id + "' class='target-" + (player.target > 0)+ "' style='color:" + player.color + "'>"
    html += "<td class='score-wrapper'><span class='badge score' style='background-color:"+player.color+"'>" + player.score + "</span></td>"
    html += "<td class='name'>" + player.name + "</td>"
    html += "<td class='target'>" + player.target + "</td>"
    html += "<td class='x'>" + player.x + "</td>"
    html += "<td class='y'>" + player.y + "</td></tr>"
    $connected.append(html)
  }
  refreshingMutex = false
}

$(document).ready(function(){
  isProd = true
  if(isProd){
    $("#prodStyle").html(".x, .y, .target{ display: none; }")
  }

  $(document).keyup(function(e){
    if (e.keyCode == 37 ||e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
      socket.emit("move", e.keyCode, function(data){
        draw(data)
      })
    }
  });

  $("#chat").keyup(function(e) {
    if(e.keyCode == 13){
      socket.emit("speak", [$("#name").val(), $("#chat").val()])
      var $speakers = $("#speakers")
      $speakers.append("<div>Me: " + $("#chat").val() + "</div>")
      $("#chat").val("")
      $speakers.animate({ scrollTop: $speakers.prop("scrollHeight") - $speakers.height() }, 100);
    }
  })

  socket.on('connect', function () {
    socket.emit('start_game', null, function (data) {
      console.log("Game Started")
      draw(data)
      refreshConnected(data)
    })

    socket.on("players_updated", function(data){
      console.log("Players Updated")
      refreshConnected(data)
    })

    socket.on('canvas_updated', function(data){
      console.log("Canvas Updated")
      draw(data)
    })

    socket.on('chat_updated', function(data){
      var $speakers = $("#speakers")
      $speakers.append("<div>" + data + "</div>")
      $speakers.animate({ scrollTop: $speakers.prop("scrollHeight") - $speakers.height() }, 100);
    })
  })

})


