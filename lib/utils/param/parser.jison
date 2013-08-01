%%

tokens
  : token
    { $$ = [$token]; }
  | $tokens token  
    { $tokens.push($token); $$ = $tokens; }
  | $tokens EOF
    { return $tokens }
  ;

token
  : VAR
    { $$ = {param: $1.substr(1), type: 'string'}; }
  | TYPED_VAR STRING
    { $$ = {param: $1.substr(1, $1.length - 2), type: $2}; }
  | STRING
    { $$ = {string: $1}; }
  ;