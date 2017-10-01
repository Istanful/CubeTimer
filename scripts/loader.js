// Load all scripts, firing callback when each script is done
function loadScripts(scripts) {
  var i = 0;
  var callback = function() {
    if (i++ < scripts.length - 1) {
      loadScript(scripts[i], callback);
    }
  }
  // Load first script
  loadScript(scripts[0], callback);
}

// Load script and fire callback when done
function loadScript(fileName, callback) {
  let script = document.createElement("script");
  script.type = "text/javascript";

  // IE detect script done
  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState == "loaded") {
        script.readyState == "loaded";
        script.onreadystatechange = null;
        callback();
      }
    }
  }
  // All other browsers detect script done
  else {
    script.onload = function() {
      callback();
    }
  }

  script.src = "scripts/" + fileName;
  document.getElementsByTagName("head")[0].append(script);
}

let scripts = [
  "convenience.js",
  "cubeTimerGUI.js",
  "scramblers.js",
  "authorisation.js",
  "cubetimer.js",
  "graph.js"
];

loadScripts(scripts);
