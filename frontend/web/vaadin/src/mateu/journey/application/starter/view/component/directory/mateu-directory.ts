import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import Component from "../../../../../../shared/apiClients/dtos/Component";
import Directory from "../../../../../../shared/apiClients/dtos/Directory";


/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-directory')
export class MateuDirectory extends LitElement {

  @property()
  componentId!: string

  @property()
  component: Component | undefined

  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl = ''

  @property()
  metadata!: Directory

  @property()
  data!: Directory

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  async runAction(event: Event) {
    const boton = (event.target as HTMLElement)
    const actionId = boton.getAttribute('actionId');
    if (!actionId) {
      console.log('Attribute actionId is missing for ' + event.target)
      return
    }
    setTimeout(async () => {
      await this.doRunActionId(actionId, undefined, undefined);
    })
  }

  async doRunActionId(actionId: string, eventName: string | undefined, event: unknown | undefined) {
      let effectiveData: any = {...this.data}
      if (event) {
        effectiveData = {...effectiveData, __eventName: eventName, __event: JSON.parse(JSON.stringify(event))}
      }
    this.dispatchEvent(new CustomEvent('runaction', {
        detail: {
          componentId: this.componentId,
          componentType: this.component?.className,
          actionId: actionId,
          action: undefined,
          data: effectiveData
        },
        bubbles: true,
        composed: true
      }))
  }

  render() {
    return html`
      <div class="directory">
          <h2>${this.metadata.title}</h2>
          <div class="toc">
              ${this.metadata.menu?.filter(m => m.visible).map(m => html`
              <div class="menu">
                  ${m.submenus?.length == 0?html`
                      <vaadin-button theme="tertiary" actionId="${m.journeyTypeId}" @click="${this.runAction}">${m.caption}</vaadin-button>
                  `:html`<h3>${m.caption}</h3>`}</h3>
                  
                  ${m.submenus?.map(s => html`

                      <div class="submenu">
                          ${s.submenus?.length == 0?html`
                              <vaadin-button theme="tertiary" actionId="${s.journeyTypeId}" @click="${this.runAction}">${s.caption}</vaadin-button>
                          `:html`<h4>${s.caption}</h4>`}</h3>

                          ${s.submenus?.map(x => html`

                              <div class="submenu">
                                  ${x.submenus?.length == 0?html`
                                      <vaadin-button theme="tertiary" actionId="${x.journeyTypeId}" @click="${this.runAction}">${x.caption}</vaadin-button>
                                  `:html`<h5>${x.caption}</h5>`}</h3>

                                  ${x.submenus?.map(y => html`
                                      <div class="submenu">
                                          ${m.submenus?.length == 0?html`
                                              <vaadin-button theme="tertiary" actionId="${y.journeyTypeId}" @click="${this.runAction}">${y.caption}</vaadin-button>
                                          `:html`<h6>${y.caption}</h6>`}</h3>
                                      </div>
                                  `)}
                              </div>


                          `)}
                      </div>

                  `)}
              </div>
              `)}
          </div>
      </div>
    `
  }

  static styles = css`    
      
    .directory {
      padding-left: 20px;
      padding-right: 20px;
      padding-bottom: 20px;
    }
      
      .toc {
            display: flex;
            padding: 20px;      
          width: 100%;
          flex-wrap: wrap;
      }
      
      .menu {
          padding: 10px;
      }
      
      .submenu {
          padding-left: 20px;
      }
      
      vaadin-button {
          height: 16px;
      }
    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-directory': MateuDirectory
  }
}
