var fs = require('fs');
var exec = child_process = require('child_process').exec;
var multipart = require('express').multipart;

var DEFAULT_UPLOAD_DIR = 'upload';

//==============================================================================
exports.middleware = function(options) {
  
  var mimeReg = /\:\s*([^\:\s]+)[^\:]*$/;  
  var accept = options.accept || options.accepts;
  var multipartMiddleware;
  
  if (options.dir)
    options.uploadDir = options.dir;
    
  if (!options.uploadDir)
    options.uploadDir = DEFAULT_UPLOAD_DIR;
  
  multipartMiddleware = multipart(options);
  
  if (!accept)
    return multipartMiddleware;
  
  accept = new RegExp(accept);  
  
  return function(req, res, next) {
    multipartMiddleware(req, res, function() {
      
      var files = req.files;
      var count = 0;
      var hasInvalidFile = false;
      var error = {};
      
      var errorCallback = options.invalid || function() {
        res.json(error);
      };
      
      var checkMimeCallback = function(f) {
        return function(err, stdout) {        
          var mime;
          if (err || !mimeReg.test(stdout)) {
            hasInvalidFile = true;
            error[f] = 'Could not detect mime';
            fs.unlink(files[f].path);
          } else {
            mime = RegExp.$1;
            if (!accept.test(mime)) {
              hasInvalidFile = true;
              error[f] = 'Not authorized mime: ' + mime;
              fs.unlink(files[f].path);
            }          
          }
          if (--count === 0) {
            if (hasInvalidFile) {
              req.files.error = error;
              errorCallback();
            } else {
              next();
            }
          }
        }
      };
      
      for (var f in req.files) {
        count++;
        exec('file --mime-type ' + req.files[f].path, checkMimeCallback(f));  
      }
      
    });      
  };
  
}