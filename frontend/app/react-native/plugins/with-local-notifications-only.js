// A build WITHOUT iOS remote push (the default: no APNs key in the EAS credentials) posts LOCAL
// notifications only (src/core/osNotifications.ts). expo-notifications' plugin still writes the iOS
// push entitlement (`aps-environment`), which would make the build ask for the Push Notifications
// capability it cannot use — this removes it. MATEU_IOS_PUSH=true drops this plugin from the build
// (src/core/pushConfig.ts). It must be listed BEFORE expo-notifications in app.json: entitlement mods
// run last-registered first.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = (config) =>
  withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
