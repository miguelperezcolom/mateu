/* Fase 3: acción saliente — el botón manda el estado que ya tienes (host.state + la edición
 * en curso del oj-dyn-form) al backend Mateu; el increment de vuelta se reduce y sus efectos
 * se aplican: State-only → re-proyección del form, toasts → spShowToast del starter,
 * NavigateTo → evento de aplicación mateuNavigate (lo atiende la shell, dueña del menú). */

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

  class runMateuAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId  id de la acción Mateu (del $current del botón)
     * @param {Object} params.event     evento ojAction (fallback: data-action-id del botón)
     */
    async run(context, { actionId, event }) {
      const { $application, $page } = context;

      let id = actionId;
      if (!id && event && event.target && event.target.dataset) {
        id = event.target.dataset.actionId;
      }
      if (!id) {
        return;
      }

      const base = $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const route = $application.variables.mateuSelectedRoute;
      // la edición en curso, acumulada por mateuFieldEdited (value-changed de cada campo)
      const draft = $page.variables.mateuDraft || {};
      const componentState = Object.assign({}, host && host.state, draft);

      const increment = await bridge.runMateuAction(base, host, route, id, componentState);
      const reg = bridge.reduceContexts(before, increment);
      $application.variables.mateuRegistry = reg;

      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      $page.variables.mateuDraft = {};

      // toast con el patrón del starter: variable + open() del oj-sp-messages-toast local
      for (const toast of reg.effects.toasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
      if (reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
      if (reg.effects.navigate && reg.effects.navigate.route) {
        await Actions.fireEvent(context, {
          name: 'application:mateuNavigate',
          payload: { route: reg.effects.navigate.route },
        });
      }
    }
  }

  return runMateuAction;
});
