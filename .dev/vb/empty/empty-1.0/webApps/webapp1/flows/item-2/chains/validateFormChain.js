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

  class validateFormChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.validationGroupId
     */
    async run(context, { validationGroupId }) {
      const { $flow, $application, $constants, $variables } = context;

      // Tests if the validation group element exists.
      if (!validationGroupId) {
        return false;
      }

      const validationResult = await Actions.callComponentMethod(context, {
        selector: `#${validationGroupId}`,
        method: 'getProperty',
        params: ['valid'],
      });

      // Tests the validation group status.
      if (validationResult === 'valid') {
        // Returns the value (true) representing the passed validation.
        return true;
      }

      // Displays all validation messages for the form items.
      await Actions.callComponentMethod(context, {
        selector: `#${validationGroupId}`,
        method: 'showMessages',
      }, { id: 'showValidationMessages' });

      // Focuses the first component failing the validation.
      await Actions.callComponentMethod(context, {
        selector: `#${validationGroupId}`,
        method: 'focusOn',
        params: [
          '@firstInvalidShown'
        ],
      }, { id: 'focusInvalidComponent' });

      // Returns the value (false) representing the failed validation.
      return false;
    }
  }

  return validateFormChain;
});
