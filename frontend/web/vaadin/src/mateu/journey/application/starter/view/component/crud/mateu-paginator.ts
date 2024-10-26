import {css, html, LitElement} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/notification'
import '@vaadin/button'
import '@vaadin/dialog'

interface Page {
  page: number
  text: string
  clickable: boolean
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-paginator')
export class MateuPaginator extends LitElement {

  @property()
  count = 0

  @property()
  pageSize = 100

  @property()
  page = 0

  @state()
  pages: Page[] = []

  setUp() {
  }

  connectedCallback() {
    super.connectedCallback();
    this.setUp()
  }

  async updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("count") || changedProperties.has("page")) {
      const pages:Page[] = []
      const totalPages = Math.ceil(this.count / this.pageSize);
      const lastPage = totalPages - 1
      if (this.count > 0) {
        if (this.page > 0) {
          pages.push({page: 0, text: 'first', clickable: true})
        }
        if (this.page > 1) {
          pages.push({page: this.page - 1, text: 'prev', clickable: true})
        }
        pages.push({page: this.page, text: `${this.page}`, clickable: false})
        if (this.page < lastPage - 1) {
          const whichPage:number = +this.page + 1;
          pages.push({page: whichPage, text: 'next', clickable: true})
        }
        if (this.page < lastPage) {
          pages.push({page: lastPage, text: 'last', clickable: true})
        }
      }
      this.pages = pages;
    }
  }

  clickOnPage(event: Event) {
    const page = (event.target as HTMLElement).getAttribute('page');
    this.dispatchEvent(new CustomEvent('page-changed', {
      bubbles: true,
      composed: true,
      detail: {
        page
      }
    }))
  }

  render() {
    return html`
      <div class="paginator">
        ${this.pages.length == 1?html``:html`
          Page:
          ${this.pages.map(p => p.clickable?html`
          <vaadin-button theme="tertiary" @click=${this.clickOnPage} page=${p.page} data-testid="page-${p.page}">${p.text}</vaadin-button>
        `:html` [ ${p.text} ] `)}
        `}
        
      </div>
    `
  }

  static styles = css`    
  
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-paginator': MateuPaginator
  }
}
