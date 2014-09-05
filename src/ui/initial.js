var domify = require('domify');
var fs = require('fs');

// HTML template. Browserify inlines file from the fs.readFileSync.
var Initial = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/initial.html', 'utf8'))
};

// Start the screen.
// Attach the template to the dom node. Save references to dom places we need
// to interact with.
// Set up events
Initial.init = function(ui, done) {
  ui.dom.appendChild(Initial.screen.cloneNode(true));

  var screen = {
    // Player names inputs
    inputs: ui.dom.querySelectorAll('.playerNames input'),
    // Error messages placeholder
    msg: ui.dom.querySelector('.playerNames span.msg')
  };

  // Start game button
  ui.events.on('click', '.playerNames button', setPlayers.bind(null, screen, ui, done));
};

// Called to start the game.
// Get the player names and call the callback `done` for starting. If there is
// any error (done returns a str), show the msg.
function setPlayers(screen, ui, done) {
  var blue = screen.inputs[0].value;
  var red = screen.inputs[1].value;
  if (!blue || !red) {
    screen.msg.textContent = 'Every player needs a name!';
    return;
  }

  var res = done(blue, red, ui);
  if (typeof res === 'string')
    screen.msg.textContent = res;
}
