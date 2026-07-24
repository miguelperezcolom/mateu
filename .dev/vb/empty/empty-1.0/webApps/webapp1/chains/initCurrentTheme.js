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

  class initCurrentTheme extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;
      if ($application.constants.themeChangeUI === 'on') {
        // data-vb-theme is added in index.html when the app is loaded
        $application.variables.currentTheme = document.documentElement.getAttribute('data-vb-theme') || 'light';
      }
    }
  }

  return initCurrentTheme;
});
