
var domready = require('domready');
var delegate = require('dom-delegate');

var Connect4 = require('../game');

var Initial = require('./initial');
var Game = require('./game');

exports.init = function(id) {
  domready(function() {

    var dom = document.getElementById(id);

    var ui = {
      dom: dom,
      game: Connect4.init(),
      events: delegate(dom),
      screens: {
        initial: Initial.screen.cloneNode(true),
        game: Game.screen.cloneNode(true)
      },
      views: {
        initial: null,
        game: null
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
  if (ui.game.state === Connect4.states.GAMEOVER)
    gameFinished(ui);
}

function gameFinished(ui) {
  // ui.dom.innerHTML = '
}

function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}

