var express = require('express');
var MongoStore = require('connect-mongo')(express);
var mongodb = require('mongodb');

var DEFAULT_MONGO_HOST = 'localhost';
var DEFAULT_MONGO_PORT = 27017;

//==============================================================================
exports.middleware = function(options) {      
  
  var mongo = options.mongo;  
  
  if (options.store === 'mongo')
    options.store = new MongoStore({db: this.db});

  if (options.store === 'memory') 
    delete options.store;

  if (mongo) {           
    options.store = new MongoStore({
      db: db(mongo),
      collection: mongo.collection,
      host: mongo.host,
      port: mongo.port,
      username: mongo.username,
      password: mongo.password,
      auto_reconnect: mongo.auto_reconnect,
      stringify: mongo.stringify === true
    });
  } 
  
  return express.session(options);  
  
}

//==============================================================================
function db(options) {
  var dbName = options.db;    
  var server = options.server;        
  if (server) {      
    server = new mongodb.Server(
      server.host || DEFAULT_MONGO_HOST,
      server.port || DEFAULT_MONGO_PORT, 
      server
    );
  } else {
    server = new mongodb.Server(DEFAULT_MONGO_HOST, DEFAULT_MONGO_PORT);
  }
  return new mongodb.Db(dbName, server, options)
}