import Constants from 'expo-constants';

/**
 * The build's deep-link scheme (`expo.scheme`): `mateu` for the hub, the app's own for a fixed build
 * (src/core/buildVariant.ts). Its own module so the units that need it (oidc.ts) can be tested with
 * a mock of THIS file — the unit tests run without node_modules, where `expo-constants` is not there.
 */
export function appScheme(): string | undefined {
  const scheme = Constants.expoConfig?.scheme;
  return Array.isArray(scheme) ? scheme[0] : scheme;
}
