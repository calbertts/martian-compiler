module.exports.grammar1 = `
Program = 
  PlanetDefinition 
  Sentences
  
PlanetDefinition "Planet Definition" = 
  _ "Square" Space w:Digit " "+ h:Digit EOS {
    if(w <= 0 || h <= 0) error("Planet definition must be > 0")
    return { square: {w, h} }
  }

Sentences = 
  i:(EmptyLine / _ t:Block)* {
    return i.map(i => i[1]).filter(x => x !== undefined)
  }

EmptyLine = _ LineTerminatorSequence { return }

Block "Block" = robot:RobotName EOS instructions:Instructions {
    return { robot, instructions }
  }

RobotName "Robot Name" = _ name:Text {
    return name
  }
  
Instructions = 
  Instruction*
  
Instruction =
  _ m:Movement e:EOS? {
    if(!e) error('Movement expects only 3 params')
    return m
  }
  / _ r:RotationType e:EOS? {
    if(!e) error('Rotation expects only 1 param')
    return r
  }
  
RotationType "Rotation Type" = 
  "Rotate" Space r:("R" / "F" / "L")+ {
    return { rotate: r }
  }

Movement "Movement" = 
  "Move" Space l:Digit " " r:Digit " " d:Direction {
    if(l <= -1 || r <= -1) error("Movement must be >= 0")
    return { move: {l, r, d} }
  }

Direction "Direction" = "N" / "E" / "S" / "W"

Digit = n:[0-9]+ { return parseInt(n.join('')) }
Text = t:[a-zA-Z0-9_]+ { return t.join('') }

Space = " "+

EOS "End Of Sentence" = LineTerminatorSequence / EOF

LineTerminatorSequence "end of line"
  = "\\n"
  / "\\r\\n"
  / "\\r"
  / "\\u2028"
  / "\\u2029"

EOF "End Of File"
  = !.

_ "whitespace"
  = [ \\t\\r\\n]*  // Espacios en blanco opcionales
`;
