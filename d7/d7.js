"use strict";

const fs = require("fs"); // for reading text file input

function readParts(state, char) {
  if (char === "[") {
    state.inside.push([]);
    return { inside: state.inside, outside: state.outside, pushTo: "in" };
  }
  if (char === "]") {
    state.outside.push([]);
    return { inside: state.inside, outside: state.outside, pushTo: "out" };
  }
  if (state.pushTo === "in") {
    const nextIn = state.inside.slice(0);
    nextIn[nextIn.length - 1] = nextIn[nextIn.length - 1].concat(char);
    return { inside: nextIn, outside: state.outside, pushTo: state.pushTo };
  }
  if (state.pushTo === "out") {
    const nextOut = state.outside.slice(0);
    nextOut[nextOut.length - 1] = nextOut[nextOut.length - 1].concat(char);
    return { inside: state.inside, outside: nextOut, pushTo: state.pushTo };
  }
  return state;
}

function processLine(str) {
  const initialState = { inside: [], outside: [[]], pushTo: "out" };
  return str.split("").reduce(readParts, initialState);
}

function isABBA(str) {
  for (let i = 0; i < str.length - 3; i += 1) {
    if (str[i] === str[i + 3] && str[i + 1] === str[i + 2] && !(str[i] === str[i + 1])) {
      return true;
    }
  }
  return false;
}

function getABACandidates(str, reverse) {
  const abas = [];

  for (let i = 0; i < str.length - 2; i += 1) {
    if (str[i] === str[i + 2] && !(str[i] === str[i + 1])) {
      if (reverse) {
        abas.push(str[i] + str[i + 1]);
      } else {
        abas.push(str[i + 1] + str[i]);
      }
    }
  }
  return abas;
}

function isTLS(descriptor) {
  return (descriptor.outside.filter(item => isABBA(item.join(""))).length) > 0
     && (descriptor.inside.filter(item => isABBA(item.join(""))).length === 0);
}

function hasSSL(descriptor) {
  let abas = descriptor.outside.map(item => getABACandidates(item, false));
  let babs = descriptor.inside.map(item => getABACandidates(item, true));

  abas = abas.reduce(
    (state, item) => {
      item.map(subitem => state.push(subitem)); return state;
    }, []);

  babs = babs.reduce(
    (state, item) => {
      item.map(subitem => state.push(subitem)); return state;
    }, []);

  return abas.filter(
    a => babs.filter(
      b => a === b
    ).length > 0
  ).length > 0;
}

fs.readFile(
  "d7/d7.txt",
  "utf-8",
  (error, data) => {
    if (error) {
      throw error;
    }
    const partOne = data.split("\r\n").filter(item => isTLS(processLine(item))).length;
    const partTwo = data.split("\r\n").filter(item => hasSSL(processLine(item))).length;
    console.log(`Part1=${partOne}`);
    console.log(`Part2=${partTwo}`);
  });
