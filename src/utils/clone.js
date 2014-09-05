
// Utility function to work with immutable data. For now it uses the simplest
// way with JSON.
module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};
