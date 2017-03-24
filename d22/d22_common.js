"use strict";

const fs = require("fs");

function readNum(numString) {
  const number = numString.split("T")[0];
  return Number(number);
}

function parseLine(line) {
  const parts = line.split(" ").reduce((total, curr) => (curr.length === 0 ? total : total.concat(curr)), []);
  [1, 2, 3].forEach((idx) => { parts[idx] = readNum(parts[idx]); });
  return parts;
}

function getNodes() {
  return fs.readFileSync("d22/input.txt", "utf-8").split("\r\n").map(parseLine);
}


function printGrid() {
  const nodes = getNodes();
  let rows = 0;
  const grid = [];

  while (rows < nodes.length) {
    const row = [];
    for (let column = 0; column <= 28; column += 1) {
      row.push([nodes[rows][1], nodes[rows][2]].join("|"));
      rows += 1;
    }
    grid.push(row.join(","));
  }

  console.log(grid);
}


exports.getNodes = getNodes;
exports.printGrid = printGrid;
