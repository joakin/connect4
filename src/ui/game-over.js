
var domify = require('domify');
var fs = require('fs');

var Connect4 = require('../game');

var GameOver = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/game-over.html', 'utf8'))
};

GameOver.init = function(ui, restart) {
  ui.dom.appendChild(GameOver.screen.cloneNode(true));

  var screen = {
    winner: ui.dom.querySelector('.winner'),
    looser: ui.dom.querySelector('.looser'),
  };

  screen.winner.textContent = Connect4.winner(ui.game);
  screen.looser.textContent = Connect4.looser(ui.game);

  ui.events.on('click', '.restart', restart.bind(null, ui));

  return screen;
};

