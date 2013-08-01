exports.controller = function(req, res) {
  if (req.body.user) {
    req.session.logged = true;
    req.session.user = req.body.user;
    res.redirect(req.session.originPage);
  } else {
    res.send(
      '<form method="post" action="login">' +
      '  <input type="text" name="user" placeholder="Enter your name">' +
      '  <input type="submit" value="login">' +
      '</form>'  
    );
  }
}