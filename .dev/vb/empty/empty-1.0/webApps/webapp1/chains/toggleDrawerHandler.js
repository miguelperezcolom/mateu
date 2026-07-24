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

  class toggleDrawerHandler extends ActionChain {

    /**
     * Toggles the navigation drawer for the page
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;

      const fireEventToggleDrawerResult = await Actions.fireEvent(context, {
        event: 'application:toggleDrawer',
      });
    }
  }

  return toggleDrawerHandler;
});
