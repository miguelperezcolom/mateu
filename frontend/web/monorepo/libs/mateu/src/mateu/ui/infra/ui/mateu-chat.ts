import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {MessageListItem} from "@vaadin/message-list";
import "@vaadin/message-list";
import "@vaadin/message-input";
import "@vaadin/vertical-layout";
import {MessageInput} from "@vaadin/message-input";

@customElement('mateu-chat')
export class MateuChat extends LitElement {

    @property()
    sseUrl: string | undefined

    @property()
    items: MessageListItem[] = []

    @query('.scroll-container')
    scrollContainer?: HTMLElement;

    @query('vaadin-message-input')
    messageInputElement?: MessageInput;

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

    send = async (e: CustomEvent) => {
        this.messageInputElement?.setAttribute("disabled", "disabled");
        const text = e.detail.value.trim();
        if (!text || !this.sseUrl) return;

        this.addMessage(text, 'user');
        const agentIdx = this.addMessage('', 'agent');

        try {
            const response = await fetch(`${this.sseUrl}?message=${encodeURIComponent(text)}`, {
                headers: { 'Accept': 'text/event-stream' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Servidor respondió ${response.status}: ${errorText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No se pudo obtener el reader del stream.");

            const decoder = new TextDecoder();
            let buffer = '';
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    if (buffer.trim().startsWith('data:')) {
                        accumulatedText += buffer.trim().slice(5);
                        this.updateMessage(agentIdx, accumulatedText);
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
                        accumulatedText += line.trim().slice(5) + '\n';
                        changed = true;
                    }
                }
                if (changed) {
                    this.updateMessage(agentIdx, accumulatedText);
                }
            }
        } catch (error: any) {
            console.error('Error en el flujo SSE:', error);
            this.updateMessage(agentIdx, '⚠️ Error: ' + error.message);
        } finally {
            this.messageInputElement?.removeAttribute("disabled");
            this.messageInputElement?.focus();
        }
    }

    render() {
        return html`
            <div class="scroll-container" style="height: 40rem; overflow: auto;">
                <vaadin-message-list .items="${this.items}" markdown></vaadin-message-list>
            </div>
            <vaadin-message-input @submit="${this.send}"></vaadin-message-input>
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
    `
}
