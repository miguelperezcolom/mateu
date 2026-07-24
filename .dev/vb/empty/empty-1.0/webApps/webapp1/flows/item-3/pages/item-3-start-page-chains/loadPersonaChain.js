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

  class loadPersonaChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.personaId
     */
    async run(context, { personaId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Test valid input
      if (true && personaId !== undefined) {
        // Clears Persona data the variable holds
        await Actions.resetVariables(context, {
          variables: [
            '$variables.persona',
          ],
        }, { id: 'resetPersonaData' });

        // Initiates REST call loading Persona data
        const callRestResult = await Actions.callRest(context, {
          endpoint: 'businessObjects/get_Persona',
          responseType: 'getPersonaResponse',
          uriParams: {
            'Persona_Id': personaId,
          },
        }, { id: 'loadPersona' });

        if (!callRestResult.ok) {
          // Shows an error message informing about data load failure
          await Actions.fireNotificationEvent(context, {
            summary: 'Could not load data',
            message: `Could not load data: status ${callRestResult.status}`,
          }, { id: 'fireErrorNotification' });

          return;
        }

        // Assigns data loaded by the REST call to the Persona variable
        $variables.persona = callRestResult.body;
      }
    }
  }

  return loadPersonaChain;
});
