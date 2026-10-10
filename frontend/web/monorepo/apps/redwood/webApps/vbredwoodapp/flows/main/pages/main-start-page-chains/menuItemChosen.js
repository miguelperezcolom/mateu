/* An item chosen in a content menu (MenuBar submenu, ContextMenu): the bridge says what it does
 * (bridge.menuChoiceOf + dispatchOf, tested in poc) — run the action through the host's or the
 * island's dispatcher, navigate inside the shell, or open an external url. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class menuItemChosen extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Array}  params.items    the menu's items (menuItemsOf)
     * @param {string} params.value    the oj-option chosen ($event.detail.selectedValue)
     * @param {string} params.variant  'host' | 'island' (which surface's atoms it belongs to)
     */
    async run(context, { items, value, variant }) {
      const plan = bridge.dispatchOf(bridge.menuChoiceOf(items, value), variant);
      if (!plan) return;
      if (plan.chain) {
        await Actions.callChain(context, { chain: plan.chain, params: plan.params });
      } else if (plan.route) {
        document.dispatchEvent(new CustomEvent('navigation-requested', {
          detail: { route: plan.route }, bubbles: true, composed: true,
        }));
      } else if (plan.url) {
        window.open(plan.url, '_blank', 'noopener');
      }
    }
  }

  return menuItemChosen;
});
