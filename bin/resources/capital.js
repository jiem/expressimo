exports.controller = function(req, res) {    
  $('country').get(req.params.country, function(country) {
    if (country) {
      res.render({
        name: req.session.user,
        country: country.name,
        capital: country.capital
      });
    } else {
      res.send('Hey ' + req.session.user + ', I could not find your country!');    
    }  
  });    
}
