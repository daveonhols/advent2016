// collections used to store and sort character counts
var SortedMap = require("collections/sorted-map");
var SortedSet = require("collections/sorted-set");

var fs = require("fs");

// parse out the name / sector / checksum from a room description string
function parseRoom(room){
    var parts = room.split("-").map( (part) => { return part.replace("]", "").split('[') } );
    var name = parts.slice(0, parts.length-1);
    name = name.reduce( (a, b) => { return a+b});
    var sector = parts[parts.length-1][0];
    var checksum = parts[parts.length-1][1];
    return {name:name, sector:sector, checksum:checksum};
}

// comparison function for a checksum object
// compare by counts first then by character alphabetically in case of tie
function checksumCompare(a, b){
    if (a.score == b.score){ // if scores tied sort by character
        return Object.compare(a.char, b.char);
    }

    // comparison to sort count / char by score first
    return Object.compare(b.score, a.score);
}

// equality check
function checksumEquals(a, b){
    return Object.equals(a.score, b.score) && Object.equals(a.char, b.char);
}

// calculate the checksum for a room by
// 1.  counting occurances of chars,
// 2.  picking the five most commonly occuring chars
// 3.  sorting alphabetically in caes of ties on number of occurances
function roomChecksum(name){
    var counts =
     name.split('').reduce((map, char) => {
        // for each char, if not seen before, add to set with count 0
        if(!map.has(char)){
            map.set(char, 0);
        }
        // increment count for this char
        map.set( char, map.get(char, 0) +1 );
        return map;
    }, SortedMap() );

    // create set of chars sorted using checksumCompare
    var sorted = counts
                    .entries()
                    .reduce((set, pair) => {
                        // add the object to sorted set
                        set.push( {score:pair[1], char:pair[0]} );
                        return set;
                    },
                    // initialise sorted set with custom comparison function
                    SortedSet( [], checksumEquals, checksumCompare ) );

    // get the five most commonly occuring characters and raze down to a string
    return sorted.slice(0, 5). reduce( (str, char) => {return str + char.char;}, "" )
}

// check if a room is real by comparing calculated checksum with given value
// used to filter out decoy rooms.
function realRoom(room){
    return roomChecksum(room.name) == room.checksum;
}

// read nad process input file
fs.readFile(
    "d4/d4.txt",
    "utf-8",
    (err, data) => {
        if (err)
            throw err;

        // get real rooms by filtering out decoys
        var realRooms = data.split("\r\n")
            .map(parseRoom)
            .filter(realRoom);

        // part 1, count up the sectors of real rooms.
        console.log("Part1=" +
                realRooms
                .reduce( (score, room) => { return score + Number(room.sector) }, 0 ));

        // part 2, decrypt names of real rooms
        var decrytedRooms = realRooms
                            .map( (room) => {
                                return {
                                            sector:room.sector,
                                            name:decrypt (room.name, room.sector).reduce( (str, char) => {return str+char;}, "" )
                                        }
                            } );

        //look for a room with north pole in the name,
        // should be the one we are looking for...
        console.log("Part2=" +
                decrytedRooms
                .filter( (room) => { return room.name.indexOf("north") >= 0; } )[0].sector );
    }
)

// decrypt a room name based on sector
function decrypt(name, sector){
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    return name.split('').map( (char) =>
     {
        // map hypen to space
        // or do decyrption with mod 26 logic in case of alpha chars
         return char == "-"
                     ? " "
                     : alpha[(alpha.indexOf(char) + sector % 26) % 26];
     });
}
