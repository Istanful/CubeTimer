var GoogleAuth; // Google Auth object.
var isAuthorized;
var currentApiRequest;
var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var appDataFilename = "eCubetimer.json";

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
