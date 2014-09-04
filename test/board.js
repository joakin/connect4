
var Board = require('../src/game/board');
var test = require('tape');

test('exports a function that creates a board, with size and cells', function(t) {
  t.equal(typeof Board, 'function');
  var b = Board(7);
  t.equal(b.size, 7);
  t.equal(b.cells.length, 7);
  b.cells.forEach(function(row) {
    t.equal(row.length, 7);
  });
  t.end();
});

test('Can put and get a cell in the board', function(t) {
  var b = Board(7);
  t.equal(Board.get(0, 3, b), Board.Chips.EMPTY);
  var b2 = Board.set(0, 3, Board.Chips.BLUE, b);
  t.equal(Board.get(0, 3, b2), Board.Chips.BLUE);
  t.end();
});
