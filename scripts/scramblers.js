let defaultMoves = "R L F B D U ";
let signWideMoves = defaultMoves.toLowerCase();
let wcaWideMoves = defaultMoves.split(" ").map(function(el) { return el + "w"; }).join(" ") + " ";
let threeWide = signWideMoves.split(" ").map(function(el) { return 3 + el; }).join(" ") + " ";

let scramblers = {
  "2x2x2": function() {
    return randomMoves(10)
  },
  "3x3x3": function() {
    return randomMoves();
  },
  "4x4x4": function() {
    let notation = saveAccess("options.scrambling.4x4x4.notation", "WCA");
    switch (notation) {
      case "SiGN":
        return randomMoves(40, defaultMoves + signWideMoves);
      default:
        return randomMoves(40, defaultMoves + wcaWideMoves);
    }
  },
  "5x5x5": function() {
    let notation = saveAccess("options.scrambling.4x4x4.notation", "WCA");
    switch (notation) {
      case "SiGN":
        return randomMoves(60, defaultMoves + signWideMoves);
      default:
        return randomMoves(60, defaultMoves + wcaWideMoves);
    }
  },
  "6x6x6": function() {
    return randomMoves(80, defaultMoves + signWideMoves + threeWide);
  },
  "7x7x7": function() {
    return randomMoves(100, defaultMoves + signWideMoves + threeWide);
  },
  skewb: function() {
    return randomMoves(11, "F R B L", "' ");
  },
  pyraminx: function() {
    return randomMoves(8) + randomUnique(Math.ceil(Math.random() * 4), "l b u r", "' ")
  },
  "square-1": function() {
    let state = { upper: [2, 1, 2, 1, 2, 1, 2, 1], lower: [1, 2, 1, 2, 1, 2, 1, 2] }
    let moves = "";

    for (let i = 0; i < 12; i++) {
      let u = sq1Available(state.upper).random();
      let d = u == 0 ? sq1Available(state.lower).randomNot(0) : sq1Available(state.lower).random();
      moves += "(" + u + ", " + d + ")/";
      state.upper = sq1Turn(state.upper, u);
      state.lower = sq1Turn(state.lower, d);
      sq1Slice(state);
    }

    return moves;
  },
  megaminx: function() {
    let scramble = "";
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 10; c++)
        scramble += (c % 2 == 0 ? ["R++", "R--"].random() : ["D++", "D--"].random()) + " ";
      scramble += ["U", "U'"].random() + "\n";
    }
    return scramble;
  }
}

function randomUnique(count = 4, availableMoves = defaultMoves, modifiers = "' 2") {
  availableMoves = availableMoves.split(" ");
  let moves = "";
  let index;
  modifiers = modifiers.split(" ");

  for (let i = 0; i < count; i++) {
    index = Math.floor(Math.random() * availableMoves.length);
    moves += availableMoves[index] + modifiers.random() + " ";
    availableMoves.splice(index, 1)
  }
  return moves;
}

function randomMoves(count = 19, availableMoves = defaultMoves, modifiers = "' 2") {
  let scramble = "";
  let lastMove = "";
  availableMoves = availableMoves.split(" ");

  for (let i = 0; i < count; i++) {
    let move = lastMove;
    while (lastMove.includes(move))
      move = availableMoves.random();
    move += modifiers.split(" ").random() + " ";
    lastMove = move;
    scramble += move;
  }
  return scramble;
}

/*

// Test square one scramble
function testScramble(scramble) {
  let success = true;
  thinkandreset();
  scramble = scramble.slice(0, scramble.length - 1);
  let sets = scramble.split("/");

  for (let a = 0; a < sets.length; a++) {
    console.log(sets[a]);
      let moves = sets[a].split(",");
      moves[0] = parseInt(moves[0].replace("(", ""));
      moves[1] = parseInt(moves[1].replace(")", ""));

    for (let b = 0; b < Math.abs(moves[0]); b++)
      if (moves[0] < 0)
        squareui();
      else
        squareu();
    for (let b = 0; b < Math.abs(moves[1]); b++)
      if (moves[1] < 0)
        squaredi();
      else
        squared();
    let sliced = sqtryslice();
    if (sliced == 0) {
      kiir();
      console.log(":(");
      return;
        }
    console.log(sliced == 1 ? "Succesfully sliced" : "Failed to slice");
    kiir();
    }
  console.log(":)");
}

*/

function sq1Available(face) {
  let turns = [];
  let leftSum;
  for (let i = 0; i < face.length; i++) {
    index = i;
    leftSum = 0;
    rightSum = 0;
    while (leftSum < 6) {
      leftSum += face[index];
      index = (index + 1);
    }

    if (leftSum == 6) {
      let leftMove = face.slice(0, i).sum();
      let rightMove = face.slice(index, face.length).sum();
      if (leftMove > rightMove)
        turns.push(rightMove)
      else
        turns.push(-leftMove);
    }
  }

  return turns;
}

function sq1Turn(face, sum) {
  let clockwise = sum > 0;
  let index = clockwise ? face.length - 1 : 0;
  let absSum = Math.abs(sum);
  let currentSum = 0;

  while (currentSum < absSum) {
    currentSum += face[index];
    index = clockwise ? (index - 1) : (index + 1);
  }

  let newFace;
  if (clockwise) {
    newFace = face.slice(index+1, face.length).concat(face.slice(0, index+1));
  }
  else {
    newFace = face.slice(index, face.length).concat(face.slice(0, index));
  }

  return newFace;
}

function sq1Slice(state) {
  let upperLeft = [];
  let upperRight = [];
  let lowerLeft = [];
  let lowerRight = [];

  let sum = 0;
  for (let i = 0; i < state.upper.length; i++) {
    if (sum < 6) {
      sum += state.upper[i];
      upperLeft.push(state.upper[i]);
    }
    else
      upperRight.push(state.upper[i]);
  }

  sum = 0;
  for (let i = 0; i < state.lower.length; i++) {
    if (sum < 6) {
      sum += state.lower[i];
      lowerLeft.push(state.lower[i]);
    }
    else
      lowerRight.push(state.lower[i]);
  }

  state.upper = upperLeft.concat(lowerRight);
  state.lower = lowerLeft.concat(upperRight);
}
