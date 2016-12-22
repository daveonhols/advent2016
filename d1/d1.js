"use strict";

const inputOne = "R3, L2, L2, R4, L1, R2, R3, R4, L2, R4, L2, L5, L1, R5, R2, R2, L1, R4, R1, L5, L3, R4, R3, R1, L1, L5, L4, L2, R5, L3, L4, R3, R1, L3, R1, L3, R3, L4, R2, R5, L190, R2, L3, R47, R4, L3, R78, L1, R3, R190, R4, L3, R4, R2, R5, R3, R4, R3, L1, L4, R3, L4, R1, L4, L5, R3, L3, L4, R1, R2, L4, L3, R3, R3, L2, L5, R1, L4, L1, R5, L5, R1, R5, L4, R2, L2, R1, L5, L4, R4, R4, R3, R2, R3, L1, R4, R5, L2, L5, L4, L1, R4, L4, R4, L4, R1, R5, L1, R1, L5, R5, R1, R1, L3, L1, R4, L1, L4, L4, L3, R1, R4, R1, R1, R2, L5, L2, R4, L1, R3, L5, L2, R5, L4, R5, L5, R3, R4, L3, L3, L2, R2, L5, L5, R3, R4, R3, R4, R3, R1";

// given a facing direction and a L / R direction, decide new facing direction
function nextDirection(facing, turn) {
  const rotator = ["N", "E", "S", "W"];
  const iFacing = rotator.indexOf(facing);

  if (turn === "L") {
    return rotator[((iFacing - 1) === -1 ? 3 : iFacing - 1)];
  }
  return rotator[((iFacing + 1) === 4 ? 0 : iFacing + 1)];
}

// generate coordinate list for the next blocks we wil cover for this move
// prev = where we were last
// dir = the direction we will move in
// num = number of blocks we will move
function nextSteps(prev, dir, num) {
  // array containing all those locations we will visit for this move
  const result = [];

  for (let i = 1; i < num + 1; i += 1) {
  // add to result array those locations derived from previous location
  // direction we are facing and number of blocks to traverse
    switch (dir) {
      case "N":
        result.push({ x: prev.x, y: prev.y + i });
        break;
      case "E":
        result.push({ x: prev.x + i, y: prev.y });
        break;
      case "S":
        result.push({ x: prev.x, y: prev.y - i });
        break;
      case "W":
        result.push({ x: prev.x - i, y: prev.y });
        break;
      default:
        console.log("unexpected direction");
    }
  }
  return result;
}

// reduce function used to derive next part of answer from current state and next move
// state tracks current path up to now
// move is next move message, eg L3, R99 etc
function applyMove(state, move) {
  // parse out direction to move in and distance from move text
  const turn = move.substring(0, 1);
  const numBlocks = parseInt(move.substring(1), 10);

  // derived new direction we are facing in after processing turn direction
  const newFacing = nextDirection(state.last.facing, turn);

  // derive those next steps we will take based on new direction and number of steps
  const steps = nextSteps(state.last, newFacing, numBlocks);

  // keep special track of final position for clarity
  const final = steps[steps.length - 1];

  // iterate over those steps we just took,
  // to see if any of them is to a location we already visited
  // decide if the prevous step was already visited,
  // by checking it against everything we already visited
  const repeated = steps.filter(
    thisStep =>
      state.visited.filter(
        visitedStep => (thisStep.x === visitedStep.x) && (thisStep.y === visitedStep.y)
      ).length > 0
  );

  // return latest state:
  //   everywhere we have been
  //   the last place we were at
  //   everywhere we have visited twice
  return {
    visited: state.visited.concat(steps),
    last: { facing: newFacing, x: final.x, y: final.y },
    twice: state.twice.concat(repeated),
  };
}


function one(input) {
  // initial state for reduce function
  // initial location and facing direction is in problem definition
  const initialState = {
    visited: [{ x: 0, y: 0 }],
    last: { facing: "N", x: 0, y: 0 },
    twice: [],
  };

  // split the input problem then reduce over each move to derive final answer
  return input.split(", ")
  .reduce(applyMove, initialState);
}

function distance(loc) {
  return loc.x + loc.y;
}

// part one asks for final location
const partOne = JSON.stringify(distance(one(inputOne).last));
console.log(`Part1= ${partOne}`);

// part two asks for first place visited twice.
const partTwo = JSON.stringify(distance(one(inputOne).twice[0]));
console.log(`Part2= ${partTwo}`);

// $(".out").html(JSON.stringify());
