import {customElement, property, query, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, PropertyValues} from "lit";
import {nanoid} from "nanoid";
import MenuOption, { ListingDescriptor } from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import { chatNavigationOf, chatRouteOfClick } from "./chatLinks";
import { navigateToRoute } from "./rowRoute";
import {neutralButtonStyles, iconMicrophone} from "./neutralChrome";
import {projectCurrentScreen} from "./screenContext";
import {handleSessionExpired} from "@infra/http/sessionGuard.ts";
import {ChatAnswer, ChatProgress, classifyChatPayload, formatToolDuration, isEmptyUsage, SseParser} from "./chatStream";
import "./mateu-markdown";
import {componentRenderer, HeaderIconButton} from "@infra/ui/renderers/ComponentRenderer.ts";
import {icon} from "@infra/ui/renderers/neutralIcon.ts";
import {chatText} from "./chatTexts";
import {CHAT_MIC_ARIA_KEYSHORTCUTS, chatMicTitle, isChatMicShortcut} from "./chatShortcut";
import {CHAT_WIDE_VW, CHAT_WIDTH, CHAT_WIDTH_STEP, clampChatWidth, dragChatWidth, loadChatWidth, saveChatWidth} from "./chatPanel";

/**
 * An icon-only button of the panel's header: the active renderer's own (the Vaadin adapter: a
 * tertiary icon vaadin-button, like the app header's toggles), else a neutral <button>.
 */
export const chatHeaderButton = (button: HeaderIconButton) =>
    componentRenderer.get()?.renderHeaderIconButton?.(button) ?? html`
        <button class="chat-header-btn ${button.cssClasses ?? ''}" @click="${button.onClick}"
                title="${button.title ?? button.label}" aria-label="${button.label}">
            ${icon(button.icon, 'width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);')}
        </button>`

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
    /** When the screen is a listing: the URL params it can be narrowed by (filters, search, ids). */
    listing?: ListingDescriptor;
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

    /**
     * Base url of the LOCAL agent companion. When a companion answers /health
     * there, the chat prefers it over the server's sseUrl: the LLM runs through
     * the USER's authenticated CLI — no api key, even with a remote server.
     */
    @property()
    localAgentUrl = 'http://127.0.0.1:8776';

    /** The app's MCP endpoint (from @AI(mcp=…)): forwarded so the agent — local companion included — can operate THIS app. */
    @property({attribute: false})
    mcpUrl?: string;

    @state()
    private localAgentAlive = false;

    @property()
    sseUrl: string | undefined

    /** Endpoint (from @AI(upload=…)) the attach button POSTs files to. When unset, no attach UI. */
    @property()
    uploadUrl: string | undefined

    /** Menu passed from the app shell; used to build LLM context. */
    @property({ attribute: false })
    menu: MenuOption[] = [];

    readonly chatSessionId: string = nanoid();
    private menuContextSent = false;

    /** Files uploaded for the NEXT message: shown as chips, sent as `attachments`, cleared on send. */
    @state()
    private attachments: { name: string; path: string }[] = [];
    @state()
    private uploading = false;
    @query('.file-input')
    private fileInputElement?: HTMLInputElement;

    /** Wide mode (⤢): the panel takes about 60% of the viewport, for when the conversation is the
     *  focus — the page stays beside it. Reflected so the shell's CSS can react. On a phone the
     *  panel covers the content in either mode. */
    @property({ type: Boolean, reflect: true })
    expanded = false;

    private toggleExpanded = () => { this.expanded = !this.expanded; };

    /** The panel's brand (@App(askLabel)); blank → the localised "Assistant". */
    @property()
    label: string | undefined = undefined;

    /** The panel's width in px (the shell lays it out through --mateu-chat-width), remembered per
     *  browser: 460 by default, 320–720 by dragging its edge. */
    @state()
    width: number = loadChatWidth();

    @state()
    private resizing = false;

    private dragStart: { x: number, width: number } | undefined = undefined;

    private isRtl = () => getComputedStyle(this).direction === 'rtl';

    private onResizeStart = (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        this.dragStart = { x: e.clientX, width: this.width };
        this.resizing = true;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    private onResizeMove = (e: PointerEvent) => {
        if (!this.dragStart) return;
        this.width = dragChatWidth(this.dragStart.width, this.dragStart.x, e.clientX, this.isRtl());
    };

    private onResizeEnd = (e: PointerEvent) => {
        if (!this.dragStart) return;
        this.dragStart = undefined;
        this.resizing = false;
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        this.width = saveChatWidth(this.width);
    };

    /** The edge is a focusable separator: ←/→ resize in steps, Home/End go to the bounds. */
    private onResizeKey = (e: KeyboardEvent) => {
        const towardsEnd = this.isRtl() ? 'ArrowLeft' : 'ArrowRight';
        const towardsStart = this.isRtl() ? 'ArrowRight' : 'ArrowLeft';
        let next: number | undefined;
        if (e.key === towardsEnd) next = this.width + CHAT_WIDTH_STEP;
        else if (e.key === towardsStart) next = this.width - CHAT_WIDTH_STEP;
        else if (e.key === 'Home') next = CHAT_WIDTH.min;
        else if (e.key === 'End') next = CHAT_WIDTH.max;
        if (next === undefined) return;
        e.preventDefault();
        this.width = saveChatWidth(clampChatWidth(next));
    };

    /** A double click on the edge goes back to the default width. */
    private onResizeReset = () => { this.width = saveChatWidth(CHAT_WIDTH.default); };

    /** The shell lays the panel out from these two custom properties (mateu-app's styles). */
    updated(changed: PropertyValues) {
        super.updated(changed);
        if (changed.has('width')) this.style.setProperty('--mateu-chat-width', `${this.width}px`);
        if (!this.style.getPropertyValue('--mateu-chat-wide')) this.style.setProperty('--mateu-chat-wide', `${CHAT_WIDE_VW}vw`);
    }

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

    /** What the agent of the turn in course says it is doing (status and tool events); cleared at its end. */
    @state()
    private progress: ChatProgress | undefined;

    /** Bumped on every progress event so Lit re-renders: ChatProgress mutates in place. */
    @state()
    private progressTick = 0;


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

    /** Whether the panel is on screen: the app shell keeps a closed one in the hidden slot. */
    private get panelOpen(): boolean {
        return this.isConnected && this.slot !== 'detail-hidden'
    }

    /** Ctrl+Shift+M (see chatShortcut) toggles the mic like a click on its button, while the panel
     *  is open — with the focus anywhere, the message field included. Nothing without recognition. */
    private onShortcutKeydown = (e: KeyboardEvent) => {
        if (!isChatMicShortcut(e) || !this.panelOpen || !this.recognitionAvailable) return
        e.preventDefault()
        this.startListening()
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

    private probeLocalAgent = async () => {
        if (!this.localAgentUrl) return;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 1200);
            const response = await fetch(this.localAgentUrl + '/health', { signal: controller.signal });
            clearTimeout(timer);
            this.localAgentAlive = response.ok;
        } catch {
            this.localAgentAlive = false;
        }
    };

    connectedCallback() {
        super.connectedCallback()
        void this.probeLocalAgent();
        window.addEventListener('keydown', this.onShortcutKeydown, true);

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

    disconnectedCallback() {
        window.removeEventListener('keydown', this.onShortcutKeydown, true);
        super.disconnectedCallback()
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
                if (opt.listing) entry.listing = opt.listing;
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
        this.progress = undefined;
        clearInterval(this._elapsedTimer);
        this._elapsedTimer = undefined;
    }

    /** The attach button — opens the file picker (only rendered when uploadUrl is set). */
    private pickFiles = () => this.fileInputElement?.click();

    /** Uploads the picked files (multipart) to uploadUrl; the endpoint saves them and returns the
     *  paths (relative to the agent's file root), which we keep as chips + send with the message. */
    private onFilesPicked = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = ''; // allow re-picking the same file later
        if (!files.length || !this.uploadUrl) return;
        this.uploading = true;
        try {
            const form = new FormData();
            form.append('sessionId', this.chatSessionId);
            for (const f of files) form.append('files', f, f.name);
            const headers: Record<string, string> = {};
            const token = localStorage.getItem('__mateu_auth_token');
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const sessionId = sessionStorage.getItem('__mateu_sesion_id');
            if (sessionId) headers['X-Session-Id'] = sessionId;
            const response = await fetch(this.uploadUrl, { method: 'POST', headers, body: form });
            if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
            const result = await response.json() as { files?: { name: string; path: string }[] };
            const saved = (result.files ?? []).filter(f => f && f.path);
            this.attachments = [...this.attachments, ...saved];
        } catch (err) {
            this.addMessage(`⚠️ No se pudieron subir los ficheros: ${err instanceof Error ? err.message : err}`, 'agent');
        } finally {
            this.uploading = false;
        }
    };

    private removeAttachment = (path: string) => {
        this.attachments = this.attachments.filter(a => a.path !== path);
    };

    send = async (e: CustomEvent) => {
        this.messageInputElement?.setAttribute("disabled", "disabled");
        const text = e.detail.value.trim();
        const effectiveSseUrl = this.localAgentAlive
            ? this.localAgentUrl + '/mateu/agent/stream'
            : this.sseUrl;
        // a message with only attachments (no text) is still worth sending
        const attachments = this.attachments;
        if ((!text && attachments.length === 0) || !effectiveSseUrl) return;

        const shown = attachments.length
            ? `${text}${text ? '\n\n' : ''}📎 ${attachments.map(a => a.name).join(', ')}`
            : text;
        this.addMessage(shown, 'user');
        this.attachments = [];
        const agentIdx = this.addMessage('', 'agent');
        this.startLoading();

        let accumulatedText = '';
        try {
            // Built per attempt: after a 401 the page refreshes the token into localStorage, and the
            // retry must carry the new one, not the one that was just refused.
            const headers = (): Record<string, string> => {
                const h: Record<string, string> = {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                };
                const token = localStorage.getItem('__mateu_auth_token');
                if (token) h['Authorization'] = 'Bearer ' + token;
                const sessionId = sessionStorage.getItem('__mateu_sesion_id');
                if (sessionId) h['X-Session-Id'] = sessionId;
                return h;
            };

            // The screen rides with every message: the assistant should know what
            // the user is LOOKING AT (route, app/component state), not just what
            // they typed — so it acts in place instead of navigating blindly.
            const context = this.contextProvider?.();
            // Beyond the raw state, a SELF-DESCRIBING projection of the current screen (fields with
            // type/label/value + the available actions) — the same shape an MCP agent gets — so the
            // assistant can fill and run precisely instead of guessing from values. Best-effort.
            const screen = projectCurrentScreen(document, (context as { componentState?: unknown } | undefined)?.componentState);
            const hasScreen = !!screen && (screen.fields.length > 0 || screen.actions.length > 0 || !!screen.title);
            const body = JSON.stringify({
                message: text,
                sessionId: this.chatSessionId,
                ...(attachments.length && { attachments }),
                ...(context !== undefined && context !== null && { context }),
                ...(hasScreen && { screen }),
                ...(this.mcpUrl && { mcpUrl: new URL(this.mcpUrl, window.location.origin).href }),
                ...(!this.menuContextSent && { menuContext: this.buildMenuContext(this.menu) }),
            });
            this.menuContextSent = true;

            const send = () => fetch(effectiveSseUrl, { method: 'POST', headers: headers(), body });
            let response = await send();
            // The token expired while the panel sat open (a sleeping laptop, a background tab, a long
            // recording): every other request of the page recovers from that — sessionGuard lets the
            // page refresh the token and retries once — and this fetch, outside the axios client,
            // used to show the 401 instead. Same contract here; if nobody re-authenticates, the
            // original 401 is what the user sees, as before.
            if (response.status === 401) {
                response = await handleSessionExpired(new Error('401'), send).catch(() => response);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Servidor respondió ${response.status}: ${errorText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No se pudo obtener el reader del stream.");

            const decoder = new TextDecoder();
            const parser = new SseParser();
            const answer = new ChatAnswer();
            const progress = new ChatProgress(Date.now());
            this.progress = progress;
            const handle = (payload: string) => {
                const msg = classifyChatPayload(payload);
                switch (msg.kind) {
                    case 'usage':
                        // older agents send all-zero placeholders while they work: not a count
                        if (!isEmptyUsage(msg.usage)) this.tokenUsage = { ...this.tokenUsage, ...msg.usage };
                        return;
                    case 'delta':
                        accumulatedText = answer.delta(msg.text);
                        progress.text(Date.now());
                        break;
                    case 'text':
                        accumulatedText = answer.line(msg.text);
                        progress.text(Date.now());
                        break;
                    case 'error':
                        accumulatedText = answer.error(msg.message);
                        break;
                    case 'status':
                        progress.status(msg.detail, Date.now());
                        break;
                    case 'tool':
                        progress.tool(msg.detail, Date.now());
                        break;
                    case 'event':
                        this.dispatchEvent(new CustomEvent(msg.event, { detail: msg.detail, bubbles: true, composed: true }));
                        return;
                }
                this.progressTick++;
                if (msg.kind === 'delta' || msg.kind === 'text' || msg.kind === 'error') {
                    this.updateMessage(agentIdx, accumulatedText);
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    parser.push(decoder.decode());
                    parser.end().forEach(handle);
                    break;
                }
                parser.push(decoder.decode(value, { stream: true })).forEach(handle);
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

    /**
     * A link in an answer to a screen of the app ([Nora Duarte](/booking/bookings/4MBZS7)) opens it
     * in the app, through the shell's own navigation — the browser would reload the whole page.
     */
    private onMessageClick = (e: MouseEvent) => {
        const anchor = (e.composedPath().find(node => node instanceof HTMLAnchorElement) ?? null) as HTMLAnchorElement | null
        const route = chatRouteOfClick(anchor, e)
        if (!route) return
        e.preventDefault()
        // through the menu entry that serves it, like the agent's own [NAVIGATE:…]: the content
        // changes and the chat — this conversation — stays. Only a route no entry serves goes
        // through the shell's route resolution.
        const navigation = chatNavigationOf(this.menu, route)
        if (navigation) {
            this.dispatchEvent(new CustomEvent('navigation-requested', { detail: navigation, bubbles: true, composed: true }))
        } else {
            navigateToRoute(this, route)
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

    /** The line under the conversation while the agent works: what it says it is doing, or — from an
     *  agent that reports nothing — the seconds it has been thinking, as before. Re-rendered by the
     *  once-a-second tick (elapsedSeconds) and by every progress event (progressTick). */
    private progressLine(): string {
        return this.progress?.line(Date.now()) ?? `Thinking… ${this.elapsedSeconds}s`;
    }

    /** The tool calls of the turn in course, under the agent's message: done, failed or running. */
    private renderToolSteps() {
        const steps = this.progress?.steps ?? [];
        if (!steps.length) return nothing;
        return html`
            <ul class="tool-steps" aria-label="Herramientas usadas">
                ${steps.map(step => html`
                    <li class="tool-step ${step.running ? 'running' : step.error ? 'failed' : 'done'}"
                        title="${step.server ? `${step.name} (${step.server})` : step.name}">
                        <span class="tool-step-icon">${step.running ? '…' : step.error ? '✕' : '✓'}</span>
                        <span class="tool-step-name">${step.name}</span>
                        ${step.running ? nothing : html`<span class="tool-step-time">${formatToolDuration(step.ms)}</span>`}
                        ${step.error ? html`<span class="tool-step-error">${step.error}</span>` : nothing}
                    </li>
                `)}
            </ul>
        `;
    }

    render() {
        return html`
            <div class="chat-container">
                <div class="chat-header">
                    ${icon('vaadin:comments-o', '', 'chat-title-icon')}
                    <h2 class="chat-title">${this.label?.trim() || chatText('title')}</h2>
                    ${this.localAgentAlive
                        ? html`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`
                        : nothing}
                    <div class="chat-header-actions">
                        ${chatHeaderButton({
                            icon: this.expanded ? 'vaadin:compress' : 'vaadin:expand-full',
                            label: chatText(this.expanded ? 'restore' : 'expand'),
                            cssClasses: 'chat-expand',
                            onClick: () => this.toggleExpanded(),
                        })}
                        ${chatHeaderButton({
                            icon: 'lumo:cross',
                            label: chatText('close'),
                            cssClasses: 'chat-close',
                            onClick: () => this.closeChat(),
                        })}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length === 0 && !this.loading ? html`
                        <div class="chat-empty">
                            ${icon('vaadin:comments-o', '', 'chat-empty-icon')}
                            <p>${chatText('empty')}</p>
                        </div>` : nothing}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((item, index) => html`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${avatarColor(item.userColorIndex)};">${initials(item.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${item.userName}</span>
                                        <span class="message-time">${item.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${item.text ?? ''}"></mateu-markdown>
                                    ${index === this.items.length - 1 && this.loading ? this.renderToolSteps() : nothing}
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
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                ` : nothing}
                ${this.attachments.length ? html`
                    <div class="attachments">
                        ${this.attachments.map(a => html`
                            <span class="attachment-chip" title="${a.path}">
                                📎 ${a.name}
                                <button class="attachment-remove" @click="${() => this.removeAttachment(a.path)}" aria-label="Quitar ${a.name}">✕</button>
                            </span>`)}
                    </div>
                ` : nothing}
                <div class="input-bar">
                    ${this.uploadUrl ? html`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading ? '…' : '📎'}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    ` : nothing}
                    <button class="mic-btn"
                            title="${chatMicTitle(this.listening)}"
                            aria-label="${chatMicTitle(this.listening)}"
                            aria-keyshortcuts="${CHAT_MIC_ARIA_KEYSHORTCUTS}"
                            aria-pressed="${this.listening ? 'true' : 'false'}"
                            style="color: ${this.listening ? 'red' : 'var(--lumo-contrast-50pct, #767676)'};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${iconMicrophone}</button>
                    <input class="msg-input"
                           placeholder="${chatText('placeholder')}"
                           aria-label="${chatText('placeholder')}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${chatText('send')}</button>
                </div>
                <div class="resize-handle ${this.resizing ? 'resizing' : ''}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${chatText('resize')}"
                     aria-valuemin="${CHAT_WIDTH.min}" aria-valuemax="${CHAT_WIDTH.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `
    }

    static styles = [neutralButtonStyles, css`
        :host {
            display: block;
            height: 100%;
            /* border-box, because the app shell sets padding on this host inline (appRenderer adds
               padding-top so the panel clears the header). Under the default content-box that
               padding is ADDED to the 100%, so the panel ends up taller than the slot that holds
               it and the overflow falls off the bottom of the viewport — which is where the input
               bar lives, so the mic, the field and Send were all clipped when opened. */
            box-sizing: border-box;
        }

        /* Wide mode (⤢): the shell gives the panel ~60% of the viewport (mateu-app's styles,
           --mateu-chat-wide); the conversation keeps a readable measure inside it. */
        :host([expanded]) .message-list,
        :host([expanded]) .input-bar,
        :host([expanded]) .attachments,
        :host([expanded]) .token-bar,
        :host([expanded]) .loading-bar {
            max-width: 820px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
            box-sizing: border-box;
        }

        .chat-container {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
        }

        .attachments {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 6px 12px 0;
        }
        .attachment-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font: 500 12px ui-sans-serif, system-ui, sans-serif;
            background: var(--lumo-contrast-10pct, #eef1f4);
            color: var(--lumo-body-text-color, #222);
            border-radius: 999px;
            padding: 3px 6px 3px 10px;
            max-width: 220px;
        }
        .attachment-chip > :not(.attachment-remove) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .attachment-remove {
            border: none;
            background: transparent;
            cursor: pointer;
            color: var(--lumo-contrast-60pct, #767676);
            font-size: 11px;
            line-height: 1;
            padding: 2px 4px;
            border-radius: 50%;
        }
        .attachment-remove:hover { background: var(--lumo-contrast-20pct, #dcdcdc); }

        .local-agent-badge {
            font: 600 10px ui-sans-serif, system-ui, sans-serif;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #047857;
            background: #d1fae5;
            border-radius: 999px;
            padding: 2px 8px;
            margin-left: 8px;
            cursor: default;
        }

        /* The panel's header: its icon and title (a panel title, not a caption), then the
           expand/close buttons grouped at the end — tertiary icon buttons like the app header's. */
        .chat-header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            min-height: var(--lumo-size-l, 2.75rem);
            padding: 0.25rem 0.5rem 0.25rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }
        .chat-title-icon {
            flex-shrink: 0;
            width: var(--lumo-icon-size-m, 1.5rem);
            height: var(--lumo-icon-size-m, 1.5rem);
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .chat-title {
            margin: 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            line-height: var(--lumo-line-height-xs, 1.25);
            color: var(--lumo-header-text-color, #1a1a1a);
        }
        .chat-header-actions {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem);
            margin-inline-start: auto;
            flex-shrink: 0;
        }
        .chat-header-actions > * {
            margin: 0;
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
        }
        .chat-header-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--lumo-size-m, 2.25rem);
            min-height: var(--lumo-size-m, 2.25rem);
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .chat-header-btn:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .05));
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .chat-header-btn:focus-visible {
            outline: 2px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            outline-offset: 1px;
        }

        /* Before the first message: what the panel is for. */
        .chat-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem) 0;
            text-align: center;
            color: var(--lumo-secondary-text-color, #5a6573);
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .chat-empty p { margin: 0; max-width: 22rem; }
        .chat-empty-icon {
            width: var(--lumo-icon-size-l, 2.25rem);
            height: var(--lumo-icon-size-l, 2.25rem);
            color: var(--lumo-contrast-30pct, rgba(0, 0, 0, .3));
        }

        /* The edge on the panel's end side: drag it (or ←/→ on it) to resize between 320 and
           720px; a double click resets. Not in wide mode, nor on a phone, where the panel's width
           is the shell's. */
        .resize-handle {
            position: absolute;
            inset-block: 0;
            inset-inline-end: -4px;
            width: 8px;
            cursor: col-resize;
            touch-action: none;
            z-index: 2;
        }
        .resize-handle::after {
            content: '';
            position: absolute;
            inset-block: 0;
            inset-inline-start: 3px;
            width: 2px;
            background: transparent;
            transition: background-color .15s;
        }
        .resize-handle:hover::after, .resize-handle.resizing::after, .resize-handle:focus-visible::after {
            background: var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
        }
        .resize-handle:focus-visible { outline: none; }
        :host([expanded]) .resize-handle { display: none; }
        @media (max-width: 600px) {
            /* a phone: the panel already covers the content — no edge, no wide mode */
            .resize-handle, .chat-expand { display: none; }
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
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
        }

        /* The tool calls of the turn in course, under the agent's message. */
        .tool-steps {
            list-style: none;
            margin: 0.25rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #555);
        }
        .tool-step {
            display: flex;
            align-items: baseline;
            gap: 0.4rem;
            min-width: 0;
        }
        .tool-step-icon {
            width: 1em;
            text-align: center;
            flex-shrink: 0;
        }
        .tool-step.done .tool-step-icon { color: var(--lumo-success-text-color, #0a7d3c); }
        .tool-step.failed .tool-step-icon,
        .tool-step-error { color: var(--lumo-error-text-color, #c62828); }
        .tool-step-name {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tool-step-time { font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .tool-step-error {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
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
