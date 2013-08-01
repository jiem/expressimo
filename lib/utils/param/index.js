var parserParser = require('./parser').parser;
var binderParser = require('./binder').parser;

//==============================================================================
exports.createParser = function(x) {
  return typeof x === 'string' ?
    createStringParser(x) :
    createObjectParser(x);
}

//==============================================================================
exports.createBinder = function(str) {
  
  var tokens = binderParser.parse(str);
  var fun = [];
  var pending = '';
  var i, token;
  
  for (i = 0; token = tokens[i]; i++) {
    if (token.param) {
      if (pending) {
        fun.push(JSON.stringify(pending));
        pending = '';
      }
      fun.push('x["' + token.param + '"]');
    } else {
      pending += token.string;
    }
  }
  
  if (pending)
    fun.push(JSON.stringify(pending));
  
  return new Function('x', 'return ' + fun.join('+')); 
  
}

//==============================================================================
function createStringParser(parameterizedStr) {
  
  var tokens = parserParser.parse(parameterizedStr);
  var params = [];
  var reg = '';
  var i, token;
  
  for (i = 0; token = tokens[i]; i++) {
    if (token.param) {
      if (TYPE_REG[token.type]) {
        reg += '(' + TYPE_REG[token.type] + ')';        
      } else {
        reg += '(' + token.type + ')';
        token.type = 'string';
      }
      params.push(token);
    } else {
      reg += token.string;
    }
  }

  reg = new RegExp('^' + reg + '$'); 
  
  return function(str) {
    var match, i, p, parsed;
    if ((match = str.match(reg))) {
      parsed = {};
      for (i = 0; p = params[i]; i++) {        
        parsed[p.param] = p.type === 'string' ? 
          match[i + 1] : 
          TYPE_PARSER[p.type](match[i + 1]);
      }
    }
    return parsed;
  };
  
}

//==============================================================================
function createObjectParser(typeObj) {

  var regs = {};
  var parsers = {};
  var prop;
  
  for (prop in typeObj) {
    switch (typeObj[prop]) {
      case 'string': 
        break;  
      case 'int': 
        regs[prop] = /^\d+$/;
        parsers[prop] = parseInt;
        break;    
      case 'array':
        parsers[prop] = TYPE_PARSER.array;
        break;    
      case 'int_array':
        regs[prop] = /^(?:\d+,)*\d+$/;
        parsers[prop] = TYPE_PARSER.int_array;
        break;    
      case 'date':
        regs[prop] = DATE_REG;
        parsers[prop] = TYPE_PARSER.date;        
      default: 
        regs[prop] = new RegExp('^' + typeObj[prop] + '$');
    }
  }
  
  return function(obj) {
    var match = {};
    for (var prop in typeObj) {
      if (!(prop in obj))
        return null;
      if (regs[prop] && !regs[prop].test(obj[prop]))
        return null;
      match[prop] = parsers[prop] ? parsers[prop](obj[prop]) : obj[prop];
    }
    return match;
  }
  
}

//==============================================================================
var TYPE_REG = {
  'string': '[^\\s/]+',
  'int': '\\d+',
  'array': '[^\\s/]+',  
  'int_array': '(?:\\d+,)*\\d+',
  'date': '\\d\\d\\d\\d\\-\\d\\d\\-\\d\\d'
};

var TYPE_PARSER = {
  
  'int': parseInt,
  
  'array': function(a) {
    return a.split(',');
  },
  
  'int_array': function(a) {
    return a.split(',').map(PARSE_INT);
  },
  
  'date': function(d) {
    var m = d.match(DATE_REG);
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  
};

var PARSE_INT = function(x) {
  return parseInt(x);
};

var DATE_REG = /^(\d\d\d\d)\-(\d\d)\-(\d\d)$/;