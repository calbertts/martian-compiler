#!/usr/bin/env node

const fs = require("fs");
const { decodeDirection, decodeRotation } = require("./bytecode");

function executeBytecode(bytecode) {
  let pc = 0; // Program counter
  let square = {};
  let robots = [];
  let scents = new Set();

  // Read square definition
  if (bytecode[pc++] !== 0x01)
    throw new Error("Invalid bytecode format: missing square definition");
  square.w = bytecode[pc++];
  square.h = bytecode[pc++];

  while (pc < bytecode.length) {
    let robot = {};
    let nameLength = bytecode[pc++];
    robot.name = String.fromCharCode(...bytecode.slice(pc, pc + nameLength));
    pc += nameLength;
    robot.instructions = [];

    while (pc < bytecode.length && bytecode[pc] !== 0x80) {
      let command = bytecode[pc++];
      if (command === 0x02) {
        // Move
        let move = {
          l: bytecode[pc++],
          r: bytecode[pc++],
          d: decodeDirection(bytecode[pc++]),
        };
        robot.instructions.push({ move });
      } else if (command === 0x03) {
        // Rotate
        let rotations = [];
        while (
          pc < bytecode.length &&
          bytecode[pc] >= 0x08 &&
          bytecode[pc] <= 0x0a
        ) {
          rotations.push(decodeRotation(bytecode[pc++]));
        }
        robot.instructions.push({ rotate: rotations });
      }
    }

    // Move past the end of robot instructions marker
    pc++;

    robots.push(robot);
  }

  return simulateRobots(square, robots, scents);
}

function simulateRobots(square, robots, scents) {
  let results = [];

  process.stdout.write(JSON.stringify({ event: "start", square, robots }) + "\n");

  robots.forEach((robot) => {
    let x, y, direction;
    let lost = false;

    // Initial position and direction
    if (robot.instructions[0] && robot.instructions[0].move) {
      x = robot.instructions[0].move.l;
      y = robot.instructions[0].move.r;
      direction = robot.instructions[0].move.d;
    }

    for (let instruction of robot.instructions) {
      if (instruction.rotate) {
        for (let command of instruction.rotate) {
          if (command === "R") {
            direction = rotateRight(direction);
          } else if (command === "L") {
            direction = rotateLeft(direction);
          } else if (command === "F") {
            let [newX, newY] = moveForward(x, y, direction);
            process.stdout.write(JSON.stringify({ event: "trying_move", robot: robot.name, position: { x: newX, y: newY }, direction }) + "\n");
            if (isOffGrid(newX, newY, square)) {
              if (!scents.has(`${x},${y},${direction}`)) {
                scents.add(`${x},${y},${direction}`);
                lost = true;
                process.stdout.write(JSON.stringify({ event: "lost", robot: robot.name, position: { x, y }, direction }) + "\n");
                break;
              }
            } else {
              x = newX;
              y = newY;
              process.stdout.write(JSON.stringify({ event: "moved", robot: robot.name, position: { x, y }, direction }) + "\n");
            }
          }
        }
      }
      if (lost) break;
    }

    results.push({
      name: robot.name,
      x,
      y,
      direction,
      lost,
    });
  });

  return results;
}

function rotateRight(direction) {
  return {
    N: "E",
    E: "S",
    S: "W",
    W: "N",
  }[direction];
}

function rotateLeft(direction) {
  return {
    N: "W",
    W: "S",
    S: "E",
    E: "N",
  }[direction];
}

function moveForward(x, y, direction) {
  return {
    N: [x, y + 1],
    E: [x + 1, y],
    S: [x, y - 1],
    W: [x - 1, y],
  }[direction];
}

function isOffGrid(x, y, square) {
  return x < 0 || x > square.w || y < 0 || y > square.h;
}

function main(bytecode) {
  let results = executeBytecode(bytecode);
  process.stdout.write(JSON.stringify({
    event: "results",
    results,
  }));
  process.stdout.write("\n");
}

if (require.main === module) {
  if (process.argv.length > 2) {
    main(fs.readFileSync(process.argv[2]));
  }
}

module.exports = {
  executeBytecode,
  decodeDirection,
  decodeRotation,
  simulateRobots,
  rotateRight,
  rotateLeft,
  moveForward,
  isOffGrid,
  main,
};
