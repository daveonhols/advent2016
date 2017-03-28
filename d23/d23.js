"use strict";

const fs = require("fs"); // for reading text file input

// initialise cpu register state
let cpu = { a: 7, b: 0, c: 0, d: 0 };

// implement the "tbl" behaviour, swap inc for dec , jnz for cpy etc.
function doToggle(instruction) {
  if (instruction.length === 2) {
    if (instruction[0] === "inc") {
      return ["dec", instruction[1]];
    }
    return ["inc", instruction[1]];
  }

  if (instruction.length === 3) {
    if (instruction[0] === "jnzreg") {
      return ["cpyreg", instruction[1], instruction[2]];
    }
    if (instruction[0] === "jnzval") {
      return ["cpyval", instruction[1], instruction[2]];
    }
    if (instruction[0] === "cpyreg") {
      return ["jnzreg", instruction[1], instruction[2]];
    }
    if (instruction[0] === "cpyval") {
      return ["jnzval", instruction[1], instruction[2]];
    }
  }
  return [];
}


// process the parts of an instruction string
// split each line by space, returns like [ [operation], [arguments] ... [more args] ]
function prepareInstruction(chunks) {
  // track what operands represent registers in the cpu
  // so we can tell the difference between jmp / cpy value and register
  // if the operand is one of these letters, we are doing a register operation
  // otherwise we are doing a numeric value operation
  const regs = "abcd";

  // copy register
  if (chunks[0] === "cpy" && regs.indexOf(chunks[1]) > -1) {
    return ["cpyreg", chunks[1], chunks[2]];
  }

  // copy value
  if (chunks[0] === "cpy" && regs.indexOf(chunks[1]) === -1) {
    return ["cpyval", Number(chunks[1]), chunks[2]];
  }

  // jump if register is not zero
  if (chunks[0] === "jnz" && regs.indexOf(chunks[1]) > -1) {
    return ["jnzreg", chunks[1], chunks[2]];
  }

  // jump if value is not zero
  if (chunks[0] === "jnz" && regs.indexOf(chunks[1]) === -1) {
    return ["jnzval", Number(chunks[1]), chunks[2]];
  }

  // increment, always a register
  if (chunks[0] === "inc") {
    return ["inc", chunks[1]];
  }

  // decrement, always a register
  if (chunks[0] === "dec") {
    return ["dec", chunks[1]];
  }

  if (chunks[0] === "tgl") {
    return ["tgl", chunks[1]];
  }

  // return no op if code not recognised as valid
  return [];
}

// break a line of code into operator and operands array for processing
function parseLine(line) {
  return prepareInstruction(line.split(" "));
}

// top level code parser, read text from file, then split and parse each line
function parseCode() {
  const code = fs.readFileSync("d23/input.txt", "utf-8");
  return code.split("\r\n").map(line => parseLine(line));
}


// run a set of instructions, cpu should be initialised correctly before starting
function run(instructions) {
  const result = [0, instructions];
  let nextInstruction = 0;
  const REGS = "abcd";

  while ((nextInstruction < instructions.length)) {
    // this code is pretty horrific but I pulled everything apart for performance reasons.
    // all ops are inline rather than functions as that is (much) faster
    switch (instructions[nextInstruction][0]) {

      case "inc":
        // increment register described in arg 1
        cpu[instructions[nextInstruction][1]] += 1;
        nextInstruction += 1;
        break;

      case "tgl":
        if ((nextInstruction + cpu[instructions[nextInstruction][1]]) >= result[1].length) {
          // if offset is beyond end of code, skip and do nothing.
          nextInstruction += 1;
        } else {
          // get the instruction to toggle based on offset in register named by arg 1
          const toToggle = result[1][nextInstruction + cpu[instructions[nextInstruction][1]]];
          // do the toggle logic
          const toggled = doToggle(toToggle);
          // write back the toggle result (self modifying code)
          result[1][nextInstruction + cpu[instructions[nextInstruction][1]]] = toggled;
          nextInstruction += 1;
        }
        break;

      case "dec":
        // decrement register described in arg 1
        cpu[instructions[nextInstruction][1]] -= 1;
        nextInstruction += 1;
        break;

      // copy a value into a register
      case "cpyval":
        if (REGS.indexOf(instructions[nextInstruction][2]) === -1) {
          // if the register indicated is not actually a register, skip to next instruction
          // shouldn't normally happen but toggle can trigger this
          nextInstruction += 1;
        } else {
          // copy value from arg 1 to cpu in arg 2
          cpu[instructions[nextInstruction][2]] = instructions[nextInstruction][1];
          nextInstruction += 1;
        }
        break;

      // jump if reg is not zero.
      case "jnzreg":
        if (cpu[instructions[nextInstruction][1]] === 0) {
          // if it is zero, don't jump just go to next instruction
          nextInstruction += 1;
        } else {
          // calculate distance to jump to, could be based on a number or a register contents
          nextInstruction +=
            REGS.indexOf(instructions[nextInstruction][2]) === -1 // is offset a number or reg
            ? Number(instructions[nextInstruction][2]) // offset is a number
            : cpu[instructions[nextInstruction][2]]; // offset is a register
        }
        break;

      // jump if value is not zero
      case "jnzval":
        if (instructions[nextInstruction][1] === 0) {
          // if it is zero, don't jump just go to next instruction
          nextInstruction += 1;
        } else {
          // calculate distance to jump to, could be based on a number or a register contents
          nextInstruction +=
            REGS.indexOf(instructions[nextInstruction][2]) === -1 // is offset a number or reg
            ? Number(instructions[nextInstruction][2]) // offset is a number
            : cpu[instructions[nextInstruction][2]]; // offset is a register
        }
        break;

      case "cpyreg":
        // copy from one register (arg 1) to another (arg 2)
        cpu[instructions[nextInstruction][2]] = cpu[instructions[nextInstruction][1]];
        nextInstruction += 1;
        break;

      default:
        // do nothing, all ops are inline above
        break;
    }
  }
  return cpu.a;
}

cpu = { a: 7, b: 0, c: 0, d: 0 };
console.log(`One= ${run(parseCode())}`);
cpu = { a: 12, b: 0, c: 0, d: 0 };
console.log(`Two= ${run(parseCode())}`);
