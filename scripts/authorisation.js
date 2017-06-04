var GoogleAuth; // Google Auth object.
var isAuthorized;
var currentApiRequest;
var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var appDataFilename = "eCubetimer.json";
let save;

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    'apiKey': 'AIzaSyD3sqkN68H-p7_Rh1KgQBl9oozEDxdi1Tc',
    'clientId': '628862522438-f06i7s7etk5bmjitd6jecqg1lj6ksg2b.apps.googleusercontent.com',
    'scope': SCOPE,
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  }).then(function () {
    GoogleAuth = gapi.auth2.getAuthInstance();

    // Listen for sign-in state changes.
    GoogleAuth.isSignedIn.listen(updateSigninStatus);

    var user = GoogleAuth.currentUser.get();
    setSigninStatus();

    $("#sign-in").click(handleAuthClick);
    load();
  });
}

function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    // User is authorized and has clicked 'Sign out' button.
    GoogleAuth.signOut();
  } else {
    // User is not signed in. Start Google auth flow.
    GoogleAuth.signIn();
  }
}

function sendAuthorizedApiRequest(requestDetails) {
  currentApiRequest = requestDetails;
  if (isAuthorized) {
    // Make API request
    gapi.client.request(requestDetails)

    // Reset currentApiRequest variable.
    currentApiRequest = {};
  } else {
    GoogleAuth.signIn();
  }
}

function updateSigninStatus(isSignedIn) {
  setSigninStatus(isSignedIn);
}

function setSigninStatus(isSignedIn) {
  var user = GoogleAuth.currentUser.get();
  isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    $('#sign-in').html('Sign out');
  } else {
    $('#sign-in').html('Sign In/Authorize');
  }
}


function load() {
  if (isAuthorized)
    loadFromDrive();
  else {
    loadLocalStorageSave();
    initializeTimer();
  }
}

function reset() {
  destroyDriveData();
  destroyLocalData();
  location.reload();
}

function saveProgress() {
  if (isAuthorized)
    driveSaveOrCreate();
  /* Always save to local storage for backup */
  saveToLocalStorage()
}

// TODO Make me complete!
function getEmptySave() {
  let save = { sessions: {} };
  save.sessions[defaultSessionName] = {};
  save.sessions[defaultSessionName][defaultPuzzle] = {};
  save.sessions[defaultSessionName][defaultPuzzle].times = [];
  return save;
}

function loadLocalStorageSave() {
  save = localStorage.eCubeTimer ? JSON.parse(localStorage.eCubeTimer) : getEmptySave();
}

function saveToLocalStorage() {
  localStorage.setItem("eCubeTimer", JSON.stringify(save));
}

function createAppDataFile() {
  return gapi.client.drive.files
    .create({
      resource: {
        name: appDataFilename,
        parents: ['appDataFolder']
      },
      fields: 'id'
    }).then(function (data) {
      return {
        fileId: data.result.id
      };
    });
}

function getAppDataFile() {
  return gapi.client.drive.files
    .list({
      q: 'name="' + appDataFilename + '"',
      spaces: 'appDataFolder',
      fields: 'files(id)'
    }).then(
      function (data) {
        id = data.result.files.length == 0 ? null : data.result.files[0].id;

        return {
          fileId: id
        };
      }
    );
}

function destroyDriveData() {
  getAppDataFile().then(function(res) {
    return gapi.client.request({
      path: '/drive/v3/files/' + res.fileId,
      method: 'DELETE'
    });
  });
}

function destroyLocalData() {
  localStorage.clear();
}

function getAppDataFileContent(fileId) {
  return gapi.client.drive.files
    .get({
      fileId: fileId,
      // Download a file — files.get with alt=media file resource
      alt: 'media'
    }).then(function (data) {
      return {
        fileId: fileId,
        appData: data.result
      };
    });
}

function loadFromDrive() {
  getAppDataFile().then(function(res) {
    if (res.fileId) {
      getAppDataFileContent(res.fileId).then(function(res) {
        if (!res.appData)
          driveCreateSave(initializeTimer);
        else {
          save = res.appData;
          initializeTimer();
        }
      });
    }
    else {
      driveCreateSave(initializeTimer)
    }
  });
}

function driveSaveOrCreate() {
  getAppDataFile().then(function(res) {
    if (res.fileId) {
      driveSave(res.fileId, save);
    }
    else
      driveCreateSave();
  });
}

function driveCreateSave(callback) {
  save = getEmptySave();
  createAppDataFile().then(function(res) {
    driveSave(res.fileId, save, callback);
  });
}

function driveSave(fileId, data, callback = function() {}) {
  return gapi.client.request({
    path: '/upload/drive/v3/files/' + fileId,
    method: 'PATCH',
    params: {
      uploadType: 'media'
    },
    body: String(JSON.stringify(data))
  })
}

function syncTimes() {
  // Sync first
  getAppDataFile().then(function(res) {
    if (res.fileId) {
      getAppDataFileContent(res.fileId).then(function(res) {
        if (!res.appData) { return; }
        let other = res.appData;
        save.sessions[currentSession][currentPuzzle].times = mergeSessionTimes(save, other);
      });
    }

    // Then save
    return gapi.client.request({
      path: '/upload/drive/v3/files/' + res.fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: String(JSON.stringify(save))
    }).then(function() {
      populateTimesDrawer();
    });
  });
}

function mergeSessionTimes(first, second) {
  first = first.sessions[currentSession][currentPuzzle].times;
  second = second.sessions[currentSession][currentPuzzle].times;
  return first.jsonUniqueMerge(second);
}

handleClientLoad();
