/* Google functions
-------------------------------------------------------------------------------------------*/
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
        if (data.result.files.length == 0) {
          throw "no files found";
        }

        return {
          fileId: data.result.files[0].id
        }
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
