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

export const createItem = (iconName: string, text: string) => {
    const item = document.createElement('vaadin-context-menu-item');
    const icon = document.createElement('vaadin-icon');

    icon.style.color = 'var(--lumo-secondary-text-color)';
    icon.style.marginInlineEnd = 'var(--lumo-space-s)';
    icon.style.padding = 'var(--lumo-space-xs)';

    icon.setAttribute('icon', iconName);
    item.appendChild(icon);
    if (text) {
        item.appendChild(document.createTextNode(text));
    }
    return item;
}

export const renderMenuCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn
) => {
    // @ts-ignore
    const actions = item[column.path]?.actions?.map(a => {
        if (a.icon) {
            return {
                component: createItem(a.icon, a.label)
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