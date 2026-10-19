/**
 * "Connect AI" (live UI push, conformance/mcp/README.md): the pairing flow behind the drawer entry
 * and its modal, as a model (unit-tested) the component only paints.
 *
 *   idle ──Connect──▶ requesting ──`_agent-pair`──▶ code (countdown) ──0 s──▶ expired
 *                                     │                 │ the channel says paired
 *                                     ▼                 ▼
 *                                   error             idle (connected: the agents' labels)
 *   connected ──Disconnect──▶ disconnecting ──`_agent-unpair`──▶ idle (the channel confirms)
 */
import { AGENT_PAIR_ACTION, AGENT_UNPAIR_ACTION, agentErrorOf, agentPairingOf, agentsLine, type AgentPushState, type AgentStatus } from './agentPush.ts';

export type PairingPhase =
  | { name: 'idle' }
  | { name: 'requesting' }
  | { name: 'code'; code: string; expiresAt: number }
  | { name: 'expired' }
  | { name: 'disconnecting' }
  | { name: 'error'; message: string };

export const PAIRING_TEXTS = {
  title: 'Connect AI',
  connectedTitle: 'AI connected',
  instruction: 'Ask your agent to pair with this code (mateu_pair_session)',
  intro: 'Let an AI agent you use (through MCP) show screens and navigate in this app while it is open.',
  requesting: 'Asking for a pairing code…',
  expired: 'The pairing code expired.',
  notConnected: 'Not connected to the server yet; try again in a moment.',
  failed: 'Could not get a pairing code.',
  disconnectFailed: 'Could not disconnect.',
} as const;

/** "K7QF-4MZP" read one character at a time ("K 7 Q F, 4 M Z P"): a screen reader would otherwise
 *  try to pronounce it as a word. */
export function spokenCode(code: string): string {
  return code
    .split('-')
    .map((group) => group.replace(/\s+/g, '').split('').join(' '))
    .filter(Boolean)
    .join(', ');
}

export const secondsLeft = (expiresAt: number, now: number): number => Math.max(0, Math.ceil((expiresAt - now) / 1000));

/** 299 → "4:59". */
export const countdownText = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** 299 → "4 minutes 59 seconds", 60 → "1 minute", 5 → "5 seconds". */
export function countdownSpoken(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (s || !m) parts.push(`${s} second${s === 1 ? '' : 's'}`);
  return parts.join(' ');
}

export type PairingButton = { id: 'pair' | 'newCode' | 'unpair' | 'close'; label: string; primary: boolean; disabled?: boolean };

export interface PairingView {
  title: string;
  connected: boolean;
  /** "alice and an agent" when connected. */
  agents: string[];
  agentsText?: string;
  intro?: string;
  code?: string;
  codeLabel?: string;
  countdown?: string;
  countdownLabel?: string;
  instruction?: string;
  /** A progress line (requesting / disconnecting). */
  busy?: string;
  /** What went wrong, or that the code expired. */
  message?: string;
  buttons: PairingButton[];
}

/** What the modal shows for this phase + the channel's status at `now`. */
export function pairingView(phase: PairingPhase, status: AgentStatus, now: number): PairingView {
  const connected = status.paired;
  const agentsText = connected ? agentsLine(status.agents) : undefined;
  const view: PairingView = {
    title: connected ? PAIRING_TEXTS.connectedTitle : PAIRING_TEXTS.title,
    connected,
    agents: connected ? status.agents.map((a) => a || 'an agent') : [],
    agentsText,
    buttons: [],
  };
  const close: PairingButton = { id: 'close', label: 'Close', primary: false };
  switch (phase.name) {
    case 'code': {
      const left = secondsLeft(phase.expiresAt, now);
      view.code = phase.code;
      view.codeLabel = `Pairing code ${spokenCode(phase.code)}`;
      view.countdown = countdownText(left);
      view.countdownLabel = `Expires in ${countdownSpoken(left)}`;
      view.instruction = PAIRING_TEXTS.instruction;
      view.buttons = [{ id: 'newCode', label: 'New code', primary: false }, close];
      return view;
    }
    case 'requesting':
      view.busy = PAIRING_TEXTS.requesting;
      view.buttons = [close];
      return view;
    case 'disconnecting':
      view.busy = 'Disconnecting…';
      view.buttons = [close];
      return view;
    case 'expired':
    case 'error':
    case 'idle':
      if (phase.name === 'expired') view.message = PAIRING_TEXTS.expired;
      if (phase.name === 'error') view.message = phase.message;
      if (connected) {
        view.buttons = [
          { id: 'unpair', label: 'Disconnect', primary: true },
          { id: 'pair', label: 'Pair another agent', primary: false },
          close,
        ];
      } else {
        view.intro = PAIRING_TEXTS.intro;
        view.buttons = [{ id: 'pair', label: phase.name === 'expired' ? 'Get a new code' : 'Get a pairing code', primary: true }, close];
      }
      return view;
  }
}

/** The drawer entry: its text and what a screen reader calls it. */
export function connectAiEntry(status: AgentStatus): { text: string; label: string; connected: boolean } {
  if (!status.paired) return { text: 'Connect AI', label: 'Connect AI', connected: false };
  const who = agentsLine(status.agents);
  return { text: `AI connected · ${who}`, label: `AI connected to ${who}. Manage`, connected: true };
}

export interface PairingDeps {
  /** Runs an agent action (sync endpoint) with the UI session's id + secret; answers the increment. */
  run: (actionId: string) => Promise<unknown>;
  state: AgentPushState;
  now?: () => number;
}

/**
 * The flow (see the module comment). Every transition notifies the subscribers and may return a
 * sentence to announce. The pairing code dies when the channel reports one more agent paired (it
 * was used), when it runs out (`tick`), or when a new one is asked for.
 */
export class AgentPairingModel {
  private current: PairingPhase = { name: 'idle' };
  private agentsAtRequest = 0;
  private listeners = new Set<() => void>();
  private readonly now: () => number;
  private seq = 0;

  private readonly deps: PairingDeps;

  constructor(deps: PairingDeps) {
    this.deps = deps;
    this.now = deps.now ?? Date.now;
  }

  /** Follows the channel's status (a used code, a disconnect elsewhere); answers the detach. */
  attach(): () => void {
    return this.deps.state.subscribe(() => this.statusChanged());
  }

  get phase(): PairingPhase {
    return this.current;
  }

  view(now: number = this.now()): PairingView {
    return pairingView(this.current, this.deps.state.status, now);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Asks for a new one-time code (`_agent-pair`); answers what to announce. */
  async pair(): Promise<string> {
    const mine = ++this.seq;
    this.agentsAtRequest = this.deps.state.status.paired ? this.deps.state.status.agents.length : 0;
    this.set({ name: 'requesting' });
    try {
      const increment = await this.deps.run(AGENT_PAIR_ACTION);
      if (mine !== this.seq) return '';
      const { found, pairing } = agentPairingOf(increment);
      if (found && pairing) {
        this.set({ name: 'code', code: pairing.code, expiresAt: this.now() + pairing.expiresInSeconds * 1000 });
        return `Pairing code ${spokenCode(pairing.code)}. Expires in ${countdownSpoken(pairing.expiresInSeconds)}. ${PAIRING_TEXTS.instruction}`;
      }
      const error = agentErrorOf(increment);
      const message = error?.text || PAIRING_TEXTS.failed;
      this.set({ name: 'error', message });
      return message;
    } catch (e) {
      if (mine !== this.seq) return '';
      const message = `${PAIRING_TEXTS.failed} ${e instanceof Error ? e.message : String(e)}`.trim();
      this.set({ name: 'error', message });
      return message;
    }
  }

  /** Removes every pairing of the session (`_agent-unpair`); the channel confirms with a status. */
  async unpair(): Promise<string> {
    const mine = ++this.seq;
    this.set({ name: 'disconnecting' });
    try {
      const increment = await this.deps.run(AGENT_UNPAIR_ACTION);
      if (mine !== this.seq) return '';
      const error = agentErrorOf(increment);
      if (error) {
        this.set({ name: 'error', message: error.text || PAIRING_TEXTS.disconnectFailed });
        return error.text || PAIRING_TEXTS.disconnectFailed;
      }
      // the answer itself says it: don't wait for the channel's confirmation to repaint
      this.deps.state.setStatus({ paired: false, agents: [] });
      this.set({ name: 'idle' });
      return 'AI disconnected';
    } catch (e) {
      if (mine !== this.seq) return '';
      const message = `${PAIRING_TEXTS.disconnectFailed} ${e instanceof Error ? e.message : String(e)}`.trim();
      this.set({ name: 'error', message });
      return message;
    }
  }

  /** The countdown's clock: answers what to announce (expiry, the last 30 s) or ''. */
  tick(now: number = this.now()): string {
    const phase = this.current;
    if (phase.name !== 'code') return '';
    const left = secondsLeft(phase.expiresAt, now);
    if (left <= 0) {
      this.set({ name: 'expired' });
      return PAIRING_TEXTS.expired;
    }
    this.emit();
    return left === 30 ? 'The pairing code expires in 30 seconds' : '';
  }

  /** Closing the modal forgets a shown code's view (the code itself just runs out server-side). */
  reset(): void {
    this.seq++;
    if (this.current.name !== 'idle') this.set({ name: 'idle' });
  }

  private statusChanged(): void {
    const status = this.deps.state.status;
    if (this.current.name === 'code' && status.paired && status.agents.length > this.agentsAtRequest) {
      this.set({ name: 'idle' }); // the code was used
      return;
    }
    this.emit();
  }

  private set(phase: PairingPhase): void {
    this.current = phase;
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        /* keep the others */
      }
    });
  }
}
