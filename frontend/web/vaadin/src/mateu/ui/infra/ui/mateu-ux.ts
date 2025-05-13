import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, upstream } from "@domain/state";
import './mateu-component'
import Component from "@mateu/shared/apiClients/dtos/Component";
import { parseOverrides } from "@infra/ui/common";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { renderFormLayout, renderHorizontalLayout, renderVerticalLayout } from "@infra/ui/renderLayouts";


@customElement('mateu-ux')
export class MateuUx extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    overrides: string | undefined = undefined;
    @property()
    journeyTypeId: string | undefined = undefined;

    // state
    @state()
    titleFromUI: string | undefined = undefined;

    overridesParsed: Object = {};

    @state()
    root: Component | undefined = undefined;

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
        this.overridesParsed = parseOverrides(this.overrides);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

    }

    // write state to reactive properties
    stampState(state: State) {
        console.log('stamp state in ux')
        this.titleFromUI = state.ui?.title
        if (state.ui?.root) {
            this.root = {...state.ui?.root}
        } else {
            this.root = undefined
        }
    }

    renderComponent = (component: Component): TemplateResult => {
        if (component.metadata.type == ComponentMetadataType.FormLayout) {
            return renderFormLayout(component, this.renderComponent)
        }
        if (component.metadata.type == ComponentMetadataType.HorizontalLayout) {
            return renderHorizontalLayout(component, this.renderComponent)
        }
        if (component.metadata.type == ComponentMetadataType.VerticalLayout) {
            return renderVerticalLayout(component, this.renderComponent)
        }
        return html`<mateu-component id="${component.id}">
${component.children?.map(child => this.renderComponent(child))}
           </mateu-component>`
    }

    render() {
        console.log('render ux')
       return html`
           ${this.root?this.renderComponent(this.root):nothing}
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


