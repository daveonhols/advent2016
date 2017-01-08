"use strict";

function calculateExpandedBlockLength(version, header, string) {
  if (version === 1) {
    return header.repeat * string.length;
  }
  return header.repeat * decompressedLength(version, string);
}

function parseHeader(header) {
  const splitBlock = header.split("x");
  const blockLen = Number(splitBlock[0]);
  const blockRepeat = Number(splitBlock[1]);
  return { len: blockLen, repeat: blockRepeat, headerLen: 2 + header.length };
}

function decompressedLength(version, str) {
  let walk = 0;
  let total = 0;
  while (walk < str.length) {
    if (str[walk] === "(") {
      const blockHeader = parseHeader(str.substring(walk + 1, str.indexOf(")", walk + 1)));

      const blockResult =
        calculateExpandedBlockLength(
          version,
          blockHeader,
          str.substring(
            walk + blockHeader.headerLen,
            walk + blockHeader.len + blockHeader.headerLen));

      total += blockResult;
      walk += blockHeader.len + blockHeader.headerLen;
    } else {
      total += 1;
      walk += 1;
    }
  }
  return total;
}

exports.expandedLength = decompressedLength;
