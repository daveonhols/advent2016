var expect = require("chai").expect;
var d1 = require("../d1.js");

it("call d1 part 1", function() {
  expect(d1.partOne()).to.equal(262);
});

it("call d1 part 2", function() {
  expect(d1.partTwo()).to.equal(131);
});
