"use strict";

// define disk states
const d1 = { positions: 7, start: 0, d: 1 };
const d2 = { positions: 13, start: 0, d: 2 };
const d3 = { positions: 3, start: 2, d: 3 };
const d4 = { positions: 5, start: 2, d: 4 };
const d5 = { positions: 17, start: 0, d: 5 };
const d6 = { positions: 19, start: 7, d: 6 };
const d7 = { positions: 11, start: 0, d: 7 };

// get the time at which capsule should be released to pass through a given disk on given spin
function nextForDisk(disk, spin) {
  return (spin * disk.positions) + disk.positions - disk.d - disk.start;
}

// return true if the capsule would pass the given disk if dropped at dropTime
function wouldPass(disk, dropTime) {
  return ((dropTime - nextForDisk(disk, 0)) % disk.positions) === 0;
}

// for each rotation of the least frequently rotating disk
// find the time at which we could release the capsule to pass through that disk
// iterate over each disk and see if all would accept the capsule passing through
// (driving this from the frequency of slowest rotating disks first effectively shrinks search)
for (let i = 0; i < 9999; i += 1) {
  const tryDrop = nextForDisk(d6, i);
  if ([d6, d5, d2, d1, d4, d3].every(item => wouldPass(item, tryDrop))) {
    console.log(`Part 1:  Passed at:  ${tryDrop} | ${i}`);
    break;
  }
}

for (let i = 0; i < 999999; i += 1) {
  const tryDrop = nextForDisk(d6, i);
  if ([d6, d5, d2, d7, d1, d4, d3].every(item => wouldPass(item, tryDrop))) {
    console.log(`Part 2:  Passed at:  ${tryDrop} | ${i}`);
    break;
  }
}
