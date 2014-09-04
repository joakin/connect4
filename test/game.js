
var Connect4 = require('../src/game');
var test = require('tape');

test('Can init game to initial state', function(t) {
  var game = Connect4.init();
  t.equal(game.state, Connect4.States.INIT);
  t.equal(typeof game.board, 'object');
  t.equal(game.players.blue, '');
  t.equal(game.players.red, '');
  t.end();
});

test('Can set players names, only when in Initial state', function(t) {
  var game = Connect4.init();
  var started = Connect4.start('John', 'Mary', game);
  t.equal(started.state, Connect4.States.BLUE);
  t.throws(function() { Connect4.start(started); });
  t.end();
});


