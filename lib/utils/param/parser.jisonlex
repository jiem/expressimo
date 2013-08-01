%s type

%%

<<EOF>>                       return 'EOF';

<INITIAL>":"\w+"<"            this.begin('type'); return 'TYPED_VAR';
<INITIAL>":"\w+               return 'VAR';
<INITIAL>":"                  return 'STRING';
<INITIAL>[^\:]+               return 'STRING';

<type>">"                     this.popState();
<type>[^>]+                   return 'STRING';