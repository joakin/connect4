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

},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js","./board":"/Users/jkn/dev/projects/connect4/src/game/board.js"}],"/Users/jkn/dev/projects/connect4/src/index.js":[function(require,module,exports){

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


},{"./game":"/Users/jkn/dev/projects/connect4/src/game/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvYm9hcmQuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91dGlscy9jbG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLy8gQ3JlYXRlcyBhIGJvYXJkIG9mIGBzaXplYFxuLy8gVGhlIGNlbGxzIGFyZSBhIHZlY3RvciBvZiB2ZWN0b3JzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEJvYXJkKHNpemUpIHtcbiAgdmFyIGNlbGxzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpPHNpemU7IGkrKykge1xuICAgIGNlbGxzLnB1c2goW10pO1xuICAgIGZvciAodmFyIGogPSAwOyBqPHNpemU7IGorKylcbiAgICAgIGNlbGxzW2ldLnB1c2gobnVsbCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuIiwiXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBHYW1lIHN0YXRlcy4gQkxVRSBhbmQgUkVEIGFyZSBmb3IgZWFjaCBwbGF5ZXJzIHR1cm5cbnZhciBTdGF0ZXMgPSBleHBvcnRzLlN0YXRlcyA9IHtcbiAgSU5JVDogJ0lOSVQnLFxuICBCTFVFOiAnQkxVRScsXG4gIFJFRDogJ1JFRCcsXG4gIEdBTUVPVkVSOiAnR0FNRU9WRVInXG59O1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBwbGF5ZXJzOiB7IGJsdWU6ICcnLCByZWQ6ICcnIH0sXG4gICAgYm9hcmQ6IEJvYXJkKDcpLFxuICAgIHN0YXRlOiBTdGF0ZXMuSU5JVFxuICB9O1xufTtcblxuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKHBsYXllcjEsIHBsYXllcjIsIGdhbWUpIHtcbiAgdmFyIHN0YXJ0ZWQgPSBjbG9uZShnYW1lKTtcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUgPSBwbGF5ZXIxO1xuICBzdGFydGVkLnBsYXllcnMucmVkID0gcGxheWVyMjtcbiAgc3RhcnRlZC5zdGF0ZSA9IFN0YXRlcy5CTFVFO1xuICByZXR1cm4gc3RhcnRlZDtcbn07XG5cbi8vIGV4cG9ydHMuc3RhcnRHYW1lID0gZnVuY3Rpb24oYmx1ZSwgcmVkKVxuIiwiXG5jb25zb2xlLmxvZygnSGkhIFdlbGNvbWUgdG8gY29ubmVjdDQnKTtcblxudmFyIENvbm5lY3Q0ID0gcmVxdWlyZSgnLi9nYW1lJyk7XG5cbmNvbnNvbGUubG9nKCdJbml0IGdhbWUnKTtcbnZhciBnYW1lID0gQ29ubmVjdDQuaW5pdCgpO1xuXG5jb25zb2xlLmxvZyhnYW1lKTtcblxudmFyIHN0YXJ0ZWQgPSBDb25uZWN0NC5zdGFydCgnSm9obicsICdNYXJ5JywgZ2FtZSk7XG5cbmNvbnNvbGUubG9nKFxuICAnR2FtZSBzdGFydGVkIHdpdGgnLFxuICBzdGFydGVkLnBsYXllcnMuYmx1ZSxcbiAgJ2FzIEJMVUUgYW5kJyxcbiAgc3RhcnRlZC5wbGF5ZXJzLnJlZCxcbiAgJ2FzIFJFRCdcbik7XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqcykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShqcykpO1xufTtcbiJdfQ==
