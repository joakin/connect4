(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jkn/dev/projects/connect4/src/game/board.js":[function(require,module,exports){
var clone = require('../utils/clone');

// Creates a board of `size`
// The cells are a vector of vectors
var Board = module.exports = function(size) {
  var cells = [];
  for (var i = 0; i<size; i++) {
    cells.push([]);
    for (var j = 0; j<size; j++)
      cells[i].push(Board.Chips.EMPTY);
  }
  return {
    size: size,
    cells: cells
  }
};

Board.Chips = {
  EMPTY: ' ',
  BLUE: 'O',
  RED: 'X'
};


Board.get = function(row, col, b) {
  return b.cells[row][col];
};

Board.set = function(row, col, val, b) {
  var nb = clone(b);
  nb.cells[row][col] = val;
  return nb;
};

Board.put = function(col, val, b) {
  var nb = clone(b);
  for (var i = 0; i < nb.size; i++) {
    var row = nb.cells[i];
    if (row[col] === Board.Chips.EMPTY) {
      row[col] = val;
      return nb;
    }
  }
  throw new Error('Column', col, 'is full in board', b);
};


},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js"}],"/Users/jkn/dev/projects/connect4/src/game/index.js":[function(require,module,exports){

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
  played.board = Board.put(col, Board.Chips[played.state], played.board);

  return switchTurn(played);
};

function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}


},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js","./board":"/Users/jkn/dev/projects/connect4/src/game/board.js","./player":"/Users/jkn/dev/projects/connect4/src/game/player.js"}],"/Users/jkn/dev/projects/connect4/src/game/player.js":[function(require,module,exports){

exports.valid = function(player) {
  return typeof player === 'string' && player !== '';
};

},{}],"/Users/jkn/dev/projects/connect4/src/index.js":[function(require,module,exports){

console.log('Hi! Welcome to connect4');

var Connect4 = require('./game');

console.log('Init game');
var game = Connect4.init();

console.log(game);

var started = Connect4.start('John', 'Mary', game);

console.log(
  'Game started with',
  started.players.blue,
  'as BLUE and',
  started.players.red,
  'as RED'
);

console.log('Game state', started.state);

console.log('Blue puts');

var p = Connect4.play(Math.floor(Math.random()*7), started);
console.log(p, p.state);

p = Connect4.play(Math.floor(Math.random()*8), p);
console.log(p, p.state);


},{"./game":"/Users/jkn/dev/projects/connect4/src/game/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBDcmVhdGVzIGEgYm9hcmQgb2YgYHNpemVgXG4vLyBUaGUgY2VsbHMgYXJlIGEgdmVjdG9yIG9mIHZlY3RvcnNcbnZhciBCb2FyZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICB2YXIgY2VsbHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGk8c2l6ZTsgaSsrKSB7XG4gICAgY2VsbHMucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGo8c2l6ZTsgaisrKVxuICAgICAgY2VsbHNbaV0ucHVzaChCb2FyZC5DaGlwcy5FTVBUWSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuXG5Cb2FyZC5DaGlwcyA9IHtcbiAgRU1QVFk6ICcgJyxcbiAgQkxVRTogJ08nLFxuICBSRUQ6ICdYJ1xufTtcblxuXG5Cb2FyZC5nZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgYikge1xuICByZXR1cm4gYi5jZWxsc1tyb3ddW2NvbF07XG59O1xuXG5Cb2FyZC5zZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBuYi5jZWxsc1tyb3ddW2NvbF0gPSB2YWw7XG4gIHJldHVybiBuYjtcbn07XG5cbkJvYXJkLnB1dCA9IGZ1bmN0aW9uKGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5iLnNpemU7IGkrKykge1xuICAgIHZhciByb3cgPSBuYi5jZWxsc1tpXTtcbiAgICBpZiAocm93W2NvbF0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSB7XG4gICAgICByb3dbY29sXSA9IHZhbDtcbiAgICAgIHJldHVybiBuYjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdDb2x1bW4nLCBjb2wsICdpcyBmdWxsIGluIGJvYXJkJywgYik7XG59O1xuXG4iLCJcbnZhciBCb2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQnKTtcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnLi4vdXRpbHMvY2xvbmUnKTtcblxuLy8gR2FtZSBzdGF0ZXMuIEJMVUUgYW5kIFJFRCBhcmUgZm9yIGVhY2ggcGxheWVycyB0dXJuXG52YXIgU3RhdGVzID0gZXhwb3J0cy5TdGF0ZXMgPSB7XG4gIElOSVQ6ICdJTklUJyxcbiAgQkxVRTogJ0JMVUUnLFxuICBSRUQ6ICdSRUQnLFxuICBHQU1FT1ZFUjogJ0dBTUVPVkVSJ1xufTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcGxheWVyczogeyBibHVlOiAnJywgcmVkOiAnJyB9LFxuICAgIGJvYXJkOiBCb2FyZCg3KSxcbiAgICBzdGF0ZTogU3RhdGVzLklOSVRcbiAgfTtcbn07XG5cbmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lKSB7XG4gIGlmIChnYW1lLnN0YXRlICE9PSBTdGF0ZXMuSU5JVClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3Qgc3RhcnQgYSBnYW1lIHRoYXQgaXMgbm90IG5ldycpO1xuICBpZiAoIVBsYXllci52YWxpZChwbGF5ZXIxKSB8fCAhUGxheWVyLnZhbGlkKHBsYXllcjIpKVxuICAgIHRocm93IG5ldyBFcnJvcignU29tZSBwbGF5ZXIgbmFtZXMgYXJlIG5vdCB2YWxpZC4nLCBwbGF5ZXIxLCBwbGF5ZXIyKTtcblxuICB2YXIgc3RhcnRlZCA9IGNsb25lKGdhbWUpO1xuICBzdGFydGVkLnBsYXllcnMuYmx1ZSA9IHBsYXllcjE7XG4gIHN0YXJ0ZWQucGxheWVycy5yZWQgPSBwbGF5ZXIyO1xuICBzdGFydGVkLnN0YXRlID0gU3RhdGVzLkJMVUU7XG4gIHJldHVybiBzdGFydGVkO1xufTtcblxuZXhwb3J0cy5wbGF5ID0gZnVuY3Rpb24oY29sLCBnYW1lKSB7XG4gIGlmIChnYW1lLnN0YXRlICE9PSBTdGF0ZXMuQkxVRSAmJiBnYW1lLnN0YXRlICE9PSBTdGF0ZXMuUkVEKVxuICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbiBvbmx5IHBsYXkgd2hlbiB0aGUgZ2FtZSBpcyBydW5uaW5nJylcblxuICB2YXIgcGxheWVkID0gY2xvbmUoZ2FtZSk7XG4gIHBsYXllZC5ib2FyZCA9IEJvYXJkLnB1dChjb2wsIEJvYXJkLkNoaXBzW3BsYXllZC5zdGF0ZV0sIHBsYXllZC5ib2FyZCk7XG5cbiAgcmV0dXJuIHN3aXRjaFR1cm4ocGxheWVkKTtcbn07XG5cbmZ1bmN0aW9uIHN3aXRjaFR1cm4oZ2FtZSkge1xuICB2YXIgdHVybiA9IGdhbWUuc3RhdGUgPT09IFN0YXRlcy5CTFVFID8gU3RhdGVzLlJFRCA6IFN0YXRlcy5CTFVFO1xuICBnYW1lLnN0YXRlID0gdHVybjtcbiAgcmV0dXJuIGdhbWU7XG59XG5cbiIsIlxuZXhwb3J0cy52YWxpZCA9IGZ1bmN0aW9uKHBsYXllcikge1xuICByZXR1cm4gdHlwZW9mIHBsYXllciA9PT0gJ3N0cmluZycgJiYgcGxheWVyICE9PSAnJztcbn07XG4iLCJcbmNvbnNvbGUubG9nKCdIaSEgV2VsY29tZSB0byBjb25uZWN0NCcpO1xuXG52YXIgQ29ubmVjdDQgPSByZXF1aXJlKCcuL2dhbWUnKTtcblxuY29uc29sZS5sb2coJ0luaXQgZ2FtZScpO1xudmFyIGdhbWUgPSBDb25uZWN0NC5pbml0KCk7XG5cbmNvbnNvbGUubG9nKGdhbWUpO1xuXG52YXIgc3RhcnRlZCA9IENvbm5lY3Q0LnN0YXJ0KCdKb2huJywgJ01hcnknLCBnYW1lKTtcblxuY29uc29sZS5sb2coXG4gICdHYW1lIHN0YXJ0ZWQgd2l0aCcsXG4gIHN0YXJ0ZWQucGxheWVycy5ibHVlLFxuICAnYXMgQkxVRSBhbmQnLFxuICBzdGFydGVkLnBsYXllcnMucmVkLFxuICAnYXMgUkVEJ1xuKTtcblxuY29uc29sZS5sb2coJ0dhbWUgc3RhdGUnLCBzdGFydGVkLnN0YXRlKTtcblxuY29uc29sZS5sb2coJ0JsdWUgcHV0cycpO1xuXG52YXIgcCA9IENvbm5lY3Q0LnBsYXkoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjcpLCBzdGFydGVkKTtcbmNvbnNvbGUubG9nKHAsIHAuc3RhdGUpO1xuXG5wID0gQ29ubmVjdDQucGxheShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqOCksIHApO1xuY29uc29sZS5sb2cocCwgcC5zdGF0ZSk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqcykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShqcykpO1xufTtcbiJdfQ==
