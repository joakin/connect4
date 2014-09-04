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

Board.isFull = function(board) {
  var i, j, row;
  for (i = 0; i < board.size; i++)
    for (row = board.cells[i], j = 0; j < board.size; j++)
      if (row[j] === Board.Chips.EMPTY) return false;
  return true;
};

Board.hasFourInline = function(board) {
  for (var i = 0; i < board.size - 4; i++) {
    var row = board.cells[i];
    for (var j = 0; j < board.size - 4; j++) {
      // Check horizontals
      if (row[i] !== Board.Chips.EMPTY &&
          row[i] === row[i+1] &&
          row[i] === row[i+2] &&
          row[i] === row[i+3])
        return { how: 'HORIZONTAL', where: [i, j] };

      // Check vertical
      var row1 = board.cells[i+1];
      var row2 = board.cells[i+2];
      var row3 = board.cells[i+3];
      if (row[i] !== Board.Chips.EMPTY &&
          row[i] === row1[i] &&
          row[i] === row2[i] &&
          row[i] === row3[i])
        return { how: 'VERTICAL', where: [i, j] };
    }
  }
  return null;
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

  var fourInline = Board.hasFourInline(played.board);
  if (fourInline) {
    return win(fourInline, played);
  }

  if (Board.isFull(played.board)) {
    return gameOver(played);
  }

  return switchTurn(played);
};

function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}

function gameOver(game) {
  var over = clone(game);
  over.state = States.GAMEOVER;
  return over;
}

function win(fourInline, game) {
  var won = clone(game);
  won.winner = game.state;
  won.state = States.GAMEOVER;
  won.line = fourInline;
  return won;
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

var p = Connect4.play(3, started);
console.log(p, p.state);
console.log(printBoard(p));

p = Connect4.play(3, p);
console.log(p, p.state);
console.log(printBoard(p));

[0, 1, 2].forEach(function(m) {
  p = Connect4.play(m, p);
  if (m !== 2)
    p = Connect4.play(m, p);
});

console.log(p, p.state);
printBoard(p);


function printBoard(g) {
  console.log(g.board.cells.map(function(r) {return r.join('|');}).join('\n'));
}


},{"./game":"/Users/jkn/dev/projects/connect4/src/game/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNsb25lID0gcmVxdWlyZSgnLi4vdXRpbHMvY2xvbmUnKTtcblxuLy8gQ3JlYXRlcyBhIGJvYXJkIG9mIGBzaXplYFxuLy8gVGhlIGNlbGxzIGFyZSBhIHZlY3RvciBvZiB2ZWN0b3JzXG52YXIgQm9hcmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgdmFyIGNlbGxzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpPHNpemU7IGkrKykge1xuICAgIGNlbGxzLnB1c2goW10pO1xuICAgIGZvciAodmFyIGogPSAwOyBqPHNpemU7IGorKylcbiAgICAgIGNlbGxzW2ldLnB1c2goQm9hcmQuQ2hpcHMuRU1QVFkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgc2l6ZTogc2l6ZSxcbiAgICBjZWxsczogY2VsbHNcbiAgfVxufTtcblxuQm9hcmQuQ2hpcHMgPSB7XG4gIEVNUFRZOiAnICcsXG4gIEJMVUU6ICdPJyxcbiAgUkVEOiAnWCdcbn07XG5cblxuQm9hcmQuZ2V0ID0gZnVuY3Rpb24ocm93LCBjb2wsIGIpIHtcbiAgcmV0dXJuIGIuY2VsbHNbcm93XVtjb2xdO1xufTtcblxuQm9hcmQuc2V0ID0gZnVuY3Rpb24ocm93LCBjb2wsIHZhbCwgYikge1xuICB2YXIgbmIgPSBjbG9uZShiKTtcbiAgbmIuY2VsbHNbcm93XVtjb2xdID0gdmFsO1xuICByZXR1cm4gbmI7XG59O1xuXG5Cb2FyZC5wdXQgPSBmdW5jdGlvbihjb2wsIHZhbCwgYikge1xuICB2YXIgbmIgPSBjbG9uZShiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYi5zaXplOyBpKyspIHtcbiAgICB2YXIgcm93ID0gbmIuY2VsbHNbaV07XG4gICAgaWYgKHJvd1tjb2xdID09PSBCb2FyZC5DaGlwcy5FTVBUWSkge1xuICAgICAgcm93W2NvbF0gPSB2YWw7XG4gICAgICByZXR1cm4gbmI7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignQ29sdW1uJywgY29sLCAnaXMgZnVsbCBpbiBib2FyZCcsIGIpO1xufTtcblxuQm9hcmQuaXNGdWxsID0gZnVuY3Rpb24oYm9hcmQpIHtcbiAgdmFyIGksIGosIHJvdztcbiAgZm9yIChpID0gMDsgaSA8IGJvYXJkLnNpemU7IGkrKylcbiAgICBmb3IgKHJvdyA9IGJvYXJkLmNlbGxzW2ldLCBqID0gMDsgaiA8IGJvYXJkLnNpemU7IGorKylcbiAgICAgIGlmIChyb3dbal0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufTtcblxuQm9hcmQuaGFzRm91cklubGluZSA9IGZ1bmN0aW9uKGJvYXJkKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYm9hcmQuc2l6ZSAtIDQ7IGkrKykge1xuICAgIHZhciByb3cgPSBib2FyZC5jZWxsc1tpXTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJvYXJkLnNpemUgLSA0OyBqKyspIHtcbiAgICAgIC8vIENoZWNrIGhvcml6b250YWxzXG4gICAgICBpZiAocm93W2ldICE9PSBCb2FyZC5DaGlwcy5FTVBUWSAmJlxuICAgICAgICAgIHJvd1tpXSA9PT0gcm93W2krMV0gJiZcbiAgICAgICAgICByb3dbaV0gPT09IHJvd1tpKzJdICYmXG4gICAgICAgICAgcm93W2ldID09PSByb3dbaSszXSlcbiAgICAgICAgcmV0dXJuIHsgaG93OiAnSE9SSVpPTlRBTCcsIHdoZXJlOiBbaSwgal0gfTtcblxuICAgICAgLy8gQ2hlY2sgdmVydGljYWxcbiAgICAgIHZhciByb3cxID0gYm9hcmQuY2VsbHNbaSsxXTtcbiAgICAgIHZhciByb3cyID0gYm9hcmQuY2VsbHNbaSsyXTtcbiAgICAgIHZhciByb3czID0gYm9hcmQuY2VsbHNbaSszXTtcbiAgICAgIGlmIChyb3dbaV0gIT09IEJvYXJkLkNoaXBzLkVNUFRZICYmXG4gICAgICAgICAgcm93W2ldID09PSByb3cxW2ldICYmXG4gICAgICAgICAgcm93W2ldID09PSByb3cyW2ldICYmXG4gICAgICAgICAgcm93W2ldID09PSByb3czW2ldKVxuICAgICAgICByZXR1cm4geyBob3c6ICdWRVJUSUNBTCcsIHdoZXJlOiBbaSwgal0gfTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuIiwiXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2Nsb25lJyk7XG5cbi8vIEdhbWUgc3RhdGVzLiBCTFVFIGFuZCBSRUQgYXJlIGZvciBlYWNoIHBsYXllcnMgdHVyblxudmFyIFN0YXRlcyA9IGV4cG9ydHMuU3RhdGVzID0ge1xuICBJTklUOiAnSU5JVCcsXG4gIEJMVUU6ICdCTFVFJyxcbiAgUkVEOiAnUkVEJyxcbiAgR0FNRU9WRVI6ICdHQU1FT1ZFUidcbn07XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBsYXllcnM6IHsgYmx1ZTogJycsIHJlZDogJycgfSxcbiAgICBib2FyZDogQm9hcmQoNyksXG4gICAgc3RhdGU6IFN0YXRlcy5JTklUXG4gIH07XG59O1xuXG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24ocGxheWVyMSwgcGxheWVyMiwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLklOSVQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHN0YXJ0IGEgZ2FtZSB0aGF0IGlzIG5vdCBuZXcnKTtcbiAgaWYgKCFQbGF5ZXIudmFsaWQocGxheWVyMSkgfHwgIVBsYXllci52YWxpZChwbGF5ZXIyKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvbWUgcGxheWVyIG5hbWVzIGFyZSBub3QgdmFsaWQuJywgcGxheWVyMSwgcGxheWVyMik7XG5cbiAgdmFyIHN0YXJ0ZWQgPSBjbG9uZShnYW1lKTtcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUgPSBwbGF5ZXIxO1xuICBzdGFydGVkLnBsYXllcnMucmVkID0gcGxheWVyMjtcbiAgc3RhcnRlZC5zdGF0ZSA9IFN0YXRlcy5CTFVFO1xuICByZXR1cm4gc3RhcnRlZDtcbn07XG5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGNvbCwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLkJMVUUgJiYgZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLlJFRClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW4gb25seSBwbGF5IHdoZW4gdGhlIGdhbWUgaXMgcnVubmluZycpXG5cbiAgdmFyIHBsYXllZCA9IGNsb25lKGdhbWUpO1xuICBwbGF5ZWQuYm9hcmQgPSBCb2FyZC5wdXQoY29sLCBCb2FyZC5DaGlwc1twbGF5ZWQuc3RhdGVdLCBwbGF5ZWQuYm9hcmQpO1xuXG4gIHZhciBmb3VySW5saW5lID0gQm9hcmQuaGFzRm91cklubGluZShwbGF5ZWQuYm9hcmQpO1xuICBpZiAoZm91cklubGluZSkge1xuICAgIHJldHVybiB3aW4oZm91cklubGluZSwgcGxheWVkKTtcbiAgfVxuXG4gIGlmIChCb2FyZC5pc0Z1bGwocGxheWVkLmJvYXJkKSkge1xuICAgIHJldHVybiBnYW1lT3ZlcihwbGF5ZWQpO1xuICB9XG5cbiAgcmV0dXJuIHN3aXRjaFR1cm4ocGxheWVkKTtcbn07XG5cbmZ1bmN0aW9uIHN3aXRjaFR1cm4oZ2FtZSkge1xuICB2YXIgdHVybiA9IGdhbWUuc3RhdGUgPT09IFN0YXRlcy5CTFVFID8gU3RhdGVzLlJFRCA6IFN0YXRlcy5CTFVFO1xuICBnYW1lLnN0YXRlID0gdHVybjtcbiAgcmV0dXJuIGdhbWU7XG59XG5cbmZ1bmN0aW9uIGdhbWVPdmVyKGdhbWUpIHtcbiAgdmFyIG92ZXIgPSBjbG9uZShnYW1lKTtcbiAgb3Zlci5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgcmV0dXJuIG92ZXI7XG59XG5cbmZ1bmN0aW9uIHdpbihmb3VySW5saW5lLCBnYW1lKSB7XG4gIHZhciB3b24gPSBjbG9uZShnYW1lKTtcbiAgd29uLndpbm5lciA9IGdhbWUuc3RhdGU7XG4gIHdvbi5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgd29uLmxpbmUgPSBmb3VySW5saW5lO1xuICByZXR1cm4gd29uO1xufVxuXG4iLCJcbmV4cG9ydHMudmFsaWQgPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgcmV0dXJuIHR5cGVvZiBwbGF5ZXIgPT09ICdzdHJpbmcnICYmIHBsYXllciAhPT0gJyc7XG59O1xuIiwiXG5jb25zb2xlLmxvZygnSGkhIFdlbGNvbWUgdG8gY29ubmVjdDQnKTtcblxudmFyIENvbm5lY3Q0ID0gcmVxdWlyZSgnLi9nYW1lJyk7XG5cbmNvbnNvbGUubG9nKCdJbml0IGdhbWUnKTtcbnZhciBnYW1lID0gQ29ubmVjdDQuaW5pdCgpO1xuXG5jb25zb2xlLmxvZyhnYW1lKTtcblxudmFyIHN0YXJ0ZWQgPSBDb25uZWN0NC5zdGFydCgnSm9obicsICdNYXJ5JywgZ2FtZSk7XG5cbmNvbnNvbGUubG9nKFxuICAnR2FtZSBzdGFydGVkIHdpdGgnLFxuICBzdGFydGVkLnBsYXllcnMuYmx1ZSxcbiAgJ2FzIEJMVUUgYW5kJyxcbiAgc3RhcnRlZC5wbGF5ZXJzLnJlZCxcbiAgJ2FzIFJFRCdcbik7XG5cbmNvbnNvbGUubG9nKCdHYW1lIHN0YXRlJywgc3RhcnRlZC5zdGF0ZSk7XG5cbmNvbnNvbGUubG9nKCdCbHVlIHB1dHMnKTtcblxudmFyIHAgPSBDb25uZWN0NC5wbGF5KDMsIHN0YXJ0ZWQpO1xuY29uc29sZS5sb2cocCwgcC5zdGF0ZSk7XG5jb25zb2xlLmxvZyhwcmludEJvYXJkKHApKTtcblxucCA9IENvbm5lY3Q0LnBsYXkoMywgcCk7XG5jb25zb2xlLmxvZyhwLCBwLnN0YXRlKTtcbmNvbnNvbGUubG9nKHByaW50Qm9hcmQocCkpO1xuXG5bMCwgMSwgMl0uZm9yRWFjaChmdW5jdGlvbihtKSB7XG4gIHAgPSBDb25uZWN0NC5wbGF5KG0sIHApO1xuICBpZiAobSAhPT0gMilcbiAgICBwID0gQ29ubmVjdDQucGxheShtLCBwKTtcbn0pO1xuXG5jb25zb2xlLmxvZyhwLCBwLnN0YXRlKTtcbnByaW50Qm9hcmQocCk7XG5cblxuZnVuY3Rpb24gcHJpbnRCb2FyZChnKSB7XG4gIGNvbnNvbGUubG9nKGcuYm9hcmQuY2VsbHMubWFwKGZ1bmN0aW9uKHIpIHtyZXR1cm4gci5qb2luKCd8Jyk7fSkuam9pbignXFxuJykpO1xufVxuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oanMpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoanMpKTtcbn07XG4iXX0=
