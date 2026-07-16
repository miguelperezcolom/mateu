import { html, nothing } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import '@vaadin/icon';
import '@vaadin/icons';

type XColumn = VaadinGridColumn & { xcolumn?: GridColumn }
type RowTarget = EventTarget & { row: unknown }
type ActionTarget = EventTarget & { action: ActionItem }
interface ActionItem {
    methodNameInCrud: string
    label: string
    icon: string
    disabled: boolean
}

const itemSelected = (e: CustomEvent) => {
    const obj = {
        _clickedRow: (e.target as RowTarget).row
    };
    e.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: 'action-on-row-' + e.detail.value.methodNameInCrud,
            parameters: obj
        },
        bubbles: true,
        composed: true
    }))
}

const clicked = (e: CustomEvent) => {
    const obj = {
        _clickedRow: (e.target as RowTarget).row
    };
    const action: ActionItem = (e.target as ActionTarget).action
    e.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: 'action-on-row-' + action.methodNameInCrud,
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
    const actions = item[column.path!]?.actions?.map((a: any) => {
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
    if (_column.path == 'select') {
        const action = {
            actionId: _column.path,
            icon: '',
            label: 'Select',
            disabled: false,
            methodNameInCrud: 'select'
        } as ActionItem
        return html`
         <vaadin-button theme="tertiary" title="Select" @click="${clicked}" .row="${item}" .action="${action}">
             Select
         </vaadin-button>
    `
    }
    // A row-level action column may carry null for rows the action does not apply to
    // (e.g. a cancelled row without its "Cancel" action): render an empty cell, and never
    // throw — an exception here aborts the whole row binding and leaves the row blank.
    const action: ActionItem = _column.path && item[_column.path]?.methodNameInCrud
        ? item[_column.path]
        : (item as any).action
    if (!action) {
        return html``
    }
    const iconOnly = action.icon && !action.label
    return html`
         <vaadin-button theme="tertiary${iconOnly ? ' icon' : ''}" title="${action.label || nothing}" @click="${clicked}" .row="${item}" .action="${action}">
             ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
             ${action.label ? action.label : nothing}
         </vaadin-button>
    `
}


const handleButtonColumnClick = (vaadinColumn: VaadinGridColumn,column: GridColumn, item: any) => {
    vaadinColumn.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: column.actionId,
            parameters: item
        },
        bubbles: true,
        composed: true
    }))
}

export const renderButtonCell = (item: any,
                                 _model: GridItemModel<any>,
                                 vaadinColumn: VaadinGridColumn,
                                 _type: string,
                                 _stereotype: string,
                                 _column: GridColumn
) => {
    const column = (vaadinColumn as XColumn).xcolumn ?? _column
    if (column.actionId) {
        const label = column.text || item[vaadinColumn.path!]
        return html`
            <vaadin-button theme="tertiary" @click="${(_e: any) => handleButtonColumnClick(vaadinColumn, column, item)}" .row="${item}">
                ${label}
            </vaadin-button>
        `
    }
    const href = item[vaadinColumn.path!]
    return html`<a href="${href}">${column.text || href}</a>`;
}
