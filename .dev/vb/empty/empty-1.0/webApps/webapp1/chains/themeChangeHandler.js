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

  class themeChangeHandler extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.themeName Name of the theme to switch to
     */
    async run(context, { themeName = 'light' }) {
      const { $application } = context;
      $application.variables.currentTheme = themeName;
      // window.vbLoadTheme is added in index.html when the app is loaded
      window.vbLoadTheme(themeName);
    }
  }

  return themeChangeHandler;
});
