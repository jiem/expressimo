module.exports = function(file) {
  return function(req, res) {
    res.sendfile(file);
  };
}