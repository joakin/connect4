var domify = require('domify');
var fs = require('fs');

var Game = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/game.html', 'utf8'))
};

Game.init = function(ui, play) {
  ui.dom.appendChild(ui.screens.game);

  var screen = {
    cell: ui.dom.querySelector('.cell'),
    board: ui.dom.querySelector('.board'),
    name: ui.dom.querySelector('.turn>span')
  };

  Game.drawBoard(screen, ui.game.board);

  ui.events.on('click', '.cell', function(ev, cell) {
    var row = cell.dataset.row;
    var col = cell.dataset.col;
    play(row, col, ui);
  });

};

Game.drawBoard = function(screen, board) {
  // Clean board
  screen.board.innerHTML = '';
  var domBoard = board.cells.map(function(row, r) {
    return row.map(cellToDom.bind(null, screen.cell, r));
  });

  domBoard.reverse().forEach(function (row, i) {
    row.forEach(function (cell, j) {
      cell.textContent = (board.size-i)+'-'+(j+1);
      screen.board.appendChild(cell);
    });
  });
};

function cellToDom(cellDom, row, cell, col) {
  var nc = cellDom.cloneNode(true);
  nc.dataset.row = row;
  nc.dataset.col = col;
  return nc;
}

