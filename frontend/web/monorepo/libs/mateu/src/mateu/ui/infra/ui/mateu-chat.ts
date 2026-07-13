import {customElement, property, query, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
import {nanoid} from "nanoid";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import {neutralButtonStyles, iconClose, iconMicrophone} from "./neutralChrome";
import "./mateu-markdown";

/** One chat message (design-system-neutral replacement for Vaadin's MessageListItem). */
export interface ChatMessageItem {
    text?: string;
    time?: string;
    userName?: string;
    userColorIndex?: number;
}

/** Avatar colors by userColorIndex (index 1 = user, 2 = agent, see addMessage). */
const USER_COLORS = ['#e91e63', '#1676f3', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const avatarColor = (index: number | undefined) =>
    USER_COLORS[Math.abs(index ?? 0) % USER_COLORS.length];

const initials = (userName: string | undefined) =>
    (userName ?? '?').split(/\s+/).filter(s => s).map(s => s[0]).slice(0, 2).join('').toUpperCase() || '?';

/** Minimal interface for the browser SpeechRecognition API (not universally typed in lib.dom). */
interface SpeechRecognitionLike {
    lang: string;
    continuous?: boolean;
    interimResults?: boolean;
    onend: (() => void) | null;
    onresult: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
    start(): void;
    stop(): void;
}

/** A flattened, LLM-friendly entry describing one navigable screen. */
interface MenuContextEntry {
    /** Breadcrumb path, e.g. ["Bookings", "List"] */
    path: string[];
    /** Optional human-readable description of what this screen is for. */
    description?: string;
    /** The navigation-requested detail payload to use in the SSE response */
    navigation: {
        route: string;
        consumedRoute: string;
        actionId: string;
        baseUrl: string;
        serverSideType: string | undefined;
        uriPrefix: string | undefined;
    };
}

@customElement('mateu-chat')
export class MateuChat extends LitElement {

    /** Supplied by the host: a snapshot of what the user is looking at (route, states). */
    @property({attribute: false})
    contextProvider?: () => unknown;

    @property()
    sseUrl: string | undefined

    /** Menu passed from the app shell; used to build LLM context. */
    @property({ attribute: false })
    menu: MenuOption[] = [];

    readonly chatSessionId: string = nanoid();
    private menuContextSent = false;

    @property()
    items: ChatMessageItem[] = []

    @query('.scroll-container')
    scrollContainer?: HTMLElement;

    @query('.msg-input')
    messageInputElement?: HTMLInputElement;

    @state()
    recognition: SpeechRecognitionLike | undefined

    @state()
    listening: boolean = false

    @state()
    recognitionAvailable: boolean = false;

    @state()
    loading: boolean = false;

    @state()
    elapsedSeconds: number = 0;

    private _elapsedTimer: ReturnType<typeof setInterval> | undefined;

    @state()
    tokenUsage: { inputTokens?: number; outputTokens?: number; totalTokens?: number } | undefined;


    startListening = () => {
        if (this.recognition) {
            if (this.listening) {
                this.recognition.stop();
                this.listening = false;
            } else {
                this.recognition.start();
                this.listening = true;
            }
        }
    }

    onSpeechResult = (event: Event) => {
        if (this.recognition) {
            // Obtener el texto procesado
            const speechEvent = event as Event & { results: SpeechRecognitionResultList }
            const transcript = speechEvent.results[speechEvent.results[0].length - 1][0].transcript;
            if (this.messageInputElement) {
                this.messageInputElement.value = transcript; // Poner el texto en el input
                this.send(new CustomEvent('submit', {
                    detail: {
                        value: transcript
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();

// Comprobar si el navegador es compatible
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;


        if (SpeechRecognition) {
            const recognition: SpeechRecognitionLike = new SpeechRecognition() as SpeechRecognitionLike;
            this.recognition = recognition;
            recognition.lang = 'es-ES'; // Configuramos el idioma a español
            //recognition.continuous = true;
            //recognition.interimResults = true;

            recognition.onend = () => {
                setTimeout(() => {
                    if (this.listening && this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                        }
                    }
                }, 250)
            };

            this.recognitionAvailable = true;

            recognition.onresult = this.onSpeechResult;

            recognition.onerror = (event: Event) => {
                console.error("Error de reconocimiento: " + (event as Event & { error: string }).error);
                if (this.listening && this.recognition) {
                    setTimeout(() => {
                        this.recognition!.start();
                    }, 250)
                }
            };
        } else {
        }

    }

    private scrollBottom() {
        setTimeout(() => {
            if (this.scrollContainer) {
                this.scrollContainer.scrollTo({
                    top: this.scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 0);
    }

    private addMessage(text: string, role: string): number {
        const msg: ChatMessageItem = {
            text,
            time: new Date().toLocaleTimeString(),
            userName: role.includes('agent') ? 'Asistente' : 'Tú',
            userColorIndex: role.includes('agent') ? 2 : 1,
        };
        this.items = [...this.items, msg];
        this.scrollBottom();
        return this.items.length - 1;
    }

    // Creates a NEW item object so Lit always detects the change (=== comparison).
    private updateMessage(idx: number, text: string) {
        this.items = this.items.map((item, i) =>
            i === idx ? { ...item, text } : item
        );
        this.scrollBottom();
    }

    /**
     * Returns {event, detail} if the payload is a JSON object with an "event" string field,
     * otherwise null. The "detail" field is optional and defaults to {}.
     */
    private tryParseCustomEvent(payload: string): { event: string; detail: unknown } | null {
        const trimmed = payload.trim();
        if (!trimmed.startsWith('{')) return null;
        try {
            const obj = JSON.parse(trimmed);
            if (typeof obj.event === 'string') {
                return { event: obj.event, detail: obj.detail ?? {} };
            }
        } catch {
            // not valid JSON
        }
        return null;
    }

    /** Returns the parsed token-usage object if the data payload is JSON with token fields, otherwise null. */
    private tryParseTokenUsage(payload: string): { inputTokens?: number; outputTokens?: number; totalTokens?: number } | null {
        const trimmed = payload.trim();
        if (!trimmed.startsWith('{')) return null;
        try {
            const obj = JSON.parse(trimmed);
            if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) {
                return obj;
            }
        } catch {
            // not valid JSON
        }
        return null;
    }

    /**
     * Recursively flattens the menu tree into a list of LLM-friendly entries.
     * Each entry carries the full breadcrumb path and the navigation payload
     * the LLM should emit to open that screen.
     */
    private buildMenuContext(
        options: MenuOption[],
        parentPath: string[] = []
    ): MenuContextEntry[] {
        const result: MenuContextEntry[] = [];
        for (const opt of options) {
            if (opt.separator) continue;
            // Skip remote entries that haven't been resolved yet — their route/baseUrl
            // points to the remote loader, not to a real screen.
            if (opt.remote) continue;
            const path = [...parentPath, opt.label];
            if (opt.submenus && opt.submenus.length > 0) {
                result.push(...this.buildMenuContext(opt.submenus, path));
            } else {
                const entry: MenuContextEntry = {
                    path,
                    navigation: {
                        route: opt.route,
                        consumedRoute: opt.consumedRoute,
                        actionId: opt.actionId ?? '',
                        baseUrl: opt.baseUrl,
                        serverSideType: opt.serverSideType,
                        uriPrefix: opt.uriPrefix,
                    },
                };
                if (opt.description) entry.description = opt.description;
                result.push(entry);
            }
        }
        return result;
    }

    private startLoading() {
        this.loading = true;
        this.elapsedSeconds = 0;
        this._elapsedTimer = setInterval(() => { this.elapsedSeconds++; }, 1000);
    }

    private stopLoading() {
        this.loading = false;
        clearInterval(this._elapsedTimer);
        this._elapsedTimer = undefined;
    }

    send = async (e: CustomEvent) => {
        this.messageInputElement?.setAttribute("disabled", "disabled");
        const text = e.detail.value.trim();
        if (!text || !this.sseUrl) return;

        this.addMessage(text, 'user');
        const agentIdx = this.addMessage('', 'agent');
        this.startLoading();

        let accumulatedText = '';
        try {
            const headers: Record<string, string> = {
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json',
            };
            const token = localStorage.getItem('__mateu_auth_token');
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const sessionId = sessionStorage.getItem('__mateu_sesion_id');
            if (sessionId) headers['X-Session-Id'] = sessionId;

            // The screen rides with every message: the assistant should know what
            // the user is LOOKING AT (route, app/component state), not just what
            // they typed — so it acts in place instead of navigating blindly.
            const context = this.contextProvider?.();
            const body = JSON.stringify({
                message: text,
                sessionId: this.chatSessionId,
                ...(context !== undefined && context !== null && { context }),
                ...(!this.menuContextSent && { menuContext: this.buildMenuContext(this.menu) }),
            });
            this.menuContextSent = true;

            const response = await fetch(this.sseUrl, { method: 'POST', headers, body });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Servidor respondió ${response.status}: ${errorText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No se pudo obtener el reader del stream.");

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    if (buffer.trim().startsWith('data:')) {
                        const payload = buffer.trim().slice(5).trim();
                        const usage = this.tryParseTokenUsage(payload);
                        const customEvent = !usage && this.tryParseCustomEvent(payload);
                        if (usage) {
                            this.tokenUsage = { ...this.tokenUsage, ...usage };
                        } else if (customEvent) {
                            if (customEvent.event === 'agent-error') {
                                accumulatedText = '⚠️ ' + ((customEvent.detail as Record<string, unknown>)?.message ?? 'Error desconocido del agente');
                                this.updateMessage(agentIdx, accumulatedText);
                            } else {
                                this.dispatchEvent(new CustomEvent(customEvent.event, { detail: customEvent.detail, bubbles: true, composed: true }));
                            }
                        } else {
                            accumulatedText += payload;
                            this.updateMessage(agentIdx, accumulatedText);
                        }
                    }
                    break;
                }

                const raw = decoder.decode(value, { stream: true });
                buffer += raw;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let changed = false;
                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        const payload = line.trim().slice(5).trim();
                        const usage = this.tryParseTokenUsage(payload);
                        const customEvent = !usage && this.tryParseCustomEvent(payload);
                        if (usage) {
                            this.tokenUsage = { ...this.tokenUsage, ...usage };
                        } else if (customEvent) {
                            if (customEvent.event === 'agent-error') {
                                accumulatedText = '⚠️ ' + ((customEvent.detail as Record<string, unknown>)?.message ?? 'Error desconocido del agente');
                                this.updateMessage(agentIdx, accumulatedText);
                            } else {
                                this.dispatchEvent(new CustomEvent(customEvent.event, { detail: customEvent.detail, bubbles: true, composed: true }));
                            }
                        } else {
                            accumulatedText += payload + '\n';
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    this.updateMessage(agentIdx, accumulatedText);
                }
            }

            if (!accumulatedText) {
                this.updateMessage(agentIdx, '⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).');
            }
        } catch (error) {
            console.error('Error en el flujo SSE:', error);
            const errorMessage = (error as Error)?.message ?? String(error)
            const isNetworkError = errorMessage === 'Failed to fetch' || errorMessage === 'network error' || errorMessage === 'Load failed';
            if (isNetworkError && !accumulatedText) {
                this.updateMessage(agentIdx, '⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.');
            } else {
                this.updateMessage(agentIdx, '⚠️ Error: ' + errorMessage);
            }
        } finally {
                this.stopLoading();
                setTimeout(() => {
                    if (this.messageInputElement) {
                        this.messageInputElement.value = ''
                    }
                }, 250)
                this.messageInputElement?.removeAttribute("disabled");
                this.messageInputElement?.focus();
        }
    }

    closeChat = () => {
        this.dispatchEvent(new CustomEvent('close-requested', { bubbles: true, composed: true }))
    }

    private submitFromInput = () => {
        const value = this.messageInputElement?.value?.trim() ?? ''
        if (!value) return
        this.send(new CustomEvent('submit', {
            detail: { value },
            bubbles: true,
            composed: true
        }))
    }

    private onInputKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.submitFromInput()
        }
    }

    render() {
        return html`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${iconClose}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(item => html`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${avatarColor(item.userColorIndex)};">${initials(item.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${item.userName}</span>
                                        <span class="message-time">${item.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${item.text ?? ''}"></mateu-markdown>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage ? html`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens != null ? html`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>` : nothing}
                        ${this.tokenUsage.outputTokens != null ? html`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>` : nothing}
                        ${this.tokenUsage.totalTokens != null ? html`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>` : nothing}
                    </div>
                ` : nothing}
                ${this.loading ? html`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                ` : nothing}
                <div class="input-bar">
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening ? 'red' : 'var(--lumo-contrast-50pct, #767676)'};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${iconMicrophone}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `
    }

    static styles = [neutralButtonStyles, css`
        :host {
            display: block;
            height: 100%;
        }

        .chat-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
        }

        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0.75rem 0.5rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }

        .chat-title {
            font-size: var(--lumo-font-size-s, .875rem);
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #555);
        }

        .chat-close {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #555);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.25rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            line-height: 1;
        }

        .chat-close svg {
            width: 1rem;
            height: 1rem;
        }

        .chat-close:hover {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            color: var(--lumo-body-text-color, #1a1a1a);
        }

        .scroll-container {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .message-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            font-size: 12px;
        }

        .message {
            display: flex;
            gap: 0.5rem;
            align-items: flex-start;
        }

        .avatar {
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.65rem;
            font-weight: 600;
            user-select: none;
        }

        .message-body {
            flex: 1;
            min-width: 0;
        }

        .message-meta {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
        }

        .message-name {
            font-weight: 600;
            color: var(--lumo-body-text-color, #1a1a1a);
        }

        .message-time {
            font-size: 0.7rem;
            color: var(--lumo-tertiary-text-color, #888);
        }

        .message-text {
            color: var(--lumo-body-text-color, #1a1a1a);
            overflow-wrap: anywhere;
        }

        .message-text img,
        .message-text svg {
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }

        .message-text > :first-child {
            margin-top: 0.15rem;
        }

        .message-text > :last-child {
            margin-bottom: 0;
        }

        .input-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }

        .mic-btn {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.35rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            line-height: 1;
        }

        .mic-btn svg {
            width: 1.1rem;
            height: 1.1rem;
        }

        .mic-btn:hover:not(:disabled) {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
        }

        .mic-btn:disabled {
            cursor: default;
            opacity: .4;
        }

        .msg-input {
            flex: 1;
            min-width: 0;
            box-sizing: border-box;
            height: var(--lumo-size-m, 2.25rem);
            padding: 0 0.75rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .2));
            border-radius: var(--lumo-border-radius-m, 4px);
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
            font-family: inherit;
            font-size: var(--lumo-font-size-s, .875rem);
            outline: none;
        }

        .msg-input:focus {
            border-color: var(--lumo-primary-color, #1676f3);
        }

        .msg-input:disabled {
            opacity: .5;
        }

        .token-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 1rem;
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #555);
            flex-wrap: wrap;
        }

        .token-label {
            font-weight: 600;
            color: var(--lumo-tertiary-text-color, #888);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .token-chip {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.1rem 0.4rem;
            font-variant-numeric: tabular-nums;
        }

        .loading-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #555);
        }

        .loading-text {
            font-variant-numeric: tabular-nums;
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .2));
            border-top-color: var(--lumo-primary-color, #1676f3);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            flex-shrink: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `]
}
