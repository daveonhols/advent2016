"use strict";

const START = "10010000000110000";

// take some data and apply provided algo to get more
// works with char arrays not strings to make iteration easier
function moreData(data) {
  const next = data.map(char => char === "0" ? "1" : "0").reverse();
  return data.concat(["0"]).concat(next);
}

// build data starting from input up to min length
// chops down to min length at the end
function buildData(data, minLength) {
  let built = data;
  while(built.length < minLength) {
    built = moreData(built);
  }
  console.log("slicing...");
  return built.slice(0, minLength);
}

// takes a checksum and derives next checksum based on provided alog
function nextChecksum(data) {
  const result = [];
  for (let i = 0; i < data.length; i += 2) {
    const c1 = data[i];
    const c2 = data[i + 1];
    result.push(c1 === c2 ? "1" : "0");
  }
  return result;
}

// iteratively derives overall checksum by applying next checksum logic
// until end condition (length of checksum is odd) is met
function calculateChecksum(data) {
  let checksum = data;
  while((checksum.length % 2) === 0) {
    checksum = nextChecksum(checksum);
  }
  return checksum;
}

// overall driver function, takes input, expands to length, calculates checksum
// input is constant, length is small for part 1 and large for part 2.
function fillAndChecksum(input, length) {
  const data = buildData(input.split(""), length);
  const checksum = calculateChecksum(data);
  return checksum.join("");
}

console.log(`Part 1: ${fillAndChecksum(START, 272)}`);
console.log(`Part 2: ${fillAndChecksum(START, 35651584)}`);