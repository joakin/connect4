var domify = require('domify');
var fs = require('fs');

var Initial = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/initial.html', 'utf8'))
};

Initial.init = function(ui, done) {
  ui.dom.appendChild(ui.screens.initial);

  var screen = {
    inputs: ui.dom.querySelectorAll('.playerNames input'),
    msg: ui.dom.querySelector('.playerNames span.msg')
  };

  ui.events.on('click', '.playerNames button', setPlayers.bind(null, screen, ui, done));
};

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
