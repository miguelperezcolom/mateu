import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues, TemplateResult} from "lit";
import Component from "../../../../../shared/apiClients/dtos/Component";
import {ComponentMetadataType} from "../../../../../shared/apiClients/dtos/ComponentMetadataType";
import './form/mateu-form'
import './stepper/mateu-stepper'
import './card/mateu-card'
import './directory/mateu-directory'
import './crud/mateu-crud'
import './result/mateu-result'
import '../../journey-starter'
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/split-layout'
import '@vaadin/tabsheet'
import JourneyStarter from "../../../../../shared/apiClients/dtos/JourneyStarter";
import {Service} from "../../../../domain/service";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import CustomElement from "../../../../../shared/apiClients/dtos/CustomElement";
import Form from "../../../../../shared/apiClients/dtos/Form";
import TabLayout from "../../../../../shared/apiClients/dtos/TabLayout";
import Action from "../../../../../shared/apiClients/dtos/Action";
import ConfirmationTexts from "../../../../../shared/apiClients/dtos/ConfirmationTexts";
import {dialogRenderer} from "lit-vaadin-helpers";
import {dialogFooterRenderer} from "@vaadin/dialog/lit";
import Card from "../../../../../shared/apiClients/dtos/Card";
import Result from "../../../../../shared/apiClients/dtos/Result";
import Listener from "../../../../../shared/apiClients/dtos/Listener";
import RemoteJourney from "../../../../../shared/apiClients/dtos/RemoteJourney";
import {MateuApiClient} from "../../../../../shared/apiClients/MateuApiClient";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

    @property()
    componentId = ''

    @property()
    baseUrl = ''

    @property()
    component: Component | undefined;

    @property()
    components!: Record<string, Component>

    @property()
    uiId!: string

    @property()
    journeyTypeId!: string

    @property()
    journeyId!: string

    @property()
    stepId!: string

    @property()
    service: Service | undefined

    @property()
    previousStepId: string | undefined

    @property()
    confirmationOpened = false;


    @property()
    closeConfirmation = () => {
        this.confirmationOpened = false
    };

    @property()
    confirmationAction = () => {};

    @property()
    runConfirmedAction = () => {
        this.confirmationAction()
        this.confirmationOpened = false
    };

    @property()
    confirmationTexts: ConfirmationTexts | undefined;

    @property()
    mateuApiClient!: MateuApiClient


    async captureRunActionEvent(event: CustomEvent) {
        console.log('event', event)
        if (event.detail.actionId) {
            await this.doRunActionId(event.detail.actionId, event.detail.eventName, event.detail.event);
        } else {
            await this.doRunAction(event.detail.action, event.detail.eventName, event.detail.event)
        }
    }

    async doRunActionId(actionId: string, eventName: string | undefined, event: unknown | undefined) {
        const action = this.findAction(actionId!)
        if (action) {
            await this.doRunAction(action, eventName, event)
        } else {
            await this.doRunAction(<Action>{
                id: actionId
            }, eventName, event)
        }
    }

    private findAction(actionId: string) {
        let actions: Action[] = []
        if (this.component?.metadata.type == ComponentMetadataType.Card) {
            const md = this.component?.metadata as Card;
            actions = md.buttons.concat(md.icons)
        }
        if (this.component?.metadata.type == ComponentMetadataType.Result) {
            const md = this.component?.metadata as Result;
            actions = md.interestingLinks.map(d => <Action>{
                id: d.value,
            }).concat([md.nowTo].map(d => <Action>{
                id: d.value
            }))
        }
        let action = actions.find(a => a.id.endsWith('__' + actionId) || a.id == actionId);
        return action
    }

    async doRunAction(action: Action | undefined, eventName: string | undefined, event: unknown | undefined) {
        if (action?.confirmationRequired) {
            this.confirmationAction = async () => {
                this.askForActionRun(action, eventName, event)
            }
            this.confirmationTexts = action.confirmationTexts
            this.confirmationOpened = true;
        } else {
            this.askForActionRun(action!, eventName, event)
        }
    }

    private askForActionRun(action: Action, eventName: string | undefined, event: unknown | undefined) {
        console.log('action', action,this.componentId)
        this.dispatchEvent(new CustomEvent('runaction', {
            detail: {
                componentId: this.componentId,
                componentType: this.component?.className,
                actionId: action.id,
                action: action,
                data: {
                    ...this.component?.data,
                    __eventName: eventName,
                    __event: event
                }
            },
            bubbles: true,
            composed: true
        }))
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.component?.metadata.type == ComponentMetadataType.Element) {
            const element = this.component.metadata as CustomElement;
            //@ts-ignore
            if (element.attributes.listeners) {
                //@ts-ignore
                for (const p of element.attributes.listeners.filter(p => p.key == 'listener')) {
                    const def = p.value as Listener
                    this.shadowRoot?.querySelector('#' + this.component.id)?.addEventListener(def.eventName, e => {
                        if (def.js) {
                            eval(def.js)
                        } else if (def.actionName) {
                            this.doRunActionId(def.actionName, def.eventName, JSON.parse(this.stringify_object(e)))
                        }
                    });
                }
            }
        }
    }

    stringify_object(object: any): string {
        const obj = {};
        for (let key in object) {
            let value = object[key];
            if (value instanceof Node)
                // specify which properties you want to see from the node
            { // @ts-ignore
                value = {id: value.id};
            }
            else if (value instanceof Window)
                value = 'Window';
            else if (value instanceof Object)
                value = 'Object';
            // @ts-ignore
            obj[key] = value;
        }
        return JSON.stringify(obj);
    }

    getStyle(c:Component) {
        let s = '';
        if (c.attributes['min-width']) {
            s += 'min-width:' + c.attributes['min-width'] + ';'
        }
        if (c.attributes['width']) {
            s += 'width:' + c.attributes['width'] + ';'
        }
        if (c.attributes['max-width']) {
            s += 'max-width:' + c.attributes['max-width'] + ';'
        }
        return s;
    }

    render() {
        return html`

    ${this.component?.metadata.type == ComponentMetadataType.Element?
            this.renderElement(this.component.id, this.component.metadata as CustomElement)
            :html``}

    ${this.component?.metadata.type == ComponentMetadataType.TabLayout?
            html`<vaadin-tabsheet>
                <vaadin-tabs slot="tabs">
                ${(this.component?.metadata as TabLayout).tabs.map(t => html`
                    <vaadin-tab id="${t.id}" ?selected="${t.active}">${t.caption}</vaadin-tab>
                `)}
                </vaadin-tabs>
                ${this.component?.childComponentIds
                        .map(id => this.components[id])
                        .map(c => html`<div tab="${c.id}"><mateu-component
                                .component=${c}
                                .components=${this.components}
                                .mateuApiClient="${this.mateuApiClient}"
                                uiId="${this.uiId}"
                                journeyTypeId="${this.journeyTypeId}"
                                journeyId="${this.journeyId}"
                                stepId="${this.stepId}"
                                baseUrl="${this.baseUrl}"
                                previousStepId="${this.previousStepId}"
                        >
                            <slot></slot></mateu-component
                                id="${c.id}"></div>
                        `)}

            </vaadin-tabsheet>`
            :html``}


    ${this.component?.metadata.type == ComponentMetadataType.HorizontalLayout?
            html`<vaadin-horizontal-layout theme="spacing">
                ${this.component.childComponentIds
                    .map(id => this.components[id])
                    .map(c => html`<mateu-component
                .component=${c}
                .components=${this.components}
                .mateuApiClient="${this.mateuApiClient}"
                uiId="${this.uiId}"
                journeyTypeId="${this.journeyTypeId}"
                journeyId="${this.journeyId}"
                stepId="${this.stepId}"
                baseUrl="${this.baseUrl}"
                previousStepId="${this.previousStepId}"
                style="${this.getStyle(c)}"
        >
            <slot></slot></mateu-component>
        `)}</vaadin-horizontal-layout>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.VerticalLayout?
                    html`<vaadin-vertical-layout theme="spacing">${this.component.childComponentIds
                            .map(id => this.components[id])
                            .map(c => html`<mateu-component
                                    .component=${c}
                                    .components=${this.components}
                                    .mateuApiClient="${this.mateuApiClient}"
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}</vaadin-vertical-layout>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.SplitLayout?
                    html`<vaadin-split-layout>${this.component.childComponentIds
                            .map(id => this.components[id])
                            .map(c => html`<mateu-component
                                    .component=${c}
                                    .components=${this.components}
                                    .mateuApiClient="${this.mateuApiClient}"
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}</vaadin-split-layout>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.Stepper?
                    html`<mateu-stepper
                            .component=${this.component}
                            .components=${this.components}
                            .metadata=${this.component.metadata}
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-stepper>`
                    :html``}


            ${this.component?.metadata.type == ComponentMetadataType.Card?
                    html`<mateu-card
                            .component=${this.component}
                            .components=${this.components}
                            .metadata=${this.component.metadata}
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                            @run-action="${this.captureRunActionEvent}"
                    ><slot></slot></mateu-card>`
                    :html``}

    ${this.component?.metadata.type == ComponentMetadataType.Directory?
            html`<mateu-directory
                    .component=${this.component}
                    .components=${this.components}
                    .metadata=${this.component.metadata}
                    .data=${this.component.data}
                    journeyTypeId="${this.journeyTypeId}"
                    journeyId="${this.journeyId}"
                    stepId="${this.stepId}"
                    baseUrl="${this.baseUrl}"
                    previousStepId="${this.previousStepId}"
                    @run-action="${this.captureRunActionEvent}"
            ><slot></slot></mateu-directory>`
            :html``}

            ${this.component?.metadata.type == ComponentMetadataType.Form?
                    html`<mateu-form
                            .component=${this.component}
                            .components=${this.components}
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            componentId="${this.component.id}"
                            .rules=${(this.component.metadata as Form).rules}
                            .service=${this.service}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-form>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.Crud?
                    html`<mateu-crud
                            .component=${this.component}
                            .components=${this.components}
                            .mateuApiClient="${this.mateuApiClient}"
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            uiId="${this.uiId}"
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            componentId="${this.component.id}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                            searchSignature="${this.journeyId}-${this.stepId}-${this.component.id}"
                    ><slot></slot></mateu-crud>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.Result?
                    html`<mateu-result
                            .component=${this.component}
                            .components=${this.components}
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-result>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.JourneyStarter?
                    html`<journey-starter
                            .component=${this.component}
                            uiId="${(this.component.metadata as JourneyStarter).uiId}"
                            baseUrl="${(this.component.metadata as JourneyStarter).baseUrl?(this.component.metadata as JourneyStarter).baseUrl:this.baseUrl}"
                            journeyTypeId="${(this.component.metadata as JourneyStarter).journeyTypeId}"
                            contextData="${(this.component.metadata as JourneyStarter).contextData}"
                    ></journey-starter>`
                    :html``}

    ${this.component?.metadata.type == ComponentMetadataType.RemoteJourney?
            html`<journey-starter
                            .component=${this.component}
                            uiId="${(this.component.metadata as RemoteJourney).remoteUiId}"
                            baseUrl="${(this.component.metadata as RemoteJourney).remoteBaseUrl?(this.component.metadata as RemoteJourney).remoteBaseUrl:this.baseUrl}"
                            journeyTypeId="${(this.component.metadata as RemoteJourney).remoteJourneyType}"
                            contextData="${(this.component.metadata as RemoteJourney).contextData}"
                    ></journey-starter>`
            :html``}

    <vaadin-dialog
            header-title="${this.confirmationTexts?.title}"
            .opened="${this.confirmationOpened}"
            ${dialogRenderer(() => html`${this.confirmationTexts?.message}`, [])}
            ${dialogFooterRenderer(
                    () => html`
      <vaadin-button theme="primary error" @click="${this.runConfirmedAction}"
                     data-testid="dialog-confirm" style="margin-right: auto;">
        ${this.confirmationTexts?.action}
      </vaadin-button>
      <vaadin-button theme="tertiary" @click="${this.closeConfirmation}"
            data-testid="dialog-cancel">Cancel</vaadin-button>
    `,
                    []
            )}
    ></vaadin-dialog>
        `
    }

    static styles = css`
    
      :host {
    width: 100%;
    display: block;
  }
    
  `

    private renderElement(componentId: string, component: CustomElement): TemplateResult  {
        let attributes = '';
        for (let attributesKey in component.attributes) {
            // @ts-ignore
            attributes += ' ' + attributesKey + '="' + component.attributes[attributesKey] + '"'
        }
        const markup = `<${component.name} id="${componentId}" ${attributes}>${component.content?component.content:''}</${component.name}>`
        return html`${unsafeHTML(markup)}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}

