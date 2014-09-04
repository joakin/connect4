(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jkn/dev/projects/connect4/src/game/board.js":[function(require,module,exports){

// Creates a board of `size`
// The cells are a vector of vectors
module.exports = function Board(size) {
  var cells = [];
  for (var i = 0; i<size; i++) {
    cells.push([]);
    for (var j = 0; j<size; j++)
      cells[i].push(null);
  }
  return {
    size: size,
    cells: cells
  }
};

},{}],"/Users/jkn/dev/projects/connect4/src/game/index.js":[function(require,module,exports){

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

var p = Connect4.play(Math.floor(Math.random()*8), started);
console.log(p, p.state);

p = Connect4.play(Math.floor(Math.random()*8), p);
console.log(p, p.state);


},{"./game":"/Users/jkn/dev/projects/connect4/src/game/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL3BsYXllci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLy8gQ3JlYXRlcyBhIGJvYXJkIG9mIGBzaXplYFxuLy8gVGhlIGNlbGxzIGFyZSBhIHZlY3RvciBvZiB2ZWN0b3JzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEJvYXJkKHNpemUpIHtcbiAgdmFyIGNlbGxzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpPHNpemU7IGkrKykge1xuICAgIGNlbGxzLnB1c2goW10pO1xuICAgIGZvciAodmFyIGogPSAwOyBqPHNpemU7IGorKylcbiAgICAgIGNlbGxzW2ldLnB1c2gobnVsbCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuIiwiXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2Nsb25lJyk7XG5cbi8vIEdhbWUgc3RhdGVzLiBCTFVFIGFuZCBSRUQgYXJlIGZvciBlYWNoIHBsYXllcnMgdHVyblxudmFyIFN0YXRlcyA9IGV4cG9ydHMuU3RhdGVzID0ge1xuICBJTklUOiAnSU5JVCcsXG4gIEJMVUU6ICdCTFVFJyxcbiAgUkVEOiAnUkVEJyxcbiAgR0FNRU9WRVI6ICdHQU1FT1ZFUidcbn07XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBsYXllcnM6IHsgYmx1ZTogJycsIHJlZDogJycgfSxcbiAgICBib2FyZDogQm9hcmQoNyksXG4gICAgc3RhdGU6IFN0YXRlcy5JTklUXG4gIH07XG59O1xuXG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24ocGxheWVyMSwgcGxheWVyMiwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLklOSVQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHN0YXJ0IGEgZ2FtZSB0aGF0IGlzIG5vdCBuZXcnKTtcbiAgaWYgKCFQbGF5ZXIudmFsaWQocGxheWVyMSkgfHwgIVBsYXllci52YWxpZChwbGF5ZXIyKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvbWUgcGxheWVyIG5hbWVzIGFyZSBub3QgdmFsaWQuJywgcGxheWVyMSwgcGxheWVyMik7XG5cbiAgdmFyIHN0YXJ0ZWQgPSBjbG9uZShnYW1lKTtcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUgPSBwbGF5ZXIxO1xuICBzdGFydGVkLnBsYXllcnMucmVkID0gcGxheWVyMjtcbiAgc3RhcnRlZC5zdGF0ZSA9IFN0YXRlcy5CTFVFO1xuICByZXR1cm4gc3RhcnRlZDtcbn07XG5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGNvbCwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLkJMVUUgJiYgZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLlJFRClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW4gb25seSBwbGF5IHdoZW4gdGhlIGdhbWUgaXMgcnVubmluZycpXG5cbiAgdmFyIHBsYXllZCA9IGNsb25lKGdhbWUpO1xuICByZXR1cm4gc3dpdGNoVHVybihwbGF5ZWQpO1xufTtcblxuZnVuY3Rpb24gc3dpdGNoVHVybihnYW1lKSB7XG4gIHZhciB0dXJuID0gZ2FtZS5zdGF0ZSA9PT0gU3RhdGVzLkJMVUUgPyBTdGF0ZXMuUkVEIDogU3RhdGVzLkJMVUU7XG4gIGdhbWUuc3RhdGUgPSB0dXJuO1xuICByZXR1cm4gZ2FtZTtcbn1cblxuIiwiXG5leHBvcnRzLnZhbGlkID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gIHJldHVybiB0eXBlb2YgcGxheWVyID09PSAnc3RyaW5nJyAmJiBwbGF5ZXIgIT09ICcnO1xufTtcbiIsIlxuY29uc29sZS5sb2coJ0hpISBXZWxjb21lIHRvIGNvbm5lY3Q0Jyk7XG5cbnZhciBDb25uZWN0NCA9IHJlcXVpcmUoJy4vZ2FtZScpO1xuXG5jb25zb2xlLmxvZygnSW5pdCBnYW1lJyk7XG52YXIgZ2FtZSA9IENvbm5lY3Q0LmluaXQoKTtcblxuY29uc29sZS5sb2coZ2FtZSk7XG5cbnZhciBzdGFydGVkID0gQ29ubmVjdDQuc3RhcnQoJ0pvaG4nLCAnTWFyeScsIGdhbWUpO1xuXG5jb25zb2xlLmxvZyhcbiAgJ0dhbWUgc3RhcnRlZCB3aXRoJyxcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUsXG4gICdhcyBCTFVFIGFuZCcsXG4gIHN0YXJ0ZWQucGxheWVycy5yZWQsXG4gICdhcyBSRUQnXG4pO1xuXG5jb25zb2xlLmxvZygnR2FtZSBzdGF0ZScsIHN0YXJ0ZWQuc3RhdGUpO1xuXG5jb25zb2xlLmxvZygnQmx1ZSBwdXRzJyk7XG5cbnZhciBwID0gQ29ubmVjdDQucGxheShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqOCksIHN0YXJ0ZWQpO1xuY29uc29sZS5sb2cocCwgcC5zdGF0ZSk7XG5cbnAgPSBDb25uZWN0NC5wbGF5KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo4KSwgcCk7XG5jb25zb2xlLmxvZyhwLCBwLnN0YXRlKTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGpzKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGpzKSk7XG59O1xuIl19
