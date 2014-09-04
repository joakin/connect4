
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

