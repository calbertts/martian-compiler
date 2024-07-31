const fs = require("fs");
const { main: compile } = require("../src/compiler");
const { main: vm } = require("../src/vm");

function compileAndRun() {
  let code;
  if (process.argv.length > 2) {
    code = fs.readFileSync(process.argv[2]).toString();
  }

  const bytecode = compile(code);
  vm(bytecode);
}

compileAndRun();
