
// Main dom UI module. Drives a game instance and the view states.

// Dom utilities
var domready = require('domready');
var delegate = require('dom-delegate');

// Game logic
var Connect4 = require('../game');

// Subviews (screens/states)
var Initial = require('./initial');
var Game = require('./game');
var GameOver = require('./game-over');

// Initialize a view given a dom id. It is self driven from there.
exports.init = function(id) {
  domready(function() {

    var dom = document.getElementById(id);

    // UI state, this will be passed through the different steps, and contains
    // the ui and game information.
    var ui = {
      id: id,
      dom: dom,
      game: Connect4.init(), // Game logic instance
      events: delegate(dom), // Delegated events hub
      views: {         // Screens of the UI.
        initial: null, // At the beginning all the steps are non existent.
        game: null,    // We will fill them along the way when we need them.
        gameOver: null
      }
    };

    // Start the initial screen. Give it a callback that will receive the
    // parameters to start the game.
    ui.views.initial = Initial.init(ui, startGame);

  });
}

// Function to be called when we have the blue and red players, and want to
// start the game.
function startGame(blue, red, ui) {
  // It tries to start the game logic. If it fails (state of player
  // validations) then return the error message and stop transitioning
  try {
    ui.game = Connect4.start(blue, red, ui.game);
  } catch (e) {
    return e.message;
  }

  // If the game started successfully transition to the game screen
  cleanScreen(ui);
  // userPlays will be called when the user wants to make a move in the game screen
  ui.views.game = Game.init(ui, userPlays);
}

// Make a movement in the game UI. Moves in the game logic, re-renders the game
// screen to update, and checks if the game has finished.
function userPlays(row, col, ui) {
  ui.game = Connect4.play(col, ui.game);
  Game.render(ui.views.game, ui);
  if (ui.game.state === Connect4.States.GAMEOVER)
    gameFinished(ui);
}

// Game is over. Transition to the game over screen.
// We don't clear the screen because gameOver has css to be an overlay, so that
// we can see the board even though it finished.
function gameFinished(ui) {
  ui.views.gameOver = GameOver.init(ui, restart);
}

// User wants a restart. Clean screen and events and make a brute restart.
function restart(ui) {
  cleanScreen(ui);
  ui.events.off();
  exports.init(ui.id);
}

// Utility function to clean the UI.
function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}

