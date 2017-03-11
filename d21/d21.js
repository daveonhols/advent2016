"use strict";

const fs = require("fs"); // for reading text file input

// function to implement rule "swap position X with position Y"
function swappos(input, x, y) {
  const res = input.slice();
  res[x] = input[y];
  res[y] = input[x];
  return res;
}

// function to implement rule "swap letter X with letter Y"
function swapchar(input, x, y) {
  return swappos(input, input.indexOf(x), input.indexOf(y));
}

// function to implement rule "rotate left"
function rotateleft(input, dist) {
  if (dist === 0) {
    return input;
  }

  // rotates left one step then recurse until no more steps left required.
  return rotateleft(input.concat(input.shift()), dist - 1);
}

// function to implement rule "rotate right"
function rotateright(input, dist) {
  if (dist === 0) {
    return input;
  }

  // rotate right one step then recurse until no more steps left required.
  return rotateright([input.pop()].concat(input.slice(0, input.length)), dist - 1);
}

// function to implement rule which rotates right based on index of char X.
// rotate the string to the right one time,
// then, a number of times equal to the index of char X
// then, plus one additional time if the index was at least 4
function rotatefromchar(input, char) {
  const idx = input.indexOf(char);
  return rotateright(input, idx > 3 ? idx + 2 : idx + 1);
}

// inverse of rotatefromchar, rotates left by the required number steps.
// may not be obvious but above rotatefromchar has one to one mapping of idx to rotate distance
// pen and paper shows that the inverseIndex in this function shows how to reverse that mapping.
function inverserotatefromchar(input, char) {
  const idx = input.indexOf(char);
  const inverseIndex = [9, 1, 6, 2, 7, 3, 8, 4][idx];
  return rotateleft(input, inverseIndex);
}

// function to implement rule "reverse positions X through Y"
// reverses a range of chars between start and end index.
function reverserange(input, start, end) {
  return input.slice(0, start)
            .concat(input.slice(start, end + 1).reverse())
            .concat(input.slice(end + 1));
}

// function to implement rule "move position X to position Y"
// splice is weird and handles remove and add but not at the same time
function move(input, from, to) {
  const item = input[from];
  input.splice(from, 1);
  input.splice(to, 0, item);
  return input;
}

// parse input text, we can get the distinct operation only from first two tokens
// i.e. swap + position, swap + letter, etc.
function parseLine(line) {
  const parts = line.split(" ");

  switch (parts[0] + parts[1]) {

    case "swapposition":
      return [swappos, Number(parts[2]), Number(parts[5])];

    case "swapletter":
      return [swapchar, parts[2], parts[5]];

    case "rotateleft":
      return [rotateleft, Number(parts[2])];

    case "rotateright":
      return [rotateright, Number(parts[2])];

    case "rotatebased":
      return [rotatefromchar, parts[6]];

    case "moveposition":
      return [move, Number(parts[2]), Number(parts[5])];

    case "reversepositions":
      return [reverserange, Number(parts[2]), Number(parts[4])];

    default:
      throw new Error(`bad operation: ${line}`);

  }
}

// For part 1, we process the operations forwards in order.
function defaultProcessor(op) {
  return op;
}

// for part 2 we process the operations backwards in reverse.
// to support that, we have to generate inverse operations for each of those rules above
// generally it is obvious how to generate inverse operation,
// but see also inverserotatefromchar which requires special handling.
function inverseProcessor(op) {
  switch (op[0]) {
    case swappos:
      return op; // swap x with y is same as swap y with x

    case swapchar:
      return op;  // swap x with y is same as swap y with x

    case rotateleft:
      return [rotateright, op[1]]; // inverse of rotate right is rotate left

    case rotateright:
      return [rotateleft, op[1]];  // inverse of rotate right is rotate left

    case move:
      return [op[0], op[2], op[1]]; // inverse of move from x to y is move y to x.

    case reverserange:  // inverse of reverse is reverse, regardless of subrange
      return op;

    case rotatefromchar:
      // rotate based on char is not straight forwards,
      // we have to figure out what index char must have been at to be rotated to it's current pos
      // since we can only figure that out at evaluation time, we insert a new function
      // this function will figure out index of char after rotate right,
      // calc how far it must have been rotated to reach current location,
      // then rotate left to undo
      return [inverserotatefromchar, op[1]];

    default:
      throw new Error(`bad operation: ${JSON.stringify(op)}`);
  }
}

// for loop over each operation,
// with process function to encapsuate the fact that
// for part 1, we do in order, and process returns input unmodified
// for part 2, we do inverse, and process calculates the inverse operation required.
function applyOperations(input, operations, process) {
  let result = input;
  for (let i = 0; i < operations.length; i += 1) {
    const ops = process(operations[i]); // get the next operation, and apply processing
    const fn = ops[0]; // get function name
    const args = [result].concat(ops.slice(1)); // build params, which include current input.
    result = fn.apply(null, args); // call function and modify input for next round.
  }
  return result;
}

// process input.
const readOps = fs.readFileSync("d21/input.txt", "utf-8").split("\r\n").map(line => parseLine(line));


console.log(`P1: ${applyOperations("abcdefgh".split(""), readOps, defaultProcessor).join("")}`);
console.log(`P2: ${applyOperations("fbgdceah".split(""), readOps.reverse(), inverseProcessor).join("")}`);
