var express = require('express');

//==============================================================================
exports.middleware = function(options) {  
  var publicDir = options ? options.publicDir || 'public' : 'public';
  return express['static'](publicDir, options);
}