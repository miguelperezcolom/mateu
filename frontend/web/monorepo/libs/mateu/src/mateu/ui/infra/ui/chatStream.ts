/**
 * The chat's SSE stream, read as SSE — by EVENT, not by line — and turned into what the panel shows:
 * the answer, the token bar and a progress line while the agent works.
 *
 * Pure and DOM-free so it is testable on its own; mateu-chat.ts drives it. The Redwood renderer has
 * the same logic in apps/redwood/poc/chat.mjs — keep the two in step.
 *
 * What a payload can be:
 *  - `{"inputTokens":…,"outputTokens":…,"totalTokens":…}` — usage (all-zero ones are placeholders
 *    from older agents and are ignored);
 *  - `{"event":"agent-delta","detail":{"text":"…"}}` — a piece of the answer, APPENDED;
 *  - `{"event":"agent-status","detail":{"phase":"…","text":"…"}}` — what the agent is doing;
 *  - `{"event":"agent-tool","detail":{"name","server","kind","phase":"start|end","ms","error"}}`;
 *  - `{"event":"agent-error","detail":{"message":"…"}}` — shown as the answer;
 *  - any other `{"event":…}` — a UI event, dispatched by the panel (navigation-requested, …);
 *  - anything else — answer text. After deltas, the first one is the whole, final answer and
 *    REPLACES them; without deltas it is the line-per-event contract agents have always used, and
 *    each one is a line of the answer.
 */

export interface TokenUsage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}

export type ChatStreamMessage =
    | { kind: 'usage'; usage: TokenUsage }
    | { kind: 'delta'; text: string }
    | { kind: 'text'; text: string }
    | { kind: 'status'; detail: AgentStatusDetail }
    | { kind: 'tool'; detail: AgentToolDetail }
    | { kind: 'error'; message: string }
    | { kind: 'event'; event: string; detail: unknown };

export interface AgentStatusDetail {
    phase?: string;
    text?: string;
    [key: string]: unknown;
}

export interface AgentToolDetail {
    name?: string;
    server?: string;
    kind?: string;
    phase?: 'start' | 'end' | string;
    ms?: number;
    error?: string;
}

/**
 * An SSE parser (the WHATWG event-stream format, minus `retry`): feed it text as it arrives, in
 * pieces of any size, and it returns the data of every event a blank line has completed. An event's
 * `data:` lines are joined with '\n'; only the one optional space after `data:` is dropped, so the
 * indentation of a markdown line survives; comment lines (`:keep-alive`) and other fields are
 * ignored. `end()` returns an event the stream ended without a blank line after.
 */
export class SseParser {
    private buffer = '';
    private data: string[] = [];
    private hasData = false;

    push(text: string): string[] {
        this.buffer += text;
        const out: string[] = [];
        for (;;) {
            const m = /\r\n|\r|\n/.exec(this.buffer);
            if (!m) break;
            // A '\r' that ends the buffer may be the first half of a '\r\n' split across pieces.
            if (m[0] === '\r' && m.index === this.buffer.length - 1) break;
            const line = this.buffer.slice(0, m.index);
            this.buffer = this.buffer.slice(m.index + m[0].length);
            this.line(line, out);
        }
        return out;
    }

    end(): string[] {
        const out: string[] = [];
        if (this.buffer) {
            this.line(this.buffer.replace(/\r$/, ''), out);
            this.buffer = '';
        }
        this.dispatch(out);
        return out;
    }

    private line(line: string, out: string[]) {
        if (line === '') {
            this.dispatch(out);
            return;
        }
        if (line.startsWith(':')) return;
        const colon = line.indexOf(':');
        const field = colon < 0 ? line : line.slice(0, colon);
        if (field !== 'data') return;
        let value = colon < 0 ? '' : line.slice(colon + 1);
        if (value.startsWith(' ')) value = value.slice(1);
        this.data.push(value);
        this.hasData = true;
    }

    private dispatch(out: string[]) {
        if (this.hasData) out.push(this.data.join('\n'));
        this.data = [];
        this.hasData = false;
    }
}

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** What one event's data is. */
export function classifyChatPayload(payload: string): ChatStreamMessage {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
        let obj: Record<string, unknown> | null = null;
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) obj = parsed;
        } catch {
            // not JSON: text
        }
        if (obj) {
            if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) {
                return { kind: 'usage', usage: obj as TokenUsage };
            }
            if (typeof obj.event === 'string') {
                const detail = (obj.detail ?? {}) as Record<string, unknown>;
                switch (obj.event) {
                    case 'agent-delta':
                        return { kind: 'delta', text: typeof detail.text === 'string' ? detail.text : '' };
                    case 'agent-status':
                        return { kind: 'status', detail: detail as AgentStatusDetail };
                    case 'agent-tool':
                        return { kind: 'tool', detail: detail as AgentToolDetail };
                    case 'agent-error':
                        return { kind: 'error', message: String(detail.message ?? 'Error desconocido del agente') };
                    default:
                        return { kind: 'event', event: obj.event, detail: obj.detail ?? {} };
                }
            }
        }
    }
    return { kind: 'text', text: payload };
}

/** A usage object that says nothing: every counter it has is zero (older agents' placeholders). */
export function isEmptyUsage(usage: TokenUsage | null | undefined): boolean {
    if (!usage) return true;
    const values = [usage.inputTokens, usage.outputTokens, usage.totalTokens].filter(isNumber);
    return values.length === 0 || values.every(v => v === 0);
}

/** The answer of one turn, as the stream builds it. */
export class ChatAnswer {
    text = '';
    /** Deltas have been shown since the last full text: the next text event replaces them. */
    private streamed = false;

    delta(piece: string): string {
        this.text += piece;
        this.streamed = true;
        return this.text;
    }

    line(text: string): string {
        if (this.streamed) {
            this.text = text;
            this.streamed = false;
        } else {
            this.text = this.text ? this.text + '\n' + text : text;
        }
        return this.text;
    }

    error(message: string): string {
        this.text = '⚠️ ' + message;
        this.streamed = false;
        return this.text;
    }
}

/** One tool call the agent made in this turn. */
export interface ChatToolStep {
    name: string;
    server?: string;
    kind?: string;
    ms?: number;
    error?: string;
    /** Still running. */
    running: boolean;
}

/** What the agent is doing, as the status and tool events say. */
export class ChatProgress {
    phase?: string;
    statusText?: string;
    /** When the current phase, tool or answer started (ms). */
    since: number;
    steps: ChatToolStep[] = [];
    /** Text is arriving: the agent is answering, not thinking. */
    answering = false;
    /** Whether the agent has sent any progress at all (older agents do not). */
    reported = false;

    constructor(now: number) {
        this.since = now;
    }

    status(detail: AgentStatusDetail, now: number) {
        this.reported = true;
        const text = typeof detail.text === 'string' ? detail.text : undefined;
        if (detail.phase !== this.phase || text !== this.statusText || this.answering) this.since = now;
        this.phase = detail.phase;
        this.statusText = text;
        this.answering = false;
    }

    tool(detail: AgentToolDetail, now: number) {
        this.reported = true;
        const name = detail.name ?? 'herramienta';
        if (detail.phase === 'start') {
            this.steps = [...this.steps, { name, server: detail.server, kind: detail.kind, running: true }];
            this.since = now;
            this.answering = false;
            return;
        }
        // end: the last running call of that name
        const steps = this.steps.slice();
        let i = steps.length - 1;
        while (i >= 0 && !(steps[i].running && steps[i].name === name)) i--;
        const done: ChatToolStep = { name, server: detail.server, kind: detail.kind, ms: detail.ms, error: detail.error, running: false };
        if (i >= 0) steps[i] = done; else steps.push(done);
        this.steps = steps;
        this.since = now;
    }

    text(now: number) {
        if (!this.answering) this.since = now;
        this.answering = true;
    }

    get runningTool(): ChatToolStep | undefined {
        for (let i = this.steps.length - 1; i >= 0; i--) if (this.steps[i].running) return this.steps[i];
        return undefined;
    }

    /**
     * The one line under the conversation: the tool being called, «Respondiendo…» while text
     * arrives, or the phase the agent said — with the seconds it has been at it once there are
     * any. Null when the agent reported nothing (the panel keeps its own «Thinking… Ns»).
     */
    line(now: number): string | null {
        const secs = Math.max(0, Math.floor((now - this.since) / 1000));
        const withSecs = (s: string) => (secs > 0 ? `${s} ${secs} s` : s);
        const running = this.runningTool;
        if (running) return withSecs(`Llamando a ${running.name}…`);
        if (this.answering) return 'Respondiendo…';
        if (!this.reported) return null;
        return withSecs(this.statusText || 'Pensando…');
    }
}

/** «1,2 s», «850 ms»: a tool call's duration, short. */
export function formatToolDuration(ms: number | undefined): string {
    if (!isNumber(ms)) return '';
    return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}
