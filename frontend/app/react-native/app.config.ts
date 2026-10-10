import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Build-variant overrides on top of app.json (which holds the production-safe defaults).
 *
 * The `development` EAS profile (APP_VARIANT=development, set in eas.json) talks to a backend on
 * the LAN over plain http — so ONLY that variant allows cleartext traffic (Android
 * usesCleartextTraffic, iOS local-networking ATS exception) and gets its own application id, so it
 * installs side by side with the store build. Preview and production builds stay https-only.
 * Local `expo start` (Expo Go / web) is unaffected: Expo Go has its own manifest.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (process.env.APP_VARIANT !== 'development') return base;

  const plugins = (base.plugins ?? []).map((p) =>
    Array.isArray(p) && p[0] === 'expo-build-properties'
      ? ['expo-build-properties', { ...(p[1] ?? {}), android: { ...((p[1] ?? {}).android ?? {}), usesCleartextTraffic: true } }]
      : p,
  ) as ExpoConfig['plugins'];

  return {
    ...base,
    name: `${base.name} (dev)`,
    ios: {
      ...base.ios,
      bundleIdentifier: `${base.ios?.bundleIdentifier}.dev`,
      infoPlist: { ...(base.ios?.infoPlist ?? {}), NSAppTransportSecurity: { NSAllowsLocalNetworking: true } },
    },
    android: { ...base.android, package: `${base.android?.package}.dev` },
    plugins,
  };
};
