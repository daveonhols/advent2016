"use strict";

const md5 = require("spark-md5").hash;


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

function getNextSteps(path) {
  const openDoors = getOpenDoors(path);
  const possible = openDoors.map(step => oneStep(path, step));
  return possible;
}

function findPossibleNextSteps(paths) {
  return paths.map(path => getNextSteps(path)).reduce((state, item) => state.concat(item), []);
}

function atDestintation(path) {
  return (path.x === 3 && path.y === 3);
}

function walk() {
  const start = { x: 0, y: 0, path: "edjrjqaa" };
  let paths = [start];
  const found = [];

  while (paths.length > 0) {
    const nextSteps = findPossibleNextSteps(paths);

    const destination = nextSteps.filter(path => atDestintation(path));

    if (destination.length > 0) {
      found.push(destination[0]);
    }

    paths = nextSteps.filter(path => !atDestintation(path));
  }

  console.log(`Part One, Shortest Path: ${JSON.stringify(found[0].path.slice(8))}`);
  console.log(`Part Two, Length of Longest Path: ${found[found.length - 1].path.slice(8).length}`);
}

walk();
