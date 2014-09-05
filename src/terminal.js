
//
// This is a test js to see how to interact with the game logic.
// Kind of like a terminal version of a played game. Used to drive the game
// logic design and initial coding
//

console.log('Hi! Welcome to connect4');

var Connect4 = require('./game');

console.log('Init game');
var game = Connect4.init();

Connect4.print(game);

var started = Connect4.start('John', 'Mary', game);

console.log(
  'Game started with',
  started.players.blue,
  'as BLUE and',
  started.players.red,
  'as RED'
);

Connect4.print(started);

console.log('Blue puts');

var p = Connect4.play(3, started);
Connect4.print(p);

p = Connect4.play(3, p);
Connect4.print(p);

[0, 1, 2].forEach(function(m) {
  p = Connect4.play(m, p);
  if (m !== 2)
    p = Connect4.play(m, p);
});

Connect4.print(p);


