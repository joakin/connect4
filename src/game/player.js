
// Validate player name
// * Must be a string
// * Not be empty
exports.valid = function(player) {
  return typeof player === 'string' && player !== '';
};
