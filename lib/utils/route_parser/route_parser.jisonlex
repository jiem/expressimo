%s path
%s direct
%s redirect

%%

<<EOF>>                         return 'EOF';

<INITIAL>\s+                    return;
<INITIAL>"GET"                  return 'GET';
<INITIAL>"POST"                 return 'POST';
<INITIAL>"HEAD"                 return 'HEAD';
<INITIAL>"PUT"                  return 'PUT';
<INITIAL>"DELETE"               return 'DELETE';
<INITIAL>"TRACE"                return 'TRACE';
<INITIAL>"OPTIONS"              return 'OPTIONS';
<INITIAL>"CONNECT"              return 'CONNECT';
<INITIAL>"ALL"                  return 'ALL';
<INITIAL>"+"                    return 'PLUS';
<INITIAL>"/"                    this.begin('path'); return 'STRING';

<path>\s*"->"\s*                this.begin('direct');
<path>\s*"-->"\s*               this.begin('redirect');
<path>"-"                       return 'STRING';    
<path>[^\s\-]+                  return 'STRING';

<direct>"/"\S*                  return 'REWRITE';
<direct>\S+                     return 'FILE';
<direct>\s+                     this.begin('INITIAL');

<redirect>"30"[0-8]\s*","\s*    return 'STATUS';
<redirect>\S+                   return 'REDIRECTION';
<redirect>\s+                   this.begin('INITIAL');