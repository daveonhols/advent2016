"use strict";

const md5 = require("spark-md5").hash;

const SALT = "jlmsuwbz";


// find first run of three consecutive chars in string
function findTriple(hash) {
  let result = "";

  for (let i = 0; i < hash.length - 2; i += 1) {
    if ((hash[i] === hash[i + 1]) && (hash[i] === hash[i + 2])) {
      result = hash[i];
      break;
    }
  }
  return result;
}

// stretch a hash by re-hashing num times
function stretch(hash, num) {
  let stretched = hash;
  for (let i = 0; i < num; i += 1) {
    stretched = md5(stretched);
  }
  return stretched;
}

// find all runs of five consecutive chars in string
function findFives(hash) {
  const result = [];

  for (let i = 0; i < hash.length - 4; i += 1) {
    if (
        (hash[i] === hash[i + 1])
        && (hash[i] === hash[i + 2])
        && (hash[i] === hash[i + 3])
        && (hash[i] === hash[i + 4])) {
      result.push(hash[i]);
    }
  }
  return result;
}

// search for indexes which derive keys whereby,
// 1. key has 3 consecutive instances of char X
// 2. within index+(1..1000), derived key contains 5 consecutive instances of char X
function search(stretching) {
  console.log("searching...");
  const found = []; // keys found, we need to find 64 in total

  // active triples, those we need to keep searching up to idx+1000
  // one triple is { char; expirey } where char is that character repeating 3 times
  // expiry is the index triple was found at + 1000, so we can expire this triple when required.
  let triples = [];

  let index = 0;

  // keep searching until we fond 64 keys.
  while (found.length < 64) {
    // find candidate key from hashing
    const candidate = stretch(md5(SALT + index), stretching);

    // find triple associated with this key if any.
    const triple = findTriple(candidate);

    // find keys associated with this key if any.
    const fives = findFives(candidate);

    // find keys which are those fives from this candidate, that are in the active triples list.
    const keys = triples.filter(item => fives.indexOf(item.trip) !== -1);

    // if any keys found, track them.
    if (keys.length > 0) {
      keys.map(key => found.push(key));
    }

    // if we found a triple at this index, track that with it's expiry
    if (triple.length > 0) {
      triples.push({ trip: triple, exp: index + 1000 });
    }

    // remove a triple if it was already used to derive a key at this index.
    // we shouldn't match a triple multiple times
    triples =
      triples.filter(
        trip => keys.filter(
          key => key.trip === trip.trip && key.exp === trip.exp
        ).length === 0);

    // expire triples that are done after this index.
    triples = triples.filter(item => item.exp > index);
    index += 1; // keep going, next index.
  }

  // done, show the index where the last key was derived from (inferred from it's expiry).
  console.log(`Found from index: ${(((found[63]).exp) - 1000)}`);
}

exports.findFives = findFives;
exports.findTriple = findTriple;
exports.search = search;
