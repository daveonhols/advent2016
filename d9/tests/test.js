const expect = require("chai").expect;
const d9 = require("../d9.js");

it("d9", function() {
  expect(d9.expandedLength(2, "(3x3)XYZ")).to.equal(9);
  expect(d9.expandedLength(2, "X(8x2)(3x3)ABCY")).to.equal("XABCABCABCABCABCABCY".length);
  expect(d9.expandedLength(2, "(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN")).to.equal(445);
  expect(d9.expandedLength(2, "(27x12)(20x12)(13x14)(7x10)(1x12)A")).to.equal(241920);

  expect(d9.expandedLength(1, "A(1x5)BC")).to.equal(7);
  expect(d9.expandedLength(1, "(3x3)XYZ")).to.equal(9);
  expect(d9.expandedLength(1, "A(2x2)BCD(2x2)EFG")).to.equal(11);
  expect(d9.expandedLength(1, "X(8x2)(3x3)ABCY")).to.equal(18);


});

/*     (3x3)XYZ still becomes XYZXYZXYZ, as the decompressed section contains no markers.
    X(8x2)(3x3)ABCY becomes XABCABCABCABCABCABCY, because the decompressed data from the (8x2) marker is then further decompressed, thus triggering the (3x3) marker twice for a total of six ABC sequences.
    (27x12)(20x12)(13x14)(7x10)(1x12)A decompresses into a string of A repeated 241920 times.
    (25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN becomes 445 characters long.
*/
