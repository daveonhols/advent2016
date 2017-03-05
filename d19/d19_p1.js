"use strict";

const NUM = 3005290;

let elves = [];

// build up array of each elf, tracking who is to her left and who to her right.
function init() {
  const buildElves = Array(NUM).fill();

  for (let i = 0; i < buildElves.length; i += 1) {
    buildElves[i] = { next: i + 1, prev: i - 1 };
  }

  // because of wrap around, first and last elft need to update their prev next.
  buildElves[0] = { next: 1, prev: buildElves.length - 1 };
  buildElves[buildElves.length - 1] = { next: 0, prev: buildElves.length - 2 };

  return buildElves;
}

// when an elf is deleted, we just re-arrange their prev and next to ignore removed elf
// this is much faster than physically deleting from the array because that needs a resize.
// which is not feasible if the size will be 3.x million... but see part 2
function eliminate(elf) {
  const prev = elves[elf].prev;
  const next = elves[elf].next;
  elves[prev].next = next;
  elves[next].prev = prev;
  elves[elf] = {};
}

// driver function to implement the algo
function stealing() {
  elves = init();

  let curr = 0;
  let lastToSteal = -1;
  let eliminated = 0;

  // while there are still elves in the game.
  while (eliminated < NUM) {
    eliminate(elves[curr].next); // each elf eliminates to their left
    eliminated += 1;
    lastToSteal = curr; // track who was last to steal (ultimately this will be the winner).
    curr = elves[curr].next; // move to next elf based "next" field
  }

  // winner, is the last player to steal.
  // use +1 because game is done on zero based indexing, but rules are 1 based.
  // means correct answer is written to console.
  return lastToSteal + 1;
}

exports.stealing = stealing;
