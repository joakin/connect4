var domify = require('domify');
var fs = require('fs');

var Initial = module.exports = {
  screen: domify(fs.readFileSync(__dirname+'/views/initial.html', 'utf8'))
};

Initial.init = function(ui, done) {
  ui.dom.appendChild(ui.screens.initial);
  ui.events.on('click', '.playerNames button', setPlayers.bind(null, ui, done));
};

function setPlayers(ui, done) {
  var inputs = ui.dom.querySelectorAll('.playerNames input');
  var msg = ui.dom.querySelector('.playerNames span.msg');
  var blue = inputs[0].value;
  var red = inputs[1].value;
  if (!blue || !red) {
    msg.textContent = 'Every player needs a name!';
    return;
  }

  var res = done(blue, red, ui);
  if (typeof res === 'string')
    msg.textContent = res;
}
