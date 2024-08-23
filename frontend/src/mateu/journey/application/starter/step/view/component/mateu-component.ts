import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, TemplateResult} from "lit";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import {ComponentType} from "../../../../../../shared/apiClients/dtos/ComponentType";
import './form/mateu-form'
import './stepper/mateu-stepper'
import './card/mateu-card'
import './crud/mateu-crud'
import './result/mateu-result'
import '../../../journey-starter'
import '../../journey-step'
import JourneyStarter from "../../../../../../shared/apiClients/dtos/JourneyStarter";
import Crud from "../../../../../../shared/apiClients/dtos/Crud";
import Step from "../../../../../../shared/apiClients/dtos/Step";
import {Service} from "../../../../../domain/service";
import VerticalLayout from "../../../../../../shared/apiClients/dtos/VerticalLayout";
import HorizontalLayout from "../../../../../../shared/apiClients/dtos/HorizontalLayout";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import CustomElement from "../../../../../../shared/apiClients/dtos/CustomElement";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

    @property()
    baseUrl = ''

    @property()
    component: Component | undefined;

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

            ${this.component?.metadata.type == ComponentType.Element?
                    this.renderElement(this.component.metadata as CustomElement)
                    :html``}

            ${this.component?.metadata.type == ComponentType.HorizontalLayout?
                    html`<vaadin-horizontal-layout>${(this.component.metadata as HorizontalLayout)
                            .components.map(c => html`<mateu-component
                        .component=${c}
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

            ${this.component?.metadata.type == ComponentType.VerticalLayout?
                    html`<vaadin-horizontal-layout>${(this.component.metadata as VerticalLayout)
                            .components.map(c => html`<mateu-component
                        .component=${c}
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

            ${this.component?.metadata.type == ComponentType.SplitLayout?
                    html`<vaadin-spl>${(this.component.metadata as VerticalLayout)
                            .components.map(c => html`<mateu-component
                        .component=${c}
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

            ${this.component?.metadata.type == ComponentType.Stepper?
                    html`<mateu-stepper
                            .metadata=${this.component.metadata}
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-stepper>`
                    :html``}


            ${this.component?.metadata.type == ComponentType.Card?
                    html`<mateu-card
                            .metadata=${this.component.metadata}
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-card>`
                    :html``}
        
            ${this.component?.metadata.type == ComponentType.Form?
                    html`<mateu-form 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            .step=${this.step}
                            .rules=${this.component.rules}
                            .service=${this.service}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-form>`
                    :html``}

            ${this.component?.metadata.type == ComponentType.Crud?
                    html`<mateu-crud 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            uiId="${this.uiId}"
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            listId="${(this.component.metadata as Crud).listId}"
                            timestamp="${this.step.timestamp}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                            searchSignature="${this.journeyId}-${this.stepId}-${(this.component.metadata as Crud).listId}"
                    ><slot></slot></mateu-crud>`
                    :html``}

            ${this.component?.metadata.type == ComponentType.Result?
                    html`<mateu-result 
                            .metadata=${this.component.metadata} 
                            .data=${this.component.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-result>`
                    :html``}

            ${this.component?.metadata.type == ComponentType.JourneyStarter?
                    html`<journey-starter 
                            baseUrl="${(this.component.metadata as JourneyStarter).baseUrl?(this.component.metadata as JourneyStarter).baseUrl:this.baseUrl}"
                            journeyType="${(this.component.metadata as JourneyStarter).journeyType}"
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

