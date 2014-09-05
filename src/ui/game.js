var domify = require('domify');
var fs = require('fs');

var Connect4 = require('../game');

// HTML template. Browserify inlines file from the fs.readFileSync.
var Game = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/game.html', 'utf8'))
};

// Start the screen.
// Attach the template to the dom node. Save references to dom places we need
// to interact with.
// Set up events
Game.init = function(ui, play) {
  ui.dom.appendChild(Game.screen.cloneNode(true));

  var screen = {
    // Cell template
    cell: ui.dom.querySelector('.cell'),
    // Whole board
    board: ui.dom.querySelector('.board'),
    // Placeholder for the current player's name
    name: ui.dom.querySelector('.turn>span')
  };

  Game.render(screen, ui);

  // When the user clicks on any cell of the board call the `play` action with
  // the row and column clicked
  ui.events.on('click', '.cell', function(ev, cell) {
    var row = cell.dataset.row;
    var col = cell.dataset.col;
    play(row, col, ui);
  });

  return screen;
};

// Brute force redraws the dom board
Game.drawBoard = function(screen, board) {
  // Clean board
  screen.board.innerHTML = '';

  // Parse game logic cells to dom cells
  var domBoard = board.cells.map(function(row, r) {
    return row.map(cellToDom.bind(null, screen.cell, r));
  });

  // Set the rows and cells in the dom. We need to reverse the rows, or it
  // would be reverse 4 in line.
  domBoard.reverse().forEach(function (row) {
    row.forEach(function (cell) {
      screen.board.appendChild(cell);
    });
  });
};

// Takes a cellDom template, row index, cell value, column index, and creates
// a new cell dom with the row and index as data attributes.
function cellToDom(cellDom, row, cell, col) {
  var nc = cellDom.cloneNode(true);
  nc.dataset.row = row;
  nc.dataset.col = col;
  nc.textContent = cell;
  return nc;
}

// Sets the player name that needs to move in the UI.
Game.drawTurn = function(screen, ui) {
  screen.name.textContent = Connect4.currentPlayer(ui.game);
};

// Render the whole game screen (turn and board)
Game.render = function(screen, ui) {
  Game.drawTurn(screen, ui);
  Game.drawBoard(screen, ui.game.board);
};

