var param = require('./utils/param');

//==============================================================================
module.exports = function(status, url) {
  
  url = param.createBinder(url);    
  
  return function(req, res) {
  
    var paramsBodyQuery = {};
    var params = req.params;
    var body = req.body;
    var query = req.query;
    var x;

    for (x in query)
      paramsBodyQuery[x] = query[x];

    for (x in body)
      paramsBodyQuery[x] = body[x];

    for (x in params)
      paramsBodyQuery[x] = params[x];

    res.redirect(status, url(paramsBodyQuery));

  };
  
}