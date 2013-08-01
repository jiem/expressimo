var mime = require('mime');

//==============================================================================
module.exports = function(file) {
  
  var contentType = mime.lookup(file);
  
  return function(req, res, next) {
  
    var locals = {};
    var params = req.params;
    var body = req.body;
    var query = req.query;
    var x;

    for (x in query)
      locals[x] = query[x];

    for (x in body)
      locals[x] = body[x];

    for (x in params)
      locals[x] = params[x];

    res.setHeader('Content-Type', contentType);      

    res.render(file, locals, function(err, html) { 
      err ? next(err) : res.end(html); 
    });

  };
  
}