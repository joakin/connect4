
var domready = require('domready');
var delegate = require('dom-delegate');

var Connect4 = require('../game');

var Initial = require('./initial');
var Game = require('./game');
var GameOver = require('./game-over');

exports.init = function(id) {
  domready(function() {

    var dom = document.getElementById(id);

    var ui = {
      id: id,
      dom: dom,
      game: Connect4.init(),
      events: delegate(dom),
      views: {
        initial: null,
        game: null,
        gameOver: null
      }
    };

    ui.views.initial = Initial.init(ui, startGame);

  });
}

function startGame(blue, red, ui) {
  try {
    ui.game = Connect4.start(blue, red, ui.game);
  } catch (e) {
    return e.message;
  }

  cleanScreen(ui);
  ui.views.game = Game.init(ui, userPlays);
}

function userPlays(row, col, ui) {
  ui.game = Connect4.play(col, ui.game);
  Game.render(ui.views.game, ui);
  if (ui.game.state === Connect4.States.GAMEOVER)
    gameFinished(ui);
}

function gameFinished(ui) {
  cleanScreen(ui);
  ui.views.gameOver = GameOver.init(ui, restart);
}

function restart(ui) {
  cleanScreen(ui);
  ui.events.off();
  exports.init(ui.id);
}

function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}

