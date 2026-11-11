/**
 * What a build needs for REMOTE push (core/remotePush.ts), read from the build's environment so a
 * build without the credentials still works — it simply gets no push token:
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

export function applyPushConfig(config: ExpoConfig, env: PushEnv): ExpoConfig {
  let out = config;
  const googleServices = env.GOOGLE_SERVICES_JSON?.trim();
  if (googleServices) out = { ...out, android: { ...out.android, googleServicesFile: googleServices } };
  if (env.MATEU_IOS_PUSH?.trim() === 'true') {
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
  return out;
}
