"use strict";

var fs = require("fs");
var SortedMap = require("collections/sorted-map");
var SortedSet = require("collections/sorted-set");

function checksumCompareDescending(a, b){
    if (a.score == b.score){ // if scores tied sort by character
        return Object.compare(a.char, b.char);
    }

    // comparison to sort count / char by score first
    return Object.compare(b.score, a.score);
}

function checksumCompareAscending(a, b){
    return checksumCompareDescending(b, a);
}

// equality check
function checksumEquals(a, b){
    return Object.equals(a.score, b.score) && Object.equals(a.char, b.char);
}


fs.readFile(
    "d6/d6.txt",
    "utf-8",
    (err, data) => {
        if(err)
            throw err;

        let counters =
            data.split("\r\n")
                .reduce(
                 colCounter,
                 [  SortedMap(), // counter for col 1.
                    SortedMap(), // counter for col 2.
                    SortedMap(), // counter for col 3.
                    SortedMap(),
                    SortedMap(),
                    SortedMap(),
                    SortedMap(),
                    SortedMap()] // counter for col 8.
                );

        console.log(counters.map(sortForMostCommon).map( (item) => {return item.char}).join(""));
        console.log(counters.map(sortForLeastCommon).map( (item) => {return item.char}).join(""));
    }
);

function sortForMostCommon(counter){
    return toSortedSet(counter, checksumCompareAscending);
}

function sortForLeastCommon(counter){
    return toSortedSet(counter, checksumCompareDescending );
}

function toSortedSet(counter, sorter){
    var sorted =
            counter
            .entries()
            .reduce((set, pair) => {
                // add the object to sorted set
                set.push( {score:pair[1], char:pair[0]} );
                return set;
            },
            // initialise sorted set with custom comparison function
            SortedSet( [], checksumEquals, sorter ) );

    return sorted.pop();
}

function colCounter(counters, message){
    [0, 1, 2, 3, 4, 5, 6, 7].map( (idx) => { addChar(counters[idx], message[idx]) } );
    return counters;
}

function addChar(counter, char){
    // for each char, if not seen before, add to set with count 0
    if(!counter.has(char)){
        counter.set(char, 0);
    }
    // increment count for this char
    counter.set( char, counter.get(char, 0) +1 );
    return counter;
}
