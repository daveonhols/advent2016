var fs = require('fs'); // for reading text file input

// check if three sides a, b, c represent a valid triangle.
function isTriangle(a, b, c){
    return ((a+b)>c) && ((a+c)>b) && ((b+c)>a)
}

// reduce function used to count up number of triangles
// total is accumulator
// triple is [a, b, c] lengths of triangle sides
function countTriangles(total, triple){

    if (isTriangle.apply(null, triple)){
        return total+1;
    }else{
        return total;
    }
}

// for part 1, get triangle data from file contents row wise
function unpackByRows(data){
    return data.split('\r\n').map(unpackRow);
}

// for part 1, get sides of a triangle from input string
// maps "  a  b  c  " to [a, b, c] using split, trim and discarding empties
function unpackRow(row){
    return row.split(' ')
        .map(    (item) => { return item.trim();   } )
        .filter( (item) => { return item.length>0; })
        .map(    (item) => { return Number(item);  });
}

// for part 2, get sides of triangles from input by unpacking text rows
// then stripping out all the first column values, all the second column values
// etc into a flat array.
// groups the flat array into triples [a, b, c] via reduce
function unpackByColumns(data){
    var flat = [];
    var rows = unpackByRows(data);
    [0, 1, 2].map( (idx) => rows.map( (triple) => flat.push(triple[idx])));
    return flat.reduce( accumlateThrees, [[]] );
}

// chunks a flat array [a, b, c, d, e, f] into triples [[a, b, c], [d, e, f]]
// by pushing to back of an array and adding a new empty array when last is full
function accumlateThrees(state, item){
    if(state[state.length-1].length==3){
        state.push([]); // if last chunk has three elements, start a new one
    }
    state[state.length-1].push(item);
    return state;
}

// read data file
fs.readFile(
  "d3/d3.txt",
  "utf-8",
  (error, data) => {
      if(error)
        throw error;
      console.log("Part1="+ unpackByRows(data).reduce(countTriangles, 0));
      console.log("Part2="+ unpackByColumns(data).reduce(countTriangles, 0));
  });
