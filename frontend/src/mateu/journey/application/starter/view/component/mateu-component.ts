import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, TemplateResult} from "lit";
import Component from "../../../../../shared/apiClients/dtos/Component";
import {ComponentMetadataType} from "../../../../../shared/apiClients/dtos/ComponentMetadataType";
import './form/mateu-form'
import './stepper/mateu-stepper'
import './card/mateu-card'
import './crud/mateu-crud'
import './result/mateu-result'
import '../../journey-starter'
import JourneyStarter from "../../../../../shared/apiClients/dtos/JourneyStarter";
import Step from "../../../../../shared/apiClients/dtos/Step";
import {Service} from "../../../../domain/service";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import CustomElement from "../../../../../shared/apiClients/dtos/CustomElement";
import Form from "../../../../../shared/apiClients/dtos/Form";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

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
    step!: Step

    @property()
    previousStepId: string | undefined


    render() {
        return html`

            ${this.component?.metadata.type == ComponentMetadataType.Element?
                    this.renderElement(this.component.metadata as CustomElement)
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.HorizontalLayout?
                    html`<vaadin-horizontal-layout>${this.component.childComponentIds
                            .map(id => this.components[id])
                            .map(c => html`<mateu-component
                        .component=${c}
                        .components=${this.components}
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        .step=${this.step}
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}</vaadin-horizontal-layout>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.VerticalLayout?
                    html`<vaadin-horizontal-layout>${this.component.childComponentIds
                            .map(id => this.components[id])
                            .map(c => html`<mateu-component
                                    .component=${c}
                                    .components=${this.components}
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        .step=${this.step}
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}</vaadin-horizontal-layout>`
                    :html``}

            ${this.component?.metadata.type == ComponentMetadataType.SplitLayout?
                    html`<vaadin-spl>${this.component.childComponentIds
                            .map(id => this.components[id])
                            .map(c => html`<mateu-component
                                    .component=${c}
                                    .components=${this.components}
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        .step=${this.step}
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}</vaadin-spl>`
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
                    ><slot></slot></mateu-card>`
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
                            .step=${this.step}
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
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            uiId="${this.uiId}"
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            timestamp="${this.step.timestamp}"
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
                            .components=${this.components}
                            baseUrl="${(this.component.metadata as JourneyStarter).baseUrl?(this.component.metadata as JourneyStarter).baseUrl:this.baseUrl}"
                            journeyType="${(this.component.metadata as JourneyStarter).journeyTypeId}"
                            journeyId="${(this.component.metadata as JourneyStarter).journeyId}"
                            stepId="${(this.component.metadata as JourneyStarter).stepId}"
                            actionId="${(this.component.metadata as JourneyStarter).actionId}"
                    ></journey-starter>`
                    :html``}
        `
    }

    static styles = css`
    
      :host {
    width: 100%;
    display: block;
  }
    
  `

    private renderElement(component: CustomElement): TemplateResult  {
        let attributes = '';
        for (let attributesKey in component.attributes) {
            // @ts-ignore
            attributes += ' ' + attributesKey + '="' + component.attributes[attributesKey] + '"'
        }
        const markup = `<${component.name} ${attributes}>${component.content?component.content:''}</${component.name}>`
        return html`${unsafeHTML(markup)}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}

