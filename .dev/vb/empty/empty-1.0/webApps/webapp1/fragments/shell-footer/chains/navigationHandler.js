define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class navigationHandler extends ActionChain {

    /**
     * Navigates to the flow selected in the navigation tab.
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.item 
     * @param {string} params.updatedFrom 
     */
    async run(context, { item, updatedFrom = '' }) {
      const { $application } = context;

      if (updatedFrom !== 'external') {

        const fireApplicationEventNavigateToItemResult = await Actions.fireEvent(context, {
          event: 'application:navigateToItem',
          payload: {
            item: item,
          },
        });
      }
    }
  }

  return navigationHandler;
});
