
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
      }
    };

    Initial.init(ui, startGame);

  });
}

function startGame(blue, red, ui) {
  try {
    ui.game = Connect4.start(blue, red, ui.game);
  } catch (e) {
    return e.message;
  }

  cleanScreen(ui);

  Game.init(ui, userPlays);
}

function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}

function userPlays(row, col, ui) {
  console.log('user: ', ui.game.state, 'plays col', col);
}

