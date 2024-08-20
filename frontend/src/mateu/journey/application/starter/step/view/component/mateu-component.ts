import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import {ViewType} from "../../../../../../shared/apiClients/dtos/ViewType";
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

            ${this.component?.metadata.type == ViewType.Stepper?
                    html`<mateu-stepper
                            .metadata=${this.component.metadata}
                            .data=${this.step.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            .rules=${this.step.rules}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-stepper>`
                    :html``}


            ${this.component?.metadata.type == ViewType.Card?
                    html`<mateu-card
                            .metadata=${this.component.metadata}
                            .data=${this.step.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            .rules=${this.step.rules}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-card>`
                    :html``}
        
            ${this.component?.metadata.type == ViewType.Form?
                    html`<mateu-form 
                            .metadata=${this.component.metadata} 
                            .data=${this.step.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            .step=${this.step}
                            .rules=${this.step.rules}
                            .service=${this.service}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-form>`
                    :html``}

            ${this.component?.metadata.type == ViewType.Crud?
                    html`<mateu-crud 
                            .metadata=${this.component.metadata} 
                            .data=${this.step.data}
                            uiId="${this.uiId}"
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            listId="${(this.component.metadata as Crud).listId}"
                            .rules=${this.step.rules}
                            timestamp="${this.step.timestamp}"
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                            searchSignature="${this.journeyId}-${this.stepId}-${(this.component.metadata as Crud).listId}"
                    ><slot></slot></mateu-crud>`
                    :html``}

            ${this.component?.metadata.type == ViewType.Result?
                    html`<mateu-result 
                            .metadata=${this.component.metadata} 
                            .data=${this.step.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" stepId="${this.stepId}"
                            .rules=${this.step.rules}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                    ><slot></slot></mateu-result>`
                    :html``}

            ${this.component?.metadata.type == ViewType.JourneyStarter?
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
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}

