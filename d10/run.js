"use strict";

const fs = require("fs");
const d10 = require("./d10.js");

fs.readFile(
    "d10/input.txt",
    "utf-8",
    (err, data) => {
        if (err) {
            throw err;
        }
        d10.run(data);
    }
);

