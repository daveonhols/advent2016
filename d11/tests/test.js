var expect = require("chai").expect;
var d11 = require("../d11.js");

it("d11 scores", function() {
  expect(d11.score([ [], [], [], [] ])).to.equal(0);
  expect(d11.score([ [], [1, 1], [], [] ])).to.equal(2);
  expect(d11.score([ [], [], [2, 3], [] ])).to.equal(4);
  expect(d11.score([ [], [1, 2], [3], [4, 5] ])).to.equal(10);
});

it("d11 generators", function() {
  expect(d11.getGeneratorsOnLevel(["AG", "BB", "CG"])).equals("AC");
  expect(d11.getGeneratorsOnLevel(["AX", "BB", "CZ"])).equals("");
});

it("d11 chips", function() {
  expect(d11.getChipsOnLevel(["AM", "BB", "DM"])).equals("AD");
  expect(d11.getChipsOnLevel(["AX", "BB", "CZ"])).equals("");
});

it("d11 level possible", function() {
  expect(d11.levelPossible(["AG","AM", "HG"])).equals(true);
  expect(d11.levelPossible(["AG","AM", "XM"])).equals(false);
  expect(d11.levelPossible(["AG", "AM", "HG", "XG"])).equals(true);
  expect(d11.levelPossible([])).equals(true);
});

it("d11 world possible", function() {
  expect(d11.worldPossible([["AG","AM", "HG"], ["AG","AM", "XM"]])).equals(false);
  expect(d11.worldPossible([["AG","AM", "HG"], []])).equals(true);
  expect(d11.worldPossible([["AG","AM", "HG", "XG"], ["AG","AM", "XM", "XG"]])).equals(true);
});

it("d11 move cobinations", function() {
  expect(d11.getMoveCombinations([])).to.deep.equal([]);
  const a = d11.getMoveCombinations(["A", "B"]);
  console.log("A=" + a);
  expect(d11.getMoveCombinations(["A", "B"])).to.deep.equal([["A"], ["B"], ["A", "B"]]);
  expect(d11.getMoveCombinations(["A", "B", "C"])).to.deep.equal([["A"], ["B"], ["C"], ["A", "B"], ["A", "C"], ["B", "C"]]);
})

it("d11 permute up", function() {
   expect(d11.permuteUp({ world: [["A"], [], ["B"]], elevator: 2 }, ["B"])).to.deep.equal( { world:[["A"], ["B"], []], elevator: 1 } );
   expect(d11.permuteUp({ world: [["A"], [], ["B", "C", "D"]], elevator: 2 }, ["B", "C"])).to.deep.equal( { world:[["A"], ["B", "C"], ["D"]], elevator: 1 } );
})

it("d11 permute down", function() {
   expect(d11.permuteDown({ world: [["A"], [], ["B"]], elevator: 0 }, ["A"])).to.deep.equal( { world:[[], ["A"], ["B"]], elevator: 1 } );
   expect(d11.permuteDown({ world: [["A"], ["B", "C", "D"], ["E"]], elevator: 1 }, ["B", "C"])).to.deep.equal( { world:[["A"], ["D"], ["E", "B", "C"] ], elevator: 2 } );
})