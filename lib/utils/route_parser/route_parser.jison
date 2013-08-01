%%

routes
  : route
    { $$ = [$route]; }
  | routes route
    { $routes.push($route); $$ = $routes; }
  | routes EOF
    { return $routes; }
  ;

url
  : STRING
    { $$ = $1; }
  | url STRING
    { $$ = $url + $2; }
  ;

route
  : methods url REWRITE
    { $$ = {methods: $methods, url: $url, rewrite: $3}; }
  | methods url FILE
    { $$ = {methods: $methods, url: $url, file: $3}; }
  | methods url STATUS REDIRECTION
    { $$ = {methods: $methods, url: $url, status: parseInt($3), redirection: $4}; }
  | methods url REDIRECTION
    { $$ = {methods: $methods, url: $url, status: 302, redirection: $3}; }
  ;

method
  : GET
  | POST
  | HEAD
  | PUT
  | DELETE
  | TRACE
  | OPTIONS
  | CONNECT
  | ALL
  ;

methods
  : method
    { $$ = $method === 'ALL' ? ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT'] : [$method]; }
  | methods PLUS method
    { $methods.push($method); $$ = $methods; }
  ;