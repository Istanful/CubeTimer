let scramblers = {
  "3x3": function() {
    let scramble = "";
    let lastMove = "";
    let availableMoves = "RLUDFB".split("");
    for (let i = 0; i < 19; i++) {
      let move = lastMove;
      while (move == lastMove)
        move = availableMoves.random();
      move += [" ", "' "].random();
      lastmove = move;
      scramble += move;
    }
    return scramble;
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
