/*===========================================================
  GUI
===========================================================*/
function updateScramble() {
  currentScramble = scramblers[currentPuzzle]().break();
  document.getElementById("scramble").innerHTML = currentScramble;
}

function buildTimeMarkup(time, date) {
  let tr = document.createElement("tr");
  tr.innerHTML = "<td>" + formatTime(time.duration) + "</td>" +
                 "<td>" + new Date(time.started_at).format() + "</td>" +
                 "<td class='delete-time' data-date='" + date + "'>✕</td>";
  tr.childNodes[tr.childNodes.length - 1].addEventListener("click", function(ev) {
    let confirmed = confirm("Are you sure you want to delete the time: " + formatTime(time.duration) + "?");
    if (confirmed)
      deleteTime(parseInt(ev.target.dataset.date));
  });
  return tr;
}

function populateTimesDrawer() {
  let markup = document.getElementById("times");
  let times = saveAccess(`sessions.${currentSession}.${currentPuzzle}.times`, []);
  markup.innerHTML = "";

  for (let i = 0; i < times.length; i++) {
    markup.insertBefore(buildTimeMarkup(times[i], times[i].started_at),
      markup.childNodes[0]);
  }
}

function closeSelects() {
  let selecting = document.getElementsByClassName("selecting");
  if (selecting.length != 0)
    for (let i = 0; i < selecting.length; i++)
      selecting[i].removeClass("selecting")
}

function populateSelect(id, data, defaultOption, onSelection = function(el) { }) {
  let select = document.getElementById(id);
  console.log(select);

  updateSelectValues(id, data, defaultOption, onSelection);
  select.addEventListener("click", function() { select.toggleClass("selecting"); });
}

function updateSelectValues(id, data, defaultOption, onSelection = function(el) {}) {
  let select = document.getElementById(id);
  let selectBody = select.getElementsByClassName("selectBody")[0];
  selectBody.innerHTML = "";
  let selected = select.getElementsByClassName("selectedOption")[0];
  selected.innerHTML = defaultOption;

  for (let option in data)
    selectBody.insertBefore(buildOption(option, onSelection),
      selectBody.childNodes[0]);
}


function buildOption(name, onSelection) {
  let option = document.createElement("div");
  option.className = "selectOption";
  option.innerHTML = name;
  option.addEventListener("click", function() {
      option.parentNode.parentNode
            .getElementsByClassName("selectedOption")[0].innerHTML = this.innerHTML;
      onSelection(option);
  });
  return option;
}

function fetchSessionInfo() {
  currentPuzzle = document.querySelector("#puzzle .selectedOption").innerHTML;
  currentSession = document.querySelector("#session .selectedOption").innerHTML;
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
    // Adding times backwards since the newest imported is the last in the list

  syncTimes();
}
document.getElementById("import-times").addEventListener("click", promptTimesImport);

function updateStats() {
  let stats = getStats().break();
  document.getElementById("stats").innerHTML = stats;
  alignTimerSection();
}

function alignTimerSection() {
  let statsHeight = document.getElementById("statsSection").offsetHeight;
  let newHeight = window.innerHeight - statsHeight;
  document.getElementById("timerSection").style.height = newHeight + "px";
}
window.addEventListener("resize", alignTimerSection);
document.getElementById("statsSection").addEventListener("resize", alignTimerSection);

function shine(element) {
  element.addClass("shine");
  setTimeout(function() {
    element.removeClass("shine");
  }, 200);
}
function copyScramble() {
  shine(document.getElementById("scramble"));
  copyToClipboard(currentScramble.format());
}
document.getElementById("copy-scramble").addEventListener("click", copyScramble);
