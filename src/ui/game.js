var domify = require('domify');
var fs = require('fs');

var Game = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/game.html', 'utf8'))
};

Game.init = function(ui) {
  ui.dom.appendChild(ui.screens.game);

  var screen = {
    cell: ui.dom.querySelector('.cell'),
    board: ui.dom.querySelector('.board'),
    name: ui.dom.querySelector('.turn>span')
  };

  drawBoard(screen, ui.game.board);

};

function drawBoard(screen, board) {
  // Clean board
  screen.board.innerHTML = '';
  board.cells.reverse().forEach(function (row, i) {
    row.forEach(function (cell, j) {
      var nc = screen.cell.cloneNode(true);
      nc.textContent = i+'-'+j
      screen.board.appendChild(nc);
    });
  });
}
