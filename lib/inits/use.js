var fs = require('fs');
var path = require('path');
var express = require('express');

var INTERNAL_MIDDLEWARES_DIR = path.resolve(__dirname, '../middlewares');

//==============================================================================
exports.init = function(middlewares, Return) {
      
  var middlewaresDir = this.get('middlewares');    
  var m, middleware, arg;
  
  this.log('Global middlewares:');
  
  for (m in middlewares) {    
    if (m === 'auth')
      middlewares[m]['static'] = middlewares['static'];
    middleware = getMiddleware(middlewaresDir, m);    
    if (middleware) {      
      this.log('  ' + m);      
      arg = middlewares[m];
      if (arg === true || arg === 1) 
        this.use(middleware.call(this));
      else       
        this.use(middleware.call(this, arg));              
    }
  }
  
  Return();
  
}

//==============================================================================
function getMiddleware(middlewaresDir, middleware) {
  var middlewareFile = path.resolve(middlewaresDir, middleware + '.js');
  if (fs.existsSync(middlewareFile))
    return require(middlewareFile).middleware;
  middlewareFile = path.resolve(INTERNAL_MIDDLEWARES_DIR, middleware + '.js');
  if (fs.existsSync(middlewareFile))
    return require(middlewareFile).middleware;  
  return express[middleware];  
}

//==============================================================================
function getMiddlewareBuilders(middlewaresDir, defaultMiddlewaresDir) {
  var middlewareBuilders = loadModules(middlewaresDir);
  var defaultMiddlewareBuilders = loadModules(defaultMiddlewaresDir);
  var builders = {};
  var x;
  for (x in defaultMiddlewareBuilders)
    builders[x] = defaultMiddlewareBuilders[x].middleware;
  for (x in middlewareBuilders)
    builders[x] = middlewareBuilders[x].middleware;
  return builders;
}

//==============================================================================
function loadModules(dir) {
  var modules = {};  
  var i, f, files;
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir);
    for (i = 0; f = files[i]; i++)
      if (path.extname(f) === '.js')
        modules[path.basename(f, '.js')] = require(path.resolve(dir, f));
  }  
  return modules;
}
