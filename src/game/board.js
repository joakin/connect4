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
