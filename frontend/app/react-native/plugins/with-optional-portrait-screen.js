// ML Kit's barcode scanner (the QR scanner behind expo-camera) ships an invisible delegate activity
// locked to portrait. Android then IMPLIES a required `android.hardware.screen.portrait` feature,
// which keeps the app off tablets, Chromebooks and Android XR — and Google Play refuses to send such
// a release to review ("Las declaraciones de funciones de hardware obligatorias están restringiendo
// la disponibilidad de tu aplicación", 1.0.1 / 200003). The app itself runs in any orientation
// (app.json `orientation: default`): declare the feature explicitly as NOT required.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

module.exports = (config) =>
  withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    const features = (manifest['uses-feature'] = manifest['uses-feature'] ?? []);
    const declared = features.find((f) => f.$?.['android:name'] === FEATURE);
    if (declared) {
      declared.$['android:required'] = 'false';
    } else {
      features.push({ $: { 'android:name': FEATURE, 'android:required': 'false' } });
    }
    return c;
  });
