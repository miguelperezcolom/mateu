Hi Josh, I'd like to contribute a new dependency to the Spring Initializer (https://medium.com/@miguelperezcolom/write-your-next-ui-using-plain-java-3c1fd981ed29) as I think it could help others. Who could I contact? It's being difficult to find the right channel  

- investigate how back visibility logic works
- investigate how modal works in journey

- fix
- add on close logic
- add close on action (e.g. CloseModal as target action)

1. back visibility logic
   2. en mateu-ux.ts
      ${this.step?.previousStepId && this.step?.previousStepId != this.initialStepId?html`
      ${this.step?.data?.__index?html``:html`
      <vaadin-button theme="tertiary" @click=${this.goBack}>Back</vaadin-button>
      `}
      `:''}
   3. en mateu-result.ts
      ${!this.metadata.nowTo && this.previousStepId?html`
      <vaadin-button theme="secondary" @click=${this.goBack}
      data-testid="action-back"
      >Back</vaadin-button>
      `:''}
2. modals storage in journey
   3. in action's json
      4. "target" : "NewModal",
      5. "target" : "Left"
      6. "target" : "Right"
   5. en mateu-ux.ts
   ```
       runAction(event: CustomEvent) {
           const action: Action = event.detail.action
           if (action && ActionTarget.NewTab == action.target) {
               const newWindow = window.open();
               newWindow?.document.write(`${this.renderModal()}`);
           } else if (action && ActionTarget.NewWindow == action.target) {
               const newWindow = window.open('', 'A window', 'width=800,height=400,screenX=200,screenY=200');
               newWindow?.document.write(`${this.renderModal()}`);
           } else if (action && ActionTarget.NewModal == action.target) {
               // crear modal y meter un mateu-ux dentro
               this.modalOpened = true
               this.modalStepId = this.stepId
               this.modalActionId = event.detail.actionId
               this.modalActionData = event.detail.data
               this.modalInstant = nanoid()
               this.modalStyle = action.modalStyle
           } else {
               this.service.runAction(event.detail.actionId, event.detail.data).then()
           }
       }
   ```
   ```
   renderModal() {
        return html`
            <div style="${this.modalStyle}">
            <mateu-ux
                    uiId="${this.uiId}"
                    journeyTypeId="${this.journeyTypeId}"
                    journeyId="${this.journeyId}"
                    stepId="${this.modalStepId}"
                    baseUrl="${this.baseUrl}"
                    instant="${this.modalInstant}"
                    actionId="${this.modalActionId}"
                    .actionData=${this.modalActionData}
                    parentStepId="${this.stepId}"
                    initialStepId="${this.stepId}"
            >
            </div>
   
        `
    }
   ```
   ```
       async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("baseUrl")
            || changedProperties.has("journeyTypeId")
            || changedProperties.has("instant")
        ) {
                setTimeout(async () => {
                    if (this.baseUrl && this.journeyTypeId) {
                        mateuApiClient.baseUrl = this.baseUrl
                        mateuApiClient.element = this
                        if (this.actionId) {
                            this.service.state.uiId = this.uiId
                            this.service.state.journeyTypeId = this.journeyTypeId
                            this.service.state.journeyId = this.journeyId
                            this.service.state.baseUrl = this.baseUrl
                            this.service.state.stepId = this.initialStepId
                            await this.service.runAction(this.actionId, this.actionData)
                        } else {
   ```
   6. xxxbacktostep al cerrar el modal!!!!, pero los steps del modal no se han limpiado!!!
   7. el currentStepId parece que no se limpia. Manda el último que se ha utilizado en el modal, aunque el journey que se devolvió es correcto
   8. 






