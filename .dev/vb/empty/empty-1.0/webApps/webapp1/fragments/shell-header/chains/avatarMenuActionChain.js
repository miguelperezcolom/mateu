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

  class avatarMenuActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.menuId 
     */
    async run(context, { menuId }) {
      const { $fragment, $application } = context;
      if (menuId?.startsWith('theme:')) {
        await Actions.fireEvent(context, {
          event: 'application:changeTheme',
          payload: {
            themeName: menuId.substring(6),
          },
        });
      }
      
    }
  }

  return avatarMenuActionChain;
});
