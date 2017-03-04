"use strict";

const md5 = require("spark-md5").hash;

// based on current path, add a step to it and increment location.
function oneStep(path, step) {
  let result = [];

  switch (step) {

    case "U":
      result = { x: path.x, y: path.y - 1, path: `${path.path}U` };
      break;

    case "D":
      result = { x: path.x, y: path.y + 1, path: `${path.path}D` };
      break;

    case "L":
      result = { x: path.x - 1, y: path.y, path: `${path.path}L` };
      break;

    case "R":
      result = { x: path.x + 1, y: path.y, path: `${path.path}R` };
      break;

    default:
      console.log("default no default");
      break;
  }

  return result;
}

// return true if applying move to path will hit a wall.
function isWall(path, move) {
  let result = false;

  switch (move) {
    case "U":
      result = path.y === 0;
      break;

    case "D":
      result = path.y === 3;
      break;

    case "L":
      result = path.x === 0;
      break;

    case "R":
      result = path.x === 3;
      break;

    default:
      console.log("default no default");
      break;
  }

  return result;
}

// use hashing algo provided to find which doors are open on current path to location
function getOpenDoors(path) {
  const moves = ["U", "D", "L", "R"];

  const keys = md5(path.path).slice(0, 4).split("");

  const result = [];
  for (let i = 0; i < 4; i += 1) {
    if (!isWall(path, moves[i]) && "bcdef".indexOf(keys[i]) !== -1) {
      result.push(moves[i]);
    }
  }
  return result;
}

// get the available next steps based on current path location
function getNextSteps(path) {
  const openDoors = getOpenDoors(path);
  const possible = openDoors.map(step => oneStep(path, step));
  return possible;
}

// get all steps for all paths at current stage of search
function findPossibleNextSteps(paths) {
  return paths.map(path => getNextSteps(path)).reduce((state, item) => state.concat(item), []);
}

// return true if current path reaches to destination
function atDestintation(path) {
  return (path.x === 3 && path.y === 3);
}

// walk the search space, tracking which paths if any reach the destination
function walk() {
  const start = { x: 0, y: 0, path: "edjrjqaa" };
  let paths = [start];
  const found = [];

  // while there are still paths to search through the space
  while (paths.length > 0) {
    // get next step paths based on current paths up to here
    const nextSteps = findPossibleNextSteps(paths);

    // see if destionation has been reached
    const destination = nextSteps.filter(path => atDestintation(path));

    if (destination.length > 0) {
      // track all paths to destionation
      found.push(destination[0]);
    }

    // remove paths that reach destination as it is not possible to continue from tthere onwards.
    paths = nextSteps.filter(path => !atDestintation(path));
  }

  // show results
  console.log(`Part One, Shortest Path: ${JSON.stringify(found[0].path.slice(8))}`);
  console.log(`Part Two, Length of Longest Path: ${found[found.length - 1].path.slice(8).length}`);
}

// do search.
walk();
