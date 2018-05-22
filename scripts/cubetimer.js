/*===========================================================
  Variables
===========================================================*/
let defaultSessionName = "Main";
let defaultPuzzle = "3x3x3";
let currentPuzzle;
let currentSession;

let currentScramble;
let lastTimeStarted;
let lastTimeDuration;
let timerIntervalId;
let timerState = 0; /* 0 idle, 1 holding, 2 inspection, 3 running, 4 stopping */
var defaultStartKeys = [32, 0];

/*===========================================================
  Timer management
===========================================================*/
var TimerController = function() {
  this.onKeyDown = function(ev) {
    if (timerState === 3) { stopTimer(); }
    else { timerState = 1; }
  }

  this.onTouchDown = function(ev) {
    this.onKeyDown(ev);
  }

  this.onKeyUp = function(ev) {
    if (timerState === 1) { startTimer(); }
    else { timerState = 0; }
  }

  this.onTouchUp = function(ev) {
    this.onKeyUp(ev);
  }
}
var timerController = new TimerController();

function startTimer() {
  lastTimeStarted = new Date().getTime();
  lastTimeDuration = null;
  if (saveAccess("options.timerUpdating", true) == true)
    timerIntervalId = setInterval(updateTimer, 10);
  else
    document.getElementById("time").innerHTML = "Running";
  timerState = 3;
}

function stopTimer() {
  if (saveAccess("options.timerUpdating", true) == true)
    clearInterval(timerIntervalId);
  lastTimeDuration = new Date().getTime() - lastTimeStarted;
  addTime(lastTimeDuration, lastTimeStarted, currentScramble);
  document.getElementById("time").innerHTML = formatTime(lastTimeDuration);
  saveManager.save(save);
  timerState = 4;
}

function updateTimer() {
  let time = new Date().getTime() - lastTimeStarted;
  document.getElementById("time").innerHTML = formatTime(time);
}

document.addEventListener("keyup", handleTimer);
document.addEventListener("keydown", handleTimer);

function handleTimer(ev) {
  let evUp = ev.type == "keyup";
  let evDown = !evUp;
  if (!startKeys().contains(ev.which)) { return; }
  if (evUp) { timerController.onKeyUp(); }
  else { timerController.onKeyDown(); }
  updateTimerClass();
}

document.getElementById("timerSection").addEventListener("touchstart", handleTouch);
document.getElementById("timerSection").addEventListener("touchend", handleTouch);

let touchStart;
function handleTouch(ev) {
  if (ev.target.id == "copy-scramble") return; // Refactor me when more controls
  let maxDistance = 10;

  switch (ev.type) {
    case "touchstart":
      touchStart = { x: ev.changedTouches[0].pageX, y: ev.changedTouches[0].pageY };
      timerController.onTouchDown(ev);
      break;
    case "touchend":
      let delta = { x: touchStart.x - ev.changedTouches[0].pageX,
                    y: touchStart.y - ev.changedTouches[0].pageY };
      if (Math.abs(delta.x) < maxDistance &&
        Math.abs(delta.y) < maxDistance) {
        timerController.onTouchUp(ev);
      }
  }
  updateTimerClass();
}

function startKeys() {
  return saveAccess("options.startKeys", defaultStartKeys);
}

function updateTimerClass() {
  let timer = document.getElementById("timerSection");
  timer.className = timer.className.replace(/ *timer-state-\d/, " ");
  timer.className += "timer-state-" + timerState;
}

function addTime(time, startedAt, scramble) {
  duration = parseTime(time);
  times = save.sessions[currentSession][currentPuzzle].times;
  times.push(
    {
      scramble: scramble,
      started_at: startedAt || (new Date().getTime() - duration),
      duration: duration
    }
  );
  updateView();
}

function deleteTime(date, session = currentSession, puzzle = currentPuzzle) {
  save.sessions[session][puzzle].times.remove(date, "started_at");
  saveManager.save(save);
  updateView();
}

function saveCurrentSession() {
  save.lastPuzzle = currentPuzzle;
  save.lastSession = currentSession;
}

/*===========================================================
  Time formatting
===========================================================*/
function formatTime(time) {
  if (time == -1) { return "N/A" }
  time = +time;
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
  if (!isNaN(time)) { return time; }
  let regexMatch = time.match(/(?:(\d+):)*(\d+).(\d{2})/);
  let m = parseInt(regexMatch[1] || 0) * 60 * 1000;
  let s = parseInt(regexMatch[2] || 0) * 1000;
  let ms = parseInt(regexMatch[3] || 0) * 10;
  return m + s + ms;
}

/*===========================================================
  GUI
===========================================================*/

function updateView() {
  updateScramble();
  populateTimesDrawer();
  updateStats();
  generateGraph();
}

function promptNewSession() {
  let name = prompt("Please enter session name");
  if (name != null && name != "")
    createOrChooseSession(name);
}

function promptClearSession(session) {
  let confirmed = confirm(`Are you sure you want to delete all ${currentPuzzle} times in "` + session + `"?`);
  if (confirmed) {
    clearSession(session);
    saveManager.save(save);
  }
}

function clearSession(name) {
  save.sessions[name][currentPuzzle].times = [];
  let session = Object.keys(save.sessions)[0];
  createOrChooseSession(session || defaultSessionName);
  updateSelectValues("session", save.sessions, session);
  updateStats();
  saveManager.save(save);
}

function createOrChooseSession(session = currentSession, puzzle = currentPuzzle) {
  currentSession = session;
  currentPuzzle = puzzle;
  saveCurrentSession();

  if (!save.sessions[session]) {
    save.sessions[session] = {};
    document.querySelector("#session .selectBody").appendChild(buildOption(session, clickSessionButton));
    document.querySelector("#session .selectedOption").innerHTML = session;
    saveManager.save(save);
  }
  if (!save.sessions[session][puzzle]) {
    save.sessions[session][puzzle] = {}
    save.sessions[session][puzzle].times = [];
  }

  updateView();
}

function initializeTimer() {
  currentPuzzle = saveAccess("lastPuzzle", defaultPuzzle);
  currentSession = saveAccess("lastSession", defaultSessionName);
  createOrChooseSession(currentSession);
  populateSessionSelects();
  document.getElementById("newSession").addEventListener("click", promptNewSession);
  document.getElementById("resetSession").addEventListener("click",
    function() { promptClearSession(currentSession) });
}

// Access or create key
function saveAccess(keys, defaultValue = {}) {
  keys = keys.split(".");
  return accessNext(save, keys, 0, defaultValue);
}

function accessNext(obj, keys, index, value) {
  let key = keys[index];
  if (typeof obj[key] == 'undefined' && index < keys.length - 1) {
    obj[key] = {};
    return accessNext(obj[key], keys, index + 1, value);
  }
  else if (typeof obj[key] != 'undefined' && index < keys.length - 1)
    return accessNext(obj[key], keys, index + 1, value);
  else if (typeof obj[key] == 'undefined' && index == keys.length - 1) {
    obj[key] = value;
    return obj[key];
  }
  return obj[key];
}

/*===========================================================
  Stats
===========================================================*/
function getStats(options = {}) {
  let times = save.sessions[currentSession][currentPuzzle].times;

  let stats = "";
  let averages = options.averages || [5, 12];

  stats += options.count || "Number of solves: " + times.length + "\n";
  stats += options.best || "Best: " + times.min("duration").formatTime() + "\n";
  stats += options.worst || "Worst: " + times.max("duration").formatTime() + "\n";

  for (let i = 0; i < averages.length; i++) {
    let current = getAverage(times.length - averages[i], times.length).formatTime();
    stats += options.currentAvg || "Current avg" + averages[i] + ": " + current + "\n"
    stats += options.bestAvg || "Best avg" + averages[i] + ": " + bestAverage(averages[i]).formatTime() + "\n";
  }
  stats += options.sessionAvg || "Session average: " + getAverage(0, times.length).formatTime();
  return stats;
}

function getAverage(start = 0, end = 2, times = save.sessions[currentSession][currentPuzzle].times) {
  if (end - start > times.length) { return -1 }
  return calcAverage(times.range(start, end));
}

function bestAverage(count, times = save.sessions[currentSession][currentPuzzle].times) {
  if (count > times.length) { return -1 }
  let averages = [];
  for (let i = 0; i <= times.length - count; i++)
    averages.push(getAverage(i, i + count));
  return averages.min("duration");
}

function calcAverage(times) {
  if (times.length < 3) { return -1; }
  let sum = times.sum("duration") -
            times.min("duration") -
            times.max("duration");
  return sum / [times.length - 2, 1].max();
}
