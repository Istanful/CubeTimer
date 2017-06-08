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
  /*

  function execSet(moves) {
    for (let b = 0; b < Math.abs(moves[0]); b++) {
      console.log("execing moves")
      if (moves[0] < 0)
        squareui();
      else
        squareu();
    }

    for (let b = 0; b < Math.abs(moves[0]); b++) {
          if (moves[1] < 0)
        squaredi();
      else
        squared();
    }
    kiir();

    setTimeout(function() { sqtryslice(); kiir(); }, 1000);
  }

  function execute(scramble) {
    scramble = scramble.slice(0, scramble.length - 1);
  	let sets = scramble.split("/");

  	for (let a = 0; a < sets.length; a++) {
      let moves = sets[a].split(",");
  		moves[0] = parseInt(moves[0].replace("(", ""));
  		moves[1] = parseInt(moves[1].replace(")", ""));

      setTimeout(function() { execSet(moves) }, a * 1000);
  	}
  }

  */
  "square-1": function() {
    let state = { upper: [2, 1, 2, 1, 2, 1, 2, 1], lower: [1, 2, 1, 2, 1, 2, 1, 2] }
    let moves = "";

    let available = function(face) {
      let turns = [];
      let leftSum;
      for (let i = 0; i < face.length; i++) {
        index = i;
        leftSum = 0;
        rightSum = 0;
        while (leftSum < 6) {
          leftSum += face[index];
          index = (index + 1)%face.length
        }

        if (leftSum == 6) {
          let leftMove = face.slice(0, i).sum();
          let rightMove = face.slice(i, face.length).sum();
          turns.push(-leftMove);
        }
      }
      return turns;
    }

    let turn = function(face, sum) {
      sum = Math.abs(sum)
      let currentSum = index = 0;

      while (currentSum < sum) {
        currentSum += face[index];
        index++;
      }

      return face.slice(index, face.length).concat(face.slice(0, index));
    }

    let slice = function(state) {
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

    for (let i = 0; i < 12; i++) {
      let u = available(state.upper).random();
      let d = available(state.lower).random();
      moves += "(" + u + ", " + d + ")/";
      state.upper = turn(state.upper, u);
      state.lower = turn(state.lower, d);
      slice(state)
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
