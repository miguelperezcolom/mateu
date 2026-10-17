/* P1 · Master with tabs that are pages: choosing a tab of an app LEVEL (the master of
 * a record, @App(TABS) with children in routes.yaml) is NAVIGATING to its route — each tab is a
 * page with its own URL —, and so is the «← Parent» (@App(backLink = PARENT)). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class appTabSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed of the bar ({detail: {value: route, updatedFrom}})
     *     or the ojAction of the «← Parent» (the button carries the route in data-route)
     * @param {boolean} params.back  the click comes from the «← Parent»
     */
    async run(context, { event, back }) {
      let route;
      if (back) {
        const target = event && (event.currentTarget || event.target);
        const holder = target && target.closest ? target.closest('[data-route]') : target;
        route = holder && holder.getAttribute ? holder.getAttribute('data-route') : null;
      } else {
        const detail = (event && (event.detail || event)) || {};
        // the writeback echo after painting the bar is not a click
        if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
          return;
        }
        route = detail.value;
      }
      if (!route) {
        return;
      }
      await Actions.fireEvent(context, {
        name: 'application:mateuNavigate',
        payload: { route },
      });
    }
  }

  return appTabSelected;
});
