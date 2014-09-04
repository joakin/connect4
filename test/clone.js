
var test = require('tape');
var clone = require('../../src/utils/clone');

test('it clones an object', function(t) {
  var a = {a: 1, b: [2, 3]};
  t.notEqual(clone(a), a);
  t.deepEqual(clone(a), a);
  t.end();
});
