// The app posts LOCAL notifications only (src/core/osNotifications.ts): no push service, no token.
// expo-notifications' plugin still writes the iOS push entitlement (`aps-environment`), which would
// make the build ask for the Push Notifications capability it never uses — this removes it. It must
// be listed BEFORE expo-notifications in app.json: entitlement mods run last-registered first.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = (config) =>
  withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
