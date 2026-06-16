import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";

type DebugTab = 'appstate' | 'appdata' | 'inspector'

@customElement('mateu-debug-overlay')
export class MateuDebugOverlay extends LitElement {

    @property() appState: Record<string, any> = {}
    @property() appData: Record<string, any> = {}

    @state() private open = false
    @state() private activeTab: DebugTab = 'appstate'
    @state() private hoveredTag = ''
    @state() private hoveredId = ''
    @state() private hoveredState: any = null
    @state() private hoveredData: any = null
    @state() private hoveredMeta: any = null

    private _prevTarget: HTMLElement | null = null

    private _onMouseover = (e: MouseEvent) => {
        let el = e.target as HTMLElement | null
        while (el && !(el.tagName?.toLowerCase().startsWith('mateu-') && (el as any) !== this)) {
            el = el.parentElement
        }
        if ((el as any) === this || el === null) {
            if (el === null && this._prevTarget) {
                this._prevTarget.style.outline = ''
                this._prevTarget.style.outlineOffset = ''
                this._prevTarget = null
                this.hoveredTag = ''
                this.hoveredId = ''
                this.hoveredState = null
                this.hoveredData = null
                this.hoveredMeta = null
            }
            return
        }
        if (el !== this._prevTarget) {
            if (this._prevTarget) {
                this._prevTarget.style.outline = ''
                this._prevTarget.style.outlineOffset = ''
            }
            this._prevTarget = el
            el.style.outline = '2px solid #0070f3'
            el.style.outlineOffset = '-2px'
            this.hoveredTag = el.tagName.toLowerCase()
            this.hoveredId = el.id || ''
            this.hoveredState = (el as any).state
            this.hoveredData = (el as any).data
            this.hoveredMeta = (el as any).component?.metadata
        }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('mouseover', this._onMouseover, true)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('mouseover', this._onMouseover, true)
        if (this._prevTarget) {
            this._prevTarget.style.outline = ''
            this._prevTarget = null
        }
    }

    private _fmt(obj: any): string {
        try {
            return JSON.stringify(obj, null, 2) ?? 'null'
        } catch {
            return String(obj)
        }
    }

    private _renderTab(id: DebugTab, label: string) {
        return html`
            <button class="tab ${this.activeTab === id ? 'tab--active' : ''}"
                @click=${() => { this.activeTab = id }}>
                ${label}
            </button>
        `
    }

    render() {
        if (this.open) {
            return html`
                <div class="panel">
                    <div class="panel-header">
                        <span class="panel-title">🐛 Mateu Debug</span>
                        <button class="close-btn" @click=${() => { this.open = false }}>✕</button>
                    </div>
                    <div class="tabs">
                        ${this._renderTab('appstate', 'AppState')}
                        ${this._renderTab('appdata', 'AppData')}
                        ${this._renderTab('inspector', 'Inspector')}
                    </div>
                    <div class="content">
                        ${this.activeTab === 'appstate' ? html`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        ` : nothing}
                        ${this.activeTab === 'appdata' ? html`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        ` : nothing}
                        ${this.activeTab === 'inspector' ? html`
                            ${this.hoveredTag ? html`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId ? ` id="${this.hoveredId}"` : ''}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            ` : html`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        ` : nothing}
                    </div>
                </div>
            `
        }
        return html`
            <button class="fab" @click=${() => { this.open = true }} title="Mateu Debug">🐛</button>
        `
    }

    static styles = css`
        :host {
            position: fixed;
            z-index: 9999;
            font-family: 'Fira Code', 'Cascadia Code', monospace;
            font-size: 13px;
        }
        .fab {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: #1e3a5f;
            color: white;
            font-size: 1.4rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s, box-shadow 0.15s;
            opacity: 0.85;
        }
        .fab:hover {
            transform: scale(1.1);
            opacity: 1;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }
        .panel {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 400px;
            background: #0f1117;
            color: #d4d4d4;
            display: flex;
            flex-direction: column;
            box-shadow: -6px 0 24px rgba(0,0,0,0.5);
            border-left: 1px solid #2a2a3a;
        }
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            background: #1a1a2e;
            border-bottom: 1px solid #2a2a3a;
            flex-shrink: 0;
        }
        .panel-title {
            font-weight: 600;
            color: #7dd3fc;
            font-size: 0.85rem;
            letter-spacing: 0.03em;
        }
        .close-btn {
            border: none;
            background: transparent;
            color: #888;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: color 0.15s, background 0.15s;
        }
        .close-btn:hover { color: #fff; background: #333; }
        .tabs {
            display: flex;
            border-bottom: 1px solid #2a2a3a;
            flex-shrink: 0;
            background: #0f1117;
        }
        .tab {
            flex: 1;
            padding: 0.6rem;
            border: none;
            background: transparent;
            color: #666;
            cursor: pointer;
            font-size: 0.75rem;
            font-family: inherit;
            border-bottom: 2px solid transparent;
            transition: color 0.15s;
        }
        .tab:hover { color: #aaa; }
        .tab--active { color: #7dd3fc; border-bottom-color: #0070f3; }
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 0.75rem;
        }
        .content::-webkit-scrollbar { width: 6px; }
        .content::-webkit-scrollbar-track { background: #0f1117; }
        .content::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .json {
            margin: 0;
            font-size: 0.72rem;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-all;
            color: #a8ff78;
        }
        .inspector-tag {
            font-size: 0.82rem;
            color: #7dd3fc;
            margin-bottom: 0.75rem;
            font-weight: bold;
            background: #1a2a3a;
            padding: 0.4rem 0.6rem;
            border-radius: 4px;
            border-left: 3px solid #0070f3;
        }
        .inspector-hint {
            color: #555;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 3rem;
            line-height: 1.8;
        }
        .section-label {
            font-size: 0.65rem;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 1rem 0 0.3rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #2a2a3a;
        }
        .section-label:first-of-type { margin-top: 0; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-debug-overlay': MateuDebugOverlay
    }
}
