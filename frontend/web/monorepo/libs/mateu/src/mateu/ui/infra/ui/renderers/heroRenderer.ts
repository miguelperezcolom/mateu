import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import HeroSection from "@mateu/shared/apiClients/dtos/componentmetadata/HeroSection";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const renderHeroSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as HeroSection
    const withImage = !!metadata.image
    const background = withImage
        ? `background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${metadata.image}'); background-size: cover; background-position: center; color: #fff;`
        : ''
    const alignment = metadata.centered === false ? 'flex-start' : 'center'
    const textAlign = metadata.centered === false ? 'left' : 'center'
    return html`
        <div class="mateu-hero ${component.cssClasses??''}"
             style="display: flex; flex-direction: column; align-items: ${alignment}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${textAlign}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${metadata.height ?? '12rem'}; box-sizing: border-box; ${background} ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${metadata.title?html`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${metadata.title}</h1>`:nothing}
            ${metadata.subtitle?html`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${withImage?'':'color: var(--lumo-secondary-text-color, #666);'} max-width: 40rem;">${metadata.subtitle}</p>`:nothing}
            ${component.children?.length?html`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${alignment}; width: 100%; max-width: 40rem;">
                    ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
                </div>
            `:nothing}
        </div>
    `
}
