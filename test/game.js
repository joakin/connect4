
var Connect4 = require('../src/game');
var Board = require('../src/game/board');
var test = require('tape');

var initial = Connect4.init();

test('Can init game to initial state', function(t) {
  t.equal(initial.state, Connect4.States.INIT);
  t.equal(typeof initial.board, 'object');
  t.equal(initial.players.blue, '');
  t.equal(initial.players.red, '');
  t.end();
});

var started = Connect4.start('John', 'Mary', initial);

test('Can set players names, only when in Initial state', function(t) {
  t.equal(started.state, Connect4.States.BLUE);
  t.throws(function() { Connect4.start('a', 'b', started); });
  t.end();
});

test('When setting player names, they have to be something', function(t) {
  t.throws(function() { Connect4.start('', 'John', initial); });
  t.throws(function() { Connect4.start('John', null, initial); });
  t.throws(function() { Connect4.start([], 'Mary', initial); });
  t.end();
});

var played = Connect4.play(3, started);
var played2 = Connect4.play(4, played);

test('We can play when it is BLUE or RED state', function(t) {
  t.equal(played.state, Connect4.States.RED);
  t.equal(played2.state, Connect4.States.BLUE);
  t.end();
});

test('Trying to play in invalid states does not work', function(t) {
  t.throws(function () { Connect4.play(3, initial); });
  t.end();
});

test('After a BLUE movement, the chip is in its place', function(t) {
  t.equal(Board.get(0, 3, played.board), Board.Chips.BLUE);
  t.end();
});
test('After a RED movement, the chip O is in its place', function(t) {
  t.equal(Board.get(0, 4, played2.board), Board.Chips.RED);
  t.end();
});

test('When the board is full, the game is over', function(t) {
  var g = started;
  Board.Chips.BLUE = 1;
  for (var i = 0; i < g.board.size; i++)
    for (var j = 0; j < g.board.size; j++) {
      ++Board.Chips.BLUE; // Cheating to avoid 4 in line
      g.state = Connect4.States.BLUE; // Cheating to avoid 4 in line
      g = Connect4.play(i, g);
    }

  t.equal(g.state, Connect4.States.GAMEOVER);
  t.end();
});

var won = started;
var winningMoves = [0, 1, 2, 3];
winningMoves.forEach(function(col) {
  won = Connect4.play(col, won);
  if (col !== 3)
    won = Connect4.play(col, won);
});

test('When there is a 4 in line, game is over, and a winner is set', function(t) {
  var g = won;
  t.equal(g.state, Connect4.States.GAMEOVER);
  t.equal(g.winner, Connect4.States.BLUE);
  t.equal(typeof g.line, "object");
  t.end();
});



test('Current player returns the name of the current player', function(t) {
  t.equal(Connect4.currentPlayer(started), 'John');
  var p = Connect4.play(0, started);
  t.equal(Connect4.currentPlayer(p), 'Mary');
  var p2 = Connect4.play(0, p);
  t.equal(Connect4.currentPlayer(p2), 'John');
  t.end();
});

test('Winner and looser returns the name of the winner and looser player', function(t) {
  t.equal(Connect4.winner(won), 'John');
  t.equal(Connect4.looser(won), 'Mary');
  t.end();
});
