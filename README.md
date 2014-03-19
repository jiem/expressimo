# Expressimo

Even more pleasure with the Express framework:
- Intuitive linking of Models, Views & Controllers
- Easily defines routes to a controller, view, static file
- 10+ template engines supported
- MongoDB, sessions, upload directly integrated
- Easily configure app with a JSON configuration file
- Easily initialize your app
- Easily define global middlewares in the JSON configuration file
- Easily define local middlewares in a controller


## Installation

    sudo npm install -g expressimo

## Create an app

    expressimo yourApp --jade

Choose your favorite templating language: --jade, --ejs, --swig, --mustache, etc...  
If no templating is defined, the default templating will be handlebars.

# Configure your app

Edit `config/development.json` or `config/production.json`.   
Set your environment variable `NODE_ENV` accordingly. 

## Define routes

Edit the file `routes`. For example:

    GET/user/:name -> controller/user.js
    
## Define controllers

Create files in the `controller` directory, ex: `controller/user.js`.  
A controller is a JS file (a module) with a `controller` function.

    //controller/user.js
    exports.controller = function(req, res) {
      res.send('Hello World');
    }

## Define models

Create files in the `model` directory, ex: `model/person.js`.  
A model is just a node module that will be accessible from controllers.

    //model/person.js
    exports.get = function(name, callback) {
      db.user.findOne({name: name}, function(err, user) {
        callback(user);
      });
    }

## Define views

Create files in the `view` directory, ex: `view/user.html`.     
A view is just a template file from your favorite templating language: handlebars, jade, etc...  
Define your favorite templating when you create the app, ex: `injection yourApp --jade`.

    //view/user.html
    <h1>Hello {{name}}</h1>

## Define middlewares

Create files in the `middleware` directory, ex: `middleware/yourMiddleware.js`.  
For example, a useless middleware that signs every request with your name:

    //middlewares/yourMiddleware.js
    exports.middleware = function(options) {
      var name = options.name;
      return function(req, res, next) {
        req.name = name;
        next();
      }
    }

    //config/development.json
    {
      "middleware": {
        ...,
        "yourMiddleware": {
          "name": "yourName"
        },
        ...
      }
    }

This is how you set a global middleware. 
If you want to set a middleware only for some controllers, see the section on passing middlewares.

## Define initializers

Create files in the `init` directory, ex: `init/redis.js`.  
For example, init your redis connection:
    
    //init/redis.js
    exports.init = function(options, Return) {
      var app = this;
      var host = options.host;
      var port = options.port;
      ...
      global.redis = redisConnection;
      Return(); //when the connection is set. 
    }

    //config/development.json
    {
      ...,
      "redis": {
        "port": 5000,
        "host": "localhost"
      },
      ...
    }

## Link controllers to models and views

In a controller, call a model with the `$` global function:

    //controller/user.js
    exports.controller = function(req, res) {
      $('user').get(req.params.id, function(user) {
        res.send('Hello ' + user.name);
      });
    }

    //model/user.js
    exports.get = function(id, callback) {
      db.user.findOne({id: id}, function(err, user) {
        callback(user);
      });
    }

To render the view `user.html` in the controller `user.js`

    //controller/user.js
    exports.controller = function(req, res) {
      res.render({name: 'John Doe'});
    }

    //view/user.html
    <h1>Hello {{name}}</h1>


## Passing middlewares to controllers

  Define a middleware in the `middleware` directory, ex: `middleware/notLogged.js`.

    //middleware/notLogged.js
    exports.middleware = function(notLoggedAction) {
      return function(req, res, next) {
        req.session && req.session.logged ?
          next() :
          notLoggedAction(req, res, next);
      }
    }

  Attach it to your controller just by exporting it:

    //controller/user.js
    exports.controller = function(req, res) {
      res.send('Hello, you are logged!');
    }

    exports.notLogged = function(req, res) {
      res.redirect('login');
    }

## Run your app

    node app


# Compatibility with Express

All the methods from Express can be called, ex: `req.param`, `res.json`.


## MIT License 

Copyright (c) 2013 Jie Meng-Gerard <contact@jie.fr>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.