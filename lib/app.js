var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var consolidate = require('consolidate');

//==============================================================================

var DEFAULT_INITS_DIR = 'inits';
var DEFAULT_MIDDLEWARES_DIR = 'middlewares';
var DEFAULT_MODELS_DIR = 'models';
var DEFAULT_VIEWS_DIR = 'views';
var DEFAULT_CONTROLLERS_DIR = 'controllers';

var DEFAULT_PORT = 8080;
var DEFAULT_HOST = '127.0.0.1';

var INTERNAL_INITS_DIR = path.resolve(__dirname, 'inits');

//==============================================================================
function app() {  
  var app = express();    
  initDefaultDirs(app);
  initConfig(app);
  initLog(app);
  initViewEngine(app);  
  initModelGetter(app);
  initParam(app);
  initLocals(app);
  initCustom(app, function() {
    var port = app.get('port') || DEFAULT_PORT;
    var host = app.get('host') || DEFAULT_HOST;
    http.createServer(app).listen(port, host);
    app.log('Server running at http://' + host + ':' + port + '/');
  });  
}

//==============================================================================
function initDefaultDirs(app) {  
  app.set('inits', DEFAULT_INITS_DIR);
  app.set('middlewares', DEFAULT_MIDDLEWARES_DIR);
  app.set('models', DEFAULT_MODELS_DIR);
  app.set('views', DEFAULT_VIEWS_DIR);  
  app.set('controllers', DEFAULT_CONTROLLERS_DIR);      
}

//==============================================================================
function initConfig(app) {
  
  var inits = [];
  var config, configFile, field, init;
  
  if (process.env.OPENSHIFT_NODEJS_PORT)
    app.set('env', 'production');  
  
  configFile = app.get('env') + '.json';
  
  if (fs.existsSync(configFile)) {
    config = fs.readFileSync(configFile, 'utf8');
    config = config.replace(/"\$([A-Z][A-Z0-9_]+)"/g, function(_, x) {
      return '"' + process.env[x] + '"';
    });
    config = JSON.parse(config);
  } else {
    throw new Error('Unable to find config file: ' + configFile);
  }
  
  if (config.inits) {
    app.set('inits', config.inits);
    delete config.inits;
  }
  
  for (field in config) {
    (init = getInit(app.get('inits'), field)) ?
      inits.push({fun: init, arg: config[field]}) :
      app.set(field, config[field]);
  }
  
  app.inits = inits;
  
}

//==============================================================================
function initLog(app) {
  app.verbose = true;
  app.log = function(text, color) {
    if (app.verbose) {      
      if ((color = COLORS[color]))
        text = color[0] + text + color[1];        
      console.log(text);
    }
  }
}

//==============================================================================
function initViewEngine(app) {
  var viewEngine = app.get('view engine');
  if (consolidate[viewEngine]) {
    app.log('View engine: ' + viewEngine);
    app.engine('html', consolidate[viewEngine]);
  } else {
    app.log('View engine "' + viewEngine + '" not supported', 'red');
  }
}

//==============================================================================
function initModelGetter(app) {
  var modelsDir = path.resolve(app.get('models'));
  global.$ = function(model) {
    return require(modelsDir + '/' + model);
  }
}
//==============================================================================
function initParam(app) {
  var paramFile = path.resolve(app.get('inits'), 'param.js');
  var param, p, cb;
  if (fs.existsSync(paramFile)) {
    param = require(paramFile);
    for (p in param) {
      cb = param[p];
      if (typeof cb === 'function' || cb instanceof RegExp)
        app.param(p, cb);      
    }      
  }
}

//==============================================================================
function initLocals(app) {
  var localsFile = path.resolve(app.get('inits'), 'locals.js');
  if (fs.existsSync(localsFile))
    app.locals(require(localsFile));            
}

//==============================================================================
function initCustom(app, callback) {  
  (function() {
    var init = app.inits.shift();
    if (init) {
      init.fun.call(app, init.arg, arguments.callee);
    } else {
      delete app.inits;
      callback();
    }
  })();  
}

//==============================================================================
function getInit(initsDir, init) {  
  var initFile = path.resolve(initsDir, init + '.js');
  if (fs.existsSync(initFile))
    return require(initFile).init;
  initFile = path.resolve(INTERNAL_INITS_DIR, init + '.js');
  if (fs.existsSync(initFile))
    return require(initFile).init;  
  return null;  
}

//==============================================================================
var COLORS = {
  'white'     : ['\x1B[37m', '\x1B[39m'],
  'grey'      : ['\x1B[90m', '\x1B[39m'],
  'black'     : ['\x1B[30m', '\x1B[39m'],
  'blue'      : ['\x1B[34m', '\x1B[39m'],
  'cyan'      : ['\x1B[36m', '\x1B[39m'],
  'green'     : ['\x1B[32m', '\x1B[39m'],
  'magenta'   : ['\x1B[35m', '\x1B[39m'],
  'red'       : ['\x1B[31m', '\x1B[39m'],
  'yellow'    : ['\x1B[33m', '\x1B[39m']
};

//==============================================================================
exports.start = app;