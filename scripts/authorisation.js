/*===========================================================
  Authorisation
===========================================================*/
var GoogleAuth; // Google Auth object.
var isAuthorized;
var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var appDataFilename = "eCubetimer.json";
var storage;
var save;
var currentUser;
var saveManager;

loadUser(function(user) {
  currentUser = user;
  updateSignInButton(currentUser.isAuthorized());
  currentUser.onStatusChange(updateSignInButton);
  saveManager = new SaveManager(currentUser);
  saveManager.load(initializeTimer);
});
document.getElementById("sign-in").addEventListener("click", handleAuthClick);

function loadUser(callback) {
  if (navigator.onLine) {
    gapi.load('client:auth2', function() {
      initGapClient().then(function() {
        callback(new OnlineUser(gapi));
      });
    });
  } else {
    callback(new LocalUser());
  }
}

function initGapClient() {
  return gapi.client.init({
    'apiKey': 'AIzaSyD3sqkN68H-p7_Rh1KgQBl9oozEDxdi1Tc',
    'clientId': '628862522438-f06i7s7etk5bmjitd6jecqg1lj6ksg2b.apps.OnlineUsercontent.com',
    'scope': SCOPE,
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  });
}

function handleAuthClick() {
  if (currentUser.isAuthorized()) {
    currentUser.googleAuth.signOut();
  } else {
    currentUser.googleAuth.signIn();
  }
}

function updateSignInButton(authorized) {
  if (authorized) {
    document.getElementById("sign-in").innerHTML = 'Sign out';
  } else {
    document.getElementById("sign-in").innerHTML = 'Sign In';
  }
}
