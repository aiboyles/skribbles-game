var socket = io()

// Prompt newcomer for username.
var username = prompt("What is your username?")
socket.emit('new user', username)

var playerList = []
var currentPlayer

function setup() {
  var canvas = createCanvas(400, 400)
  canvas.parent('sketch-holder')

  background("lightblue")
}

/******* STARTING THE GAME ******/

socket.on("new user", function(playerNames) {
  playerList = playerNames
  showPlayerList()
})


function startGame() {
  if (playerList.length < 2) {
    document.getElementById("game-info").innerHTML = "<button onclick='startGame()'>Start Game!</button><p>Not enough players!</p>"
  } else {
    socket.emit("start game")
  }
}

socket.on('start game', function(cPlayer) {
  currentPlayer = cPlayer
  markCurrentPlayer(currentPlayer)
  document.getElementById("game-info").innerHTML = ""
})

/****** DRAWING CODE  ******/

function mouseDragged() {
  if (username === currentPlayer) {
    var drawInfo = {
      pmX: pmouseX,
      pmY: pmouseY,
      mX: mouseX,
      mY: mouseY
    }

    socket.emit('drawing', drawInfo)
  }
}

socket.on('drawing', function(msg) {
  stroke("black")
  strokeWeight(8)
  line(msg.pmX, msg.pmY, msg.mX, msg.mY)
})




// When we receive a "word pick" event, we will display all
// three words as BUTTONS for the user to pick from
socket.on("word pick", function(msg) {
  var str = "<button onclick='sendWordChoice(\"" + msg.one + "\")'>" + msg.one + "</button><button onclick='sendWordChoice(\"" + msg.two + "\")'>" + msg.two + "</button><button onclick='sendWordChoice(\"" + msg.three + "\")'>" + msg.three + "</button>"
  document.getElementById("game-info").innerHTML = str
})

function sendWordChoice(choice) {
  
  // 🌲 how do we send our choice of word to the server?
  socket.emit("word picked", choice)

  document.getElementById("game-info").innerHTML = "<button onclick='clearCanvas()'>Clear Canvas</button>"
}

function clearCanvas() {
  // 🌲 how do we clear EVERYONE'S canvas?
  socket.emit('clear canvas')
}

socket.on('clear canvas', function() {
  background('lightblue')
})


function submitGuess() {
  // 🌲 how do we submit a guess to the server?
  var userGuess = {
    user: username,
    word: document.getElementById("guess").value.toLowerCase()
  }

  socket.emit("submit guess", userGuess)

  document.getElementById("guess").value = ""
}

// when we receive a "winner" event from the server, we will display the
// name of the winner, and the word they correctly guessed!
socket.on("winner", function(winnerInfo) {
  var str = winnerInfo.user + " won! The word was " + winnerInfo.word + "!<p><button onclick='startGame()'>Play Again?</button>"
  document.getElementById("game-info").innerHTML = str
})

/****** LISTING PLAYERS ******/

// marks the current player (the person currently drawing)
// in the list of player
function markCurrentPlayer(playerName) {
  showPlayerList()
  document.getElementById(playerName).innerHTML = "<span>😀 " + playerName + " ✏️</span>"
}

// displays the list of players
function showPlayerList() {
  document.getElementById("players").innerHTML = "<h3>Players</h3>"
  var str = "<ul>"
  for (var p of playerList) {
    str += "<li id='" + p.name + "'>😀 " + p.name + "</li>"
  }
  str += "</ul>"
  document.getElementById("players").innerHTML += str
}

// Allows me to send a message by hitting
// the "Enter" key
document.addEventListener('keydown', keyCheck)

function keyCheck(e) {
  if (e.code == "Enter") {
    submitGuess()
  }
}
