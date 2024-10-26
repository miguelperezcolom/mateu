import {css, html, LitElement} from 'lit'
import {customElement, state} from 'lit/decorators.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-home')
export class MyHome extends LitElement {

  @state()
  label = 'Hola!'

  createRenderRoot() {
    return this;
  }

  clicked(e) {
    console.log('clicked', e)
  }

  render() {
    return html`

      <oj-c-button id="button1" label="${this.label}" @ojAction="${this.clicked}"></oj-c-button>

      <oj-sp-welcome-page id="oj-sp-welcome-page-1" page-title="Page title"
                          overline-text="[[ $variables.overlineText ]]"
                          description-text="[[ $variables.descriptionText ]]"
                          background-color="[[ $variables.availableImageConfigs[$variables.selectedImageConfig].backgroundColor ]]"
                          illustration-background="[[ require.toUrl($variables.availableImageConfigs[$variables.selectedImageConfig].illustrationBackground) ]]"
                          illustration-foreground="[[ require.toUrl($variables.availableImageConfigs[$variables.selectedImageConfig].illustrationForeground) ]]"
                          primary-action="[[ $variables.primaryAction ]]"
                          display-options.image-stretch="[[ $variables.availableImageConfigs[$variables.selectedImageConfig].imageStretch ]]"
                          display-options.mobile-image="[[ $variables.displayMobileImage ? &#39;on&#39; : &#39;off&#39; ]]"
                          display-options.in-flow-back="[[$variables.inFlowBackEnable]]"
                          display-options.responsive-padding="[[ $variables.responsivePaddingEnabled ? &#39;on&#39; : &#39;off&#39; ]]"
                          secondary-action="[[ $variables.secondaryAction ]]"
                          on-sp-primary-action="[[$listeners.onPrimaryAction]]"
                          on-sp-secondary-action="[[$listeners.onSecondaryAction]]"
                          translations.in-flow-back="[[$variables.inFlowBackTranslation]]"
                          class="oj-sp-responsive-paddings-on oj-complete">
        
      </oj-sp-welcome-page>
      
      
    `
  }

  static styles = css`
 
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-home': MyHome
  }
}
