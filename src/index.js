
console.log('Hi! Welcome to connect4');

var Connect4 = require('./game');

console.log('Init game');
var game = Connect4.init();

console.log(game);

var started = Connect4.start('John', 'Mary', game);

console.log(
  'Game started with',
  started.players.blue,
  'as BLUE and',
  started.players.red,
  'as RED'
);

console.log('Game state', started.state);

console.log('Blue puts');

var p = Connect4.play(3, started);
console.log(p, p.state);
console.log(printBoard(p));

p = Connect4.play(3, p);
console.log(p, p.state);
console.log(printBoard(p));

[0, 1, 2].forEach(function(m) {
  p = Connect4.play(m, p);
  if (m !== 2)
    p = Connect4.play(m, p);
});

console.log(p, p.state);
printBoard(p);


function printBoard(g) {
  console.log(g.board.cells.map(function(r) {return r.join('|');}).join('\n'));
}

