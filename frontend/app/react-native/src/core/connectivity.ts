// Whether the backend can be reached — the RN port of libs/mateu's connectivity.ts. The platform's
// own "online" flag is a hard NEGATIVE only (it lies on captive portals); the positive comes from
// our own traffic: an answer means reachable, a request that never reached the network means not.
// The shell's offline strip listens here, and the way back is announced.

type Listener = (online: boolean) => void;

export class Connectivity {
  private online = true;
  private listeners = new Set<Listener>();

  get isOnline(): boolean {
    return this.online;
  }

  /** An answer came back (any status: the server was reached). */
  noteReachable(): void {
    this.set(true);
  }

  /** A request never reached the network. */
  noteUnreachable(): void {
    this.set(false);
  }

  /** The platform says it is offline, or that its link is back. A link back proves nothing about the
   *  server, but — like the web — the strip goes and the next request settles it. */
  notePlatform(online: boolean): void {
    this.set(online);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(online: boolean): void {
    if (this.online === online) return;
    this.online = online;
    for (const l of [...this.listeners]) l(online);
  }
}

/** The process-wide connectivity (one network per device). */
export const connectivity = new Connectivity();
