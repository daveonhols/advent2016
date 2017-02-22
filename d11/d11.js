"use strict";

// we need to use a hashset for constant time look up of already visited locations
const hashes = require("hashes");

// create a hashcode from a string, used when tracking already visited locations in hashset
// stackoverflow (maybe Java JVM string hashcode?)
function hashCode(str) {
  let hash = 0;
  let i = 0;
  let chr = 0;
  let len = 0;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i += 1) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// score a given arrangement
// sum of number of objects on a floor multiplied by objects on that floor
// evaluates to zero if everything successfully moved to top
function score(world) {
  return [1, 2, 3].reduce((sum, idx) => sum + (idx * world[idx].length), 0);
}

// look up objects of type X on level(where X can be M for microchip, G for generator)
function getXOnLevel(x, level) {
  return level.reduce((xs, item) => { return (item.slice(1) === x) ? (xs + item.slice(0, 1)) : xs; }, "");
}

// get generators on level
function getGeneratorsOnLevel(level) {
  return getXOnLevel("G", level);
}

// get chips on level
function getChipsOnLevel(level) {
  return getXOnLevel("M", level);
}

// decide if a level is possible, by checking if anything will get fried in this arrangement
// chips get fried if they are on the same floor as an incompatible generator
// but only if not protected by being on the same floor as their own generator
function levelPossible(level) {
  const chips = getChipsOnLevel(level);
  const gens = getGeneratorsOnLevel(level);

  // chips are vulnerable if their generator is not on this floor
  const vulnerable = chips.split("").filter(chip => gens.indexOf(chip) === -1);

  // chips are burned if they are vulnerable, and if a generator not their own is here
  const burned = vulnerable.filter(vuln => gens.split("").some(gen => gen !== vuln));

  // level is possible if nothing is burned
  return burned.length === 0;
}

// check if this overall arrangement of floors is possible
// which is only true if all levels in this arrangement is possible
function worldPossible(world) {
  return world.every(levelPossible);
}

// get all combinations of things that could possibly be moved from this level
// combinatorial
// 1. anything can be moved by itself
// 2. anything can be paired with another item and moved together
// 3. avoid duplicates by going forwards in order: A, B, C
// 4. A can pair with B, C; B will not pair again with A but will with C
function getMoveCombinations(level) {
  const combos = level.map(x => [x]); //1.
  // 2. pair up, but 3. is handled by slice(i+1), we will only pair up forwards
  level.map((x, i) => level.slice(i + 1).map(y => combos.push([x, y])));
  return combos;
}

// items to move go up one floor from current state
function permuteUp(state, move) {
  // first of all, elevator goes up
  const newElevator = state.elevator - 1;

  // go over each level and add those items moving up to their new floor
  // leave other floors unaffected
  const newWorld =
    state.world.map((level, idx) => {
      return (idx === state.elevator - 1) ? level.concat(move) : level;
    });

  // remove items from level they are moving from if they are in move list
  newWorld[state.elevator] = newWorld[state.elevator].filter(item => move.indexOf(item) === -1);
  return { world: newWorld, elevator: newElevator };
}

// items to move go down one floor from current state
// similar to permuteUp (above).
function permuteDown(state, move) {
  const newElevator = state.elevator + 1; // move elevator

  // go over each level and add those item moving to their new floor
  // leave other floors unaffected
  const newWorld =
    state.world.map((level, idx) => {
      return (idx === state.elevator + 1) ? level.concat(move) : level;
    });

  // remove items from level they are moving from if they are in move list
  newWorld[state.elevator] = newWorld[state.elevator].filter(item => move.indexOf(item) === -1);
  return { world: newWorld, elevator: newElevator };
}

// get possible permutations of current world for one potential move candidate
// move everything that could move up or down
// filtering out impossible states
function permute(state, move) {
  let result = [];

  // if not currently on top floor, then get move up permutation
  if (state.elevator !== 0) {
    result.push(permuteUp(state, move));
  }

  // if not currently on bottom floor, then get move down permutation
  if (state.elevator !== 3) {
    result.push(permuteDown(state, move));
  }

  // discard impossible results
  result = result.filter(item => worldPossible(item.world));

  // build and return new result objects for each permutation
  return result.map((item) => { return { world: item.world, elevator: item.elevator }; });
}

// get all permutations of current state, based on each possible move candidate going up and down
function permutations(state, history) {
  const perms = [];

  // current level elevator is on for this world, this drives what we can move
  const level = state.world[state.elevator];

  // get all possible combinations of items that could move from this level
  const movers = getMoveCombinations(level);

  // for each possible mover, get its permutations
  movers.map(move => perms.push(permute(state, move, history)));

  // flatten out result as we have an array for each move candidate
  return perms.reduce((flat, item) => flat.concat(item), []);
}

// function used to sort worlds so the one with the lowest score (i.e. best) comes first
function sortWorlds(wa, wb) {
  return score(wa.world) - score(wb.world);
}

// look up an items canonical replacement based on its current location in the world
// canonical representation is used to remove equivalent duplicate world states
// so the Nth item in the world will always be replaced with the Nth item in canonical ordering
function replace(order, canon, char) {
  return canon[order.indexOf(char)];
}

// convert a world to its canonical form, to remove ultimately equivalent states
// canonical means, put instances of types in a specific order,
// since [[AG AM],[BG BM]] is effectively the same as[[BG BM],[AG AM]]
// world is the world to reorganise, canon is the ordering of types to prefer
function canonical(world, canon) {

  // find the order of each object of type M in current world state
  const order = world.reduce( //iterate each level in the world
    (worldstate, level) =>
      worldstate.concat( // ordering in the world is derived by compressing the orders per level
        level.reduce((levelstate, item) => { return (item.slice(1) === "M") ? levelstate.concat(item.slice(0, 1)) : levelstate; }, []))
    , []);

  // rebuild the world with new ordering
  // go over each level, then each element in each level
  // look up the new item required to replace each current item to translate to canonical representation
  return world.map(level =>
    level.map(item =>
      //replace item X[GM] Y[GM] where mapping from X to Y is based on canonical order of X and Y
      replace(order, canon, item.slice(0, 1)).concat(item.slice(1))).sort());
}

// prune the search space
// translates each world to canonical form, then removes worlds already in history
// then adds newly visited worlds to history for future pruning.
function prune(universe, history, canon) {
  let pruned =
    universe.map((item) => {
      return { world: canonical(item.world, canon), elevator: item.elevator };
    });

  pruned = pruned.filter((item) => {
    if (history.contains(hashCode(JSON.stringify(item)))) {
      return false;
    }
    history.add(hashCode(JSON.stringify(item)));
    return true;
  });

  return pruned.sort(sortWorlds);
}

// walk through the search space
function walk(start) {
  let steps = 0;
  let done = false;
  const canon = start.canon;
  let universe = [start];
  const history = new hashes.HashSet();
  let next = [];

  // keep searching until we find a solution
  while (!done) {
    steps += 1;
    next = universe.map(parent => permutations(parent)); // get valid permutations of current world
    next = next.reduce((state, item) => state.concat(item), []); // flatted results
    next = prune(next, history, canon); // prune results via canonical form
    const best = score(next[0].world); // find best score

    const won = best === 0; // if best score is zero, we are finished.
    if (won) {
      console.log(`Found a result, quitting=> ${steps}`);
      done = true;
    }

    // if next cycle has no possible worlds, we have run out of the search space, give up.
    if (next.length === 0) {
      console.log("exhausted, quitting");
      done = true;
    }

    // go around for next loop
    universe = next;

    // add this generation to visited hashset to prevent revisiting.
    for (let i = 0; i < next.length; i += 1) {
      history.add(hashCode(JSON.stringify(next[i])));
    }
  }
  return steps;
}

function partOne() {
  return walk({ world: [[], ["CM", "UM", "RM", "PM"], ["CG", "UG", "RG", "PG"], ["XG", "XM"]], elevator: 3, canon: "CPRUX".split("") });
}

function partTwo() {
  return walk({ world: [[], ["CM", "UM", "RM", "PM"], ["CG", "UG", "RG", "PG"], ["XG", "XM", "DG", "DM", "EG", "EM"]], elevator: 3, canon: "DECPRUX".split("") });
}

exports.partOne = partOne;
exports.partTwo = partTwo;
exports.walk = walk;
exports.score = score;
exports.getGeneratorsOnLevel = getGeneratorsOnLevel;
exports.getChipsOnLevel = getChipsOnLevel;
exports.levelPossible = levelPossible;
exports.worldPossible = worldPossible;
exports.getMoveCombinations = getMoveCombinations;
exports.permutations = permutations;
exports.permuteUp = permuteUp;
exports.permuteDown = permuteDown;
exports.hashCode = hashCode;
exports.canon = canonical;
