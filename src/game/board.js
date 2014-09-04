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
