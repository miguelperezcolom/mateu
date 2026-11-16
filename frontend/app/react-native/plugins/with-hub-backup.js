// Android Auto Backup keeps the hub's list of UIs and never the secure store (rules and reasons in
// ./hub-backup-rules.js). expo-secure-store's own rules are turned off in app.json
// (`configureAndroidBackup: false`): they back up shared preferences only, not the list.
const fs = require('fs');
const path = require('path');
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const { applyToApplication, resourceFiles } = require('./hub-backup-rules');

module.exports = (config) => {
  config = withDangerousMod(config, [
    'android',
    (c) => {
      const dir = path.join(c.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(dir, { recursive: true });
      for (const [name, content] of Object.entries(resourceFiles())) fs.writeFileSync(path.join(dir, name), content);
      return c;
    },
  ]);
  return withAndroidManifest(config, (c) => {
    applyToApplication(AndroidConfig.Manifest.getMainApplicationOrThrow(c.modResults));
    return c;
  });
};
