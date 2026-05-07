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

    // Acceso directo al elemento de la lista para el scroll
    @query('vaadin-message-list')
    messageListElement?: HTMLElement;

    @query('.scroll-container')
    scrollContainer?: HTMLElement;

    @query('vaadin-message-input')
    messageInputElement?: MessageInput;

    private scrollBottom() {
        // Usamos requestAnimationFrame para esperar a que Lit termine de renderizar el nuevo item
        /*
        requestAnimationFrame(() => {
            if (this.messageListElement) {
                this.messageListElement.scrollTop = this.messageListElement.scrollHeight;
            }
        });
         */
        // Usamos setTimeout 0 para forzar que se ejecute DESPUÉS del ciclo de renderizado de Lit y Vaadin
        setTimeout(() => {
            if (this.scrollContainer) {
                this.scrollContainer.scrollTo({
                    top: this.scrollContainer.scrollHeight,
                    behavior: 'smooth' // 'smooth' para desplazamiento fluido, 'auto' para instantáneo
                });
            }
        }, 0);
    }

    addMessage = (text: string, role: string) => {
        const msg = {
            text,
            time: new Date().toLocaleTimeString(),
            userName: role.includes('agent') ? 'Asistente' : 'Tú',
            userColorIndex: role.includes('agent') ? 2 : 1,
        } as MessageListItem;

        this.items = [...this.items, msg];
        this.scrollBottom();
        return msg;
    }

    send = async (e: CustomEvent) => {

        this.messageInputElement?.setAttribute("disabled", "disabled")

        const text = e.detail.value.trim();
        if (!text || !this.sseUrl) return;

        this.addMessage(text, 'user');
        const agentMsg = this.addMessage('', 'agent streaming');

        try {

            console.log('Enviando mensaje:', text);

            const response = await fetch(`${this.sseUrl}?message=${encodeURIComponent(text)}`, {
                headers: { 'Accept': 'text/event-stream' }
            });

            // Captura errores de respuesta (404, 500, etc)
            if (!response.ok) {
                // Intentamos leer el error que viene del servidor
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
                    // --- PROCESAR BUFFER RESTANTE ---
                    if (buffer.startsWith('data:')) {
                        console.log('Done. Última parte del stream:', buffer);
                        agentMsg.text += buffer.slice(5);
                        this.items = [...this.items];
                        this.scrollBottom();
                    }
                    break;
                }

                const raw = decoder.decode(value, { stream: true });
                console.log('Nueva parte del stream:', raw);
                buffer += raw;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        const chunk = line.trim().slice(5);
                        agentMsg.text += chunk;
                        this.items = [...this.items];
                        this.scrollBottom();
                    }
                }
            }
            this.messageInputElement?.removeAttribute("disabled")
            this.messageInputElement?.focus()
        } catch (error: any) {
            console.error('Error en el flujo:', error);
            agentMsg.text = '⚠️ Error: ' + error.message;
            this.items = [...this.items];
            this.scrollBottom();
            this.messageInputElement?.removeAttribute("disabled")
            this.messageInputElement?.focus()
        }
    }

    render() {
        return html`
            <div class="scroll-container" style="height: 10rem; overflow: auto;">
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
            /* Ocupa el 100% del padre o el viewport */
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color);
        }

        vaadin-message-list {
            flex: 1; /* Esto hace que la lista crezca y el input se quede abajo */
            overflow-y: auto;
            padding: 1rem;
        }

        vaadin-message-input {
            flex-shrink: 0; /* No permite que el input se haga pequeño */
            padding: 1rem;
            border-top: 1px solid var(--lumo-contrast-10pct);
        }
    `
}