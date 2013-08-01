var param = require('./utils/param');

//==============================================================================
module.exports = function(app, url) {
  
  url = param.createBinder(url);    
  
  return function(req, res, next) {  
    req.originalUrl = req.url;
    req.url = url(req.params);
    app.router(req, res, next);  
  };
  
}