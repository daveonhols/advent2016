var expect = require("chai").expect;
var d14 = require("../d14.js");

it("d14 find threes", function() {
  expect(d14.findTriple("abababc")).to.equal("");
  expect(d14.findTriple("abababccc")).to.equal("c");
  expect(d14.findTriple("ddabababccc")).to.equal("c");
  expect(d14.findTriple("0034e0923cc38887a57bd7b1d4f953df")).to.equal("8");
  expect(d14.findTriple("dddabababccc")).to.equal("d");
});

it("d14 find fives", function() {
  expect(d14.findFives("ababbabc").length).to.equal(0);
  expect(d14.findFives("ababbbabccc").length).to.equal(0);
  expect(d14.findFives("ddababbbbabccc").length).to.equal(0);
  expect(d14.findFives("dddababbbbbabccc").length).to.equal(1);
  expect(d14.findFives("dddababbbbbabccc")[0]).to.equal("b");
});


