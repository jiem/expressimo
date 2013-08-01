%%

<<EOF>>                return 'EOF';
":"\w+                 return 'VAR';
":"                    return 'STRING';
[^\:]+                 return 'STRING';