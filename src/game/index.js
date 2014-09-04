
var Board = require('./board');
var Player = require('./player');
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
  if (game.state !== States.INIT)
    throw new Error('Can\'t start a game that is not new');
  if (!Player.valid(player1) || !Player.valid(player2))
    throw new Error('Some player names are not valid.', player1, player2);

  var started = clone(game);
  started.players.blue = player1;
  started.players.red = player2;
  started.state = States.BLUE;
  return started;
};

exports.play = function(col, game) {
  if (game.state !== States.BLUE && game.state !== States.RED)
    throw new Error('You can only play when the game is running')

  var played = clone(game);
  return switchTurn(played);
};

function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}

