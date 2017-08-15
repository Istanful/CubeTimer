document.addEventListener('timer:initialize', function() {
  let canvas        = document.getElementById("graph");
  let ctx           = canvas.getContext("2d");
  let padding       = 10;
  let maxDuration;
  let times;
  let count;
  let min;

  function generateGraph() {
    scaleGraph();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setVariables();
    beginPath();
    times.forEach(function(time, i) {
      ctx.lineTo(relativeX(i), relativeY(time.duration));
    });
    ctx.lineTo(canvas.clientWidth, canvas.clientHeight);
    ctx.closePath();
    ctx.fill();
  }

  function beginPath() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.clientHeight);
    ctx.lineTo(0, relativeY(times[0]));
  }

  function relativeY(value) {
    let proportion = value / maxDuration;
    let maxHeight = canvas.height - padding * 2;
    return canvas.clientHeight - (maxHeight * proportion + padding);
  }

  function relativeX(index) {
    let proportion = index / (count - 1);
    return canvas.clientWidth * proportion;
  }

  function setVariables() {
    times         = save.sessions[currentSession][currentPuzzle].times;
    count         = times.length;
    maxDuration   = times.max("duration");
    minDuration   = times.min("duration");
  }

  function scaleGraph() {
    canvas.width = $("#statsSection")[0].scrollWidth;
    canvas.height = $("#statsSection")[0].scrollHeight / 2;
  }

  generateGraph();
  document.addEventListener('times:reload', generateGraph);
});
