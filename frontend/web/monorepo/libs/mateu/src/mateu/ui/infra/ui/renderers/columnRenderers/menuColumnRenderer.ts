import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

const itemSelected = (e: CustomEvent) => {
    const obj = {
        // @ts-ignore
        _clickedRow: e.target.row
    };
    e.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: e.detail.value.methodNameInCrud,
            parameters: obj
        },
        bubbles: true,
        composed: true
    }))
}

const clicked = (e: CustomEvent) => {
    const obj = {
        // @ts-ignore
        _clickedRow: e.target.row
    };
    const action : {
        methodNameInCrud: string
        label: string
        icon: string
        disabled: boolean
        //@ts-ignore
    } = e.target.action
    e.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: action.methodNameInCrud,
            parameters: obj
        },
        bubbles: true,
        composed: true
    }))
}

export const createItem = (a: any) => {
    const item = document.createElement('vaadin-context-menu-item');
    const icon = document.createElement('vaadin-icon');

    icon.style.color = 'var(--lumo-secondary-text-color)';
    icon.style.marginInlineEnd = 'var(--lumo-space-s)';
    icon.style.padding = 'var(--lumo-space-xs)';

    icon.setAttribute('icon', a.icon);
    item.appendChild(icon);
    if (a.label) {
        item.appendChild(document.createTextNode(a.label));
    }
    item.disabled = a.disabled
    return item;
}

export const renderMenuCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn
) => {
    // @ts-ignore
    const actions = item[column.path]?.actions?.map(a => {
        if (a.icon) {
            return {
                component: createItem(a),
                methodNameInCrud: a.methodNameInCrud
            }
        }
        return {
            ...a,text: a.label
        }
    })
    if (!actions || actions.length == 0) {
        return html``
    }
    return html`
                                     <vaadin-menu-bar
                                         .items=${[{ text: '···', children: actions }]}
                                         theme="tertiary"
                                         .row="${item}"
                                         data-testid="menubar-${column.path}"
                                         @item-selected="${itemSelected}"
                                     ></vaadin-menu-bar>
                                   `
}

export const renderActionCell = (item: any,
                               _model: GridItemModel<any>,
                               _column: VaadinGridColumn
) => {
    // @ts-ignore
    const action: {
        methodNameInCrud: string
        label: string
        icon: string
        disabled: boolean
    } = item.action
    return html`
         <vaadin-button theme="tertiary" @click="${clicked}" .row="${item}" .action="${action}">
             ${action.label}
         </vaadin-button>
    `
}