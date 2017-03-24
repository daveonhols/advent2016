"use strict";

// we have to move data from some host in a compute grid to another
// unfortunately it seems that most hosts are full so data has to be shuffled around carefully
// effectively the hosts fall into three categories
// One host is empty,
// A few which are large and overloaded
// Most are not too large and the free space is such that data can be shuffled between them.

// this problem can be treated as a tile shuffling game where the empty host can be moved around
// if the empty host is next to the goal data, the goal data an be moved closer to the destination
// and the large / overloaded servers are immutable and treated as obstacles to avoid.
// thus the problem becomes a pathfinding search.

// algorithm is as follows
// 1. find route from data to goal (use A* search)
// 2. if next stop on route is open, move goal forwards towards destination
// 3. else move space to next stop on route (use A* search)

const d22 = require("./d22_common.js");

// build data structure describing the set up fo the world, simple nested grid array
function buildGrid() {
  const nodes = d22.getNodes();

  let rows = 0;
  const grid = [];

  while (rows < nodes.length) {
    const row = [];
    for (let column = 0; column <= 28; column += 1) {
      row.push([nodes[rows][1], nodes[rows][2]]);
      rows += 1;
    }
    grid.push(row);
  }
  return grid;
}

const grid = buildGrid();

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
  if (pos.x < 0 || pos.y < 0 || pos.x > 34 || pos.y > 28) {
    return true;
  }
  return (grid[pos.x][pos.y][0]) > 400; // treat those large / overloaded nodes as walls
}

// get next possible steps from current location to continue search
// optionally avoid the goal location as we ultimately need to shuffle space around the goal
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

  // filter or special "avoid" space.
  // this is so that we can move the space back around in front of the goal without going thru it
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
// used multiple times in the solution
// first to find ideal route from goal to destination
// and to find route to move the space to the next point on the route from goal to dest
// we use the avoid parameter to move space around the goal instead of through it
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

// run the search algorithm described above.
function run() {
  // by inspection this is the only empty slot in the grid
  let space = { x: 8, y: 28 };

  // from puzzle spec.
  let goal = { x: 34, y: 0 };

  // from puzzle spec.
  const destination = { x: 0, y: 0 };

  // 1. find route from data to goal (use A* search)
  const goalRoute = getAStarPath(goal, destination, { x: 9999, y: 9999 });

  let steps = 0;

  // keep searching until we reach destination
  while (!reached(goal, destination)) {
    // 2. if next stop on route is open, move goal forwards
    // 3. else move space to next stop on route (use A* search)
    if (reached(space, goalRoute[0])) {
      steps += 1;
      space = goal;
      goal = goalRoute[0];
      goalRoute.shift(); // move goal forwards one step and carry on
    } else {
      const spaceRoute = getAStarPath(space, goalRoute[0], goal);
      steps += spaceRoute.length - 1;
      space = goalRoute[0];
    }
  }
  return steps;
}


exports.run = run;
