var fs = require('fs');
var express = require('express');

//==============================================================================
exports.middleware = function(options) {
  if (typeof options === 'string')
    return express.cookieParser(options);
  if (options && options.secret)
    return express.cookieParser(options.secret);  
  if (options && options.secretFile)
    return express.cookieParser(fs.readFileSync(options.secretFile, 'utf8'));
  return express.cookieParser();  
}