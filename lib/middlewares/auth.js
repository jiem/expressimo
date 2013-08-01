var staticMiddlewareFactory = require('./static').middleware;

//==============================================================================
exports.middleware = function(notLoggedAction) {
  
  var ignore = {};
  var ignoreArray = Array.isArray(notLoggedAction.ignore) ?
    notLoggedAction.ignore : 
    [notLoggedAction.ignore];  
  var staticMiddleware;
    
  ignoreArray.forEach(function(i) {
    if (typeof i === 'string') {
      if (i.charAt(i.length - 1) === '/') {
        ignore[i] = 1;
        ignore[i.substr(0, i.length - 1)] = 1;
      } else {
        ignore[i] = 1;
        ignore[i + '/'] = 1;
      }  
    }    
  });   
    
  if (ignore['static'])    
    staticMiddleware = staticMiddlewareFactory(notLoggedAction['static']); 
  
  if (typeof notLoggedAction === 'function') {
    if (staticMiddleware) {    
      return function(req, res, next) {
        staticMiddleware(req, res, function() {
          req.session.logged || ignore[req.path] ?
            next() :
            notLoggedAction(req, res, next);    
        });        
      };
    }
    return function(req, res, next) {
      req.session.logged || ignore[req.path] ?
        next() :
        notLoggedAction(req, res, next);    
    };
  }
    
  if (notLoggedAction.login) {
    ignore[notLoggedAction.login] = 1;
    if (staticMiddleware) {    
      return function(req, res, next) {
        staticMiddleware(req, res, function() {
          if (req.session.logged || ignore[req.path]) {
            next();
          } else {
            req.session.originPage = req.url;
            res.redirect(notLoggedAction.login);    
          }
        });        
      };
    }
    return function(req, res, next) {
      if (req.session.logged || ignore[req.path]) {
          next();
        } else {
          req.session.originPage = req.url;
          res.redirect(notLoggedAction.login);    
        }
    };
  }
    
  throw new Error('auth middleware: invalid arguments');
  
}