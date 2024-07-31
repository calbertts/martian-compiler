const fs = require("fs");
const path = require("path");
const { main, compileFile, writeBytecodeToFile } = require("../src/compiler");

jest.mock("fs");

describe("Compiler Tests", () => {
  beforeAll(() => {
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should compile successfully", () => {
    const program = `Square 5 3
      Carlos
      Move 1 1 E
      Rotate RFRFRFRF

      Mike
      Move 3 2 N
      Rotate FRRFLLFFRRFLL

      Jhon
      Move 0 3 W
      Rotate LLFFFLFLFL
`;

    const expectedBytecode = [
      1,   5,   3,   6,   67,  97,  114, 108, 111, 115,
      2,   1,   1,   5,   3,   8,   9,   8,   9,   8,
      9,   8,   9,   128, 4,   77,  105, 107, 101, 2,
      3,   2,   4,   3,   9,   8,   8,   9,   10,  10,
      9,   9,   8,   8,   9,   10,  10,  128, 4,   74,
      104, 111, 110, 2,   0,   3,   7,   3,   10,  10,
      9,   9,   9,   10,  9,   10,  9,   10,  128
    ];

    const bytecode = main(program);

    expect(bytecode).toEqual(expectedBytecode);
  });

  test("should throw an error when the program is invalid", () => {
    const program = `Square 0 3
      Carlos
      Move 1 1 E
      Rotate RFRFRFRF

      Mike
      Move 3 2 N
      Rotate FRRFLLFFRRFLL

      Jhon
      Move 0 3 W
      Rotate LLFFFLFLFL
`;

    expect(() => main(program)).toThrow("Planet definition must be > 0");
  });

  test("should write bytecode to a file", () => {
    const filename = "output.bytecode";
    const programFilename = path.resolve(__dirname, "program.bytecode");

    const program = `Square 5 3
      Carlos
      Move 1 1 E
      Rotate RFRFRFRF

      Mike
      Move 3 2 N
      Rotate FRRFLLFFRRFLL

      Jhon
      Move 0 3 W
      Rotate LLFFFLFLFL
`;

    fs.readFileSync.mockImplementation(() => {
      return program;
    });

    compileFile(programFilename);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filename,
      Buffer.from([
        1,   5,   3,   6,   67,  97,  114, 108, 111, 115,
        2,   1,   1,   5,   3,   8,   9,   8,   9,   8,
        9,   8,   9,   128, 4,   77,  105, 107, 101, 2,
        3,   2,   4,   3,   9,   8,   8,   9,   10,  10,
        9,   9,   8,   8,   9,   10,  10,  128, 4,   74,
        104, 111, 110, 2,   0,   3,   7,   3,   10,  10,
        9,   9,   9,   10,  9,   10,  9,   10,  128
      ])
    );

    // Clean up
    fs.unlinkSync.mockClear();
  });

  test("should export all required functions", () => {
    expect(typeof main).toBe("function");
    expect(typeof compileFile).toBe("function");
    expect(typeof writeBytecodeToFile).toBe("function");
  });

  test("should handle empty input gracefully", () => {
    const program = ``;

    expect(() => main(program)).toThrow(
      "Expected Planet Definition but end of input found."
    );
  });
});
