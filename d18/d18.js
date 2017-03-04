"use strict";

const INPUT = "^^.^..^.....^..^..^^...^^.^....^^^.^.^^....^.^^^...^^^^.^^^^.^..^^^^.^^.^.^.^.^.^^...^^..^^^..^.^^^^";


function countSafeOnRow(row) {
  let num = 0;
  for (let i = 0; i < row.length; i += 1) {
    num += row[i] === "." ? 1 : 0;
  }
  return num;
}


function deriveTile(l, c, r) {
  if (l === "^" && c === "^" && r === ".") {
    return "^";
  }
  if (l === "." && c === "^" && r === "^") {
    return "^";
  }
  if (l === "^" && c === "." && r === ".") {
    return "^";
  }
  if (l === "." && c === "." && r === "^") {
    return "^";
  }
  return ".";
}

function calcNextRow(row) {
  const result = [];
  for (let i = 0; i < row.length; i += 1) {
    const left = (i === 0) ? "." : row[i - 1];
    const center = row[i];
    const right = (i === (row.length - 1)) ? "." : row[i + 1];

    result.push(deriveTile(left, center, right));
  }
  return result;
}

function countSafe(first, rows) {
  let numSafe = 0;
  let row = first;

  for (let i = 0; i < rows; i += 1) {
    const safeThisRow = countSafeOnRow(row);
    row = calcNextRow(row);
    numSafe += safeThisRow;
  }
  return numSafe;
}

console.log(`Part 1, safe tiles: ${countSafe(INPUT.split(""), 40)}`);
console.log(`Part 2, safe tiles: ${countSafe(INPUT.split(""), 400000)}`);
