"use strict";

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

function getchar(x, y, secret, target) {
  if (x === target.x && y === target.y) {
    return "*";
  }
  const num = secret + ((x * x) + ( 3 * x) + (2 * x * y) + (y) + (y * y));
  return odd(onbits(num)) ? "#" : ".";
}

function estimate(current, destination) {
  const distance =
    Math.sqrt(
      Math.pow((destination.x - current.x), 2)
      +
      Math.pow((destination.y - current.y), 2));

  return { x: current.x, y: current.y, steps: current.steps, rank: distance };
}

function reached(pos, goal) {
  return (pos.x === goal.x) && (pos.y === goal.y);
}

function isWall(pos, destination) {
  if (pos.x < 0 || pos.y < 0) {
    return true;
  }
  const char = getchar(pos.x, pos.y, SECRET, destination);
  return char === "#";
}

function getNextSteps(start, destination, limit) {
  let nextSteps = [];

  if (start.steps === limit) {
    return nextSteps;
  }

  nextSteps.push({ x: start.x - 1, y: start.y, steps: start.steps + 1 });
  nextSteps.push({ x: start.x + 1, y: start.y, steps: start.steps + 1 });
  nextSteps.push({ x: start.x, y: start.y - 1, steps: start.steps + 1 });
  nextSteps.push({ x: start.x, y: start.y + 1, steps: start.steps + 1 });
  nextSteps = nextSteps.filter(step => !isWall(step, destination));
  return nextSteps;
}

function visited(item, closed) {
  return closed.filter(curr => (item.x === curr.x) && (curr.y === item.y)).length === 0;
}

function sortByEstimatedDistance(a, b) {
  return a.rank - b.rank;
}

function walk(limit) {
  const destination = { x: 31, y: 39 };
  const start = { x: 1, y: 1, steps: 0 };
  let open = [];
  const closed = [];
  open.push(estimate(start, destination));
  let next = open.shift();
  closed.push(next);
  while (!reached(next, destination)) {
    const expanded = getNextSteps(next, destination, limit);
    expanded.map(item => open.push(estimate(item, destination)));
    open = open.filter(item => visited(item, closed)).sort(sortByEstimatedDistance);

    if (open.length === 0) {
      console.log(`exhausted: ${closed.length}`);
      break;
    }

    next = open.shift();
    closed.push(next);
  }

  if (reached(next, destination)) {
    console.log(`Reached after steps: ${next.steps}`);
  }
}

console.log("Part 1:");
walk(9999);
console.log("Part 2:");
walk(50);

exports.onbits = onbits;
