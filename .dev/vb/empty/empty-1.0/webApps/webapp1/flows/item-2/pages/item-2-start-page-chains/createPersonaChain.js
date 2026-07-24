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

  class createPersonaChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Sets the progress variable to true
      $variables.createPersonaChainInProgress = true;

      try {
        // Validates Persona form
        const validateFormResult = await Actions.callChain(context, {
          chain: 'flow:validateFormChain',
          params: {
            validationGroupId: 'persona-validation-group--356298034-1',
          },
        }, { id: 'validatePersona' });

        if (!validateFormResult) {
          return;
        }

        // Call REST creating new Persona record
        const callRestResult = await Actions.callRest(context, {
          endpoint: 'businessObjects/create_Persona',
          body: $variables.persona,
        }, { id: 'savePersona' });

        if (!callRestResult.ok) {
          // Create error message
          const errorMessage = callRestResult.body?.detail || callRestResult.body?.['o:errorDetails']?.[0]?.detail || `Could not create new Persona: status ${callRestResult.status}`;
          // Fires a notification event about failed save
          await Actions.fireNotificationEvent(context, {
            summary: 'Save failed',
            message: errorMessage,
          }, { id: 'fireErrorNotification' });

          return;
        }

        // Fires a notification event about successful save
        await Actions.fireNotificationEvent(context, {
          summary: 'Persona saved',
          message: 'Persona record successfully created',
          displayMode: 'transient',
          type: 'confirmation',
        }, { id: 'fireSuccessNotification' });

        // Resets persona variable to the default state
        await Actions.resetVariables(context, {
          variables: [
            '$variables.persona',
          ],
        }, { id: 'resetPersona' });

        // Resets the dynamic form by updating its display value using the value attribute. User entered values will be erased.
        await Actions.callComponentMethod(context, {
          selector: '#oj-dyn-form--356298034-1',
          method: 'reset',
        }, { id: 'resetDynamicForm' });
      } finally {
        // Sets the progress variable to false
        $variables.createPersonaChainInProgress = false;
      }
    }
  }

  return createPersonaChain;
});
