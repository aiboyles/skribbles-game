const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// our list of words to choose from!
var words = []
var wordToGuess

// we're reading in a list of nouns and placing
// those nouns into an array
fs.readFile('nouns1.txt', 'utf8', function(err, data){
  words = data.split(",")
  for (var i = 0; i < words.length; i++) {
    words[i] = words[i].trim()
  }
})

http.listen(3000, function() {
  console.log('Listening on port 3000');
})

// the list of players currently in the game
var playerNames = []
// the index of the current player
var playerIndex = 0
// stores the current player object (this
// contains their username and socket id)
var currentPlayer

// Handle a new connection
io.on('connection', function(socket) {

  var username
  // when a new user joins, we will set
  // their username for their connection
  // and let everyone know they've joined
  socket.on('new user', function(user) {
    username = user

    // 🌲 what do we do when a new user joins?
    var newplayer = {
      name: user,
      id: socket.id
    }

    playerNames.push(newplayer)

    io.emit('new user', playerNames)

  })

  socket.on('start game', function() {

    // 🌲 what do we do when the "Start Game"
    // button is clicked?
    currentPlayer = playerNames[playerIndex]
    playerIndex++
    if (playerIndex == playerNames.length) {
      playerIndex = 0
    }

    io.emit("start game", currentPlayer.name)

    var wordChoices = {
      one: words[Math.floor(Math.random() * words.length)],
      two: words[Math.floor(Math.random() * words.length)],
      three: words[Math.floor(Math.random() * words.length)]
    }

    // this line sends a "word pick" event ONLY to
    // the user with a socket id stored in
    // currentPlayer.id
    io.to(currentPlayer.id).emit("word pick", wordChoices)
    console.log("current player is ")
  })

  socket.on('drawing', function(msg) {
    io.emit('drawing', msg)
  })

  socket.on('word picked', function(choice) {
    wordToGuess = choice
    console.log(wordToGuess)
  })

  socket.on("submit guess", function(guess) {

    // 🌲 What do we do when a user submits a guess?
    if (guess.word == wordToGuess) {
      io.emit("winner", guess)
    }

  })

  socket.on('clear canvas', function() {
    io.emit('clear canvas')
  })


  
})
