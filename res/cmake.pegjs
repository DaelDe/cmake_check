file         =  file_element*
file_element =  command_invocation line_ending /
                (bracket_comment/space)* line_ending
command_invocation  =  space* identifier space* '(' arguments ')'
arguments           =  argument? separated_arguments*
separated_arguments =  separation+ argument? /
                         separation* '(' arguments ')'

bracket_comment =  '#' bracket_argument
bracket_argument =  bracket_open bracket_content bracket_close
bracket_open     =  '[' '='* '['
/*any text not containing a bracket_close with the same number of '=' as the bracket_open*/
bracket_content  = [^\[\]] 
bracket_close    =  ']' '='* ']'

argument =  bracket_argument / quoted_argument / unquoted_argument
quoted_argument     =  '"' quoted_element* '"'
/* <any character except '\' or '"'>*/
quoted_element      =  [^\\\"] / escape_sequence / quoted_continuation
quoted_continuation =  '\\' newline

unquoted_argument =  unquoted_element+  /* / unquoted_legacy*/
// <any character except whitespace or one of '()#"\'>
unquoted_element  =   [^\(\)#\"\\] / escape_sequence
// unquoted_legacy   =  <see note in text>

escape_sequence  =  escape_identity / escape_encoded / escape_semicolon
escape_identity  =  '\\'[^A-Za-z0-9;]
escape_encoded   =  '\t' / '\r' / '\n'
escape_semicolon =  '\\;'

// line_comment should match only once but this is maybe not supported
line_ending  =  line_comment* newline
/*any text not starting in a bracket_argument and not containing a newline*/
line_comment =  '#'[a-zA-Z0-9 \t\(\)=\-.<>/\*_]* {return text()}
separation          =  space / line_ending
identifier          =  [A-Za-z_][A-Za-z0-9_]*
space        =  [ \t]+
newline      =  '\n'