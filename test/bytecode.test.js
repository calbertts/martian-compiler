const {
  convertToBytecode,
  convertDirection,
  convertRotation,
  decodeDirection,
  decodeRotation,
} = require("../src/bytecode");

describe("Bytecode Conversion Tests", () => {
  test("should convert parsed program to bytecode correctly", () => {
    const parsedProgram = [
      { square: { w: 5, h: 3 } },
      [
        {
          robot: "Carlos",
          instructions: [
            { move: { l: 1, r: 1, d: "E" } },
            { rotate: ["R", "F", "R", "F"] },
          ],
        },
        {
          robot: "Mike",
          instructions: [
            { move: { l: 3, r: 2, d: "N" } },
            { rotate: ["F", "R", "R", "F", "L", "L"] },
          ],
        },
      ],
    ];

    const expectedBytecode = [
      0x01, 0x05, 0x03, // Square definition
      0x06, 0x43, 0x61, 0x72, 0x6c, 0x6f, 0x73, // Robot name "Carlos"
      0x02, 0x01, 0x01, 0x05, // Move instruction
      0x03, 0x08, 0x09, 0x08, 0x09, // Rotate instruction
      0x80, // End of robot instructions
      0x04, 0x4d, 0x69, 0x6b, 0x65, // Robot name "Mike"
      0x02, 0x03, 0x02, 0x04, // Move instruction
      0x03, 0x09, 0x08, 0x08, 0x09, 0x0a, 0x0a, // Rotate instruction
      0x80, // End of robot instructions
    ];

    const bytecode = convertToBytecode(parsedProgram);
    expect(bytecode).toEqual(expectedBytecode);
  });

  test("should convert direction correctly", () => {
    expect(convertDirection("N")).toBe(0x04);
    expect(convertDirection("E")).toBe(0x05);
    expect(convertDirection("S")).toBe(0x06);
    expect(convertDirection("W")).toBe(0x07);
  });

  test("should convert rotation correctly", () => {
    expect(convertRotation("R")).toBe(0x08);
    expect(convertRotation("F")).toBe(0x09);
    expect(convertRotation("L")).toBe(0x0a);
  });

  test("should decode direction correctly", () => {
    expect(decodeDirection(0x04)).toBe("N");
    expect(decodeDirection(0x05)).toBe("E");
    expect(decodeDirection(0x06)).toBe("S");
    expect(decodeDirection(0x07)).toBe("W");
  });

  test("should decode rotation correctly", () => {
    expect(decodeRotation(0x08)).toBe("R");
    expect(decodeRotation(0x09)).toBe("F");
    expect(decodeRotation(0x0a)).toBe("L");
  });
});
