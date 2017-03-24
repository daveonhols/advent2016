"use strict";

const d22 = require("./d22_common.js");

// solve part 1, just iterate simply, the problem is not big or hard...
function countViablePairs() {
  const nodes = d22.getNodes();

  const viable = [];

  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i][2] === 0) {
      continue; // a node is not viable if it is empty
    }
    for (let j = 0; j < nodes.length; j += 1) {
      if (j === i) {
        continue; // a node cannot be viable with itself
      }

      if (nodes[i][2] <= nodes[j][3]) {
        // pair is viable if data on node A (its Used) would fit on node B (its Avail)
        viable.push([nodes[i][0], nodes[j][0], nodes[i][2], nodes[j][3]]);
      }
    }
  }
  return viable.length;
}

exports.countViablePairs = countViablePairs;
