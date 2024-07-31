const fs = require("fs");
const { main, executeBytecode, simulateRobots, rotateRight, rotateLeft, moveForward, isOffGrid } = require("../src/vm");

jest.mock("fs");

describe("VM Tests", () => {
  let consoleLogMock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should execute bytecode and return correct results", () => {
    const bytecode = new Uint8Array([
      0x01, 0x05, 0x03, // Square definition
      0x06, 0x43, 0x61, 0x72, 0x6c, 0x6f, 0x73, // Robot name "Carlos"
      0x02, 0x01, 0x01, 0x05, // Move instruction
      0x03, 0x08, 0x09, 0x08, 0x09, 0x08, 0x09, 0x08, 0x09, // Rotate instruction
      0x80, // End of robot instructions
      0x04, 0x4d, 0x69, 0x6b, 0x65, // Robot name "Mike"
      0x02, 0x03, 0x02, 0x04, // Move instruction
      0x03, 0x09, 0x08, 0x08, 0x09, 0x0a, 0x0a, 0x09, 0x09, 0x08, 0x08, 0x09, 0x0a, 0x0a, // Rotate instruction
      0x80, // End of robot instructions
      0x04, 0x4a, 0x68, 0x6f, 0x6e, // Robot name "Jhon"
      0x02, 0x00, 0x03, 0x07, // Move instruction
      0x03, 0x0a, 0x0a, 0x09, 0x09, 0x09, 0x0a, 0x09, 0x0a, 0x09, 0x0a, // Rotate instruction
      0x80, // End of robot instructions
    ]);

    const results = executeBytecode(bytecode);

    expect(results).toEqual([
      {
        direction: "E",
        lost: false,
        x: 1,
        y: 1,
        name: "Carlos",
      },
      {
        direction: "N",
        lost: true,
        x: 3,
        y: 3,
        name: "Mike",
      },
      {
        direction: "S",
        lost: false,
        x: 2,
        y: 3,
        name: "Jhon",
      },
    ]);
  });

  test("should simulate robots correctly", () => {
    const square = { w: 5, h: 3 };
    const robots = [
      {
        name: "Carlos",
        instructions: [
          { move: { l: 1, r: 1, d: "E" } },
          { rotate: ["R", "F", "R", "F", "R", "F", "R", "F"] },
        ],
      },
      {
        name: "Mike",
        instructions: [
          { move: { l: 3, r: 2, d: "N" } },
          { rotate: ["F", "R", "R", "F", "L", "L", "F", "F", "R", "R", "F", "L", "L"] },
        ],
      },
      {
        name: "Jhon",
        instructions: [
          { move: { l: 0, r: 3, d: "W" } },
          { rotate: ["L", "L", "F", "F", "F", "L", "F", "L", "F", "L"] },
        ],
      },
    ];
    const scents = new Set();

    const results = simulateRobots(square, robots, scents);

    expect(results).toEqual([
      { name: "Carlos", x: 1, y: 1, direction: "E", lost: false },
      { name: "Mike", x: 3, y: 3, direction: "N", lost: true },
      { name: "Jhon", x: 2, y: 3, direction: "S", lost: false },
    ]);
  });

  test("should rotate right correctly", () => {
    expect(rotateRight("N")).toBe("E");
    expect(rotateRight("E")).toBe("S");
    expect(rotateRight("S")).toBe("W");
    expect(rotateRight("W")).toBe("N");
  });

  test("should rotate left correctly", () => {
    expect(rotateLeft("N")).toBe("W");
    expect(rotateLeft("W")).toBe("S");
    expect(rotateLeft("S")).toBe("E");
    expect(rotateLeft("E")).toBe("N");
  });

  test("should move forward correctly", () => {
    expect(moveForward(0, 0, "N")).toEqual([0, 1]);
    expect(moveForward(0, 0, "E")).toEqual([1, 0]);
    expect(moveForward(0, 0, "S")).toEqual([0, -1]);
    expect(moveForward(0, 0, "W")).toEqual([-1, 0]);
  });

  test("should detect off-grid positions correctly", () => {
    const square = { w: 5, h: 3 };
    expect(isOffGrid(0, 0, square)).toBe(false);
    expect(isOffGrid(6, 0, square)).toBe(true);
    expect(isOffGrid(0, 4, square)).toBe(true);
    expect(isOffGrid(-1, 0, square)).toBe(true);
    expect(isOffGrid(0, -1, square)).toBe(true);
  });

  test("should read bytecode from file and execute correctly", () => {
    consoleLogMock = jest.spyOn(process.stdout, "write").mockImplementation(() => {});

    const bytecode = new Uint8Array([
      0x01, 0x05, 0x03, // Square definition
      0x06, 0x43, 0x61, 0x72, 0x6c, 0x6f, 0x73, // Robot name "Carlos"
      0x02, 0x01, 0x01, 0x05, // Move instruction
      0x03, 0x08, 0x09, 0x08, 0x09, // Rotate instruction
      0x80, // End of robot instructions
      0x04, 0x4d, 0x69, 0x6b, 0x65, // Robot name "Mike"
      0x02, 0x03, 0x02, 0x04, // Move instruction
      0x03, 0x09, 0x08, 0x08, 0x09, 0x0a, 0x0a, // Rotate instruction
      0x80, // End of robot instructions
      0x04, 0x4a, 0x68, 0x6f, 0x6e, // Robot name "Jhon"
      0x02, 0x00, 0x03, 0x07, // Move instruction
      0x03, 0x0a, 0x0a, 0x09, 0x09, 0x09, 0x0a, 0x09, 0x0a, 0x09, 0x0a, // Rotate instruction
      0x80, // End of robot instructions
    ]);

    main(bytecode);

    // Get last call before the new line
    const lastCall = consoleLogMock.mock.calls[consoleLogMock.mock.calls.length - 2][0];
    expect(lastCall).toEqual(JSON.stringify({
      event: "results",
      results: [
        { name: "Carlos", x: 0, y: 0, direction: "W", lost: false },
        { name: "Mike", x: 3, y: 2, direction: "N", lost: false },
        { name: "Jhon", x: 3, y: 3, direction: "N", lost: true },
      ],
    }));

    consoleLogMock.mockRestore();
  });
});

