exports.get = function(country, Return) {            
  db.countries.findOne({
    name: new RegExp('^' + country + '$', 'i')
  }, function(err, country) {             
    Return(country);         
  });  
}