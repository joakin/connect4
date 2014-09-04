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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNsb25lID0gcmVxdWlyZSgnLi4vdXRpbHMvY2xvbmUnKTtcblxuLy8gQ3JlYXRlcyBhIGJvYXJkIG9mIGBzaXplYFxuLy8gVGhlIGNlbGxzIGFyZSBhIHZlY3RvciBvZiB2ZWN0b3JzXG52YXIgQm9hcmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgdmFyIGNlbGxzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpPHNpemU7IGkrKykge1xuICAgIGNlbGxzLnB1c2goW10pO1xuICAgIGZvciAodmFyIGogPSAwOyBqPHNpemU7IGorKylcbiAgICAgIGNlbGxzW2ldLnB1c2goQm9hcmQuQ2hpcHMuRU1QVFkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgc2l6ZTogc2l6ZSxcbiAgICBjZWxsczogY2VsbHNcbiAgfVxufTtcblxuQm9hcmQuQ2hpcHMgPSB7XG4gIEVNUFRZOiAnICcsXG4gIEJMVUU6ICdPJyxcbiAgUkVEOiAnWCdcbn07XG5cblxuQm9hcmQuZ2V0ID0gZnVuY3Rpb24ocm93LCBjb2wsIGIpIHtcbiAgcmV0dXJuIGIuY2VsbHNbcm93XVtjb2xdO1xufTtcblxuQm9hcmQuc2V0ID0gZnVuY3Rpb24ocm93LCBjb2wsIHZhbCwgYikge1xuICB2YXIgbmIgPSBjbG9uZShiKTtcbiAgbmIuY2VsbHNbcm93XVtjb2xdID0gdmFsO1xuICByZXR1cm4gbmI7XG59O1xuXG5Cb2FyZC5wdXQgPSBmdW5jdGlvbihjb2wsIHZhbCwgYikge1xuICB2YXIgbmIgPSBjbG9uZShiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYi5zaXplOyBpKyspIHtcbiAgICB2YXIgcm93ID0gbmIuY2VsbHNbaV07XG4gICAgaWYgKHJvd1tjb2xdID09PSBCb2FyZC5DaGlwcy5FTVBUWSkge1xuICAgICAgcm93W2NvbF0gPSB2YWw7XG4gICAgICByZXR1cm4gbmI7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignQ29sdW1uJywgY29sLCAnaXMgZnVsbCBpbiBib2FyZCcsIGIpO1xufTtcblxuQm9hcmQuaXNGdWxsID0gZnVuY3Rpb24oYm9hcmQpIHtcbiAgdmFyIGksIGosIHJvdztcbiAgZm9yIChpID0gMDsgaSA8IGJvYXJkLnNpemU7IGkrKylcbiAgICBmb3IgKHJvdyA9IGJvYXJkLmNlbGxzW2ldLCBqID0gMDsgaiA8IGJvYXJkLnNpemU7IGorKylcbiAgICAgIGlmIChyb3dbal0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufTtcblxuQm9hcmQuaGFzRm91cklubGluZSA9IGZ1bmN0aW9uKGJvYXJkKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYm9hcmQuc2l6ZSAtIDQ7IGkrKykge1xuICAgIHZhciByb3cgPSBib2FyZC5jZWxsc1tpXTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJvYXJkLnNpemUgLSA0OyBqKyspIHtcblxuICAgICAgdmFyIHZhbCA9IHJvd1tpXTtcbiAgICAgIHZhciBjYW5CZSA9IHRydWUgJiYgdmFsICE9PSBCb2FyZC5DaGlwcy5FTVBUWTtcblxuICAgICAgdmFyIGhvcml6b250YWwgPSBjYW5CZTtcbiAgICAgIHZhciB2ZXJ0aWNhbCAgID0gY2FuQmU7XG4gICAgICB2YXIgdXBkaWFnICAgICA9IGNhbkJlO1xuICAgICAgdmFyIGRvd25kaWFnICAgPSBjYW5CZTtcblxuICAgICAgaWYgKGNhbkJlKSB7XG4gICAgICAgIGZvciAodmFyIGsgPSAxOyBrIDwgNDsgaysrKSB7XG4gICAgICAgICAgaG9yaXpvbnRhbCA9IGhvcml6b250YWwgJiYgdmFsID09PSByb3dbaStrXTtcbiAgICAgICAgICB2ZXJ0aWNhbCAgID0gdmVydGljYWwgICAmJiB2YWwgPT09IGJvYXJkLmNlbGxzW2kra11baV07XG4gICAgICAgICAgdXBkaWFnICAgICA9IHVwZGlhZyAgICAgJiYgdmFsID09PSBib2FyZC5jZWxsc1tpK2tdW2kra107XG4gICAgICAgICAgZG93bmRpYWcgICA9IGRvd25kaWFnICAgJiYgdmFsID09PSBib2FyZC5jZWxsc1tpKzQta11baStrXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBob3cgPSBudWxsO1xuICAgICAgICBpZiAoaG9yaXpvbnRhbCkgaG93ID0gJ0hPUklaT05UQUwnO1xuICAgICAgICBpZiAodmVydGljYWwpICAgaG93ID0gJ1ZFUlRJQ0FMJztcbiAgICAgICAgaWYgKHVwZGlhZykgICAgIGhvdyA9ICdVUERJQUdPTkFMJztcbiAgICAgICAgaWYgKGRvd25kaWFnKSAgIGhvdyA9ICdET1dORElBR09OQUwnO1xuXG4gICAgICAgIGlmIChob3cpIHJldHVybiB7IGhvdzogaG93LCB3aGVyZTogW2ksIGpdIH07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcbiIsIlxudmFyIEJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZCcpO1xudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBHYW1lIHN0YXRlcy4gQkxVRSBhbmQgUkVEIGFyZSBmb3IgZWFjaCBwbGF5ZXJzIHR1cm5cbnZhciBTdGF0ZXMgPSBleHBvcnRzLlN0YXRlcyA9IHtcbiAgSU5JVDogJ0lOSVQnLFxuICBCTFVFOiAnQkxVRScsXG4gIFJFRDogJ1JFRCcsXG4gIEdBTUVPVkVSOiAnR0FNRU9WRVInXG59O1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBwbGF5ZXJzOiB7IGJsdWU6ICcnLCByZWQ6ICcnIH0sXG4gICAgYm9hcmQ6IEJvYXJkKDcpLFxuICAgIHN0YXRlOiBTdGF0ZXMuSU5JVFxuICB9O1xufTtcblxuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKHBsYXllcjEsIHBsYXllcjIsIGdhbWUpIHtcbiAgaWYgKGdhbWUuc3RhdGUgIT09IFN0YXRlcy5JTklUKVxuICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCBzdGFydCBhIGdhbWUgdGhhdCBpcyBub3QgbmV3Jyk7XG4gIGlmICghUGxheWVyLnZhbGlkKHBsYXllcjEpIHx8ICFQbGF5ZXIudmFsaWQocGxheWVyMikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTb21lIHBsYXllciBuYW1lcyBhcmUgbm90IHZhbGlkLicsIHBsYXllcjEsIHBsYXllcjIpO1xuXG4gIHZhciBzdGFydGVkID0gY2xvbmUoZ2FtZSk7XG4gIHN0YXJ0ZWQucGxheWVycy5ibHVlID0gcGxheWVyMTtcbiAgc3RhcnRlZC5wbGF5ZXJzLnJlZCA9IHBsYXllcjI7XG4gIHN0YXJ0ZWQuc3RhdGUgPSBTdGF0ZXMuQkxVRTtcbiAgcmV0dXJuIHN0YXJ0ZWQ7XG59O1xuXG5leHBvcnRzLnBsYXkgPSBmdW5jdGlvbihjb2wsIGdhbWUpIHtcbiAgaWYgKGdhbWUuc3RhdGUgIT09IFN0YXRlcy5CTFVFICYmIGdhbWUuc3RhdGUgIT09IFN0YXRlcy5SRUQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2FuIG9ubHkgcGxheSB3aGVuIHRoZSBnYW1lIGlzIHJ1bm5pbmcnKVxuXG4gIHZhciBwbGF5ZWQgPSBjbG9uZShnYW1lKTtcbiAgcGxheWVkLmJvYXJkID0gQm9hcmQucHV0KGNvbCwgQm9hcmQuQ2hpcHNbcGxheWVkLnN0YXRlXSwgcGxheWVkLmJvYXJkKTtcblxuICB2YXIgZm91cklubGluZSA9IEJvYXJkLmhhc0ZvdXJJbmxpbmUocGxheWVkLmJvYXJkKTtcbiAgaWYgKGZvdXJJbmxpbmUpIHtcbiAgICByZXR1cm4gd2luKGZvdXJJbmxpbmUsIHBsYXllZCk7XG4gIH1cblxuICBpZiAoQm9hcmQuaXNGdWxsKHBsYXllZC5ib2FyZCkpIHtcbiAgICByZXR1cm4gZ2FtZU92ZXIocGxheWVkKTtcbiAgfVxuXG4gIHJldHVybiBzd2l0Y2hUdXJuKHBsYXllZCk7XG59O1xuXG5mdW5jdGlvbiBzd2l0Y2hUdXJuKGdhbWUpIHtcbiAgdmFyIHR1cm4gPSBnYW1lLnN0YXRlID09PSBTdGF0ZXMuQkxVRSA/IFN0YXRlcy5SRUQgOiBTdGF0ZXMuQkxVRTtcbiAgZ2FtZS5zdGF0ZSA9IHR1cm47XG4gIHJldHVybiBnYW1lO1xufVxuXG5mdW5jdGlvbiBnYW1lT3ZlcihnYW1lKSB7XG4gIHZhciBvdmVyID0gY2xvbmUoZ2FtZSk7XG4gIG92ZXIuc3RhdGUgPSBTdGF0ZXMuR0FNRU9WRVI7XG4gIHJldHVybiBvdmVyO1xufVxuXG5mdW5jdGlvbiB3aW4oZm91cklubGluZSwgZ2FtZSkge1xuICB2YXIgd29uID0gY2xvbmUoZ2FtZSk7XG4gIHdvbi53aW5uZXIgPSBnYW1lLnN0YXRlO1xuICB3b24uc3RhdGUgPSBTdGF0ZXMuR0FNRU9WRVI7XG4gIHdvbi5saW5lID0gZm91cklubGluZTtcbiAgcmV0dXJuIHdvbjtcbn1cblxuZXhwb3J0cy5wcmludCA9IGZ1bmN0aW9uKGcpIHtcbiAgY29uc29sZS5sb2coJyAnLCBnLnN0YXRlLCAnd2lubmVyOicsIGcud2lubmVyLFxuICAgICAgICAgICAgICAnbGluZTonLCBnLmxpbmUgJiYgZy5saW5lLmhvdywgZy5saW5lICYmIGcubGluZS53aGVyZS5qb2luKCcsICcpKTtcbiAgY29uc29sZS5sb2coXG4gICAgZy5ib2FyZC5jZWxscy5tYXAoZnVuY3Rpb24ocikge1xuICAgICAgcmV0dXJuIFsnJ10uY29uY2F0KHIpLmNvbmNhdChbJyddKS5qb2luKCd8Jyk7XG4gICAgfSkucmV2ZXJzZSgpLmpvaW4oJ1xcbicpXG4gICk7XG4gIGNvbnNvbGUubG9nKGcpO1xufTtcbiIsIlxuZXhwb3J0cy52YWxpZCA9IGZ1bmN0aW9uKHBsYXllcikge1xuICByZXR1cm4gdHlwZW9mIHBsYXllciA9PT0gJ3N0cmluZycgJiYgcGxheWVyICE9PSAnJztcbn07XG4iLCJcbmNvbnNvbGUubG9nKCdIaSEgV2VsY29tZSB0byBjb25uZWN0NCcpO1xuXG52YXIgQ29ubmVjdDQgPSByZXF1aXJlKCcuL2dhbWUnKTtcblxuY29uc29sZS5sb2coJ0luaXQgZ2FtZScpO1xudmFyIGdhbWUgPSBDb25uZWN0NC5pbml0KCk7XG5cbkNvbm5lY3Q0LnByaW50KGdhbWUpO1xuXG52YXIgc3RhcnRlZCA9IENvbm5lY3Q0LnN0YXJ0KCdKb2huJywgJ01hcnknLCBnYW1lKTtcblxuY29uc29sZS5sb2coXG4gICdHYW1lIHN0YXJ0ZWQgd2l0aCcsXG4gIHN0YXJ0ZWQucGxheWVycy5ibHVlLFxuICAnYXMgQkxVRSBhbmQnLFxuICBzdGFydGVkLnBsYXllcnMucmVkLFxuICAnYXMgUkVEJ1xuKTtcblxuQ29ubmVjdDQucHJpbnQoc3RhcnRlZCk7XG5cbmNvbnNvbGUubG9nKCdCbHVlIHB1dHMnKTtcblxudmFyIHAgPSBDb25uZWN0NC5wbGF5KDMsIHN0YXJ0ZWQpO1xuQ29ubmVjdDQucHJpbnQocCk7XG5cbnAgPSBDb25uZWN0NC5wbGF5KDMsIHApO1xuQ29ubmVjdDQucHJpbnQocCk7XG5cblswLCAxLCAyXS5mb3JFYWNoKGZ1bmN0aW9uKG0pIHtcbiAgcCA9IENvbm5lY3Q0LnBsYXkobSwgcCk7XG4gIGlmIChtICE9PSAyKVxuICAgIHAgPSBDb25uZWN0NC5wbGF5KG0sIHApO1xufSk7XG5cbkNvbm5lY3Q0LnByaW50KHApO1xuXG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqcykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShqcykpO1xufTtcbiJdfQ==
