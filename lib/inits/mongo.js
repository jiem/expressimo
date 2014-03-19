var mongodb = require('mongodb');

//==============================================================================
exports.init = function(mongo, Return) {
  
  var self = this;
  var proto = 'mongodb://';
  var user = mongo.user;
  var password = mongo.password;
  var auth = user && password ? user + ':'  + password + '@' : '';
  var host = mongo.host || 'localhost';
  var port = mongo.port || 27017;
  var db = mongo.db || '';
  var path = host + ':' + port + '/' + db;
  var reg = /^[^\.]+\.(.+)$/;
  
  mongodb.connect(proto + auth + path, function(e, db) {
    if (e) {
      self.log('MongoDB failed to connect on ' + path, 'red');
      Return(e);
    } else {
      DB.$ = db;
      db.collectionNames(function(err, names) {
        var count = 0;  
        var i, name;
        if (err) {
          self.log('MongoDB failed to connect on ' + path, 'red');
          Return(err);
        } else {          
          for (i = 0; name = names[i]; i++) {
            if (reg.test(name.name)) {
              db.collection(RegExp.$1, function(_, collection) {
                if (collection)
                  DB[collection.collectionName] = collection;
                if (++count >= names.length) {
                  global.db = DB;
                  self.db = DB;
                  self.log('MongoDB connected on ' + path);
                  Return();
                }
              });
            } else {
              count++;
            }            
          }
        }
      });
    }      
  });
  
}

//============================================================================
function DB(queries, callback) {
  var general = {results: [], callback: callback, countdown: 0};
  var i, query, coll, method; 
  for (i = 0; query = queries[i]; i++) {        
    coll = arguments.callee[query.shift()];
    method = query.shift();
    if (typeof coll[method] === 'function') {      
      query.push(createCallback(i, general));
      general.countdown++;
      coll[method].apply(coll, query);
    } else {
      callback(new Error('Invalid db method "' + method + '"'));
      delete general.callback;
    }
  }  
}

DB.id = function(x) {
 if (typeof x === 'string')
    return new mongodb.ObjectID(x);
  if (x instanceof Date)
    x = x.getTime();
  return mongodb.ObjectID.createFromTime(Math.floor(x / 1000));
};

DB.close = function() {
  DB.$.close();
}

//==============================================================================
function createCallback(index, general) {
  return function(err, x) {        
    if (err) {
      general.callback(err);
      delete general.callback;
    } else {
      general.results[index + 1] = x;
      if (general.callback && --general.countdown <= 0) {        
        general.callback.apply(null, general.results);
        delete general.callback;
      }        
    }    
  }
}

//==============================================================================
mongodb.Collection.prototype.findAll = function() {
  var callback = Array.prototype.pop.call(arguments);
  this.find.apply(this, arguments).toArray(callback);
}

//==============================================================================
mongodb.Collection.prototype.each = function() {
  var callback = Array.prototype.pop.call(arguments);
  this.find.apply(this, arguments).each(callback);
}