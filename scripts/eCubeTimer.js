let currentPuzzle = "megaminx";
let currentSession = "Session 1";
let currentScramble;

let lastTimeStarted;
let lastTimeDuration;
let timerIntervalId;
let timerState = 0; /* 0 idle, 1 inspection, 2 running, 3 stopping */

document.addEventListener("keyup", handleTimer);
document.addEventListener("keydown", handleTimer);

initialize();

function handleTimer(ev) {
  if (ev.which == 32) {
    if (timerState == 0 && ev.type == "keyup")
      startTimer();
    else if (timerState == 2 && ev.type == "keydown")
      stopTimer();
    else if (timerState == 3 && ev.type == "keyup") {
      timerState = 0;
      saveTime();
    }
  }
}

function startTimer() {
  lastTimeStarted = new Date().getTime();
  lastTimeDuration = null;
  timerIntervalId = setInterval(updateTimer, 10);
  timerState = 2;
}

function stopTimer() {
  clearInterval(timerIntervalId);
  lastTimeDuration = new Date().getTime() - lastTimeStarted;
  updateScramble();
  timerState = 3;
}

function updateTimer() {
  let time = new Date().getTime() - lastTimeStarted;
  $("#time").text(formatTime(time));
}

function formatTime(time) {
  let cs = time % 1000;
  let s = time % (1000 * 60) - cs;
  let m = time - s - cs;

  // Since the values returned above is suffixed
  // we have to divide afterwards
  cs = Math.floor(cs / 10);
  s = Math.floor(s / 1000);
  m = Math.floor(m / (1000 * 60));


  return (m > 0 ? m + ":" : "") + (s < 10 && m > 0 ? "0" + s : s) + "." + (cs < 10 ? "0" + cs : cs);
}

function parseTime(time) {
  let regexMatch = time.match(/(?:(\d+):)*(\d+).(\d{2})/);
  let m = parseInt(regexMatch[1] || 0) * 60 * 1000;
  let s = parseInt(regexMatch[2] || 0) * 1000;
  let ms = parseInt(regexMatch[3] || 0) * 10;
  return m + s + ms;
}

function saveTime() {
  if (!save.sessions[currentSession]) {
      save.sessions[currentSession] = {
        puzzle: currentPuzzle,
        times: []
      }
  }
  save.sessions[currentSession].times.push(
    {
      started_at: lastTimeStarted,
      duration: lastTimeDuration
    }
  );
}

function updateScramble() {
  currentScramble = scramblers[currentPuzzle]();
  $("#scramble").html(currentScramble);
}

function initialize() {
  updateScramble();
}
