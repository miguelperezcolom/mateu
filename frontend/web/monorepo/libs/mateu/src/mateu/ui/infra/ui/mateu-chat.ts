import {customElement, property, query, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
import {MessageListItem} from "@vaadin/message-list";
import "@vaadin/message-list";
import "@vaadin/message-input";
import "@vaadin/vertical-layout";
import {MessageInput} from "@vaadin/message-input";
import {nanoid} from "nanoid";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";

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

    @property()
    sseUrl: string | undefined

    /** Menu passed from the app shell; used to build LLM context. */
    @property({ attribute: false })
    menu: MenuOption[] = [];

    readonly chatSessionId: string = nanoid();
    private menuContextSent = false;

    @property()
    items: MessageListItem[] = []

    @query('.scroll-container')
    scrollContainer?: HTMLElement;

    @query('vaadin-message-input')
    messageInputElement?: MessageInput;

    @state()
    recognition: any

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
        console.log('startListening', this.recognition);
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

    onSpeechResult = (event: any) => {
        if (this.recognition) {
            // Obtener el texto procesado
            console.log("Resultados del reconocimiento:", event.results);
            const transcript = event.results[event.results[0].length - 1][0].transcript;
            console.log("Resultado del reconocimiento:", transcript);
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

        console.log('SpeechRecognition', SpeechRecognition);

        if (SpeechRecognition) {
            console.log('SpeechRecognition available');
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'es-ES'; // Configuramos el idioma a español
            //this.recognition.continuous = true;
            //this.recognition.interimResults = true;

            this.recognition.onend = () => {
                console.log("El reconocimiento ha terminado.");
                setTimeout(() => {
                    if (this.listening) {
                        try {
                            this.recognition.start();
                        } catch (e: any) {
                            console.log('Error al iniciar el reconocimiento:', e.message);
                        }
                    }
                }, 250)
            };

            this.recognitionAvailable = true;

            this.recognition.onresult = this.onSpeechResult;

            this.recognition.onerror = (event: any) => {
                console.error("Error de reconocimiento: " + event.error);
                if (this.listening) {
                    setTimeout(() => {
                        this.recognition.start();
                    }, 250)
                }
            };
        } else {
            console.log("Lo siento, tu navegador no soporta la API de voz.");
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
        const msg = {
            text,
            time: new Date().toLocaleTimeString(),
            userName: role.includes('agent') ? 'Asistente' : 'Tú',
            userColorIndex: role.includes('agent') ? 2 : 1,
        } as MessageListItem;
        this.items = [...this.items, msg];
        this.scrollBottom();
        return this.items.length - 1;
    }

    // Creates a NEW item object so Vaadin always detects the change (=== comparison).
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
    private tryParseCustomEvent(payload: string): { event: string; detail: any } | null {
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

            const body = JSON.stringify({
                message: text,
                sessionId: this.chatSessionId,
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
                                accumulatedText = '⚠️ ' + (customEvent.detail?.message ?? 'Error desconocido del agente');
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
                                accumulatedText = '⚠️ ' + (customEvent.detail?.message ?? 'Error desconocido del agente');
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
        } catch (error: any) {
            console.error('Error en el flujo SSE:', error);
            const isNetworkError = error.message === 'Failed to fetch' || error.message === 'network error' || error.message === 'Load failed';
            if (isNetworkError && !accumulatedText) {
                this.updateMessage(agentIdx, '⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.');
            } else {
                this.updateMessage(agentIdx, '⚠️ Error: ' + error.message);
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

    render() {
        return html`
            <div class="scroll-container" style="height: 35rem; overflow: auto;">
                <vaadin-message-list .items="${this.items}" markdown style="--lumo-font-size-m: 12px;"></vaadin-message-list>
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
            <vaadin-horizontal-layout
                    style="padding-left: 1rem; align-items: center; border-top: 1px solid var(--lumo-contrast-10pct);"><vaadin-button
                    theme="icon"
                    @click="${this.startListening}"
                    ?disabled="${!this.recognitionAvailable}"
            ><vaadin-icon
                    style="color: ${this.listening?'red':'var(--lumo-contrast-50pct)'};"
                    icon="vaadin:microphone"></vaadin-icon></vaadin-button>
                <vaadin-message-input @submit="${this.send}" style="border-top: none; flex-grow: 1;"></vaadin-message-input></vaadin-horizontal-layout>
        `
    }

    static styles = css`
        :host {
            display: block;
            height: 100%;
        }

        .chat-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color);
        }

        vaadin-message-list {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
        }

        vaadin-message-input {
            flex-shrink: 0;
            padding: 1rem;
            border-top: 1px solid var(--lumo-contrast-10pct);
        }

        .token-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 1rem;
            background: var(--lumo-contrast-5pct);
            border-top: 1px solid var(--lumo-contrast-10pct);
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
            flex-wrap: wrap;
        }

        .token-label {
            font-weight: 600;
            color: var(--lumo-tertiary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .token-chip {
            background: var(--lumo-contrast-10pct);
            border-radius: var(--lumo-border-radius-s);
            padding: 0.1rem 0.4rem;
            font-variant-numeric: tabular-nums;
        }

        .loading-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            background: var(--lumo-contrast-5pct);
            border-top: 1px solid var(--lumo-contrast-10pct);
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
        }

        .loading-text {
            font-variant-numeric: tabular-nums;
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--lumo-contrast-20pct);
            border-top-color: var(--lumo-primary-color);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            flex-shrink: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `
}
