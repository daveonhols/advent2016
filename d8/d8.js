"use strict";

const fs = require("fs");

function genScreen() {
  const screen = [];
  for (let col = 0; col < 6; col += 1) {
    screen.push([]);
    for (let row = 0; row < 50; row += 1) {
      screen[col].push(0);
    }
  }
  return screen;
}

function print(screen) {
  console.log(screen.map(item => item.join("")));
}

function readcol(screen, col) {
  const result = [];
  for (let row = 0; row < 6; row += 1) {
    result.push(screen[row][col]);
  }
  return result;
}

function writecol(screen, idx, col) {
  const result = screen.slice(0);
  for (let row = 0; row < 6; row += 1) {
    result[row][idx] = col[row];
  }
  return result;
}

function readrow(screen, row) {
  return screen[row];
}

function writerow(screen, idx, row) {
  const result = screen.slice(0);
  for (let col = 0; col < 50; col += 1) {
    result[idx][col] = row[col];
  }
  return result;
}

function rotateOne(line) {
  line.unshift(line.pop());
  return line;
}

function rotate(col, num) {
  if (num === 0) {
    return col;
  }
  return rotate(rotateOne(col), num - 1);
}

function rect(scr, a, b) {
  const result = scr.slice(0);
  for (let row = 0; row < b; row += 1) {
    for (let col = 0; col < a; col += 1) {
      result[row][col] = 1;
    }
  }
  return result;
}

function parseLine(line) {
  const result = [];
  const split = line.split(" ");
  const operation = split[0];

  result.push(operation);

  switch (operation) {
    case "rect": {
      const coords = split[1].split("x");
      result.push(coords[0]);
      result.push(coords[1]);
      break;
    }
    case "rotate": {
      result.push(split[1]);
      const idx = split[2].split("=");
      result.push(idx[1]);
      result.push(split[4]);
      break;
    }
    default:
      break;
  }
  return result;
}
function dispatch(screen, operation, args) {
  console.log([operation, args]);
  switch (operation) {
    case "rect":
      return rect(screen, args[0], args[1]);
    case "rotate":
      switch (args[0]) {
        case "row":
          return writerow(screen, args[1], rotate(readrow(screen, args[1]), args[2]));
        case "column":
          return writecol(screen, args[1], rotate(readcol(screen, args[1]), args[2]));
        default:
          break;
      }
      break;
    default:
      break;
  }
  print(screen);
  return screen;
}

function count(screen) {
  return screen.reduce(
    (tablesum, row) => tablesum + row.reduce((rowsum, cell) => rowsum + cell), 0);
}

fs.readFile(
  "d8/d8.txt",
  "utf-8",
  (error, data) => {
    if (error) {
      throw error;
    }
    const final =
      data.split("\r\n").reduce(
        (state, line) => {
          const parsed = parseLine(line);
          return dispatch(state, parsed[0], parsed.slice(1));
        }, genScreen());
    const partOne = count(final);
    console.log(`Part1=${partOne}`);
    console.log("Part2");
    print(final);
  });
