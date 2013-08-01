var fs = require('fs');
var path = require('path');
var parser = require('./utils/route_parser').parser;
var rewrite = require('./rewrite');
var controller = require('./controller');
var view = require('./view');
var file = require('./file');
var redirection = require('./redirection');

//==============================================================================
module.exports = function(app, routeFile, cache) {    
  
  var mtime = new Date(0);    
  app.set('router cache', cache);
 
  function update() {    
    var mtimeLast, module;    
    if (!fs.existsSync(routeFile))
      throw new Error('Could not find route file: ' + routeFile);    
    mtimeLast = fs.statSync(routeFile).mtime;
    for (module in require.cache)
      delete require.cache[module];      
    if (mtimeLast > mtime) {
      mtime = mtimeLast;
      getRoutes(app, routeFile).forEach(function(route) {
        route.methods.forEach(function(method) {
          app[method.toLowerCase()](route.url, route.destination);
        });
      });  
    }  
  }
  
  return function(req, res, next) {
    cache || update();
    app.router(req, res, next);
  };

}

//==============================================================================
function getRoutes(app, routeFile) {
  var routes = parser.parse(fs.readFileSync(routeFile, 'utf8'));
  for (var i = 0, route; route = routes[i]; i++) {
    if (route.rewrite) {
      route.destination = rewrite(app, route.rewrite);
    } else if (route.file) {
      if (isController(app, route.file))
        route.destination = controller(app, route.file);
      else if (isView(app, route.file))
        route.destination = view(route.file);
      else
        route.destination = file(route.file)
    } else {
      route.destination = redirection(route.status, route.redirection);
    }
  }
  return routes;
}

//==============================================================================
function isController(app, file) {
  return path.relative(
    path.resolve(app.get('controllers')), 
    path.resolve(file)
  ).substr(0, 3) !== '../';
}

//==============================================================================
function isView(app, file) {
  return path.relative(
    path.resolve(app.get('views')), 
    path.resolve(file)
  ).substr(0, 3) !== '../';
}