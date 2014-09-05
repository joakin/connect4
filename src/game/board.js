var clone = require('../utils/clone');

// Board module. Manages the board and its functionality.
// Returns a constructor function as exports, and functions to operate on that
// data structure as exports.fn

// Creates a board of `size`. The cells are a vector of vectors.
// Initializes the board with empty chips.
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

// Types of chips for the board, constants.
Board.Chips = {
  EMPTY: ' ',
  BLUE: 'O',
  RED: 'X'
};

// Get a specific cell on the board
Board.get = function(row, col, b) {
  return b.cells[row][col];
};

// Set a specific cell on the board
Board.set = function(row, col, val, b) {
  var nb = clone(b);
  nb.cells[row][col] = val;
  return nb;
};

// Put a chip on a column. This is the main function used in the game logic
// when playing. Just receives the col and figures out the row.
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

// Predicate function, true if the board is full, false if it is not
Board.isFull = function(board) {
  var i, j, row;
  for (i = 0; i < board.size; i++)
    for (row = board.cells[i], j = 0; j < board.size; j++)
      if (row[j] === Board.Chips.EMPTY) return false;
  return true;
};

// Returns a function that given an index will tell you if you should check it
// for 4 in line depending on the board size.
function shouldCheck(board) {
  return function(idx) {
    return idx <= board.size - 4;
  };
}

// Detects 4 in line in a board.
// Returns null if there is none.
// Returns { how: TYPE, where: [ROW, COL] } when it finds one.
// Pretty hairy code, but well tested and commented.
Board.hasFourInline = function(board) {

  // Check idx will be used to see if we should try and find 4 in line on
  // a particular index (if it would fit from that index to the board size)
  var checkIdx = shouldCheck(board);

  for (var rowIdx = 0; rowIdx < 7; rowIdx++) {
    var row = board.cells[rowIdx];
    for (var colIdx = 0; colIdx < 7; colIdx++) {

      // We are going to go through every cell in the board, and will try to
      // find 4 different types of 4 in line from the initial cell.
      var currentChip = row[colIdx];
      // For the downwards diagonal we will check from 4 up of the current cell
      // to 4 right of the current cell.
      var iniDownDiag =  checkIdx(rowIdx+3) && board.cells[rowIdx+3][colIdx];

      // We are going to calculate the initial values of the booleans we will
      // use to see if there was 4 in line that particular way.

      // Valid initial cells should not be EMPTY. If empty no 4 in line
      var valValid = true && currentChip !== Board.Chips.EMPTY;
      var downDiagValid = true && iniDownDiag !== Board.Chips.EMPTY;

      // These are the initial values for the different types of 4 in line.
      // For each type of diagonal, the initial value will be if it is possible
      // to have 4 in line there (won't go out of bounds when searching, and
      // the cell has a valid player chip on it)
      var canBeHorizontal = valValid      && checkIdx(colIdx);
      var canBeVertical   = valValid      && checkIdx(rowIdx);
      var canBeUpDiag     = valValid      && checkIdx(rowIdx)  && checkIdx(colIdx);
      var canBeDownDiag   = downDiagValid && checkIdx(rowIdx)  && checkIdx(colIdx);

      var horizontal = canBeHorizontal;
      var vertical   = canBeVertical;
      var updiag     = canBeUpDiag;
      var downdiag   = canBeDownDiag;

      // When there exists the possibility of any 4 in line, go check
      if (canBeHorizontal || canBeVertical || canBeUpDiag || canBeDownDiag) {

        // Lets go through the other 3 cells for each kind of 4 in line and see
        // if they match. We will shortcircuit to false as soon as possible.
        for (var k = 1; k < 4; k++) {

          // For horizontal, we check to the right
          horizontal = horizontal && currentChip === row[colIdx+k];

          // For vertical, we check to the upwards maintaining column
          vertical = vertical && currentChip === board.cells[rowIdx+k][colIdx];

          // For upwards diagonal, we check right and up
          updiag = updiag && currentChip === board.cells[rowIdx+k][colIdx+k];

          // For downwards diagonal, we go from up-left to bottom-right
          downdiag = downdiag && iniDownDiag === board.cells[rowIdx+3-k][colIdx+k];
        }

        // When done checking, we save the position, and see if any of the 4 in
        // lines has matched (true), and return the 4 inline and exit the
        // function
        var how = null;
        var where = [rowIdx, colIdx];
        if (horizontal) how = 'HORIZONTAL';
        if (vertical)   how = 'VERTICAL';
        if (updiag)     how = 'UPDIAGONAL';
        if (downdiag) { how = 'DOWNDIAGONAL'; where = [rowIdx+3, colIdx]; }

        if (how) return { how: how, where: where };
      }
    }
  }
  return null;
};
