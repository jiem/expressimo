var fs = require('fs');
var express = require('express');

//==============================================================================
exports.middleware = function(options) {  
  if (options && options.file)
    options.stream = fs.createWriteStream(options.file, {flags: 'a'});
  return express.logger(options);
}