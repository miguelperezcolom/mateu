/**
 * Where an app shell's HOME content is loaded from. A shell opened on a link to a REMOTE screen
 * (a federated console's /fed/stock) comes back with that screen mounted as its home: an ABSOLUTE
 * `homeBaseUrl` (the remote's) and the remote's view type. Loaded from the shell's own backend, the
 * shell refused the remote's type (403) — the same rule the web client applies
 * (libs/mateu appContentTarget.ts): an absolute home base wins; a relative one is the app's own.
 */
export function remoteHomeBaseUrl(app: { homeBaseUrl?: string | null }, ownBaseUrl?: string): string | undefined {
  const home = app.homeBaseUrl ?? '';
  if (!/^https?:\/\//i.test(home)) return undefined;
  return ownBaseUrl && trim(home) === trim(ownBaseUrl) ? undefined : home;
}

const trim = (url: string) => url.replace(/\/+$/, '');
