
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

var p = Connect4.play(Math.floor(Math.random()*8), started);
console.log(p, p.state);

p = Connect4.play(Math.floor(Math.random()*8), p);
console.log(p, p.state);

