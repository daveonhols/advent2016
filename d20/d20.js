"use strict";

const fs = require("fs"); // for reading text file input
const SortedSet = require("collections/sorted-set");

// read a line of text from input, split and parse numbers
function readLine(line) {
  const parts = line.split("-").map(part => Number(part));
  return parts;
}


// we need equality and comparison to put the pairs of numbers into SortedSet
function rangesEquals(a, b){
   return Object.equals(a[0], b[0]) && Object.equals(a[1], b[1]);
}

// we need equality and comparison to put the pairs of numbers into SortedSet
function rangesCompare(b, a){
    if (a[0] === b[0]){
        return Object.compare(b[1], a[1]);
    }
    return Object.compare(b[0], a[0]);
}

// read the input file contents into an array
const ranges = fs.readFileSync("d20/input.txt", "utf-8").split("\r\n").map(line => readLine(line));

// set up sorted set with comparitors for storing ranges
const rangeSet = SortedSet([], rangesEquals, rangesCompare);

// load up sorted set.  ranges are now sorted based on range start.
ranges.map(range => rangeSet.push(range));

// iterate from start of range to end.
// at each point, track the highest range (max reach) that currently processed chunks cover
// when moving to next point, see if it is within current reached range
// if it is, continue upwards
// if it is larger than the current max reached value (+1), there is a break, track that and continue.
function getBreaks(sorted) {

  let index = 0;
  let maxReach = 0;

  let next = sorted.slice(index++, 1)[0];
  maxReach = next[1];

  let breaks = [];


  // puzzle description tells us the max value, confirmed in file.
  // once we reach this we are at the end.
  while(maxReach < 4294967295) {

    // get next next chunk, first arg is processed first so it's (0, 1), (1, 2), (2, 3) ... etc
    next = sorted.slice(index++, index+1)[0];

    // if the start of the next range is overlapping with already processed chunks
    // increase the top end of what current chunks cover if it longer than current.
    if (next[0] <= 1 + maxReach) {
      if (next[1] > maxReach) {
        maxReach = next[1];
      }
    }
    // if the start of next range is beyond what we could reach with currently processed chunks
    // we found a break.
    // track it, measure length of break (next chunk - max reached chunk).
    // move onto next chunk.
    else {
      const brk = [maxReach + 1, next[0] - maxReach -1];
      breaks.push(brk);
      maxReach = next[1];
    }

  }
  return breaks;
}

const breaks = getBreaks(rangeSet);
console.log(`Part One: ${breaks[0][0]}`);
const countOpen = breaks.reduce((sum, item) => sum + item[1], 0);
console.log(`Part Two: ${countOpen}`);

