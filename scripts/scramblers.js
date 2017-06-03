let defaultMoves = "R L F B D U ";
let wideMoves = defaultMoves.toLowerCase();
let threeWide = wideMoves.split(" ").map(function(el) { return 3 + el}).join(" ") + " ";

let scramblers = {
  "2x2x2": function() {
    return randomMoves(10)
  },
  "3x3x3": function() {
    return randomMoves();
  },
  "4x4x4": function() {
    return randomMoves(40, defaultMoves + wideMoves);
  },
  "5x5x5": function() {
    return randomMoves(60, defaultMoves + wideMoves);
  },
  "6x6x6": function() {
    return randomMoves(80, defaultMoves + wideMoves + threeWide);
  },
  "7x7x7": function() {
    return randomMoves(100, defaultMoves + wideMoves + threeWide);
  },
  skewb: function() {
    return randomMoves(11);
  },
  megaminx: function() {
    let scramble = "";
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 10; c++)
        scramble += ["R++", "R--"].random() + " ";
      scramble += ["U", "U'"].random() + "\n";
    }
    return scramble;
  }
}

function randomMoves(count = 19, availableMoves = defaultMoves) {
  let scramble = "";
  let lastMove = "";
  availableMoves = availableMoves.split(" ");

  for (let i = 0; i < count; i++) {
    let move = lastMove;
    while (lastMove.includes(move))
      move = availableMoves.random();
    move += [" ", "' ", "2 "].random();
    lastMove = move;
    scramble += move;
  }
  return scramble;
}
