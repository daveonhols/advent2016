"use strict";

const fs = require("fs"); // for reading text file input

// initialise cpu register state
let cpu = { a: 0, b: 0, c: 0, d: 0 };

// define cpu operations
// we need to pass in and get back modified instruction pointer,
// so that jumps can be evaluated at run time

// copy a value to a register, move to next instruction
function cpyval(val, to, pointer) {
  cpu[to] = val;
  return pointer + 1;
}

// copy a register to a register, move to next instruction
function cpyreg(reg, to, pointer) {
  cpu[to] = cpu[reg];
  return pointer + 1;
}

// increment register, move to next instruction
function inc(reg, pointer) {
  cpu[reg] += 1;
  return pointer + 1;
}

// decrement register, move to next instruction
function dec(reg, pointer) {
  cpu[reg] -= 1;
  return pointer + 1;
}


// jump to offset if value is not zero, this modifies instruction pointer
// if val is zero, don't jump but move to next instruction
function jnzval(val, offset, pointer) {
  if (val === 0) {
    return pointer + 1;
  }
  return pointer + offset;
}

// jump to offset if register is not zero, this modifies instruction pointer
// looks up value from register then jumps based on value (above).
function jnzreg(reg, offset, pointer) {
  return jnzval(cpu[reg], offset, pointer);
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
    return [cpyreg, chunks[1], chunks[2]];
  }

  // copy value
  if (chunks[0] === "cpy" && regs.indexOf(chunks[1]) === -1) {
    return [cpyval, Number(chunks[1]), chunks[2]];
  }

  // jump if register is not zero
  if (chunks[0] === "jnz" && regs.indexOf(chunks[1]) > -1) {
    return [jnzreg, chunks[1], Number(chunks[2])];
  }

  // jump if value is not zero
  if (chunks[0] === "jnz" && regs.indexOf(chunks[1]) === -1) {
    return [jnzval, Number(chunks[1]), Number(chunks[2])];
  }

  // increment, always a register
  if (chunks[0] === "inc") {
    return [inc, chunks[1]];
  }

  // decrement, always a register
  if (chunks[0] === "dec") {
    return [dec, chunks[1]];
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
  const code = fs.readFileSync("d12/input.txt", "utf-8");
  return code.split("\r\n").map(line => parseLine(line));
}

// run a set of instructions, cpu should be initialised correctly before starting
function run(instructions) {
  let nextInstruction = 0;

  while ((nextInstruction < instructions.length)) {
    const fn = instructions[nextInstruction][0];
    const args = instructions[nextInstruction].slice(1).concat(nextInstruction);
    nextInstruction = fn.apply(null, args);
  }

  return cpu.a;
}

// part one, cpu is already initialised at top, run code
console.log(`One= ${run(parseCode())}`);

// part two is same as part one, but we just need to initialise c to 1 instead of zero first
cpu = { a: 0, b: 0, c: 1, d: 0 };
console.log(`Two= ${run(parseCode())}`);
