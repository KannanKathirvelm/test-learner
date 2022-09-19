const fs = require('fs');
const config = require('../ionic.config.json');

module.exports = function() {
  deeplinkHostUpdate();
};

// Function used to update the deeplink host
function deeplinkHostUpdate() {
  let packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  packageJSON.cordova.plugins['ionic-plugin-deeplinks'].DEEPLINK_HOST = config.deeplinkHost;
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2), 'utf-8');
}
