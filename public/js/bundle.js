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
      var diagval = board.cells[i+3][i];
      var canBe = true && val !== Board.Chips.EMPTY;
      var diagCanBe = true && diagval !== Board.Chips.EMPTY;

      var horizontal = canBe;
      var vertical   = canBe;
      var updiag     = canBe;
      var downdiag   = diagCanBe;

      if (canBe || diagCanBe) {
        for (var k = 1; k < 4; k++) {
          horizontal = horizontal && val === row[i+k];
          vertical   = vertical   && val === board.cells[i+k][i];
          updiag     = updiag     && val === board.cells[i+k][i+k];
          downdiag   = downdiag   && diagval === board.cells[i+3-k][i+k];
        }

        var how = null;
        var where = [i, j];
        if (horizontal) how = 'HORIZONTAL';
        if (vertical)   how = 'VERTICAL';
        if (updiag)     how = 'UPDIAGONAL';
        if (downdiag) { how = 'DOWNDIAGONAL'; where = [i+3, j]; }

        if (how) return { how: how, where: where };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBDcmVhdGVzIGEgYm9hcmQgb2YgYHNpemVgXG4vLyBUaGUgY2VsbHMgYXJlIGEgdmVjdG9yIG9mIHZlY3RvcnNcbnZhciBCb2FyZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICB2YXIgY2VsbHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGk8c2l6ZTsgaSsrKSB7XG4gICAgY2VsbHMucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGo8c2l6ZTsgaisrKVxuICAgICAgY2VsbHNbaV0ucHVzaChCb2FyZC5DaGlwcy5FTVBUWSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuXG5Cb2FyZC5DaGlwcyA9IHtcbiAgRU1QVFk6ICcgJyxcbiAgQkxVRTogJ08nLFxuICBSRUQ6ICdYJ1xufTtcblxuXG5Cb2FyZC5nZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgYikge1xuICByZXR1cm4gYi5jZWxsc1tyb3ddW2NvbF07XG59O1xuXG5Cb2FyZC5zZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBuYi5jZWxsc1tyb3ddW2NvbF0gPSB2YWw7XG4gIHJldHVybiBuYjtcbn07XG5cbkJvYXJkLnB1dCA9IGZ1bmN0aW9uKGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5iLnNpemU7IGkrKykge1xuICAgIHZhciByb3cgPSBuYi5jZWxsc1tpXTtcbiAgICBpZiAocm93W2NvbF0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSB7XG4gICAgICByb3dbY29sXSA9IHZhbDtcbiAgICAgIHJldHVybiBuYjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdDb2x1bW4nLCBjb2wsICdpcyBmdWxsIGluIGJvYXJkJywgYik7XG59O1xuXG5Cb2FyZC5pc0Z1bGwgPSBmdW5jdGlvbihib2FyZCkge1xuICB2YXIgaSwgaiwgcm93O1xuICBmb3IgKGkgPSAwOyBpIDwgYm9hcmQuc2l6ZTsgaSsrKVxuICAgIGZvciAocm93ID0gYm9hcmQuY2VsbHNbaV0sIGogPSAwOyBqIDwgYm9hcmQuc2l6ZTsgaisrKVxuICAgICAgaWYgKHJvd1tqXSA9PT0gQm9hcmQuQ2hpcHMuRU1QVFkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5Cb2FyZC5oYXNGb3VySW5saW5lID0gZnVuY3Rpb24oYm9hcmQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2FyZC5zaXplIC0gNDsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IGJvYXJkLmNlbGxzW2ldO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYm9hcmQuc2l6ZSAtIDQ7IGorKykge1xuXG4gICAgICB2YXIgdmFsID0gcm93W2ldO1xuICAgICAgdmFyIGRpYWd2YWwgPSBib2FyZC5jZWxsc1tpKzNdW2ldO1xuICAgICAgdmFyIGNhbkJlID0gdHJ1ZSAmJiB2YWwgIT09IEJvYXJkLkNoaXBzLkVNUFRZO1xuICAgICAgdmFyIGRpYWdDYW5CZSA9IHRydWUgJiYgZGlhZ3ZhbCAhPT0gQm9hcmQuQ2hpcHMuRU1QVFk7XG5cbiAgICAgIHZhciBob3Jpem9udGFsID0gY2FuQmU7XG4gICAgICB2YXIgdmVydGljYWwgICA9IGNhbkJlO1xuICAgICAgdmFyIHVwZGlhZyAgICAgPSBjYW5CZTtcbiAgICAgIHZhciBkb3duZGlhZyAgID0gZGlhZ0NhbkJlO1xuXG4gICAgICBpZiAoY2FuQmUgfHwgZGlhZ0NhbkJlKSB7XG4gICAgICAgIGZvciAodmFyIGsgPSAxOyBrIDwgNDsgaysrKSB7XG4gICAgICAgICAgaG9yaXpvbnRhbCA9IGhvcml6b250YWwgJiYgdmFsID09PSByb3dbaStrXTtcbiAgICAgICAgICB2ZXJ0aWNhbCAgID0gdmVydGljYWwgICAmJiB2YWwgPT09IGJvYXJkLmNlbGxzW2kra11baV07XG4gICAgICAgICAgdXBkaWFnICAgICA9IHVwZGlhZyAgICAgJiYgdmFsID09PSBib2FyZC5jZWxsc1tpK2tdW2kra107XG4gICAgICAgICAgZG93bmRpYWcgICA9IGRvd25kaWFnICAgJiYgZGlhZ3ZhbCA9PT0gYm9hcmQuY2VsbHNbaSszLWtdW2kra107XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaG93ID0gbnVsbDtcbiAgICAgICAgdmFyIHdoZXJlID0gW2ksIGpdO1xuICAgICAgICBpZiAoaG9yaXpvbnRhbCkgaG93ID0gJ0hPUklaT05UQUwnO1xuICAgICAgICBpZiAodmVydGljYWwpICAgaG93ID0gJ1ZFUlRJQ0FMJztcbiAgICAgICAgaWYgKHVwZGlhZykgICAgIGhvdyA9ICdVUERJQUdPTkFMJztcbiAgICAgICAgaWYgKGRvd25kaWFnKSB7IGhvdyA9ICdET1dORElBR09OQUwnOyB3aGVyZSA9IFtpKzMsIGpdOyB9XG5cbiAgICAgICAgaWYgKGhvdykgcmV0dXJuIHsgaG93OiBob3csIHdoZXJlOiB3aGVyZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG4iLCJcbnZhciBCb2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQnKTtcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnLi4vdXRpbHMvY2xvbmUnKTtcblxuLy8gR2FtZSBzdGF0ZXMuIEJMVUUgYW5kIFJFRCBhcmUgZm9yIGVhY2ggcGxheWVycyB0dXJuXG52YXIgU3RhdGVzID0gZXhwb3J0cy5TdGF0ZXMgPSB7XG4gIElOSVQ6ICdJTklUJyxcbiAgQkxVRTogJ0JMVUUnLFxuICBSRUQ6ICdSRUQnLFxuICBHQU1FT1ZFUjogJ0dBTUVPVkVSJ1xufTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcGxheWVyczogeyBibHVlOiAnJywgcmVkOiAnJyB9LFxuICAgIGJvYXJkOiBCb2FyZCg3KSxcbiAgICBzdGF0ZTogU3RhdGVzLklOSVRcbiAgfTtcbn07XG5cbmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lKSB7XG4gIGlmIChnYW1lLnN0YXRlICE9PSBTdGF0ZXMuSU5JVClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3Qgc3RhcnQgYSBnYW1lIHRoYXQgaXMgbm90IG5ldycpO1xuICBpZiAoIVBsYXllci52YWxpZChwbGF5ZXIxKSB8fCAhUGxheWVyLnZhbGlkKHBsYXllcjIpKVxuICAgIHRocm93IG5ldyBFcnJvcignU29tZSBwbGF5ZXIgbmFtZXMgYXJlIG5vdCB2YWxpZC4nLCBwbGF5ZXIxLCBwbGF5ZXIyKTtcblxuICB2YXIgc3RhcnRlZCA9IGNsb25lKGdhbWUpO1xuICBzdGFydGVkLnBsYXllcnMuYmx1ZSA9IHBsYXllcjE7XG4gIHN0YXJ0ZWQucGxheWVycy5yZWQgPSBwbGF5ZXIyO1xuICBzdGFydGVkLnN0YXRlID0gU3RhdGVzLkJMVUU7XG4gIHJldHVybiBzdGFydGVkO1xufTtcblxuZXhwb3J0cy5wbGF5ID0gZnVuY3Rpb24oY29sLCBnYW1lKSB7XG4gIGlmIChnYW1lLnN0YXRlICE9PSBTdGF0ZXMuQkxVRSAmJiBnYW1lLnN0YXRlICE9PSBTdGF0ZXMuUkVEKVxuICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbiBvbmx5IHBsYXkgd2hlbiB0aGUgZ2FtZSBpcyBydW5uaW5nJylcblxuICB2YXIgcGxheWVkID0gY2xvbmUoZ2FtZSk7XG4gIHBsYXllZC5ib2FyZCA9IEJvYXJkLnB1dChjb2wsIEJvYXJkLkNoaXBzW3BsYXllZC5zdGF0ZV0sIHBsYXllZC5ib2FyZCk7XG5cbiAgdmFyIGZvdXJJbmxpbmUgPSBCb2FyZC5oYXNGb3VySW5saW5lKHBsYXllZC5ib2FyZCk7XG4gIGlmIChmb3VySW5saW5lKSB7XG4gICAgcmV0dXJuIHdpbihmb3VySW5saW5lLCBwbGF5ZWQpO1xuICB9XG5cbiAgaWYgKEJvYXJkLmlzRnVsbChwbGF5ZWQuYm9hcmQpKSB7XG4gICAgcmV0dXJuIGdhbWVPdmVyKHBsYXllZCk7XG4gIH1cblxuICByZXR1cm4gc3dpdGNoVHVybihwbGF5ZWQpO1xufTtcblxuZnVuY3Rpb24gc3dpdGNoVHVybihnYW1lKSB7XG4gIHZhciB0dXJuID0gZ2FtZS5zdGF0ZSA9PT0gU3RhdGVzLkJMVUUgPyBTdGF0ZXMuUkVEIDogU3RhdGVzLkJMVUU7XG4gIGdhbWUuc3RhdGUgPSB0dXJuO1xuICByZXR1cm4gZ2FtZTtcbn1cblxuZnVuY3Rpb24gZ2FtZU92ZXIoZ2FtZSkge1xuICB2YXIgb3ZlciA9IGNsb25lKGdhbWUpO1xuICBvdmVyLnN0YXRlID0gU3RhdGVzLkdBTUVPVkVSO1xuICByZXR1cm4gb3Zlcjtcbn1cblxuZnVuY3Rpb24gd2luKGZvdXJJbmxpbmUsIGdhbWUpIHtcbiAgdmFyIHdvbiA9IGNsb25lKGdhbWUpO1xuICB3b24ud2lubmVyID0gZ2FtZS5zdGF0ZTtcbiAgd29uLnN0YXRlID0gU3RhdGVzLkdBTUVPVkVSO1xuICB3b24ubGluZSA9IGZvdXJJbmxpbmU7XG4gIHJldHVybiB3b247XG59XG5cbmV4cG9ydHMucHJpbnQgPSBmdW5jdGlvbihnKSB7XG4gIGNvbnNvbGUubG9nKCcgJywgZy5zdGF0ZSwgJ3dpbm5lcjonLCBnLndpbm5lcixcbiAgICAgICAgICAgICAgJ2xpbmU6JywgZy5saW5lICYmIGcubGluZS5ob3csIGcubGluZSAmJiBnLmxpbmUud2hlcmUuam9pbignLCAnKSk7XG4gIGNvbnNvbGUubG9nKFxuICAgIGcuYm9hcmQuY2VsbHMubWFwKGZ1bmN0aW9uKHIpIHtcbiAgICAgIHJldHVybiBbJyddLmNvbmNhdChyKS5jb25jYXQoWycnXSkuam9pbignfCcpO1xuICAgIH0pLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICApO1xuICBjb25zb2xlLmxvZyhnKTtcbn07XG4iLCJcbmV4cG9ydHMudmFsaWQgPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgcmV0dXJuIHR5cGVvZiBwbGF5ZXIgPT09ICdzdHJpbmcnICYmIHBsYXllciAhPT0gJyc7XG59O1xuIiwiXG52YXIgQ29ubmVjdDQgPSByZXF1aXJlKCcuL2dhbWUnKTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGpzKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGpzKSk7XG59O1xuIl19
