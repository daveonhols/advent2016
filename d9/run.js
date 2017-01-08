const d9 = require("./d9.js");
const fs = require("fs");


fs.readFile(
  "d9/d9.txt",
  "utf-8",
  (err, data) => {
    if (err) {
      throw (err);
    }
    console.log(`Part One ${d9.expandedLength(1, data.trim())}`);
    console.log(`Part Two ${d9.expandedLength(2, data.trim())}`);
  }
);
