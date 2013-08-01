var fs = require('fs');
var path = require('path');
var express = require('express');

var INTERNAL_MIDDLEWARES_DIR = path.resolve(__dirname, 'middlewares');

//==============================================================================
module.exports = function(app, file) {

  var name = path.basename(file, '.js');  
  var middlewares = null;
  var data = null;
  var controller = null;  
  
  file = path.resolve(file);
  
  //============================================================================
  function update() {    
    var module = require(file);
    var middlewaresDir = app.get('middlewares');
    var field, middleware;
    middlewares = [];
    data = module.data;    
    controller = module.controller;     
    for (field in module)
      if ((middleware = getMiddleware(middlewaresDir, field)))      
        middlewares.push(middleware(module[field]));  
  }
  
  update();
  
  //============================================================================
  return function(req, res, next) {

    var render = res.render;

    var finish = function() {
      if (data) {
        data(req, res, function(x) {
          x instanceof Error ?
            next(x) :        
            controller.call(app, req, res, x, next);
        });
      } else {
        controller.call(app, req, res, next);
      }
    };

    res.render = function() {
      
      var view = arguments[0];
      var locals = arguments[1];
      var callback = arguments[2];
      
      if (typeof arguments[0] !== 'string') {        
        view = name + '.html';
        locals = arguments[0];
        callback = arguments[1];      
      }
      
      if (typeof locals === 'function') {
        callback = locals;
        locals = {};
      }
      
      if (!locals) {
        locals = {};
      }
      
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/html');
      }
      
      render.call(res, view, locals, callback || function(err, html) {
        err ?
          res.end('Error rendering view: ' + view) :
          res.end(html);
      });    
      
    }

    if (!app.get('router cache'))      
      update();    

    if (middlewares.length) {
      middlewares.shift()(req, res, function() {      
        var nextMiddleware = middlewares.shift();
        nextMiddleware ?
          nextMiddleware(req, res, arguments.callee) :
          finish();              
      });
    } else {
      finish();
    }  

  };
  
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