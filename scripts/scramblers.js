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
      case "sign":
        return randomMoves(40, defaultMoves + signWideMoves);
      default:
        return randomMoves(40, defaultMoves + wcaWideMoves);
    }
  },
  "5x5x5": function() {
    return randomMoves(60, defaultMoves + signWideMoves);
  },
  "6x6x6": function() {
    return randomMoves(80, defaultMoves + signWideMoves + threeWide);
  },
  "7x7x7": function() {
    return randomMoves(100, defaultMoves + signWideMoves + threeWide);
  },
  skewb: function() {
    return randomMoves(11);
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
