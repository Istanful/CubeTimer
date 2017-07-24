function updateScramble() {
  currentScramble = scramblers[currentPuzzle]().break();
  $("#scramble").html(currentScramble);
}

function buildTimeMarkup(time, date) {
  let li = document.createElement("li");
  li.innerHTML = "<span style='float: left'>" + formatTime(time.duration) + "</span>" +
                 "<span>" + new Date(time.started_at).format() + "</span>" +
                 "<span class='delete-time' data-date='" + date + "'>✕</span>";
  li.childNodes[li.childNodes.length - 1].addEventListener("click", function(ev) {
    let confirmed = confirm("Are you sure you want to delete the time: " + formatTime(time.duration) + "?");
    if (confirmed)
      deleteTime(parseInt(ev.target.dataset.date));
  });
  return li;
}

function populateTimesDrawer() {
  let times = saveAccess(`sessions.${currentSession}.${currentPuzzle}.times`, []);
  $("#times").empty();

  for (let i = 0; i < times.length; i++) {
    $("#times").prepend(buildTimeMarkup(times[i], times[i].started_at));
  }
}

function closeSelects() {
  let selecting = document.getElementsByClassName("selecting");
  if (selecting.length != 0)
    $(".selecting").removeClass("selecting");
}

function populateSelect(id, data, defaultOption, onSelection = function(el) { }) {
  updateSelectValues(id, data, defaultOption, onSelection);
  $("#" + id).click(function() { $(this).toggleClass("selecting"); });
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


function buildOption(name, onSelection) {
  let option = document.createElement("div");
  option.className = "selectOption";
  option.innerHTML = name;
  $(option).click(function() {
      $(option).parent().parent().find(".selectedOption").html($(this).html());
      onSelection(option);
  });
  return option;
}

function fetchSessionInfo() {
  currentPuzzle = $("#puzzle .selectedOption").html();
  currentSession = $("#session .selectedOption").html();
}

function clickSessionButton() {
  fetchSessionInfo();
  createOrChooseSession();
}

function populateSessionSelects() {
  populateSelect("puzzle", scramblers, currentPuzzle, clickSessionButton);
  populateSelect("session", save.sessions, currentSession, clickSessionButton);
}

function promptTimesImport() {
  let times = window.prompt("Please enter the times to import separated by ','");
  if (!times) { return; }
  times = times.replace(/[^\d:.,\s]/g, "");  // Remove noise
  times = times.split(",");                 // Split times
  for (let i = times.length - 1; i >= 0; i-=1)
    addTime(times[i]);
    // addTime(times[i]);  // Adding times backwards since the newest imported is the last in the list

  syncTimes();
}
$("#import-times").click(promptTimesImport);

function updateStats() {
  let stats = getStats().break();
  $("#stats").html(stats);
  alignTimerSection();
}

function alignTimerSection() {
  let statsHeight = document.getElementById("statsSection").offsetHeight;
  let newHeight = window.innerHeight - statsHeight;
  document.getElementById("timerSection").style.height = newHeight + "px";
}
$(window).resize(alignTimerSection);
$("#statsSection").resize(alignTimerSection);
