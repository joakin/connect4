
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
