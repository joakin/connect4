
var Board = require('./board');
var clone = require('../utils/clone');

// Game states. BLUE and RED are for each players turn
var States = exports.States = {
  INIT: 'INIT',
  BLUE: 'BLUE',
  RED: 'RED',
  GAMEOVER: 'GAMEOVER'
};

exports.init = function() {
  return {
    players: { blue: '', red: '' },
    board: Board(7),
    state: States.INIT
  };
};

exports.start = function(player1, player2, game) {
  var started = clone(game);
  started.players.blue = player1;
  started.players.red = player2;
  started.state = States.BLUE;
  return started;
};

// exports.startGame = function(blue, red)
