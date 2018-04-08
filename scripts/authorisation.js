/*===========================================================
  Storage
===========================================================*/
// #region
var GoogleDriveStorage = function(gapi) {
  this.gapi = gapi;
  this.load = function(callback) {
    this.getFileId().then(function(fileId) {
      this.getSaveContent(fileId).then(callback);
    }.bind(this));
  };

  this.save = function(save, callback = function() { console.log('saved'); }) {
    this.getFileId().then(function(fileId) {
      return this.gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: String(JSON.stringify(save))
      }).then(callback);
    });
  };

  this.clear = function() {
    this.getFileId().then(function(fileId) {
      return this.gapi.client.request({
        path: '/drive/v3/files/' + fileId,
        method: 'DELETE'
      });
    });
  };

  this.getSaveContent = function(fileId) {
    return this.gapi.client.drive.files
      .get({
        fileId: fileId,
        alt: 'media'
      }).then(function (data) {
        return data.result;
      });
  };

  this.getFileId = function() {
    return this.gapi.client.drive.files
      .list({
        q: 'name="' + appDataFilename + '"',
        spaces: 'appDataFolder',
        fields: 'files(id)'
      }).then(
        function (data) {
          if (data.result.files.length == 0) {
            return this.createSave();
          } else {
            return data.result.files[0].id;
          }
        }.bind(this)
      );
  };

  this.createSave = function() {
    return gapi.client.drive.files
      .create({
        resource: {
          name: appDataFilename,
          parents: ['appDataFolder']
        },
        fields: 'id'
      }).then(function (data) {
        return data.result.id;
      });
  };
};

var LocalStorage = function() {
  this.load = function(callback) {
    if (!localStorage.eCubeTimer) return callback(null);
    var data = JSON.parse(localStorage.eCubeTimer);
    callback(data);
  };

  this.save = function(save, callback = function() {}) {
    localStorage.setItem("eCubeTimer", JSON.stringify(save));
    callback();
  };

  this.clear = function() {
    localStorage.clear();
  };
};
// #endregion

/*===========================================================
  Authorisation
===========================================================*/
var GoogleAuth; // Google Auth object.
var isAuthorized;
var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var appDataFilename = "eCubetimer.json";
var storage;
let save;

if (navigator.onLine) {
  gapi.load('client:auth2', function() {
    initGapClient().then(function() {
      GoogleAuth = gapi.auth2.getAuthInstance();
      GoogleAuth.isSignedIn.listen(updateSigninStatus);
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();
      document.getElementById("sign-in").addEventListener("click", handleAuthClick);
      load();
    });
  });
} else {
  load();
}

function initGapClient() {
  return gapi.client.init({
    'apiKey': 'AIzaSyD3sqkN68H-p7_Rh1KgQBl9oozEDxdi1Tc',
    'clientId': '628862522438-f06i7s7etk5bmjitd6jecqg1lj6ksg2b.apps.googleusercontent.com',
    'scope': SCOPE,
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  });
}

function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    GoogleAuth.signOut();
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
    document.getElementById("sign-in").innerHTML = 'Sign out';
  } else {
    document.getElementById("sign-in").innerHTML = 'Sign In';
  }
}

/*===========================================================
  Save actions
===========================================================*/
function currentStorage() {
  if (isAuthorized){  return new GoogleDriveStorage(gapi); }
  return new LocalStorage();
}

function load() {
  currentStorage().load(function(data) {
    save = data || getEmptySave();
    initializeTimer();
  });
}

function saveProgress() {
  currentStorage().save(save);
}

// TODO Make me complete!
function getEmptySave() {
  let save = { sessions: {} };
  save.sessions[defaultSessionName] = {};
  save.sessions[defaultSessionName][defaultPuzzle] = {};
  save.sessions[defaultSessionName][defaultPuzzle].times = [];
  save.options = {};
  save.options.startKeys = [32, 0];
  return save;
}

function syncTimes() {
  currentStorage().save(save);
}
