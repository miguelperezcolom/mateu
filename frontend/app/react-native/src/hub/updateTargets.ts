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

export function storeUrlFor(platform: string, distribution: string | undefined): string {
  if (platform === 'ios') return APP_STORE_URL;
  if (platform === 'android') return distribution === 'github' ? GITHUB_RELEASES_URL : PLAY_URL;
  return DOCS_URL;
}
