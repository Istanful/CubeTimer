/*===========================================================
  Save actions
===========================================================*/
var SaveManager = function(user) {
  this.currentUser = user;
  this.load = function(callback) {
    this.storage().load(function(data) {
      save = data || getEmptySave();
      callback(data);
    });
  };

  this.storage = function() {
    return this.currentUser.storage();
  };

  this.save = function(data) {
    this.storage().save(data);
  };

  this.clear = function() {
    this.storage().clear();
  }
};

function getEmptySave() {
  var save = { sessions: {} };
  save.sessions[defaultSessionName] = {};
  save.sessions[defaultSessionName][defaultPuzzle] = {};
  save.sessions[defaultSessionName][defaultPuzzle].times = [];
  save.options = {};
  save.options.startKeys = [32, 0];
  return save;
}
