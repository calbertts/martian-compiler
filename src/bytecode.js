function convertToBytecode(parsedProgram) {
  let bytecode = [];

  // Add square definition
  let square = parsedProgram[0].square;
  bytecode.push(0x01, square.w, square.h);

  // Add robot instructions
  let robots = parsedProgram[1];
  robots.forEach((robot) => {
    bytecode.push(...convertRobotInstructions(robot));
  });

  return bytecode;
}

function convertRobotInstructions(robot) {
  let bytecode = [];

  // Encode robot name length and name
  let robotName = robot.robot;
  bytecode.push(robotName.length);
  for (let char of robotName) {
    bytecode.push(char.charCodeAt(0));
  }

  robot.instructions.forEach((instruction) => {
    if (instruction.move) {
      bytecode.push(
        0x02,
        instruction.move.l,
        instruction.move.r,
        convertDirection(instruction.move.d)
      );
    } else if (instruction.rotate) {
      bytecode.push(0x03);
      instruction.rotate.forEach((r) => {
        bytecode.push(convertRotation(r));
      });
    }
  });

  // End of robot instructions
  bytecode.push(0x80);

  return bytecode;
}

function convertDirection(direction) {
  return {
    N: 0x04,
    E: 0x05,
    S: 0x06,
    W: 0x07,
  }[direction];
}

function convertRotation(rotation) {
  return {
    R: 0x08,
    F: 0x09,
    L: 0x0a,
  }[rotation];
}

function decodeDirection(byte) {
  return {
    0x04: "N",
    0x05: "E",
    0x06: "S",
    0x07: "W",
  }[byte];
}

function decodeRotation(byte) {
  return {
    0x08: "R",
    0x09: "F",
    0x0a: "L",
  }[byte];
}

module.exports = {
  convertToBytecode,
  convertDirection,
  convertRotation,
  decodeDirection,
  decodeRotation,
};
