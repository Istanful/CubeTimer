/*===========================================================
  Scrambling
===========================================================*/
let defaultMoves = "R L F B D U ";
let signWideMoves = "r l f b d u ";
let wcaWideMoves = "Rw Lw Fw Bw Dw Uw ";
let threeWide = "3r 3l 3f 3b 3d 3u ";

let scramblers = {
  "2x2x2": function() {
    return new Scramble(
      10,
      [
        "R",  "F", "U",
        "R2", "F2", "U2",
        "R'", "F'", "U'"
      ],
      [new RepeatRule(), new OppositeRule()]
    ).generate();
  },
  "3x3x3": function() {
    return new Scramble(
      19,
      [
        "R", "L", "F", "B", "D", "U",
        "R2", "L2", "F2", "B2", "D2", "U2",
        "R'", "L'", "F'", "B'", "D'", "U'"
      ],
      [new RepeatRule(), new OppositeRule()]
    ).generate();
  },
  "4x4x4": function() {
    switch (getNotation("4x4x4")) {
      case "SiGN":
        return randomMoves(40, defaultMoves + signWideMoves);
      default:
        return randomMoves(40, defaultMoves + wcaWideMoves);
    }
  },
  "5x5x5": function() {
    switch (getNotation("5x5x5", "WCA")) {
      case "SiGN":
        return randomMoves(60, defaultMoves + signWideMoves);
      default:
        return randomMoves(60, defaultMoves + wcaWideMoves);
    }
  },
  "6x6x6": function() {
    switch (getNotation("6x6x6", "prefix")) {
      case "SiGN":
        return randomMoves(80, defaultMoves + signWideMoves + threeWide);
      case "prefix":
        return randomMoves(80, defaultMoves, "' ", "3 2 ");
    }
  },
  "7x7x7": function() {
    switch (getNotation("7x7x7", "prefix")) {
      case "SiGN":
        return randomMoves(100, defaultMoves + signWideMoves + threeWide);
      case "prefix":
        return randomMoves(100, defaultMoves, "' ", "3 2 ");
    }
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
  clock: function() {
    let moves = "";

    switch (getNotation("clock")) {
      default:
        let firstFacePins = ("UR DR DL UL U R D L ALL").split(" ");
        let secondFacePins = ("U R D L ALL").split(" ");
        for (let i = 0; i < firstFacePins.length + secondFacePins.length; i++) {
          if (i < firstFacePins.length)
            moves += firstFacePins[i] + randomRange(0, 6) + ["+", "-"].random() + "&#9;&#9;";
          else if (i == firstFacePins.length)
            moves += "y2"
          else
            moves += secondFacePins[i - firstFacePins.length] + randomRange(0, 6) + ["+", "-"].random() + "&#9;&#9;";
        }
        moves += "UR DR UL";
        return moves;
    }
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

let Scramble = function(length, availableMoves, rules) {
  this.availableMoves = availableMoves;
  this.rules = rules;
  this.length = length;

  this.generate = function() {
    let scramble = [];
    for (let i = 0; i < this.length; i++) {
      let allowedMoves = availableMoves.slice(0);
      for (let i = 0; i < this.rules.length; i++) {
        allowedMoves = this.rules[i].apply(scramble, availableMoves, allowedMoves);
      }
      scramble.push(allowedMoves.random());
    }
    return scramble.join(' ');
  }
}

let RepeatRule = function() {
  this.apply = function(currentScramble, availableMoves, allowedMoves) {
    allowedMoves = allowedMoves.slice(0);
    let lastThree = currentScramble.range([currentScramble.length - 3, 0].max(), currentScramble.length);
    for (let b = 0; b < lastThree.length;  b++) {
      for (let i = 0; i < allowedMoves.length; i++) {
        if (!allowedMoves[i]) continue;
        if (allowedMoves[i].replace(/['2]/, "") === lastThree[b].replace(/['2]/, "")) {
          allowedMoves.splice(i, 1);
        }
      }
    }
    return allowedMoves;
  }
};

let OppositeRule = function() {
  this.apply = function(currentScramble, availableMoves, allowedMoves) {
    allowedMoves = allowedMoves.slice(0);
    let lastThree = currentScramble.range([currentScramble.length - 3, 0].max(), currentScramble.length);
    for (let i = 0; i < allowedMoves.length; i++) {
      for (let b = 0; b < lastThree.length; b++) {
        if (!allowedMoves[i]) continue;
        if (isOpposite(allowedMoves[i], lastThree[b])) {
          allowedMoves.splice(i, 1);
        }
      }
    }
    return allowedMoves;
  }
};

var moveMap = {
  'R': 'L',
  'U': 'D',
  'F': 'B'
}

function isOpposite(first, second) {
  first = first.replace(/['2]/, "");
  second = second.replace(/['2]/, "");
  return moveMap[first] === second || moveMap[second] === first;
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

function randomMoves(count = 19, availableMoves = defaultMoves, modifiers = "' 2", prefixes = "") {
  let scramble = "";
  let lastMove = "";
  availableMoves = availableMoves.split(" ");

  for (let i = 0; i < count; i++) {
    let move = lastMove;
    while (lastMove.includes(move))
      move = availableMoves.random();
    move += modifiers.split(" ").random() + " ";
    move = prefixes.split(" ").random() + move;
    lastMove = move;
    scramble += move;
  }
  return scramble;
}

function getNotation(puzzle, defaultNotation = "WCA") {
  return saveAccess("options.scrambling" + puzzle + "notation", defaultNotation);
}

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