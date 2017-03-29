"use strict";

const fs = require("fs");

function readFile() {
  return fs.readFileSync("d24/input.txt", "utf-8").split("\r\n").map(line => line.split(""));
}

const grid = readFile();

// A* search heuristic, pythag distance.
function estimate(current, destination) {
  const distance =
    Math.sqrt(
      Math.pow((destination.x - current.x), 2)
      +
      Math.pow((destination.y - current.y), 2));

  return { x: current.x, y: current.y, path: current.path, steps: current.steps, rank: distance };
}

// check if we reached goal, is pos x,y same as goal x,y
function reached(pos, goal) {
  return (pos.x === goal.x) && (pos.y === goal.y);
}

// decide if we hit a wall, don't walk that way if so.
function isWall(pos) {
  return (grid[pos.x][pos.y][0]) === "#"; // treat those large / overloaded nodes as walls
}

// get next possible steps from current location to continue search
// optionally avoid some spaces eg in puzzle 22 we have to avoid the "goal" each time.
function getNextSteps(start, destination, avoid) {
  let nextSteps = [];

  const nextPath = start.path.concat({ x: start.x, y: start.y });

  // up / down / left / right options to move
  nextSteps.push({ x: start.x - 1, y: start.y, path: nextPath });
  nextSteps.push({ x: start.x + 1, y: start.y, path: nextPath });
  nextSteps.push({ x: start.x, y: start.y - 1, path: nextPath });
  nextSteps.push({ x: start.x, y: start.y + 1, path: nextPath });

  // filter for walls
  nextSteps = nextSteps.filter(step => !isWall(step, destination));

  // filter out special "avoid" space.
  nextSteps = nextSteps.filter(step => !((step.x === avoid.x) && (step.y === avoid.y)));

  return nextSteps;
}

// A* cost function, curr distance + heuristic
function sortByEstimatedDistance(a, b) {
  return (a.rank + a.path.length) - (b.rank + b.path.length);
}

// decide if location was visited by checking the closed list
function visited(item, closed) {
  return closed.filter(curr => (item.x === curr.x) && (curr.y === item.y)).length === 0;
}

// general A* path finder,
function getAStarPath(start, destination, avoid) {
  let open = [];
  const closed = [];
  open.push(estimate({ x: start.x, y: start.y, path: [] }, destination));

  let next = open.shift();
  closed.push(next);

  while (!reached(next, destination)) {
    // get next possible steps
    const expanded = getNextSteps(next, destination, avoid);

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

  // return path to final destination, but include extra step onto destination in route
  return next.path.concat(destination);
}

function findWaypoints() {
  const result = [];
  for (let i = 0; i < grid.length; i += 1) {
    for (let j = 0; j < grid[i].length; j += 1) {
      if ("0123456789".indexOf(grid[i][j]) > -1) {
        result[grid[i][j]] = [grid[i][j], i, j];
      }
    }
  }
  return result;
}

// get combinations of values from 1 to num
// when input is 1 we just return [[1]]
// for inputs > 1 we derive from num-1 combinations
// by adding num at each possible location
// so for num=2, we get [[1]] => [[2, 1],[1, 2]]
function combinations(num) {
  if (num === 0) {
    return [];
  }

  if (num === 1) {
    return [[1]];
  }

  const prev = combinations(num - 1);

  const result = [];

  // for each combination already available
  for (let i = 0; i < prev.length; i += 1) {
    // go over each index from start to end
    for (let j = 0; j <= prev[i].length; j += 1) {
      const next = prev[i].slice(); // create a new array derived from last
      next.splice(j, 0, num); // add num at each index
      result.push(next); // build up result
    }
  }
  return result;
}

// get the locations of each point we need to visit, scans the array for "1", "2", "3" etc.
const waypoints = findWaypoints();

// build up all possible combinations of routes through 1 to N waypoints.
// we have to start at 0, so preprend that onto each route
const possibleRoutes = combinations(waypoints.length - 1).map(combo => [0].concat(combo));

// build up all the segment distances for which we will use A* search to get lengths
// 1 to 2, 1 to 3, 1 to N, 2 to 3, 2 to 4, 2 to N, 3 to 4 ... N-1 to N.
// we don't do 2 to 1 because it is same as 1 to 2.  We store both when calculating 1 to 2.
const segments = [];

for (let i = 0; i < waypoints.length; i += 1) {
  for (let j = i + 1; j < waypoints.length; j += 1) {
    const segment = [i, j];
    const start = { x: waypoints[i][1], y: waypoints[i][2] };
    const end = { x: waypoints[j][1], y: waypoints[j][2] };
    const length = getAStarPath(start, end, []).length - 1;
    segments[[i, j]] = length; // store length of X to Y
    segments[[j, i]] = length; // store same as length of Y to X
    console.log(`adding path: ${JSON.stringify([segment, length])}`);
  }
}

console.log("done route building");

// find the length of a possible route combination by summing each segment length
function scoreRoute(lengths, route) {
  let result = 0;
  for (let i = 0; i < route.length - 1; i += 1) {
    const fromto = [route[i], route[i + 1]];
    const chunkLen = lengths[fromto];
    result += chunkLen;
  }
  return result;
}

// reduce function to track best route
// best is current best score, next is next route to consider, segments is pre built lengths data.
// score this route and return best of current best score and score for this route
function evalBest(best, next, lengths) {
  const score = scoreRoute(lengths, next);
  if (score < best) {
    return score;
  }
  return best;
}

// part 1 is to score all possible route and find best, starting at 0
let result = possibleRoutes.reduce((best, route) => evalBest(best, route, segments), 9999);
console.log(`Part 1: ${result}`);

// part 2 is same as part 1, but we have to return to 0 at end, concat it to each route
result = possibleRoutes.reduce((best, route) => evalBest(best, route.concat([0]), segments), 9999);
console.log(`Part 2: ${result}`);
