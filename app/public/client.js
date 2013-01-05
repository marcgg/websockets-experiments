var url = "http://localhost:8080"
var timer = 6
var isProd = false
if(document.location.host == "funfunfun-marcgg.dotcloud.com"){
  url = "funfunfun-marcgg.dotcloud.com"
  isProd = true
}
var socket = io.connect(url);
var myself

function draw(info){
  console.log(info)
  var world = info.world
  var hit = info.hit
  var target = null

  // SETUP
  var ctx = document.getElementById('main').getContext('2d')
  ctx.clearRect(0,0,400,400)

  for(var el in world){
    player = world[el]
    if(player.target > 0) target = player

    // PLAYER DRAWING
    ctx.fillStyle = player.color
    ctx.fillRect(player.x,player.y,16,16)
    if(player.target == 0){
      ctx.clearRect(player.x+1,player.y+1,14,14);
    }else{
      //ctx.clearRect(player.x+1,player.y+1, 14 - Math.floor(player.target/timer), 14 - Math.floor(player.target/timer));
    }

    // SCORES PER PLAYER
    $player = $("#" + player.id)
    $player.find(".target").html(player.target)
    $player.find(".score").html(player.score)
    $player.find(".x").html(player.x)
    $player.find(".y").html(player.y)
    $player.find(".invincible").html(player.invincible)
  }

  // HITS
  if(hit != null){
    var $badge = $("<span class='badge badge-success'>+1</span>")
    $("#" + hit).find(".change").append($badge)
    $badge.fadeOut(700)

    if(hit == myself){
      showInfo("You hit the target!", "#55aa22")
    }else if(world[myself].target == 0){
    }else{
      showInfo(world[hit].name + " hit you", "red")
    }
  }

  if(info.targetScored){
    var $badge = $("<span class='badge badge-success'>+1</span>")
    $("#" + target.id).find(".change").append($badge)
    $badge.fadeOut(700)
  }

  console.log("World redrawn")
}

var $info = null;
function showInfo(message, color){
  $info.show()
  $info.html(message)
  $info.attr("style", "color:"+color)
  $info.fadeOut(1000)
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
    html += "<td class='change'></td>"
    html += "<td class='target admin'>" + player.target + "</td>"
    html += "<td class='invincible admin'>" + player.invincible + "</td>"
    html += "<td class='x admin'>" + player.x + "</td>"
    html += "<td class='y admin'>" + player.y + "</td></tr>"
    $connected.append(html)
  }
  refreshingMutex = false
}

$(document).ready(function(){
  $info = $("#info")

  if(isProd){
    $("#prodStyle").html(".admin{ display: none; }")
    $(".admin").hide()
  }

  $("#debug").click(function(e){
    e.preventDefault()
    $("#prodStyle").html("")
    $(".admin").show()
  })

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
  $("#name").keyup(function(e) {
    if(e.keyCode == 13){
      socket.emit("change_name", $("#name").val())
    }
  })

  socket.on('connect', function () {
    socket.emit('start_game', null, function (data) {
      console.log("Game Started")
      myself = data.you
      $("#name").val("Player "+myself)
      draw(data)
      refreshConnected(data)
    })

    socket.on("timer_changed", function (data) {
      $("#timer").val(data)
      timer = data
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


