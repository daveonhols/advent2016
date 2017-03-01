var expect = require("chai").expect;
var d13 = require("../d13.js");

it("d13 bits counter", function() {
  expect(d13.onbits(31)).to.equal(5);
  expect(d13.onbits(32)).to.equal(1);
  expect(d13.onbits(33)).to.equal(2);
  expect(d13.onbits(35)).to.equal(3);
});