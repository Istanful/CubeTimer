
function updateScramble() {
  currentScramble = scramblers[currentPuzzle]().break();
  $("#scramble").html(currentScramble);
}

function buildTimeMarkup(time) {
  let li = document.createElement("li");
  li.innerHTML = "<span>" + formatTime(time.duration) + "</span>" +
                 "<span style='float: right'>" + new Date(time.started_at).format() + "</span>";
  return li;
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

function updateStats() {
  let stats = getStats().break();
  $("#stats").html(stats);
}