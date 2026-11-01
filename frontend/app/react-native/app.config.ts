import type { ConfigContext, ExpoConfig } from 'expo/config';
import { applyVariant, type VariantEnv } from './src/core/buildVariant.ts';

/**
 * Build-variant overrides on top of app.json (which holds the production-safe defaults).
 *
 * The `development` EAS profile (APP_VARIANT=development, set in eas.json) talks to a backend on
 * the LAN over plain http — so ONLY that variant allows cleartext traffic (Android
 * usesCleartextTraffic, iOS local-networking ATS exception) and gets its own application id, so it
 * installs side by side with the store build. Preview and production builds stay https-only.
 * Local `expo start` (Expo Go / web) is unaffected: Expo Go has its own manifest.
 *
 * MATEU_VARIANT=hub (default) | fixed picks what the installable is — the hub of the user's own UIs,
 * or a white-label app bound to one UI (src/core/buildVariant.ts, docs ux-patterns/mobile-app.md).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = applyVariant(config as ExpoConfig, process.env as VariantEnv);
  // An APK built outside EAS (the GitHub release workflow, .github/workflows/mobile.yml) has no remote
  // build number: the workflow passes one, and it must only grow for the APK to install as an update.
  const versionCode = Number(process.env.MATEU_ANDROID_VERSION_CODE);
  const versioned: ExpoConfig = Number.isInteger(versionCode) && versionCode > 0
    ? { ...variant, android: { ...variant.android, versionCode } }
    : variant;
  // What the hub's compatibility check knows of this build (src/hub/compat.ts, appUpdate.ts): the
  // Mateu release its renderer comes from (MATEU_VERSION, set by the release workflows — also for
  // an over-the-air update, which carries its own app config) and where it updates from
  // (MATEU_DISTRIBUTION=github for the APK on the GitHub releases; a store build otherwise).
  const stamped = Object.fromEntries(
    [
      ['mateuVersion', process.env.MATEU_VERSION?.trim()],
      ['distribution', process.env.MATEU_DISTRIBUTION?.trim()],
    ].filter(([, v]) => !!v),
  );
  const base: ExpoConfig = Object.keys(stamped).length
    ? { ...versioned, extra: { ...(versioned.extra ?? {}), ...stamped } }
    : versioned;
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
