#!/usr/bin/env node

const fs = require("fs");
const peggy = require("peggy");
const { convertToBytecode } = require("./bytecode");
const grammarProvider = require("./grammarProvider");

function writeBytecodeToFile(bytecode, filename) {
  const buffer = Buffer.from(bytecode);
  fs.writeFileSync(filename, buffer);
}

function main(code) {
  const grammar = grammarProvider.grammar1;
  let parser = peggy.generate(grammar);

  try {
    const parsed = parser.parse(code);
    return convertToBytecode(parsed);
  } catch (e) {
    console.error(e.message, e.location);
    throw e;
  }
}

function compileFile(filename) {
  let code = fs.readFileSync(filename, "utf8");

  const bytecode = main(code);
  writeBytecodeToFile(bytecode, "output.bytecode");
}

if (require.main === module) {
  if (process.argv.length > 2) {
    compileFile(process.argv[2]);
  }
}

module.exports = { main, compileFile, writeBytecodeToFile };
