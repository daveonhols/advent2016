"use strict";

/* Explanation...
The algorithm for this solution has two performance requirements
 1.  indexing directly into a collection.
 2.  removing elements from the collection.

As far as I know, there is no easily available collection in Javascript that supports both.
A map does not allow indexing directly into the elements
Although a simple arrays support removal via splice, the performance is too slow for this problem
When the size is a few million, and ultimately all but one element will be removed,
the resizing cost is huge. (run time is measured in hours).
Bear in mind that the very first call to splice will move approx 1.5 million elements

So the solution involves a "custom" data structure, an array of arrays.
Since arrays support the operations we need, building on them makes sense
The idea behind using an array of arrays, is that each splice works on a smaller data set,
and thus the worst case splice will only have to move the contents of one array, not the whole set
pseudo randomly I chose 10k as the size of each sub-array, and the run time is ~30s

This design choice leads to more complexity in the algorithm, but not much
When removing element N from the structure, we have to iterate over each sub array
counting up the lengths of each one we skip as we go along,
//until we find the one containing our target index
Then we delete from that, but with the number of elements in skipped sub arrays subtracted

EG to delete element 13 from a 16 element structure with chunks of 4.
[0, 1, 2, 3]     (delete =13, skipped=0, found=false)
[4, 5, 6, 7]     (delete =13, skipped=4, found=false)
[8, 9, 10, 11]   (delete =13, skipped=8, found=false)
[12, 13, 14, 15] (delete =13, skipped=12, found=true, delete @ 1 [=13-12])

*/


// puzzle input, the number of elves playing the game
const NUM = 3005290;

// size of each sub array we are splitting into.
const SPLIT = 10000;

// initialise the problem space
// build array of arrays up to NUM cut into chunks of size SPLIT
function init() {
  const elves = [];

  let chunk = [];
  for (let i = 0; i < NUM; i += 1) {
    chunk.push(i + 1);
    if (chunk.length === SPLIT) {
      elves.push(chunk);
      chunk = [];
    }
  }
  elves.push(chunk);

  return elves;
}

let elves = [];

// logic to eliminate an elf, by deleting from global elves structure
// uses the sub array skipping logic described at the top
function eliminate(who, elf) {
  let skippedChunkLength = 0;
  let chunk = 0;
  while ((skippedChunkLength + (elves[chunk].length - 1)) < elf) {
    skippedChunkLength += elves[chunk].length;
    chunk += 1;
  }
  elves[chunk].splice(elf - skippedChunkLength, 1);
}

// driver function that implements the solution algo
// start at index zero, eliminate opposite elf, move onto next elf
// repeat until only one elf remaining.
function stealing() {
  elves = init();
  let curr = 0; // index of current player
  let eliminated = 0; // count of how many eliminated.

  while (NUM - eliminated > 1) {
    // calculate who is opposite current player
    const toEliminate = Math.floor(curr + (NUM - eliminated) / 2) % (NUM - eliminated);
    eliminate(curr, toEliminate); // eliminate elf
    eliminated += 1; // track how many eliminated

    // if the person we elminiated was to our left,
    // we shouldn't immediately move onto next player (by index)
    // because effectively we have ourselves moved left too
    // so move current index left one to account for that.
    if (toEliminate < curr) {
      curr -= 1;
    }

    // index of next player is +1, but wrap around to zero at end of cirle
    curr = (curr + 1) < (NUM - eliminated) ? curr + 1 : 0;
  }
  // pretty print result, all but one of sub arrays will be empty
  // other sub array will have one element.
  return elves.reduce((state, item) => state.concat(item), []);
}

exports.stealing = stealing;
