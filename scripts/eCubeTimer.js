let defaultSessionName = "Main";
let defaultPuzzle = "3x3x3";
let currentPuzzle;
let currentSession;

let currentScramble;
let lastTimeStarted;
let lastTimeDuration;
let timerIntervalId;
let timerState = 0; /* 0 idle, 1 inspection, 2 running, 3 stopping */
let defaultStartKeys = [32, 0];

document.addEventListener("keyup", handleTimer);
document.addEventListener("keydown", handleTimer);

function handleTimer(ev) {
  let evUp = ev.type == "keyup";
  let evDown = !evUp;

  if (startKeys().contains(ev.which) && timerState == 0 && evUp)
    startTimer();
  else if (willStopTimer(ev.which) && timerState == 2 && evDown)
    stopTimer();
  else if (willStopTimer(ev.which) && timerState == 3 && evUp) {
    timerState = 0;
    saveTime();
  }
}

function willStopTimer(keycode) {
	return saveAccess("save.options.mashStop", true) || startKeys().contains(keycode);
}

function startKeys() {
  return saveAccess("options.startKeys", defaultStartKeys);
}

document.getElementById("timerSection").addEventListener("touchstart", handleTouch);
document.getElementById("timerSection").addEventListener("touchend", handleTouch);
let touchStart;

function handleTouch(ev) {
  let maxDistance = 10;

  switch (ev.type) {
    case "touchstart":
      if (timerState == 2)
        stopTimer();
      touchStart = { x: ev.changedTouches[0].pageX, y: ev.changedTouches[0].pageY };
      break;
    case "touchend":
      let delta = { x: touchStart.x - ev.changedTouches[0].pageX,
                    y: touchStart.y - ev.changedTouches[0].pageY };
      if (Math.abs(delta.x) < maxDistance &&
          Math.abs(delta.y) < maxDistance &&
          timerState == 0)
            startTimer();
      else if (timerState == 3) {
          timerState = 0;
          saveTime();
      }
  }
}

function startTimer() {
  lastTimeStarted = new Date().getTime();
  lastTimeDuration = null;
  if (saveAccess("options.timerUpdating", true) == true)
    timerIntervalId = setInterval(updateTimer, 10);
  else
    $("#time").text("Running");
  timerState = 2;
}

function stopTimer() {
  if (saveAccess("options.timerUpdating", true) == true)
    clearInterval(timerIntervalId);
  lastTimeDuration = new Date().getTime() - lastTimeStarted;
  $("#time").text(formatTime(lastTimeDuration));
  updateScramble();
  saveProgress();
  timerState = 3;
}

function updateTimer() {
  let time = new Date().getTime() - lastTimeStarted;
  $("#time").text(formatTime(time));
}

function formatTime(time) {
  if (time == -1) { return "N/A" }
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
  times = save.sessions[currentSession][currentPuzzle].times;
  times.push(
    {
      scramble: currentScramble,
      started_at: lastTimeStarted,
      duration: lastTimeDuration
    }
  );
  $("#times").prepend(buildTimeMarkup(times.last(), times.length))
  syncTimes();
  updateStats();
}

function initializeTimer() {
  currentPuzzle = saveAccess("lastPuzzle", defaultPuzzle);
  currentSession = saveAccess("lastSession", defaultSessionName);
  createOrChooseSession(currentSession);
  populateSessionSelects();
  $("#newSession").click(promptNewSession);
  $("#resetSession").click(function() { promptResetSession(currentSession) });
}

function promptNewSession() {
  let name = prompt("Please enter session name");
  if (name != null && name != "")
    createOrChooseSession(name);
}

function promptResetSession(session) {
  let categories = Object.keys(save.sessions[session]).join("\n");
  let confirmed = confirm('Are you sure you want to delete the session "' + session + '"?\n\n' +
                        'It will delete all times in the following categories: \n' +
                        categories
                        );
  if (confirmed) {
    deleteSession(session);
    saveProgress();
  }
}

function deleteSession(name) {
  delete save.sessions[name];
  let session = Object.keys(save.sessions)[0];
  createOrChooseSession(session || defaultSessionName);
  updateSelectValues("session", save.sessions, session);
  updateStats();
  saveProgress();
}

function createOrChooseSession(session = currentSession, puzzle = currentPuzzle) {
  currentSession = session;
  currentPuzzle = puzzle;
  saveCurrentSession();

  if (!save.sessions[session]) {
    save.sessions[session] = {};
    $("#session .selectBody").append(buildOption(session, clickSessionButton));
    $("#session .selectedOption").html(session);
    saveProgress();
  }
  if (!save.sessions[session][puzzle]) {
    save.sessions[session][puzzle] = {}
    save.sessions[session][puzzle].times = [];
  }

  populateTimesDrawer();
  updateScramble();
  updateStats();
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

function deleteTime(date, session = currentSession, puzzle = currentPuzzle) {
  save.sessions[session][puzzle].times.remove(date, "started_at");
  populateTimesDrawer();
  updateStats();
  saveProgress();
}

function saveCurrentSession() {
  save.lastPuzzle = currentPuzzle;
  save.lastSession = currentSession;
}
