"use strict";

// this problem is a classing question of halting
// we need to search for a never ending sequence of 0 1 0 1 0 1 0 1 0 1
// but how long is "never ending"???
// I put an array into the CPU to catch the output, and if it reaches BUFFER length, exit
// hopefully the first input generating BUFFER length entries matching the pattern is right
// If not we may have to increase buffer

const fs = require("fs"); // for reading text file input

// initialise cpu register state
let cpu = { a: 7, b: 0, c: 0, d: 0 };


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

  if (chunks[0] === "out") {
    return ["out", chunks[1]];
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
  const code = fs.readFileSync("d25/input.txt", "utf-8");
  return code.split("\r\n").map(line => parseLine(line));
}


// run a set of instructions, cpu should be initialised correctly before starting
function run(instructions, buffer) {
  let nextInstruction = 0;
  const REGS = "abcd";

  while ((nextInstruction < instructions.length)) {
    // if we filled the buffer, stop processing and report to caller
    if (cpu.outs.length > buffer) {
      return cpu.outs;
    }

    // this code is pretty horrific but I pulled everything apart for performance reasons.
    // all ops are inline rather than functions as that is (much) faster
    switch (instructions[nextInstruction][0]) {

      case "inc":
        // increment register described in arg 1
        cpu[instructions[nextInstruction][1]] += 1;
        nextInstruction += 1;
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

      // the out function transmits a value to the antenna
      // we need to track whether or not this program will generate 0, 1, 0, 1, 0, 1 .. etc
      // this implementation will exit fast as soon as the sequence is broken
      case "out":

        if (cpu.last + cpu.b !== 1) {
          return cpu.outs.concat(cpu.b); // exit fast, this and prev must sum to 1
        }
        cpu.last = cpu.b; // track last value (to help track correctness more quickly.
        cpu.outs.push(cpu.b); // track all values so we can count then and return back to caller
        nextInstruction += 1;
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


const code = parseCode();

// this problem is a classing question of halting
// we need to search for a never ending sequence of 0 1 0 1 0 1 0 1 0 1
// but how long is "never ending"???
// I put an array into the CPU to catch the output, and if it reaches BUFFER length, exit
// hopefully the first input generating BUFFER length entries matching the pattern is right
// If not we may have to increase buffer
// NOTE: in reality, 5000 is much more than enough, the first result works.
const BUFFER = 5000;

// we need to try various values to init register A and
// decide which is the lowest which generates the required output pattern
// I cheated and guess 500,000 before writing any code to try and find an upper bound
// because AOC tells you "that was too high..."
for (let initA = 0; initA < 500000; initA += 1) {
  // init CPU each time round
  cpu = { a: initA, b: 0, c: 0, d: 0, last: 1, outs: [1] };

  // execute code to see what we get out of the CPU for this value of A
  const thisRun = run(code, BUFFER);

  // if the buffer was filled, we may have a candidate answer, stop and report to user.
  if (thisRun.length > BUFFER) {
    console.log(`Part 1: ${initA}`);
    break;
  }
}
