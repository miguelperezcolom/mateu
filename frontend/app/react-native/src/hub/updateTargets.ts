/**
 * Where "Update Mateu" sends the person when no over-the-air update is waiting (pure, unit-tested).
 * A store build updates from its store; the APK attached to the GitHub releases (built by
 * .github/workflows/mobile.yml with MATEU_DISTRIBUTION=github) is not in any store, so it points
 * at the release page. The web build has nothing to install: the docs page.
 */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6829227403';
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=io.mateu.app';
export const GITHUB_RELEASES_URL = 'https://github.com/miguelperezcolom/mateu/releases/latest';
export const DOCS_URL = 'https://mateu.io';

/**
 * The over-the-air update channel a build asks for (app.config.ts → the native `expo-channel-name`
 * request header). The GitHub APK has its own: the release workflow publishes every update twice
 * (mobile.yml `ota`), to `production` for the store builds and to `github` stamped with
 * MATEU_DISTRIBUTION=github, so an update never makes the APK forget where it updates from.
 */
export function updateChannelFor(distribution: string | undefined): 'github' | 'production' {
  return distribution === 'github' ? 'github' : 'production';
}

/**
 * Where THIS binary came from. The running update's app config (`extra.distribution`) is the
 * update's, published once for the whole channel — after an over-the-air update the APK's would say
 * nothing (GA review S8). The update channel (expo-updates `Updates.channel`) is native configuration
 * of the binary that no update changes: it decides; the config's stamp only when there is no channel.
 */
export function distributionOf(channel: string | null | undefined, extra: { distribution?: unknown }): string | undefined {
  if (channel === 'github') return 'github';
  if (channel) return undefined;
  return typeof extra.distribution === 'string' ? extra.distribution : undefined;
}

export function storeUrlFor(platform: string, distribution: string | undefined): string {
  if (platform === 'ios') return APP_STORE_URL;
  if (platform === 'android') return distribution === 'github' ? GITHUB_RELEASES_URL : PLAY_URL;
  return DOCS_URL;
}
