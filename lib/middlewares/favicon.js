var express = require('express');

//==============================================================================
exports.middleware = function(options) {  
  var favicon = express.favicon;      
  if (typeof options === 'string')
    return favicon(options);
  if (options)
    return favicon(options.path, options);
  return favicon();
}