"use strict";

const hashes = require("hashes");

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

function score(world) {
  return [1, 2, 3].reduce((sum, idx) => sum + (idx * world[idx].length), 0);
}

function getXOnLevel(x, level) {
  return level.reduce((xs, item) => { return (item.slice(1) === x) ? (xs + item.slice(0, 1)) : xs; }, "");
}

function getGeneratorsOnLevel(level) {
  return getXOnLevel("G", level);
}

function getChipsOnLevel(level) {
  return getXOnLevel("M", level);
}

function levelPossible(level) {
  const chips = getChipsOnLevel(level);
  const gens = getGeneratorsOnLevel(level);
  const vulnerable = chips.split("").filter(chip => gens.indexOf(chip) === -1);
  const burned = vulnerable.filter(vuln => gens.split("").some(gen => gen !== vuln));
  return burned.length === 0;
}

function worldPossible(world) {
  return world.every(levelPossible);
}

function getMoveCombinations(level) {
  const combos = level.map(x => [x]);
  level.map((x, i) => level.slice(i + 1).map(y => combos.push([x, y])));
  return combos;
}

function permuteUp(state, move) {
  const newElevator = state.elevator - 1;

  const newWorld =
    state.world.map((level, idx) => {
      return (idx === state.elevator - 1) ? level.concat(move) : level;
    });

  newWorld[state.elevator] = newWorld[state.elevator].filter(item => move.indexOf(item) === -1);
  return { world: newWorld, elevator: newElevator };
}

function permuteDown(state, move) {
  const newElevator = state.elevator + 1;

  const newWorld =
    state.world.map((level, idx) => {
      return (idx === state.elevator + 1) ? level.concat(move) : level;
    });

  newWorld[state.elevator] = newWorld[state.elevator].filter(item => move.indexOf(item) === -1);
  return { world: newWorld, elevator: newElevator };
}

function permute(state, move) {
  let result = [];
  if (state.elevator !== 0) {
    result.push(permuteUp(state, move));
  }
  if (state.elevator !== 3) {
    result.push(permuteDown(state, move));
  }
  result = result.filter(item => worldPossible(item.world));
  return result.map((item) => { return { world: item.world, elevator: item.elevator }; });
}

function permutations(state, history) {
  const perms = [];
  const level = state.world[state.elevator];
  const movers = getMoveCombinations(level);
  movers.map(move => perms.push(permute(state, move, history)));
  return perms.reduce((flat, item) => flat.concat(item), []);
}

function sortWorlds(wa, wb) {
  return score(wa.world) - score(wb.world);
}

function replace(order, canon, char) {
  return canon[order.indexOf(char)];
}

function canonical(world, canon) {
  const order = world.reduce(
    (worldstate, level) =>
      worldstate.concat(
        level.reduce((levelstate, item) => { return (item.slice(1) === "M") ? levelstate.concat(item.slice(0, 1)) : levelstate; }, []))
    , []);
  return world.map(level =>
    level.map(item =>
      replace(order, canon, item.slice(0, 1)).concat(item.slice(1))).sort());
}

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

function walk(start) {
  let steps = 0;
  let done = false;
  const canon = start.canon;
  let universe = [start];
  const history = new hashes.HashSet();
  let next = [];
  while (!done) {
    steps += 1;
    next = universe.map(parent => permutations(parent));
    next = next.reduce((state, item) => state.concat(item), []);
    next = prune(next, history, canon);
    const best = score(next[0].world);
    const won = best === 0;
    if (won) {
      console.log(`Found a result, quitting=> ${steps}`);
      done = true;
    }
    if (next.length === 0) {
      console.log("exhausted, quitting");
      done = true;
    }
    universe = next;
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
