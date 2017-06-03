let scramblers = {
  megaminx: function() {
    let scramble = "";
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 10; c++)
        scramble += ["R++", "R--"].random() + " ";
      scramble += ["U", "U'"].random() + "</br>";
    }
    return scramble;
  }
}
