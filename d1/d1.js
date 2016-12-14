var input_one = "R3, L2, L2, R4, L1, R2, R3, R4, L2, R4, L2, L5, L1, R5, R2, R2, L1, R4, R1, L5, L3, R4, R3, R1, L1, L5, L4, L2, R5, L3, L4, R3, R1, L3, R1, L3, R3, L4, R2, R5, L190, R2, L3, R47, R4, L3, R78, L1, R3, R190, R4, L3, R4, R2, R5, R3, R4, R3, L1, L4, R3, L4, R1, L4, L5, R3, L3, L4, R1, R2, L4, L3, R3, R3, L2, L5, R1, L4, L1, R5, L5, R1, R5, L4, R2, L2, R1, L5, L4, R4, R4, R3, R2, R3, L1, R4, R5, L2, L5, L4, L1, R4, L4, R4, L4, R1, R5, L1, R1, L5, R5, R1, R1, L3, L1, R4, L1, L4, L4, L3, R1, R4, R1, R1, R2, L5, L2, R4, L1, R3, L5, L2, R5, L4, R5, L5, R3, R4, L3, L3, L2, R2, L5, L5, R3, R4, R3, R4, R3, R1";

var test = "R8, R4, R4, R8"

// given a facing direction and a L / R direction, decide new facing direction
function nextDirection(facing, turn){
  	var rotator = ["N", "E", "S", "W"];
    var iFacing = rotator.indexOf(facing);

    if("L" == turn)
    	return rotator[((iFacing-1) == -1 ? 3 : iFacing-1)];

    if("R" == turn)
    	return rotator[((iFacing+1) == 4 ? 0 : iFacing+1)];
  }


// generate coordinate list for the next blocks we wil cover for this move
// prev = where we were last
// dir = the direction we will move in
// num = number of blocks we will move
function nextSteps(prev, dir, num){

    // array containing all those locations we will visit for this move
	var result = [];

  for (i=1; i < num+1; ++i){

    //add to result array those locations derived from previous location
    // direction we are facing and number of blocks to traverse
    switch(dir){
            case "N":
            	result.push({x:prev.x, y:prev.y+i})
              break;
            case "E":
              result.push({x:prev.x+i, y:prev.y});
              break;
            case "S":
              result.push({x:prev.x, y:prev.y-i});
              break;
            case "W":
              result.push({x:prev.x-i, y:prev.y});
              break;
          }
    }

    return result;
}

// reduce function used to derive next part of answer from current state and next move
// state tracks current path up to now
// move is next move message, eg L3, R99 etc
function applyMove(state, move){

  // parse out direction to move in and distance from move text
  var turn = move.substring(0,1);
  var distance = parseInt(move.substring(1));

  // derived new direction we are facing in after processing turn direction
  var newFacing = nextDirection(state.last.facing, turn);

  // derive those next steps we will take based on new direction and number of steps
  var steps = nextSteps(state.last, newFacing, distance);

  // keep special track of final position for clarity
  var final = steps[steps.length-1];

  // iterate over those steps we just took,
  // to see if any of them is to a location we already visited
  var repeated = steps.filter(function(stepsValue){
        // decide if the prevous step was already visited,
        // by checking it against everything we already visited
  	return state.visited.filter(function(visitedValue){
    	return (stepsValue.x == visitedValue.x) && (stepsValue.y == visitedValue.y);
    }).length > 0; // if any locations returned by the filter, we have visited already
  });

  // return latest state:
  //   everywhere we have been
  //   the last place we were at
  //   everywhere we have visited twice
  return {
            visited:state.visited.concat(steps),
            last:{facing:newFacing, x:final.x, y:final.y},
            twice:state.twice.concat(repeated)
  		};
}


function one(input){

  // initial state for reduce function
  // initial location and facing direction is in problem definition
  var initialState = {
        visited:[{x:0, y:0}],
        last:{facing:"N", x:0, y:0},
        twice:[]
    };

    // split the input problem then reduce over each move to derive final answer
	return input
          .split(", ")
          .reduce(applyMove,initialState)
 };

function distance(loc){
    return loc.x+loc.y;
}

// part one asks for final location
console.log("Part1=" + JSON.stringify(distance(one(input_one).last)));

// part two asks for first place visited twice.
console.log("Part2=" + JSON.stringify(distance(one(input_one).twice[0])));

// $(".out").html(JSON.stringify());
