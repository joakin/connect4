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

      var val = row[i];
      var canBe = true && val !== Board.Chips.EMPTY;

      var horizontal = canBe;
      var vertical   = canBe;
      var updiag     = canBe;
      var downdiag   = canBe;

      if (canBe) {
        for (var k = 1; k < 4; k++) {
          horizontal = horizontal && val === row[i+k];
          vertical   = vertical   && val === board.cells[i+k][i];
          updiag     = updiag     && val === board.cells[i+k][i+k];
          downdiag   = downdiag   && val === board.cells[i+4-k][i+k];
        }

        var how = null;
        if (horizontal) how = 'HORIZONTAL';
        if (vertical)   how = 'VERTICAL';
        if (updiag)     how = 'UPDIAGONAL';
        if (downdiag)   how = 'DOWNDIAGONAL';

        if (how) return { how: how, where: [i, j] };
      }
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

},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js","./board":"/Users/jkn/dev/projects/connect4/src/game/board.js","./player":"/Users/jkn/dev/projects/connect4/src/game/player.js"}],"/Users/jkn/dev/projects/connect4/src/game/player.js":[function(require,module,exports){

exports.valid = function(player) {
  return typeof player === 'string' && player !== '';
};

},{}],"/Users/jkn/dev/projects/connect4/src/index.js":[function(require,module,exports){

var Connect4 = require('./game');


},{"./game":"/Users/jkn/dev/projects/connect4/src/game/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBDcmVhdGVzIGEgYm9hcmQgb2YgYHNpemVgXG4vLyBUaGUgY2VsbHMgYXJlIGEgdmVjdG9yIG9mIHZlY3RvcnNcbnZhciBCb2FyZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICB2YXIgY2VsbHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGk8c2l6ZTsgaSsrKSB7XG4gICAgY2VsbHMucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGo8c2l6ZTsgaisrKVxuICAgICAgY2VsbHNbaV0ucHVzaChCb2FyZC5DaGlwcy5FTVBUWSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuXG5Cb2FyZC5DaGlwcyA9IHtcbiAgRU1QVFk6ICcgJyxcbiAgQkxVRTogJ08nLFxuICBSRUQ6ICdYJ1xufTtcblxuXG5Cb2FyZC5nZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgYikge1xuICByZXR1cm4gYi5jZWxsc1tyb3ddW2NvbF07XG59O1xuXG5Cb2FyZC5zZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBuYi5jZWxsc1tyb3ddW2NvbF0gPSB2YWw7XG4gIHJldHVybiBuYjtcbn07XG5cbkJvYXJkLnB1dCA9IGZ1bmN0aW9uKGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5iLnNpemU7IGkrKykge1xuICAgIHZhciByb3cgPSBuYi5jZWxsc1tpXTtcbiAgICBpZiAocm93W2NvbF0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSB7XG4gICAgICByb3dbY29sXSA9IHZhbDtcbiAgICAgIHJldHVybiBuYjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdDb2x1bW4nLCBjb2wsICdpcyBmdWxsIGluIGJvYXJkJywgYik7XG59O1xuXG5Cb2FyZC5pc0Z1bGwgPSBmdW5jdGlvbihib2FyZCkge1xuICB2YXIgaSwgaiwgcm93O1xuICBmb3IgKGkgPSAwOyBpIDwgYm9hcmQuc2l6ZTsgaSsrKVxuICAgIGZvciAocm93ID0gYm9hcmQuY2VsbHNbaV0sIGogPSAwOyBqIDwgYm9hcmQuc2l6ZTsgaisrKVxuICAgICAgaWYgKHJvd1tqXSA9PT0gQm9hcmQuQ2hpcHMuRU1QVFkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5Cb2FyZC5oYXNGb3VySW5saW5lID0gZnVuY3Rpb24oYm9hcmQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2FyZC5zaXplIC0gNDsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IGJvYXJkLmNlbGxzW2ldO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYm9hcmQuc2l6ZSAtIDQ7IGorKykge1xuXG4gICAgICB2YXIgdmFsID0gcm93W2ldO1xuICAgICAgdmFyIGNhbkJlID0gdHJ1ZSAmJiB2YWwgIT09IEJvYXJkLkNoaXBzLkVNUFRZO1xuXG4gICAgICB2YXIgaG9yaXpvbnRhbCA9IGNhbkJlO1xuICAgICAgdmFyIHZlcnRpY2FsICAgPSBjYW5CZTtcbiAgICAgIHZhciB1cGRpYWcgICAgID0gY2FuQmU7XG4gICAgICB2YXIgZG93bmRpYWcgICA9IGNhbkJlO1xuXG4gICAgICBpZiAoY2FuQmUpIHtcbiAgICAgICAgZm9yICh2YXIgayA9IDE7IGsgPCA0OyBrKyspIHtcbiAgICAgICAgICBob3Jpem9udGFsID0gaG9yaXpvbnRhbCAmJiB2YWwgPT09IHJvd1tpK2tdO1xuICAgICAgICAgIHZlcnRpY2FsICAgPSB2ZXJ0aWNhbCAgICYmIHZhbCA9PT0gYm9hcmQuY2VsbHNbaStrXVtpXTtcbiAgICAgICAgICB1cGRpYWcgICAgID0gdXBkaWFnICAgICAmJiB2YWwgPT09IGJvYXJkLmNlbGxzW2kra11baStrXTtcbiAgICAgICAgICBkb3duZGlhZyAgID0gZG93bmRpYWcgICAmJiB2YWwgPT09IGJvYXJkLmNlbGxzW2krNC1rXVtpK2tdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhvdyA9IG51bGw7XG4gICAgICAgIGlmIChob3Jpem9udGFsKSBob3cgPSAnSE9SSVpPTlRBTCc7XG4gICAgICAgIGlmICh2ZXJ0aWNhbCkgICBob3cgPSAnVkVSVElDQUwnO1xuICAgICAgICBpZiAodXBkaWFnKSAgICAgaG93ID0gJ1VQRElBR09OQUwnO1xuICAgICAgICBpZiAoZG93bmRpYWcpICAgaG93ID0gJ0RPV05ESUFHT05BTCc7XG5cbiAgICAgICAgaWYgKGhvdykgcmV0dXJuIHsgaG93OiBob3csIHdoZXJlOiBbaSwgal0gfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuIiwiXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2Nsb25lJyk7XG5cbi8vIEdhbWUgc3RhdGVzLiBCTFVFIGFuZCBSRUQgYXJlIGZvciBlYWNoIHBsYXllcnMgdHVyblxudmFyIFN0YXRlcyA9IGV4cG9ydHMuU3RhdGVzID0ge1xuICBJTklUOiAnSU5JVCcsXG4gIEJMVUU6ICdCTFVFJyxcbiAgUkVEOiAnUkVEJyxcbiAgR0FNRU9WRVI6ICdHQU1FT1ZFUidcbn07XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBsYXllcnM6IHsgYmx1ZTogJycsIHJlZDogJycgfSxcbiAgICBib2FyZDogQm9hcmQoNyksXG4gICAgc3RhdGU6IFN0YXRlcy5JTklUXG4gIH07XG59O1xuXG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24ocGxheWVyMSwgcGxheWVyMiwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLklOSVQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHN0YXJ0IGEgZ2FtZSB0aGF0IGlzIG5vdCBuZXcnKTtcbiAgaWYgKCFQbGF5ZXIudmFsaWQocGxheWVyMSkgfHwgIVBsYXllci52YWxpZChwbGF5ZXIyKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvbWUgcGxheWVyIG5hbWVzIGFyZSBub3QgdmFsaWQuJywgcGxheWVyMSwgcGxheWVyMik7XG5cbiAgdmFyIHN0YXJ0ZWQgPSBjbG9uZShnYW1lKTtcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUgPSBwbGF5ZXIxO1xuICBzdGFydGVkLnBsYXllcnMucmVkID0gcGxheWVyMjtcbiAgc3RhcnRlZC5zdGF0ZSA9IFN0YXRlcy5CTFVFO1xuICByZXR1cm4gc3RhcnRlZDtcbn07XG5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGNvbCwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLkJMVUUgJiYgZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLlJFRClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW4gb25seSBwbGF5IHdoZW4gdGhlIGdhbWUgaXMgcnVubmluZycpXG5cbiAgdmFyIHBsYXllZCA9IGNsb25lKGdhbWUpO1xuICBwbGF5ZWQuYm9hcmQgPSBCb2FyZC5wdXQoY29sLCBCb2FyZC5DaGlwc1twbGF5ZWQuc3RhdGVdLCBwbGF5ZWQuYm9hcmQpO1xuXG4gIHZhciBmb3VySW5saW5lID0gQm9hcmQuaGFzRm91cklubGluZShwbGF5ZWQuYm9hcmQpO1xuICBpZiAoZm91cklubGluZSkge1xuICAgIHJldHVybiB3aW4oZm91cklubGluZSwgcGxheWVkKTtcbiAgfVxuXG4gIGlmIChCb2FyZC5pc0Z1bGwocGxheWVkLmJvYXJkKSkge1xuICAgIHJldHVybiBnYW1lT3ZlcihwbGF5ZWQpO1xuICB9XG5cbiAgcmV0dXJuIHN3aXRjaFR1cm4ocGxheWVkKTtcbn07XG5cbmZ1bmN0aW9uIHN3aXRjaFR1cm4oZ2FtZSkge1xuICB2YXIgdHVybiA9IGdhbWUuc3RhdGUgPT09IFN0YXRlcy5CTFVFID8gU3RhdGVzLlJFRCA6IFN0YXRlcy5CTFVFO1xuICBnYW1lLnN0YXRlID0gdHVybjtcbiAgcmV0dXJuIGdhbWU7XG59XG5cbmZ1bmN0aW9uIGdhbWVPdmVyKGdhbWUpIHtcbiAgdmFyIG92ZXIgPSBjbG9uZShnYW1lKTtcbiAgb3Zlci5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgcmV0dXJuIG92ZXI7XG59XG5cbmZ1bmN0aW9uIHdpbihmb3VySW5saW5lLCBnYW1lKSB7XG4gIHZhciB3b24gPSBjbG9uZShnYW1lKTtcbiAgd29uLndpbm5lciA9IGdhbWUuc3RhdGU7XG4gIHdvbi5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgd29uLmxpbmUgPSBmb3VySW5saW5lO1xuICByZXR1cm4gd29uO1xufVxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24oZykge1xuICBjb25zb2xlLmxvZygnICcsIGcuc3RhdGUsICd3aW5uZXI6JywgZy53aW5uZXIsXG4gICAgICAgICAgICAgICdsaW5lOicsIGcubGluZSAmJiBnLmxpbmUuaG93LCBnLmxpbmUgJiYgZy5saW5lLndoZXJlLmpvaW4oJywgJykpO1xuICBjb25zb2xlLmxvZyhcbiAgICBnLmJvYXJkLmNlbGxzLm1hcChmdW5jdGlvbihyKSB7XG4gICAgICByZXR1cm4gWycnXS5jb25jYXQocikuY29uY2F0KFsnJ10pLmpvaW4oJ3wnKTtcbiAgICB9KS5yZXZlcnNlKCkuam9pbignXFxuJylcbiAgKTtcbiAgY29uc29sZS5sb2coZyk7XG59O1xuIiwiXG5leHBvcnRzLnZhbGlkID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gIHJldHVybiB0eXBlb2YgcGxheWVyID09PSAnc3RyaW5nJyAmJiBwbGF5ZXIgIT09ICcnO1xufTtcbiIsIlxudmFyIENvbm5lY3Q0ID0gcmVxdWlyZSgnLi9nYW1lJyk7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqcykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShqcykpO1xufTtcbiJdfQ==
