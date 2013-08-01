var fs = require('fs');
var router = require('../router');

//==============================================================================
exports.middleware = function(options) {   
  return router(this, options.routeFile, options.cache);
}