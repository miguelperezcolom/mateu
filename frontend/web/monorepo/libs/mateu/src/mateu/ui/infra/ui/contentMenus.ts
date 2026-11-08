import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption'
import { leaveToRoute } from './rowRoute.ts'

/**
 * The menus a PAGE carries in its content — MenuBar, ContextMenu, Directory — as opposed to the
 * app shell's own menu. One rule for every web renderer (shared neutral and Vaadin).
 */

/**
 * A GROUP is an option with entries of its own. A leaf (a RouteLink, a MethodLink) arrives with
 * `submenus: []`, and an empty array is truthy: every link used to be drawn as an empty group.
 */
export const isMenuGroup = (option: MenuOption | undefined): boolean =>
    !!option && Array.isArray(option.submenus) && option.submenus.length > 0

/**
 * Picking a leaf: a route navigates (asking about unsaved changes, like a menu click; a whole URL
 * opens in another tab), an action id runs on the component that owns the menu. Before, an item
 * only carried its `path` and nothing listened for the selection: picking it did nothing.
 */
export const selectContentMenuOption = (from: HTMLElement, option: MenuOption | undefined): void => {
    if (!option || option.disabled || option.separator || isMenuGroup(option)) return
    if (option.route) {
        leaveToRoute(from, option.route)
        return
    }
    if (option.actionId) {
        from.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: option.actionId },
            bubbles: true,
            composed: true,
        }))
    }
}
