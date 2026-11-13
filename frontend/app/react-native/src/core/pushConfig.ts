/**
 * What a build needs for REMOTE push (core/remotePush.ts), read from the build's environment so a
 * build without the credentials still works — it simply gets no push token.
 *
 * ONLY a `fixed` build (MATEU_VARIANT=fixed, src/core/buildVariant.ts) can have remote push: the
 * pushes of an app go out under ITS store identity (APNs team + bundle, Firebase project), so the
 * hub — Mateu's own app, which opens anybody's UI — would make every server its users add send as
 * Mateu. Whoever wants push distributes their own app with their own credentials (owner decision
 * 2026-11-13). A hub build ignores the credentials below and never asks for a push token; its
 * notifications stay local (core/osNotifications.ts) and in the in-app inbox.
 *
 * The decision travels in `extra.remotePush` (true only when set up here): the app binds its token
 * source only then (src/context/AppContext.tsx), so a binary built before this rule — or any hub —
 * running newer JS over the air never registers a token either.
 *
 * The credentials of a fixed build:
 *
 * - Android: `GOOGLE_SERVICES_JSON` = the path of the Firebase `google-services.json` (an EAS
 *   "file" environment variable) → `android.googleServicesFile`. Without it FCM is not set up and
 *   `getExpoPushTokenAsync` fails (caught: no registration).
 * - iOS: `MATEU_IOS_PUSH=true` keeps the push entitlement (`aps-environment`) that
 *   ./plugins/with-local-notifications-only otherwise removes — set it once the APNs key is in the
 *   EAS credentials, or the build asks for a capability the profile lacks. `production` mode except
 *   for the `development` variant.
 *
 * Pure (unit-tested); app.config.ts applies it.
 */
import type { ExpoConfig } from 'expo/config';

export interface PushEnv {
  GOOGLE_SERVICES_JSON?: string;
  MATEU_IOS_PUSH?: string;
  APP_VARIANT?: string;
}

const LOCAL_ONLY_PLUGIN = './plugins/with-local-notifications-only';

const pluginName = (p: unknown): unknown => (Array.isArray(p) ? p[0] : p);

/** Pure: the build was set up for remote push (see above). */
export const remotePushEnabled = (extra: Record<string, unknown> | null | undefined): boolean =>
  extra?.['remotePush'] === true;

export function applyPushConfig(config: ExpoConfig, env: PushEnv): ExpoConfig {
  // the hub never has remote push, whatever the environment carries
  if (config.extra?.['mateuVariant'] !== 'fixed') return config;
  let out = config;
  const googleServices = env.GOOGLE_SERVICES_JSON?.trim();
  const iosPush = env.MATEU_IOS_PUSH?.trim() === 'true';
  if (googleServices) out = { ...out, android: { ...out.android, googleServicesFile: googleServices } };
  if (iosPush) {
    const mode = env.APP_VARIANT === 'development' ? 'development' : 'production';
    const plugins = (out.plugins ?? [])
      .filter((p) => pluginName(p) !== LOCAL_ONLY_PLUGIN)
      .map((p) =>
        pluginName(p) === 'expo-notifications'
          ? ['expo-notifications', { ...((Array.isArray(p) ? p[1] : undefined) ?? {}), mode }]
          : p,
      ) as ExpoConfig['plugins'];
    out = { ...out, plugins };
  }
  if (googleServices || iosPush) out = { ...out, extra: { ...(out.extra ?? {}), remotePush: true } };
  return out;
}
