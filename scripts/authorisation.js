/*===========================================================
  Authorisation
===========================================================*/
var GoogleAuth; // Google Auth object.
var isAuthorized;
var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var appDataFilename = "eCubetimer.json";
var storage;
var save;
var saveManager = new SaveManager();

if (navigator.onLine) {
  gapi.load('client:auth2', function() {
    initGapClient().then(function() {
      GoogleAuth = gapi.auth2.getAuthInstance();
      GoogleAuth.isSignedIn.listen(updateSigninStatus);
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();
      document.getElementById("sign-in").addEventListener("click", handleAuthClick);
      saveManager.load(initializeTimer);
    });
  });
} else {
  saveManager.load(initializeTimer);
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
