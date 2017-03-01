"use strict";

// puzzle input value
const SECRET = 1352;

function odd(num) {
  return num % 2 === 1;
}

function onbits(num) {
  if (num < 2) {
    return num;
  }

  const thispower = Math.log2(num);
  const takeoff = Math.pow(2, Math.floor(thispower));

  const next = num - takeoff;
  return 1 + onbits(next);
}

// get char representing location, from puzzle definition
// if number of bits set by that function is odd, that x,y position is a wall.
function getchar(x, y, secret, target) {
  if (x === target.x && y === target.y) {
    return "*";
  }
  const num = secret + ((x * x) + ( 3 * x) + (2 * x * y) + (y) + (y * y));
  return odd(onbits(num)) ? "#" : ".";
}

//A* heuristic function, estimates remaining distance to destionation (straight line / pythag).
function estimate(current, destination) {
  const distance =
    Math.sqrt(
      Math.pow((destination.x - current.x), 2)
      +
      Math.pow((destination.y - current.y), 2));

  return { x: current.x, y: current.y, steps: current.steps, rank: distance };
}

// check if we reached goal, is pos x,y same as goal x,y
function reached(pos, goal) {
  return (pos.x === goal.x) && (pos.y === goal.y);
}

// decide if we hit a wall, don't walk that way if so.
function isWall(pos, destination) {
  if (pos.x < 0 || pos.y < 0) {
    return true;
  }
  const char = getchar(pos.x, pos.y, SECRET, destination);
  return char === "#";
}

// get next possible steps, up down left right.  filter out steps that hit walls.
function getNextSteps(start, destination, limit) {
  let nextSteps = [];

  if (start.steps === limit) {
    return nextSteps;
  }

  nextSteps.push({ x: start.x - 1, y: start.y, steps: start.steps + 1 });
  nextSteps.push({ x: start.x + 1, y: start.y, steps: start.steps + 1 });
  nextSteps.push({ x: start.x, y: start.y - 1, steps: start.steps + 1 });
  nextSteps.push({ x: start.x, y: start.y + 1, steps: start.steps + 1 });

  // filter for walls
  nextSteps = nextSteps.filter(step => !isWall(step, destination));

  return nextSteps;
}

// decide if location was visited by checking the closed list
function visited(item, closed) {
  return closed.filter(curr => (item.x === curr.x) && (curr.y === item.y)).length === 0;
}

// sort function to put item with minimal cost (steps taken + heuristic distance) at index 0
function sortByEstimatedDistance(a, b) {
  return a.rank - b.rank;
}

// do the walk over problem space.
// A* search implementation
// Will loop until no more steps allowed, or we hit destionation
function walk(limit) {
  const destination = { x: 31, y: 39 };
  const start = { x: 1, y: 1, steps: 0 };
  let open = []; // track open set
  const closed = []; // what we have visited
  open.push(estimate(start, destination));
  let next = open.shift();
  closed.push(next);

  // keep looping until found destionation
  while (!reached(next, destination)) {
    // get next possible steps
    const expanded = getNextSteps(next, destination, limit);

    // add next steps to open step, with estimate of remaining distance added on
    expanded.map(item => open.push(estimate(item, destination)));

    // filter out visited items, and sort to put best candidate at index 0
    open = open.filter(item => visited(item, closed)).sort(sortByEstimatedDistance);

    // give up if nothing left to search
    // log number of visited locations (required for part 2)
    if (open.length === 0) {
      console.log(`exhausted: ${closed.length}`);
      break;
    }

    // go round again with best candidate from open set (was sorted to indx 0).
    next = open.shift();

    // put last visited location to closed set, we are done with it forever.
    closed.push(next);
  }

  // if we found our destination, report how many steps taken to find it
  // required to show this for part 1
  if (reached(next, destination)) {
    console.log(`Reached after steps: ${next.steps}`);
  }
}

console.log("Part 1:");
walk(9999); // walk with a large limit to find destination
console.log("Part 2:");
walk(50); // part two was how many places can we visit in 50 steps.

exports.onbits = onbits;
