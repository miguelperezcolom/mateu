import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageList from "@mateu/shared/apiClients/dtos/componentmetadata/MessageList";
import { html, nothing } from "lit";

/*
 * Design-system-neutral MessageList — native message rows (CSS-circle avatar + name/time + text; no
 * `@vaadin`). The Vaadin adapter overrides it with vaadin-message-list (which also renders markdown).
 */
export const renderMessageList = (component: ClientSideComponent) => {
    const metadata = component.metadata as MessageList
    const items = metadata.items ?? []
    return html`
        <div class="mateu-message-list ${component.cssClasses ?? ''}"
             style="display:flex; flex-direction:column; gap:.75rem; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            ${items.map(item => html`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${item.userImg
                            ? html`<img src="${item.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`
                            : (item.userAbbr ?? (item.userName ? item.userName.charAt(0) : '?'))}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${item.userName ? html`<span style="font-weight:600;">${item.userName}</span>` : nothing}
                            ${item.time ? html`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${item.time}</span>` : nothing}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${item.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `
}
