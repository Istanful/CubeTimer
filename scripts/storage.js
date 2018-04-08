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
