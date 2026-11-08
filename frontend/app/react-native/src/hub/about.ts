// What "About Mateu" shows (pure, tested by node's runner): which app this is and which JavaScript it
// runs — the bundle built into the installable, or an over-the-air update and when it was published.
// That second half is the one a store version number never tells: two phones on the same 1.0.0 can run
// different code.

export interface AboutInfo {
  /** the app's version (app.json `version`, the store's "1.0.0") */
  version: string;
  /** the native build number (Android versionCode / iOS buildNumber), when the platform reports it */
  build?: string | number | null;
  /** the Mateu release the renderer comes from (`extra.mateuVersion`) */
  mateuVersion?: string | null;
  /** false in development and on the web: no over-the-air updates at all */
  updatesEnabled: boolean;
  /** true while the app runs the bundle built into the installable */
  embedded: boolean;
  updateId?: string | null;
  updateCreatedAt?: Date | null;
  channel?: string | null;
  runtimeVersion?: string | null;
}

export interface AboutRow { label: string; value: string }

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-07 23:05" in the device's time — the moment the update was published. */
export function publishedAt(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function aboutRows(i: AboutInfo): AboutRow[] {
  const rows: AboutRow[] = [
    { label: 'App version', value: i.build != null && `${i.build}` !== '' ? `${i.version} (${i.build})` : i.version },
  ];
  if (i.mateuVersion) rows.push({ label: 'Mateu', value: i.mateuVersion });
  if (!i.updatesEnabled) {
    rows.push({ label: 'Running', value: 'This build does not take updates' });
    return rows;
  }
  if (i.embedded || !i.updateId) {
    rows.push({ label: 'Running', value: 'The code built into the app (no update applied yet)' });
  } else {
    const when = i.updateCreatedAt ? ` · published ${publishedAt(i.updateCreatedAt)}` : '';
    rows.push({ label: 'Running', value: `Update ${i.updateId.slice(0, 8)}${when}` });
  }
  if (i.channel) rows.push({ label: 'Update channel', value: i.channel });
  if (i.runtimeVersion) rows.push({ label: 'Runtime', value: i.runtimeVersion });
  return rows;
}

export type CheckState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'downloading' }
  | { kind: 'latest' }
  | { kind: 'pending' }
  | { kind: 'failed'; message: string }
  | { kind: 'disabled' };

/** The line under the button, or null while nothing has been asked. */
export function checkMessage(s: CheckState): string | null {
  switch (s.kind) {
    case 'checking': return 'Looking for an update…';
    case 'downloading': return 'Downloading the update…';
    case 'latest': return 'You have the latest version.';
    case 'pending': return 'An update is ready. Restart Mateu to use it.';
    case 'failed': return `Could not check for updates: ${s.message}`;
    case 'disabled': return 'This build does not take over-the-air updates.';
    default: return null;
  }
}
