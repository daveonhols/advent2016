"use strict";

const fs = require("fs");

// zero padding around keys tells us when we cannot move to given location
// makes hanlding odd keypad for part 2 easier.
// the key pads are same size so I can use common code for parts 1 & 2
const keyPadOne = [
            ["0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "1", "2", "3", "0", "0"],
            ["0", "0", "4", "5", "6", "0", "0"],
            ["0", "0", "7", "8", "9", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0"]];

const keyPadTwo = [
            ["0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "1", "0", "0", "0"],
            ["0", "0", "2", "3", "4", "0", "0"],
            ["0", "5", "6", "7", "8", "9", "0"],
            ["0", "0", "A", "B", "C", "0", "0"],
            ["0", "0", "0", "D", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0"]];

// map co-ordinates to button position.
// we treat center of the keypad as [0, 0]
function buttonAtPos(keyPad, pos) {
  return keyPad[pos.y + 3][pos.x + 3];
}

// find the next position of the finger after processing current move (UDLR)
// remember our keypad has 0 padding around
// we do the move, and check if the result points at a zero
// if so, we return the previous state as we cannot apply that move
function processChar(state, move) {
  let next = {};

  switch (move) {

    case "U":
      next = { x: state.lastButtonPos.x, y: state.lastButtonPos.y - 1 };
      break;
    case "D":
      next = { x: state.lastButtonPos.x, y: state.lastButtonPos.y + 1 };
      break;
    case "L":
      next = { x: state.lastButtonPos.x - 1, y: state.lastButtonPos.y };
      break;
    case "R":
      next = { x: state.lastButtonPos.x + 1, y: state.lastButtonPos.y };
      break;
    default:
      console.log("default...");
      break;
  }

  if (buttonAtPos(state.keypad, next) === "0") {
    return state; // reject impossible move and return previous state
  }
      // return new state if the move is allowed
  return { keypad: state.keypad, lastButtonPos: next, code: state.code };
}

// each line of input is further reduced to process each character
// state variable tracks the position of the finger after each move
// result of processing this line is the final state after processing each move on this line
function processLine(state, line) {
  const nextState = line.split("").reduce(processChar, state);
  return {
    keypad: nextState.keypad,
    lastButtonPos: nextState.lastButtonPos,
    code: state.code.concat([buttonAtPos(state.keypad, nextState.lastButtonPos)])
  };
}

// each line of input generates one part of the answer, so reduce and track state
// the reduce function processes one line of input and generates one part of the answer
// we pass through the keypad layout so we can use a different one in each part
// result will be accumulated into code array
function processFile(data) {
  const lines = data.split("\r\n");
  const partOneInitialState = { keypad: keyPadOne, lastButtonPos: { x: 0, y: 0 }, code: [] };
  const partTwoInitialState = { keypad: keyPadTwo, lastButtonPos: { x: -2, y: 0 }, code: [] };

  const partOne = lines.reduce(processLine, partOneInitialState).code;
  const partTwo = lines.reduce(processLine, partTwoInitialState).code;
  console.log(`part1= ${partOne}`);
  console.log(`part2= ${partTwo}`);
}

// read and process data file
fs.readFile(
  "d2/d2.txt",
  "utf-8",
  (error, data) => {
    if (error) {
      throw error;
    }
    processFile(data);
  });
