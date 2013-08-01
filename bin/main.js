#!/usr/bin/env node

var fs = require('fs');
var crypto = require('crypto');

var RESOURCES = __dirname + '/resources';
var CONSOLIDATE_FILE = __dirname + '/resources/consolidate.json';
var TEMPLATE_ENGINES = JSON.parse(fs.readFileSync(CONSOLIDATE_FILE, 'utf8')).devDependencies;

//==============================================================================
function main() {
  
  var options = getOptions();
  var project = options.project;
  
  if (!project || options.help) {
    console.log('Usage: injection [appname]');
  } else if (options.version) {
    console.log(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version);
  } else if (fs.existsSync(project)) {
    console.log('Error: there is already a "' + project + '" directory!');
  } else {
    createProjectStructure(options);
  }

}

//==============================================================================
function createProjectStructure(options) {
  
  var project = options.project;

  console.log('');
  
  mkdir(project);    
  cp(RESOURCES + '/app.js', project + '/app.js');
  cp(RESOURCES + '/routes', project + '/routes');
  mkfile(RESOURCES + '/package.json', options, project + '/package.json');
  mkfile(RESOURCES + '/development.json', options, project + '/development.json');
  mkfile(RESOURCES + '/production.json', options, project + '/production.json');    
  mkdir(project + '/controllers');
  cp(RESOURCES + '/login.js', project + '/controllers/login.js');
  cp(RESOURCES + '/capital.js', project + '/controllers/capital.js');
  mkdir(project + '/views');
  cp(RESOURCES + '/capital.html', project + '/views/capital.html');
  mkdir(project + '/models');  
  cp(RESOURCES + '/country.js', project + '/models/country.js');    
  mkdir(project + '/public');    
  cp(RESOURCES + '/favicon.ico', project + '/public/favicon.ico');  
  
  createSessionSecret(project + '/session.secret');
  
  console.log();
  console.log('  install dependencies:');
  console.log('    $ cd ' + project + ' && npm install\n');
  
  console.log('  run the app:');
  console.log('    $ node app\n');
  
}

//==============================================================================
function getOptions() {
  var options = {
    project: process.argv[2],
    help: process.argv.indexOf('--help') !== -1,
    version: process.argv.indexOf('--version') !== -1,
    template: "handlebars"
  };      
  for (var t in TEMPLATE_ENGINES)
    if (process.argv.indexOf('--' + t) !== -1)
      options.template = t;
  return options;
}

//==============================================================================
function createSessionSecret(file) {
  fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'));
}

//==============================================================================
function mkdir(dir) {
  console.log('  \033[32mcreating\033[0m: ' + dir);
  fs.mkdirSync(dir);
}

function mkfile(template, options, file) {
  template = fs.readFileSync(template, 'utf8');
  template = template.replace(/\{\{([^\}]+)\}\}/g, function(_, attr) {
    return options[attr];
  });
  console.log('  \033[32mcreating\033[0m: ' + file);
  fs.writeFileSync(file, template);
}

function cp(src, dest) {
  console.log('  \033[32mcreating\033[0m: ' + dest);
  fs.createReadStream(src).pipe(fs.createWriteStream(dest));
}

//==============================================================================
main();