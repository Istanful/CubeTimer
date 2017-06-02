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
  else
    loadLocalStorageSave();
}

function saveProgress() {
  if (isAuthorized)
    driveSave();
  else
    saveToLocalStorage();
}

// TODO Make me complete!
function getEmptySave() {
  return {
    times: {
      megaminx: []
    }
  }
}

function loadLocalStorageSave() {
  save = localStorage.eCubeTimer ? JSON.parse(localStorage.eCubeTimer) : getEmptySave();
  console.log("local storage loaded")
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

function saveAppData(fileId, appData) {
  return gapi.client.request({
    path: '/upload/drive/v3/files/' + fileId,
    method: 'PATCH',
    params: {
      uploadType: 'media'
    },
    body: JSON.stringify(appData)
  });
}

function destroyAppData(fileId) {
  return gapi.client.request({
    path: '/drive/v3/files/' + fileId,
    method: 'DELETE'
  });
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
    if (res.fileId)
      getAppDataFileContent(res.fileId).then(function(res) { save = JSON.parse(res.appData) });
    else
      save = getEmptySave();
  });
}

function driveSaveOrCreate() {
  getAppDataFile().then(function(res) {
    if (res.fileId)
      driveSave(res.fileId, save);
    else {
      createAppDataFile().then(function(res) {
        driveSave(res.fileId, save);
      });
    }
  });
}

function driveSave(fileId, data) {
  saveAppData(fileId, data);
}

handleClientLoad();
