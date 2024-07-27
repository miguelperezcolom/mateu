import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Step from "../../../../shared/apiClients/dtos/Step";
import './view/mateu-view';
import {Service} from "../../../domain/service";

@customElement('journey-step')
export class JourneyStep extends LitElement {

    @property()
    baseUrl = '';

    @property()
    uiId!: string

    @property()
    journeyTypeId = '';

    @property()
    journeyId = '';

    @property()
    stepId = '';

    @property()
    initialStepId: string | undefined

    @property()
    service: Service | undefined

    @property()
    step: Step | undefined = undefined;

    connectedCallback() {
        super.connectedCallback();
    }

    render() {
        return html`
        <mateu-view 
                .view=${this.step?.view}
                uiId="${this.uiId}"
                journeyTypeId="${this.journeyTypeId}"
                journeyId="${this.journeyId}" 
                stepId="${this.stepId}"
                .step=${this.step}
                .service=${this.service}
                baseUrl="${this.baseUrl}"
                previousStepId="${this.step?.previousStepId}"
                initialStepId="${this.initialStepId}"
        ><slot></slot></mateu-view>`
    }

    static styles = css`

  `
}

declare global {
    interface HTMLElementTagNameMap {
        'journey-step': JourneyStep
    }
}

