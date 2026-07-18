import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, nothing, TemplateResult } from "lit";
import { handleButtonClick } from "@/RedwoodOjComponentRenderer.ts";

const separatorStyle = "border-left: 1px solid var(--oj-core-text-color-secondary, #888); height: 1.5rem; display: inline-block; align-self: center;"

export const renderButton = (component: ClientSideComponent, _baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as Button
    const slot = component.slot ?? nothing

    if (metadata.children && metadata.children.length > 0) {
        const items = metadata.children.map(child => ({
            key: child.actionId,
            label: child.label,
            disabled: child.disabled ?? false
        }))
        return html`
            ${metadata.separatorBefore ? html`<span slot="${slot}" style="${separatorStyle}"></span>` : nothing}
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="${metadata.label}"
                .items="${items}"
                slot="${slot}"
                @ojMenuAction="${(e: CustomEvent) => {
                    const actionId = e.detail.key
                    e.target?.dispatchEvent(new CustomEvent('action-requested', {
                        detail: { actionId },
                        bubbles: true,
                        composed: true
                    }))
                }}"
            ></oj-c-menu-button>
        `
    }

    // A primary button gets the RDS highlighted (callToAction) chroming; everything else keeps
    // oj-c-button's default "solid" chroming (so this is a no-op for the non-primary buttons).
    const chroming = (metadata as any).buttonStyle === 'primary' ? 'callToAction' : 'solid'

    return html`
        ${metadata.separatorBefore ? html`<span slot="${slot}" style="${separatorStyle}"></span>` : nothing}
        <oj-c-button
            data-oj-binding-provider="preact"
            data-action-id="${metadata.actionId}"
            label="${metadata.label}"
            chroming="${chroming}"
            @ojAction=${handleButtonClick}
            slot="${slot}"
        ></oj-c-button>
    `
}
