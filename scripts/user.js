var LocalUser = function() {
  this.storage = function() {
    return new LocalStorage();
  };

  this.isAuthorized = function() {
    return false;
  };

  this.onStatusChange = function(callback) {
    callback(this.isAuthorized());
  };
};

var OnlineUser = function(gapi) {
  this.gapi = gapi;
  this.googleAuth = gapi.auth2.getAuthInstance();

  this.storage = function() {
    if (this.isAuthorized()) {
      return new GoogleDriveStorage(this.gapi);
    } else {
      return new LocalStorage();
    }
  };

  this.isAuthorized = function() {
    return this.remoteUser().hasGrantedScopes(SCOPE);
  };

  this.remoteUser = function() {
    return this.googleAuth.currentUser.get();
  };

  this.onStatusChange = function(callback) {
    this.googleAuth.isSignedIn.listen(callback);
  };
};
