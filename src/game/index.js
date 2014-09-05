
var Board = require('./board');
var Player = require('./player');
var clone = require('../utils/clone');

// Game logic module.
// All functions are pure, to get an initial game call `init`.
// All functions return the modified game data structure, they do not modify
// the original game.

// Game states (constants).
// INIT for the initial state waiting for players.
// BLUE and RED are for each players turn to play (imply game started)
// GAMEOVER is when the game is finished
var States = exports.States = {
  INIT: 'INIT',
  BLUE: 'BLUE',
  RED: 'RED',
  GAMEOVER: 'GAMEOVER'
};

// Initialize a game. Leave it in initial state. Next step is `start` with the
// player names.
exports.init = function() {
  return {
    players: { blue: '', red: '' },
    board: Board(7),
    state: States.INIT
  };
};

// Start a game with `player1`, and `player2`.
// Throws if it doesn't come from initial state, or the players are not valid.
// Gives the first turn to the first player.
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

// Make a move. Who moves is determined with the game state, no need to specify
// it.
// Can just be done when game is started (BLUE or RED states).
// After moving, it checks for 4 inlines and returns the win if there were.
// It also checks for full board (not sure if this can happen :s).
// Finally if nothing interesting happened it just changes turn to the other
// player.
exports.play = function(col, game) {
  if (game.state !== States.BLUE && game.state !== States.RED)
    throw new Error('You can only play when the game is running')

  var played = clone(game);
  played.board = Board.put(col, Board.Chips[played.state], played.board);

  var fourInline = Board.hasFourInline(played.board);
  if (fourInline) {
    return win(fourInline, played);
  }

  if (Board.isFull(played.board)) {
    return gameOver(played);
  }

  return switchTurn(played);
};

// Utility function to switch the turn of the player in the game state.
function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}

// Puts a game into game over
function gameOver(game) {
  var over = clone(game);
  over.state = States.GAMEOVER;
  return over;
}

// Given a winning 4 in line (like the one from Board.hasFourInline), it puts
// the game into game over and fills the winning information.
function win(fourInline, game) {
  var won = clone(game);
  won.winner = game.state;
  won.state = States.GAMEOVER;
  won.line = fourInline;
  return won;
}

// Utility. Logs a game in a ascii readable way.
exports.print = function(g) {
  console.log(' ', g.state, 'winner:', g.winner,
              'line:', g.line && g.line.how, g.line && g.line.where.join(', '));
  console.log(
    g.board.cells.map(function(r) {
      return [''].concat(r).concat(['']).join('|');
    }).reverse().join('\n')
  );
  console.log(g);
};

function getPlayer(state, game) {
  return game.players[state.toLowerCase()]
}

// Returns the current player's name.
exports.currentPlayer = function(game) {
  return getPlayer(game.state, game);
};

// Returns the winner player's name.
exports.winner = function(game) {
  return getPlayer(game.winner, game);
};

// Returns the looser player's name.
exports.looser = function(game) {
  var w = exports.winner(game);
  return game.players.blue === w ? game.players.red : game.players.blue;
};
