%%

tokens
  : token
    { $$ = [$token]; }  
  | tokens token
    { $tokens.push($token); $$ = $tokens; }
  | tokens EOF
    { return $tokens; }
  ;

token
  : VAR
    { $$ = {param: $1.substr(1)}; }
  | STRING
    { $$ = {string: $1}; }
  ;