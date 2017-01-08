"use strict";

const bots = {};
const outputs = {};

function giveOutput(out, val) {
  outputs[out] = val;
}

function give(rule, val) {
  if (rule.type === "bot") {
    giveBot(rule.target, val);
  }
  if (rule.type === "output") {
    giveOutput(rule.target, val);
  }
}

function process(bot) {
  if (bots[bot].values.length < 2) {
    return;
  }

  const lower =
    (bots[bot].values[0] > bots[bot].values[1])
      ? bots[bot].values.pop()
      : bots[bot].values.shift();

  const higher = bots[bot].values[0]; // only value left.

  if (lower === 17 && higher === 61) {
    console.log(`Part One: 17 & 61 processed by: ${bot}`);
  }

  give(bots[bot].low, lower);
  give(bots[bot].high, higher);
}

function giveBot(bot, val) {
  if (bots[bot] === undefined) {
    bots[bot] = { values: [], low: undefined, high: undefined };
  }
  bots[bot].values.push(val);
  process(bot);
}

function setRule(bot, lowRule, highRule) {
  if (bots[bot] === undefined) {
    bots[bot] = { values: [], low: lowRule, high: highRule };
  }
}


function parseInit(parts) {
  return { init: true, val: Number(parts[1]), to: Number(parts[5]) };
}

function parseRule(parts) {
  const who = Number(parts[1]);
  const lowType = parts[5];
  const lowTarget = Number(parts[6]);
  const highType = parts[10];
  const highTarget = Number(parts[11]);

  return {
    who,
    low: { type: lowType, target: lowTarget },
    high: { type: highType, target: highTarget }
  };
}

function parseInstruction(strInstruction) {
  const parts = strInstruction.split(" ");
  if (parts[0] === "value") {
    return parseInit(parts);
  }
  return parseRule(parts);
}

function run(input) {
  const lines = input.split("\r\n");
  const instructions = lines.map(parseInstruction);
  instructions.map(
    (rule) => {
      if (!rule.init) {
        setRule(rule.who, rule.low, rule.high);
      }
    }
  );

  instructions.map(
    (rule) => {
      if (rule.init) {
        giveBot(rule.to, rule.val);
      }
    }
  );

  const partTwo = [0, 1, 2].reduce((sum, idx) => sum * outputs[idx], 1);
  console.log(`Part Two: ${partTwo}`);
}

exports.run = run;
