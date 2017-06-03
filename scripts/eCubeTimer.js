let defaultPuzzle = "3x3x3";
let defaultSessionName = "Main";
let currentPuzzle = defaultPuzzle;
let currentSession = defaultSessionName;

let currentScramble;
let lastTimeStarted;
let lastTimeDuration;
let timerIntervalId;
let timerState = 0; /* 0 idle, 1 inspection, 2 running, 3 stopping */

document.addEventListener("keyup", handleTimer);
document.addEventListener("keydown", handleTimer);

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
  saveProgress();
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
  save.sessions[currentSession][currentPuzzle].times.push(
    {
      scramble: currentScramble,
      started_at: lastTimeStarted,
      duration: lastTimeDuration
    }
  );
  $("#times").prepend(buildTimeMarkup(save.sessions[currentSession][currentPuzzle].times.last()))
  saveProgress();
}

function updateScramble() {
  currentScramble = scramblers[currentPuzzle]().replace(/\n/g, "<br />");
  $("#scramble").html(currentScramble);
}

function populateTimesDrawer() {
  let times = save.sessions[currentSession][currentPuzzle].times;
  $("#times").empty();

  for (let i = 0; i < times.length; i++) {
    $("#times").prepend(buildTimeMarkup(times[i]));
  }
}

function buildTimeMarkup(time) {
  let li = document.createElement("li");
  li.innerHTML = "<span>" + formatTime(time.duration) + "</span>" +
                 "<span style='float: right'>" + new Date(time.started_at).format() + "</span>";
  return li;
}

function initializeTimer() {
  populateSessionSelects();
  $("#newSession").click(promptNewSession);
  $("#resetSession").click(function() { promptResetSession(currentSession) });
  updateScramble();
  populateTimesDrawer();
}

function populateSessionSelects() {
  let action = function() {
    fetchSessionInfo();
    createOrChooseSession();
  }

  populateSelect("puzzle", scramblers, currentPuzzle, action);
  populateSelect("session", save.sessions, currentSession, action);
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
  if (confirmed)
    deleteSession(session);
}

function deleteSession(name) {
  delete save.sessions[name];
  let session = Object.keys(save.sessions)[0];
  createOrChooseSession(session || defaultSessionName);
  updateSelectValues("session", save.sessions, session);
}

function createOrChooseSession(session = currentSession, puzzle = currentPuzzle) {
  currentSession = session;
  currentPuzzle = puzzle;

  if (!save.sessions[session])
    save.sessions[session] = {};
  if (!save.sessions[session][puzzle]) {
    save.sessions[session][puzzle] = {}
    save.sessions[session][puzzle].times = [];
  }

  populateTimesDrawer();
  updateScramble();
}

function fetchSessionInfo() {
  currentPuzzle = $("#puzzle .selectedOption").html();
  currentSession = $("#session .selectedOption").html();
}

/* Inputs
-------------------------------------------------------------------------------------------*/

function closeSelects() {
  let selecting = document.getElementsByClassName("selecting");
  if (selecting.length != 0)
    $(".selecting").removeClass("selecting");
}

function populateSelect(id, data, defaultOption, onSelection = function(el) { }) {
  updateSelectValues(id, data, defaultOption, onSelection);
  activateSelect(id, onSelection)
}

function updateSelectValues(id, data, defaultOption, onSelection = function(el) {}) {
  let select = $("#" + id);
  let selectBody = select.find(".selectBody");
  selectBody.html("");
  let selected = select.find(".selectedOption");
  selected.html(defaultOption);

  for (let option in data)
    selectBody.prepend(buildOption(option, onSelection));
}

function activateSelect(id, onSelection) {
  let select = $("#" + id);
  let selectBody = select.find(".selectBody");
  select.click(function() {
    $(this).toggleClass("selecting");
  });

  $(selectBody).children().each(function() {
    $(this).click(function() {
      select.find(".selectedOption").html($(this).html());
      onSelection(this);
    });
  })
}

function buildOption(name, onSelection) {
  let optionMarkup = document.createElement("div");
  optionMarkup.className = "selectOption";
  optionMarkup.innerHTML = name;
  return optionMarkup;
}
